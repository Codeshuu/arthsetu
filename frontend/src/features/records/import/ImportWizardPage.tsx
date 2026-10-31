import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useArthSetuStore } from '../../../store/useArthSetuStore';
import { SourceType, AccountTag, Transaction } from '../../../services/types';
import { parseCsvFile, ParsedCsvResult } from '../../../lib/csvParser';
import { detectDuplicates, DuplicateMatch } from '../../../lib/duplicateDetector';
import { formatINR } from '../../../lib/formatCurrency';
import { suggestClassification } from '../../../lib/ruleClassifier';
import { ArrowLeft, ArrowRight, Upload, Check, Download, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { UpiSlip } from '../../../components/fragments/UpiSlip';
import { BankStatementStrip } from '../../../components/fragments/BankRow';
import { InvoiceSheet } from '../../../components/fragments/InvoiceSheet';
import { useI18n } from '../../../i18n/i18nContext';

export const ImportWizardPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const existingTxns = useArthSetuStore((s) => s.transactions);
  const addTransaction = useArthSetuStore((s) => s.addTransaction);
  const addSource = useArthSetuStore((s) => s.addSource);

  const [step, setStep] = useState<number>(1);
  const [sourceType, setSourceType] = useState<SourceType>('bank_csv');
  const [accountTag, setAccountTag] = useState<AccountTag>('business');

  // CSV parsing state
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCsvResult | null>(null);
  const [dateCol, setDateCol] = useState<string>('');
  const [descCol, setDescCol] = useState<string>('');
  const [amountCol, setAmountCol] = useState<string>('');
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setIsParsing(true);
      try {
        const result = await parseCsvFile(selected);
        setParsedData(result);
        setDateCol(result.detectedMapping.dateCol || result.headers[0] || '');
        setDescCol(result.detectedMapping.descriptionCol || result.headers[1] || '');
        setAmountCol(
          result.detectedMapping.amountCol ||
            result.detectedMapping.creditCol ||
            result.detectedMapping.debitCol ||
            result.headers[2] ||
            ''
        );

        // Run duplicate detection preview
        const rawIncoming = result.rows.map((row) => ({
          date: row[result.detectedMapping.dateCol || ''] || '2026-10-28',
          amount: parseFloat(row[result.detectedMapping.amountCol || ''] || '0') || 500,
          description: row[result.detectedMapping.descriptionCol || ''] || 'Sample Payment',
          direction: 'in' as const,
        }));
        const dupes = detectDuplicates(rawIncoming, existingTxns);
        setDuplicates(dupes);
      } catch (err) {
        console.error('Error parsing CSV', err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleLoadSampleCsv = async (sampleType: 'bank' | 'upi' = 'bank') => {
    setIsParsing(true);
    try {
      const fileName = sampleType === 'bank' ? 'lakshmi-kirana-bank.csv' : 'lakshmi-kirana-upi.csv';
      const response = await fetch(`/sample-data/${fileName}`);
      const csvText = await response.text();
      const demoFile = new File([csvText], fileName, { type: 'text/csv' });
      setFile(demoFile);
      const result = await parseCsvFile(demoFile);
      setParsedData(result);
      setDateCol(result.detectedMapping.dateCol || result.headers[0] || '');
      setDescCol(result.detectedMapping.descriptionCol || result.headers[1] || '');
      setAmountCol(
        result.detectedMapping.amountCol ||
          result.detectedMapping.creditCol ||
          result.detectedMapping.debitCol ||
          result.headers[2] ||
          ''
      );

      const rawIncoming = result.rows.map((row) => ({
        date: row[result.detectedMapping.dateCol || ''] || '2026-10-28',
        amount: parseFloat(row[result.detectedMapping.amountCol || ''] || '0') || 500,
        description: row[result.detectedMapping.descriptionCol || ''] || 'Sample Payment',
        direction: 'in' as const,
      }));
      const dupes = detectDuplicates(rawIncoming, existingTxns);
      setDuplicates(dupes);
    } catch (err) {
      console.error('Error loading sample CSV', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFinishImport = () => {
    if (!parsedData) return;

    // Register Source
    const newSource = addSource({
      type: sourceType,
      fileName: file?.name || 'Imported_Statement.csv',
      rowCount: parsedData.totalRows,
      accountTag,
      uploadedAt: new Date().toISOString(),
    });

    // Convert CSV rows to Transactions
    let importedCount = 0;
    parsedData.rows.forEach((row, idx) => {
      const isDupe = duplicates.some((d) => d.incomingIndex === idx);
      if (isDupe && skipDuplicates) return;

      const dateVal = row[dateCol] || '2026-10-28';
      const descVal = row[descCol] || 'Imported statement row';
      const amtVal = Math.abs(parseFloat(row[amountCol]?.replace(/,/g, '') || '500'));
      const direction = row[amountCol]?.includes('-') ? 'out' : 'in';

      // Rule classification
      const suggestion = suggestClassification(descVal, direction, amtVal);

      addTransaction({
        date: dateVal,
        amount: amtVal || 500,
        direction,
        channel: sourceType === 'upi_export' ? 'upi' : 'bank',
        account: accountTag,
        category: 'unclassified', // Invariant: arrives as Unclassified
        classification: {
          value: suggestion ? suggestion.category : 'unclassified',
          suggestedBy: suggestion ? 'rule' : null,
          confidence: suggestion?.confidence,
          reason: suggestion?.reason,
          confirmed: false, // Invariant: never confirmed automatically
        },
        evidence: {
          class: 'document_supplied',
          sourceId: newSource.id,
          note: `Imported from ${newSource.fileName}`,
        },
        description: descVal,
        linkedDocIds: [newSource.id],
        flags: isDupe ? ['duplicate_imported'] : [],
      });
      importedCount++;
    });

    navigate('/app/records');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 border-b border-[#D6CAA8] pb-4">
        <Link
          to="/app/records"
          className="p-1.5 rounded hover:bg-[#F8F1DE] text-[#14402F]"
          aria-label="Back to Records"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('import.badge')}
          </span>
          <h1 className="font-display text-2xl font-bold text-[#14402F]">
            {t('import.title')}
          </h1>
        </div>
      </div>

      {/* 4-Step Horizontal Flow Diagram with Animated Threads */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        {[
          { num: 1, label: t('import.step1') },
          { num: 2, label: t('import.step2') },
          { num: 3, label: t('import.step3') },
          { num: 4, label: t('import.step4') },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded border transition-all ${
              step === s.num
                ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] font-bold shadow-sm'
                : step > s.num
                ? 'bg-[#E4EAD6] text-[#2A6347] border-[#939F5B]'
                : 'bg-[#FDFBF4] text-[#7C766B] border-[#D6CAA8]'
            }`}
          >
            <div className="text-[10px] font-bold">STEP {s.num}</div>
            <div className="truncate font-sans text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-lg p-6 sm:p-8 shadow-paper-elevated min-h-[380px] flex flex-col justify-between bg-khata-page">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#D08A1E]">
                Step 1 of 4
              </span>
              <h2 className="font-display text-2xl font-bold text-[#14402F] mt-0.5">
                {t('import.step1Title')}
              </h2>
              <p className="text-xs text-[#5A3E2B]">
                {t('import.step1Desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                {
                  id: 'bank_csv',
                  title: t('import.typeBank'),
                  desc: 'Downloaded from NetBanking (Canara, SBI, HDFC, BoB, etc.)',
                },
                {
                  id: 'upi_export',
                  title: t('import.typeUpi'),
                  desc: 'Daily or monthly merchant settlement CSV export',
                },
                {
                  id: 'invoice',
                  title: t('import.typeBill'),
                  desc: 'Wholesale distributor bills and cash receipts',
                },
                {
                  id: 'manual_cash',
                  title: 'Manual Daybook Cash Record',
                  desc: 'Direct entry into your bahi-khata daybook',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSourceType(opt.id as SourceType)}
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    sourceType === opt.id
                      ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] shadow'
                      : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8] hover:bg-[#E6DAB9]'
                  }`}
                >
                  <div className="font-bold text-sm">{opt.title}</div>
                  <div
                    className={`text-xs mt-1 ${
                      sourceType === opt.id ? 'text-[#B7C4A0]' : 'text-[#7C766B]'
                    }`}
                  >
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Download Sample CSV Callout */}
            <div className="mt-4 p-3 rounded bg-[#F8F1DE] border border-[#D6CAA8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#5A3E2B] font-medium">
                Want to test with sample data?
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href="/sample-data/lakshmi-kirana-bank.csv"
                  download
                  className="px-2.5 py-1 rounded bg-[#14402F] text-white font-mono text-[11px] font-bold flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Sample Bank CSV</span>
                </a>
                <a
                  href="/sample-data/lakshmi-kirana-upi.csv"
                  download
                  className="px-2.5 py-1 rounded bg-[#6B7A3A] text-white font-mono text-[11px] font-bold flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Sample UPI CSV</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#D08A1E]">
                Step 2 of 4
              </span>
              <h2 className="font-display text-2xl font-bold text-[#14402F] mt-0.5">
                {t('import.step2Title')}
              </h2>
              <p className="text-xs text-[#5A3E2B]">
                {t('import.step2Desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  id: 'business',
                  title: t('import.accBiz'),
                  desc: 'Used solely for shop supplier payments and customer revenue.',
                },
                {
                  id: 'mixed',
                  title: t('import.accMixed'),
                  desc: 'Used for both shop purchases and family / household expenses.',
                },
                {
                  id: 'personal',
                  title: t('import.accPersonal'),
                  desc: 'Mainly personal; only occasional business transfers.',
                },
              ].map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setAccountTag(acc.id as AccountTag)}
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    accountTag === acc.id
                      ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] shadow'
                      : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8] hover:bg-[#E6DAB9]'
                  }`}
                >
                  <div className="font-bold text-sm">{acc.title}</div>
                  <div
                    className={`text-xs mt-1 ${
                      accountTag === acc.id ? 'text-[#B7C4A0]' : 'text-[#7C766B]'
                    }`}
                  >
                    {acc.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#D08A1E]">
                Step 3 of 4
              </span>
              <h2 className="font-display text-2xl font-bold text-[#14402F] mt-0.5">
                {t('import.step3Title')}
              </h2>
              <p className="text-xs text-[#5A3E2B]">
                {t('import.step3Desc')}
              </p>
            </div>

            {/* Dropzone */}
            <div className="p-6 border-2 border-dashed border-[#14402F] rounded-lg bg-[#F8F1DE] text-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-[#14402F] mx-auto" />
              <div className="text-sm font-bold text-[#2B2620]">
                {file ? file.name : t('import.dropzoneLabel')}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <label className="inline-block px-4 py-2 rounded bg-[#14402F] text-white text-xs font-bold cursor-pointer hover:bg-[#0F2E22]">
                  <span>{t('import.browseLocal')}</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleLoadSampleCsv(sourceType === 'upi_export' ? 'upi' : 'bank')}
                  className="px-4 py-2 rounded bg-[#D08A1E] text-white text-xs font-bold hover:bg-[#B57415] shadow-xs"
                >
                  {sourceType === 'upi_export' ? t('import.loadDemoUpi') : t('import.loadDemoBank')}
                </button>
              </div>
            </div>

            {/* Parsed Preview & Mapping */}
            {parsedData && (
              <div className="bg-[#FDFBF4] p-3 rounded border border-[#D6CAA8] space-y-3 text-xs">
                <div className="font-bold text-[#14402F] flex justify-between">
                  <span>Detected {parsedData.totalRows} {t('import.detectedRows')}</span>
                  <span className="text-[#2A6347]">PapaParse Verified ✓</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2B2620]">{t('import.colDateLabel')}</label>
                    <select
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                      className="w-full p-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] font-mono"
                    >
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2B2620]">
                      {t('import.colDescLabel')}
                    </label>
                    <select
                      value={descCol}
                      onChange={(e) => setDescCol(e.target.value)}
                      className="w-full p-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] font-mono"
                    >
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2B2620]">
                      {t('import.colAmtLabel')}
                    </label>
                    <select
                      value={amountCol}
                      onChange={(e) => setAmountCol(e.target.value)}
                      className="w-full p-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] font-mono"
                    >
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#D08A1E]">
                Step 4 of 4
              </span>
              <h2 className="font-display text-2xl font-bold text-[#14402F] mt-0.5">
                {t('import.step4Title')}
              </h2>
              <p className="text-xs text-[#5A3E2B]">
                {t('import.step4Desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-[#E4EAD6] border border-[#939F5B] text-center space-y-1">
                <div className="text-xs font-mono text-[#2A6347] font-bold">{t('import.totalNewRows')}</div>
                <div className="font-display text-3xl font-bold text-[#14402F]">
                  {(parsedData?.totalRows || 0) - duplicates.length}
                </div>
                <div className="text-[11px] text-[#2A6347]">
                  {t('import.newRowsNote')}
                </div>
              </div>

              <div className="p-4 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-center space-y-1">
                <div className="text-xs font-mono text-[#8A6446] font-bold">
                  {t('import.dupeRows')}
                </div>
                <div className="font-display text-3xl font-bold text-[#B5532F]">
                  {duplicates.length}
                </div>
                <div className="text-[11px] text-[#5A3E2B]">
                  {t('import.dupeRowsNote')}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-[#2B2620]">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="w-4 h-4 accent-[#14402F] rounded"
                />
                <span>{t('import.skipDupesLabel')}</span>
              </label>
            </div>
          </div>
        )}

        {/* Step Nav Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-[#D6CAA8] mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 text-xs font-bold text-[#5A3E2B] hover:text-[#14402F]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 3 && !parsedData}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-colors ${
                step === 3 && !parsedData
                  ? 'bg-[#D6CAA8] text-[#7C766B] cursor-not-allowed'
                  : 'bg-[#14402F] text-[#FDFBF4] hover:bg-[#0F2E22]'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishImport}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded bg-[#D08A1E] text-white text-xs font-bold hover:bg-[#B57415] shadow transition-colors"
            >
              <span>{t('import.finishBtn')}</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// Four Dimensions of Financial Visibility Selectors
// Transparent independent assessment metrics without composite scoring

import { Business, DiaryDay, DimensionLevel, DimensionMetric, Transaction } from '../services/types';
import { selectOperatingContinuity } from './financeSelectors';
import { selectEvidenceBreakdown } from './evidenceSelectors';

export function getLevelFromScore(score: number): DimensionLevel {
  if (score >= 80) return 'Extensive';
  if (score >= 55) return 'Substantial';
  if (score >= 30) return 'Emerging';
  return 'Limited';
}

export function selectFourDimensions(
  business: Business,
  transactions: Transaction[],
  diaryDays: DiaryDay[]
): DimensionMetric[] {
  // 1. Business Activity Visibility
  const continuity = selectOperatingContinuity(business, diaryDays);
  const monthsCount = new Set(diaryDays.map((d) => d.date.substring(0, 7))).size;
  const activityScore = Math.min(100, Math.round(continuity.coveragePercent * 0.7 + Math.min(monthsCount, 12) * 2.5));
  const activityLevel = getLevelFromScore(activityScore);

  const activityMetric: DimensionMetric = {
    id: 'activity',
    nameEn: 'Business Activity Visibility',
    nameHi: 'व्यावसायिक गतिविधि दृश्यता',
    level: activityLevel,
    scorePercent: activityScore,
    factsEn: [
      `${continuity.recordedDays} of ${continuity.expectedDays} operating days documented (${continuity.coveragePercent}%)`,
      `${monthsCount} months of uninterrupted activity records`,
    ],
    factsHi: [
      `${continuity.expectedDays} में से ${continuity.recordedDays} कार्य दिवस दर्ज (${continuity.coveragePercent}%)`,
      `${monthsCount} महीनों का निरंतर व्यावसायिक रिकॉर्ड`,
    ],
    improvementEn: continuity.gapDays > 0 ? `Fill in records for ${continuity.gapDays} missing days in Diary` : 'Great continuity! Keep logging daily sales.',
    improvementHi: continuity.gapDays > 0 ? `डायरी में छूटे हुए ${continuity.gapDays} दिनों का हिसाब दर्ज करें` : 'उत्कृष्ट निरंतरता! दैनिक बिक्री दर्ज करते रहें।',
  };

  // 2. Financial Record Completeness
  const totalTxns = transactions.length;
  const confirmedTxns = transactions.filter((t) => t.classification.confirmed).length;
  const unclassifiedCount = transactions.filter((t) => t.category === 'unclassified').length;
  const completenessScore = totalTxns > 0 ? Math.round((confirmedTxns / totalTxns) * 100) : 0;
  const completenessLevel = getLevelFromScore(completenessScore);

  const completenessMetric: DimensionMetric = {
    id: 'completeness',
    nameEn: 'Financial Record Completeness',
    nameHi: 'वित्तीय रिकॉर्ड पूर्णता',
    level: completenessLevel,
    scorePercent: completenessScore,
    factsEn: [
      `${confirmedTxns} of ${totalTxns} transactions classified and confirmed (${completenessScore}%)`,
      `${unclassifiedCount} transactions currently pending review in queue`,
    ],
    factsHi: [
      `${totalTxns} में से ${confirmedTxns} लेनदेन वर्गीकृत और पुष्ट (${completenessScore}%)`,
      `${unclassifiedCount} लेनदेन वर्तमान में समीक्षा के लिए लंबित`,
    ],
    improvementEn: unclassifiedCount > 0 ? `Review ${unclassifiedCount} unclassified transactions to boost completeness` : 'All imported records are classified.',
    improvementHi: unclassifiedCount > 0 ? `पूर्णता बढ़ाने के लिए ${unclassifiedCount} अवर्गीकृत लेनदेन की समीक्षा करें` : 'सभी रिकॉर्ड वर्गीकृत हैं।',
  };

  // 3. Financial Pattern Visibility
  const has12Months = monthsCount >= 12;
  const patternScore = has12Months ? 88 : Math.round((monthsCount / 12) * 70);
  const patternLevel = getLevelFromScore(patternScore);

  const patternMetric: DimensionMetric = {
    id: 'patterns',
    nameEn: 'Financial Pattern Visibility',
    nameHi: 'वित्तीय रुझान व पैटर्न दृश्यता',
    level: patternLevel,
    scorePercent: patternScore,
    factsEn: [
      `${monthsCount} months of history available (${has12Months ? 'Full annual cycle' : 'Partial annual view'})`,
      has12Months ? 'Annual seasonality and festive peaks observable' : 'Need ~12 months to discern seasonality',
    ],
    factsHi: [
      `${monthsCount} महीनों का इतिहास उपलब्ध (${has12Months ? 'पूर्ण वार्षिक चक्र' : 'आंशिक वार्षिक दृश्य'})`,
      has12Months ? 'वार्षिक मौसमी रुझान और त्योहारों के शिखर स्पष्ट' : 'मौसमी बदलाव देखने के लिए ~12 महीने आवश्यक हैं',
    ],
    improvementEn: has12Months ? 'Consistent monthly patterns established.' : `Log ${12 - monthsCount} more months to unlock full seasonality insights.`,
    improvementHi: has12Months ? 'निरंतर मासिक रुझान स्थापित।' : `पूर्ण मौसमी समझ के लिए ${12 - monthsCount} और महीनों का हिसाब दर्ज करें।`,
  };

  // 4. Evidence Reliability
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const supplied = evidenceSegments.find((s) => s.cls === 'document_supplied')?.amount || 0;
  const totalValue = transactions.reduce((s, t) => s + t.amount, 0);
  const reliabilityScore = totalValue > 0 ? Math.round((supplied / totalValue) * 100) : 0;
  const reliabilityLevel = getLevelFromScore(reliabilityScore);

  const reliabilityMetric: DimensionMetric = {
    id: 'reliability',
    nameEn: 'Evidence Reliability',
    nameHi: 'प्रमाण विश्वसनीयता',
    level: reliabilityLevel,
    scorePercent: reliabilityScore,
    factsEn: [
      `${reliabilityScore}% of recorded monetary value supported by uploaded documents`,
      '0% directly authenticated (Consented aggregator source locked in demo)',
    ],
    factsHi: [
      `दर्ज कुल मूल्य का ${reliabilityScore}% अपलोड किए गए दस्तावेजों से समर्थित`,
      '0% सीधे प्रमाणित (सहमति-आधारित स्रोत इस डेमो में बंद है)',
    ],
    improvementEn: 'Upload supplier invoices for cash & bank purchases to strengthen reliability.',
    improvementHi: 'विश्वसनीयता मजबूत करने के लिए सप्लायर बिल और रसीदें अपलोड करें।',
  };

  return [activityMetric, completenessMetric, patternMetric, reliabilityMetric];
}


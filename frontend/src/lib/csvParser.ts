// Client-side CSV Parser for Bank & UPI statements using PapaParse

import Papa from 'papaparse';

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  previewRows: Record<string, string>[];
  detectedMapping: {
    dateCol?: string;
    descriptionCol?: string;
    debitCol?: string;
    creditCol?: string;
    amountCol?: string;
    balanceCol?: string;
  };
}

export function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data;
        const detectedMapping = detectColumnMapping(headers);

        resolve({
          headers,
          rows,
          totalRows: rows.length,
          previewRows: rows.slice(0, 5),
          detectedMapping,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

function detectColumnMapping(headers: string[]) {
  const mapping: {
    dateCol?: string;
    descriptionCol?: string;
    debitCol?: string;
    creditCol?: string;
    amountCol?: string;
    balanceCol?: string;
  } = {};

  headers.forEach((h) => {
    const lower = h.toLowerCase().trim();
    if (!mapping.dateCol && (lower.includes('date') || lower.includes('txn date') || lower.includes('value date'))) {
      mapping.dateCol = h;
    } else if (!mapping.descriptionCol && (lower.includes('desc') || lower.includes('narration') || lower.includes('particular') || lower.includes('remarks'))) {
      mapping.descriptionCol = h;
    } else if (!mapping.debitCol && (lower.includes('debit') || lower.includes('withdrawal') || lower.includes('dr'))) {
      mapping.debitCol = h;
    } else if (!mapping.creditCol && (lower.includes('credit') || lower.includes('deposit') || lower.includes('cr'))) {
      mapping.creditCol = h;
    } else if (!mapping.amountCol && (lower.includes('amount') || lower.includes('txn amount'))) {
      mapping.amountCol = h;
    } else if (!mapping.balanceCol && (lower.includes('balance') || lower.includes('closing'))) {
      mapping.balanceCol = h;
    }
  });

  return mapping;
}


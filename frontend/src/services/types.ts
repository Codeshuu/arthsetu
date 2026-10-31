// Core Domain Types for ArthSetu

export type BusinessCategory =
  | 'kirana'
  | 'festival_goods'
  | 'general_retail'
  | 'vegetable_fruit'
  | 'garments'
  | 'stationery'
  | 'other';

export type OwnershipType = 'sole_proprietorship' | 'family_run' | 'partnership';

export interface LocationInfo {
  city: string;
  state: string;
  pincode: string;
  area: string;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  ownership: OwnershipType;
  yearsOperating: number;
  location: LocationInfo;
  operatingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  closedOnFestivals: boolean;
  language: 'en' | 'hi';
  isDemo: boolean;
}

export type Direction = 'in' | 'out';
export type Channel = 'cash' | 'upi' | 'bank' | 'card' | 'other';
export type AccountTag = 'personal' | 'business' | 'mixed' | 'unknown';

export type TransactionCategory =
  | 'business_income'
  | 'personal_transfer'
  | 'inventory_purchase'
  | 'operating_expense'
  | 'supplier_payment'
  | 'refund'
  | 'unclassified';

export type EvidenceClass =
  | 'source_authenticated'
  | 'document_supplied'
  | 'owner_declared'
  | 'estimated'
  | 'unclassified';

export interface TransactionClassification {
  value: TransactionCategory;
  suggestedBy: 'rule' | 'user' | null;
  confidence?: number;
  reason?: string;
  confirmed: boolean;
}

export interface TransactionEvidence {
  class: EvidenceClass;
  sourceId: string;
  note?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  amount: number;
  direction: Direction;
  channel: Channel;
  account: AccountTag;
  category: TransactionCategory;
  classification: TransactionClassification;
  evidence: TransactionEvidence;
  counterparty?: string;
  description: string;
  linkedDocIds: string[];
  flags: string[];
}

export type SourceType =
  | 'bank_csv'
  | 'upi_export'
  | 'invoice'
  | 'receipt'
  | 'diary'
  | 'manual_cash';

export interface Source {
  id: string;
  type: SourceType;
  fileName?: string;
  fileUrl?: string; // in-memory blob or data URL
  uploadedAt: string;
  rowCount: number;
  accountTag: AccountTag;
  authenticated: false; // Invariant: always false in prototype
}

export interface DiaryDay {
  date: string; // 'YYYY-MM-DD'
  cashSales: number;
  upiSales: number;
  isOpen: boolean;
  cashInDrawerCounted?: number;
  notes?: string;
}

export interface UdhaarSettlement {
  date: string;
  amount: number;
  note?: string;
}

export interface Udhaar {
  id: string;
  customerLabel: string; // Anonymous nickname (e.g., 'Ramesh Bhai (Milkman)')
  amount: number;
  givenOn: string;
  status: 'open' | 'part' | 'settled';
  settlements: UdhaarSettlement[];
}

export type ObservationType =
  | 'missing_record'
  | 'duplicate'
  | 'inconsistent'
  | 'reconciliation_diff'
  | 'incomplete_expense_docs'
  | 'mixed_personal_business';

export interface Observation {
  id: string;
  type: ObservationType;
  severity: 'info' | 'attention';
  titleEn: string;
  titleHi: string;
  plainExplanationEn: string;
  plainExplanationHi: string;
  affectedTxnIds: string[];
  suggestedActionEn: string;
  suggestedActionHi: string;
  potentialValueShift?: {
    fromClass: EvidenceClass;
    toClass: EvidenceClass;
    amount: number;
  };
  resolved: boolean;
  resolutionNote?: string;
}

export interface ShareGrant {
  token: string;
  sections: string[];
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
  recipientLabel: string;
}

export type DimensionLevel = 'Limited' | 'Emerging' | 'Substantial' | 'Extensive';

export interface DimensionMetric {
  id: 'activity' | 'completeness' | 'patterns' | 'reliability';
  nameEn: string;
  nameHi: string;
  level: DimensionLevel;
  scorePercent: number; // 0 - 100
  factsEn: string[];
  factsHi: string[];
  improvementEn: string;
  improvementHi: string;
}


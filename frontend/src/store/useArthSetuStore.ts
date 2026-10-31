// Main Zustand Store for ArthSetu
// Handles complete offline state, deterministic seed loading, and local persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Business,
  DiaryDay,
  Observation,
  ShareGrant,
  Source,
  Transaction,
  TransactionCategory,
  Udhaar,
} from '../services/types';
import { BUSINESS_IDS } from '../data/seedConstants';
import { generateBusinessAData } from '../data/businessA_LakshmiKirana';
import { generateBusinessBData } from '../data/businessB_RangoliBazaar';
import { generateBusinessCData } from '../data/businessC_SunitaVariety';

interface ArthSetuState {
  currentBusinessId: string;
  business: Business;
  transactions: Transaction[];
  sources: Source[];
  diaryDays: DiaryDay[];
  udhaar: Udhaar[];
  observations: Observation[];
  shares: ShareGrant[];
  tourActive: boolean;
  tourStep: number;

  // Actions
  switchBusiness: (businessId: string) => void;
  resetDemoData: () => void;
  updateBusiness: (updates: Partial<Business>) => void;

  // Transaction Actions
  classifyTransaction: (id: string, category: TransactionCategory, confirmed?: boolean) => void;
  bulkClassifyTransactions: (ids: string[], category: TransactionCategory) => void;
  confirmSuggestion: (id: string) => void;
  confirmAllSuggestions: () => number;
  splitTransaction: (
    id: string,
    parts: { amount: number; category: TransactionCategory; description?: string }[]
  ) => void;
  addTransaction: (txn: Omit<Transaction, 'id'>) => Transaction;

  // Source Actions
  addSource: (source: Omit<Source, 'id' | 'authenticated'>) => Source;
  removeSource: (id: string) => void;

  // Diary & Udhaar Actions
  saveDiaryDay: (day: DiaryDay) => void;
  addUdhaar: (item: Omit<Udhaar, 'id' | 'settlements' | 'status'>) => void;
  settleUdhaar: (id: string, amount: number, note?: string) => void;

  // Observation Actions
  resolveObservation: (id: string, note?: string) => void;
  dismissObservation: (id: string) => void;

  // Share Actions
  addShareGrant: (grant: ShareGrant) => void;
  revokeShareGrant: (token: string) => void;

  // Guided Tour
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
}

function loadInitialBusinessData(id: string) {
  if (id === BUSINESS_IDS.B_RANGOLI_BAZAAR) {
    return generateBusinessBData();
  }
  if (id === BUSINESS_IDS.C_SUNITA_VARIETY) {
    return generateBusinessCData();
  }
  return generateBusinessAData();
}

const initialData = loadInitialBusinessData(BUSINESS_IDS.A_LAKSHMI_KIRANA);

export const useArthSetuStore = create<ArthSetuState>()(
  persist(
    (set, get) => ({
      currentBusinessId: BUSINESS_IDS.A_LAKSHMI_KIRANA,
      business: initialData.business,
      transactions: initialData.transactions,
      sources: initialData.sources,
      diaryDays: initialData.diaryDays,
      udhaar: initialData.udhaar,
      observations: initialData.observations,
      shares: [
        {
          token: 'demo',
          sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
          createdAt: '2026-10-25T10:00:00Z',
          expiresAt: '2026-11-25T10:00:00Z',
          recipientLabel: 'State Bank of India (Demonstration Share)',
        },
      ],
      tourActive: false,
      tourStep: 0,

      switchBusiness: (businessId: string) => {
        const data = loadInitialBusinessData(businessId);
        set({
          currentBusinessId: businessId,
          business: data.business,
          transactions: data.transactions,
          sources: data.sources,
          diaryDays: data.diaryDays,
          udhaar: data.udhaar,
          observations: data.observations,
        });
      },

      resetDemoData: () => {
        const id = get().currentBusinessId;
        const data = loadInitialBusinessData(id);
        set({
          business: data.business,
          transactions: data.transactions,
          sources: data.sources,
          diaryDays: data.diaryDays,
          udhaar: data.udhaar,
          observations: data.observations,
        });
      },

      updateBusiness: (updates) => {
        set((state) => ({
          business: { ...state.business, ...updates },
        }));
      },

      classifyTransaction: (id, category, confirmed = true) => {
        set((state) => {
          const updated = state.transactions.map((t) => {
            if (t.id === id) {
              const prevEvidenceClass = t.evidence.class;
              // If classifying an unclassified item, update its evidence class to document_supplied or owner_declared
              let newClass = prevEvidenceClass;
              if (prevEvidenceClass === 'unclassified') {
                newClass = t.channel === 'cash' ? 'owner_declared' : 'document_supplied';
              }
              return {
                ...t,
                category,
                classification: {
                  ...t.classification,
                  value: category,
                  confirmed,
                },
                evidence: {
                  ...t.evidence,
                  class: newClass,
                },
              };
            }
            return t;
          });
          return { transactions: updated };
        });
      },

      bulkClassifyTransactions: (ids, category) => {
        const idSet = new Set(ids);
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (idSet.has(t.id)) {
              let newClass = t.evidence.class;
              if (newClass === 'unclassified') {
                newClass = t.channel === 'cash' ? 'owner_declared' : 'document_supplied';
              }
              return {
                ...t,
                category,
                classification: {
                  ...t.classification,
                  value: category,
                  confirmed: true,
                },
                evidence: {
                  ...t.evidence,
                  class: newClass,
                },
              };
            }
            return t;
          }),
        }));
      },

      confirmSuggestion: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              let newClass = t.evidence.class;
              if (newClass === 'unclassified') {
                newClass = t.channel === 'cash' ? 'owner_declared' : 'document_supplied';
              }
              return {
                ...t,
                category: t.classification.value,
                classification: {
                  ...t.classification,
                  confirmed: true,
                },
                evidence: {
                  ...t.evidence,
                  class: newClass,
                },
              };
            }
            return t;
          }),
        }));
      },

      confirmAllSuggestions: () => {
        let count = 0;
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (!t.classification.confirmed && t.classification.suggestedBy) {
              count++;
              let newClass = t.evidence.class;
              if (newClass === 'unclassified') {
                newClass = t.channel === 'cash' ? 'owner_declared' : 'document_supplied';
              }
              return {
                ...t,
                category: t.classification.value,
                classification: {
                  ...t.classification,
                  confirmed: true,
                },
                evidence: {
                  ...t.evidence,
                  class: newClass,
                },
              };
            }
            return t;
          }),
        }));
        return count;
      },

      splitTransaction: (id, parts) => {
        set((state) => {
          const original = state.transactions.find((t) => t.id === id);
          if (!original) return state;

          const remaining = state.transactions.filter((t) => t.id !== id);
          const newEntries: Transaction[] = parts.map((part, idx) => ({
            ...original,
            id: `${original.id}_split_${idx + 1}`,
            amount: part.amount,
            category: part.category,
            description: part.description || `${original.description} (Part ${idx + 1})`,
            classification: {
              value: part.category,
              suggestedBy: 'user',
              confirmed: true,
            },
          }));

          return { transactions: [...remaining, ...newEntries] };
        });
      },

      addTransaction: (txn) => {
        const newTxn: Transaction = {
          ...txn,
          id: `txn_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
        set((state) => ({
          transactions: [newTxn, ...state.transactions],
        }));
        return newTxn;
      },

      addSource: (src) => {
        const newSrc: Source = {
          ...src,
          id: `src_user_${Date.now()}`,
          authenticated: false,
        };
        set((state) => ({
          sources: [newSrc, ...state.sources],
        }));
        return newSrc;
      },

      removeSource: (id) => {
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
        }));
      },

      saveDiaryDay: (day) => {
        set((state) => {
          const exists = state.diaryDays.some((d) => d.date === day.date);
          const updatedDays = exists
            ? state.diaryDays.map((d) => (d.date === day.date ? day : d))
            : [...state.diaryDays, day];
          return { diaryDays: updatedDays };
        });
      },

      addUdhaar: (item) => {
        const newUdh: Udhaar = {
          ...item,
          id: `udh_user_${Date.now()}`,
          status: 'open',
          settlements: [],
        };
        set((state) => ({
          udhaar: [newUdh, ...state.udhaar],
        }));
      },

      settleUdhaar: (id, amount, note) => {
        set((state) => ({
          udhaar: state.udhaar.map((u) => {
            if (u.id === id) {
              const settlements = [
                ...u.settlements,
                { date: new Date().toISOString().split('T')[0], amount, note },
              ];
              const totalSettled = settlements.reduce((s, curr) => s + curr.amount, 0);
              const status = totalSettled >= u.amount ? 'settled' : 'part';
              return { ...u, status, settlements };
            }
            return u;
          }),
        }));
      },

      resolveObservation: (id, note) => {
        set((state) => ({
          observations: state.observations.map((o) =>
            o.id === id ? { ...o, resolved: true, resolutionNote: note } : o
          ),
        }));
      },

      dismissObservation: (id) => {
        set((state) => ({
          observations: state.observations.map((o) =>
            o.id === id ? { ...o, resolved: true, resolutionNote: 'Dismissed by merchant' } : o
          ),
        }));
      },

      addShareGrant: (grant) => {
        set((state) => ({
          shares: [grant, ...state.shares],
        }));
      },

      revokeShareGrant: (token) => {
        set((state) => ({
          shares: state.shares.map((s) =>
            s.token === token ? { ...s, revokedAt: new Date().toISOString() } : s
          ),
        }));
      },

      startTour: () => set({ tourActive: true, tourStep: 1 }),
      nextTourStep: () => set((state) => ({ tourStep: Math.min(6, state.tourStep + 1) })),
      prevTourStep: () => set((state) => ({ tourStep: Math.max(1, state.tourStep - 1) })),
      endTour: () => set({ tourActive: false, tourStep: 0 }),
    }),
    {
      name: 'arthsetu_primary_store_v1',
      partialize: (state) => ({
        currentBusinessId: state.currentBusinessId,
        business: state.business,
        transactions: state.transactions,
        sources: state.sources,
        diaryDays: state.diaryDays,
        udhaar: state.udhaar,
        observations: state.observations,
        shares: state.shares,
      }),
    }
  )
);


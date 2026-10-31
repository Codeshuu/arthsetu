// Main Zustand Store for ArthSetu
// Handles complete multi-user isolation, private shopkeeper vaults, and local persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Business,
  BusinessCategory,
  DiaryDay,
  Observation,
  ShareGrant,
  Source,
  Transaction,
  TransactionCategory,
  Udhaar,
  UserAccount,
} from '../services/types';
import { BUSINESS_IDS } from '../data/seedConstants';
import { generateBusinessAData } from '../data/businessA_LakshmiKirana';
import { generateBusinessBData } from '../data/businessB_RangoliBazaar';
import { generateBusinessCData } from '../data/businessC_SunitaVariety';
import { SEED_USERS } from '../data/seedUsers';

export interface BusinessDataPayload {
  transactions: Transaction[];
  sources: Source[];
  diaryDays: DiaryDay[];
  udhaar: Udhaar[];
  observations: Observation[];
  shares: ShareGrant[];
}

interface ArthSetuState {
  // Multi-user & Account Management
  currentUser: UserAccount | null;
  users: UserAccount[];
  businesses: Record<string, Business>;
  businessDataStore: Record<string, BusinessDataPayload>;

  // Active Business & Records (Scoped strictly to current user)
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

  // Account & Auth Actions
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  loginAsDemoUser: (userId: string) => void;
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    businessName: string;
    category: BusinessCategory;
  }) => { success: boolean; error?: string };
  logout: () => void;
  getUserBusinesses: () => Business[];

  // Business Actions
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

function loadInitialBusinessData(id: string): { business: Business } & BusinessDataPayload {
  if (id === BUSINESS_IDS.B_RANGOLI_BAZAAR) {
    const data = generateBusinessBData();
    return {
      ...data,
      shares: [
        {
          token: 'demo-b',
          sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
          createdAt: '2026-10-25T10:00:00Z',
          expiresAt: '2026-11-25T10:00:00Z',
          recipientLabel: 'State Bank of India (Festival Appraisal)',
        },
      ],
    };
  }
  if (id === BUSINESS_IDS.C_SUNITA_VARIETY) {
    const data = generateBusinessCData();
    return {
      ...data,
      shares: [
        {
          token: 'demo-c',
          sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
          createdAt: '2026-10-25T10:00:00Z',
          expiresAt: '2026-11-25T10:00:00Z',
          recipientLabel: 'Bank of Baroda (Microcredit Appraisal)',
        },
      ],
    };
  }
  const data = generateBusinessAData();
  return {
    ...data,
    shares: [
      {
        token: 'demo',
        sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
        createdAt: '2026-10-25T10:00:00Z',
        expiresAt: '2026-11-25T10:00:00Z',
        recipientLabel: 'State Bank of India (Demonstration Share)',
      },
    ],
  };
}

const dataA = loadInitialBusinessData(BUSINESS_IDS.A_LAKSHMI_KIRANA);
const dataB = loadInitialBusinessData(BUSINESS_IDS.B_RANGOLI_BAZAAR);
const dataC = loadInitialBusinessData(BUSINESS_IDS.C_SUNITA_VARIETY);

const initialBusinesses: Record<string, Business> = {
  [BUSINESS_IDS.A_LAKSHMI_KIRANA]: dataA.business,
  [BUSINESS_IDS.B_RANGOLI_BAZAAR]: dataB.business,
  [BUSINESS_IDS.C_SUNITA_VARIETY]: dataC.business,
};

const initialBusinessDataStore: Record<string, BusinessDataPayload> = {
  [BUSINESS_IDS.A_LAKSHMI_KIRANA]: {
    transactions: dataA.transactions,
    sources: dataA.sources,
    diaryDays: dataA.diaryDays,
    udhaar: dataA.udhaar,
    observations: dataA.observations,
    shares: dataA.shares,
  },
  [BUSINESS_IDS.B_RANGOLI_BAZAAR]: {
    transactions: dataB.transactions,
    sources: dataB.sources,
    diaryDays: dataB.diaryDays,
    udhaar: dataB.udhaar,
    observations: dataB.observations,
    shares: dataB.shares,
  },
  [BUSINESS_IDS.C_SUNITA_VARIETY]: {
    transactions: dataC.transactions,
    sources: dataC.sources,
    diaryDays: dataC.diaryDays,
    udhaar: dataC.udhaar,
    observations: dataC.observations,
    shares: dataC.shares,
  },
};

export const useArthSetuStore = create<ArthSetuState>()(
  persist(
    (set, get) => ({
      currentUser: SEED_USERS[0], // Default logged-in demo user: Ramesh Patel
      users: SEED_USERS,
      businesses: initialBusinesses,
      businessDataStore: initialBusinessDataStore,

      currentBusinessId: BUSINESS_IDS.A_LAKSHMI_KIRANA,
      business: dataA.business,
      transactions: dataA.transactions,
      sources: dataA.sources,
      diaryDays: dataA.diaryDays,
      udhaar: dataA.udhaar,
      observations: dataA.observations,
      shares: dataA.shares,
      tourActive: false,
      tourStep: 0,

      // Authentication & Login
      login: (identifier: string, password?: string) => {
        const cleanId = identifier.trim().toLowerCase();
        const cleanPhone = cleanId.replace(/\D/g, '');
        const state = get();

        const user = state.users.find((u) => {
          const emailMatch = u.email.toLowerCase() === cleanId;
          const phoneClean = u.phone.replace(/\D/g, '');
          const phoneMatch = cleanPhone.length >= 7 && phoneClean.includes(cleanPhone);
          return emailMatch || phoneMatch;
        });

        if (!user) {
          return { success: false, error: 'No account found with this email or mobile number.' };
        }

        if (password && user.password && user.password !== password) {
          return { success: false, error: 'Incorrect password entered. Please try again.' };
        }

        // Save current business state before switching user
        const currentBizId = state.currentBusinessId;
        const updatedStore = {
          ...state.businessDataStore,
          [currentBizId]: {
            transactions: state.transactions,
            sources: state.sources,
            diaryDays: state.diaryDays,
            udhaar: state.udhaar,
            observations: state.observations,
            shares: state.shares,
          },
        };

        // Select the new user's first business
        const nextBizId = user.businessIds[0] || BUSINESS_IDS.A_LAKSHMI_KIRANA;
        const nextBiz = state.businesses[nextBizId] || initialBusinesses[nextBizId] || dataA.business;
        const nextData = updatedStore[nextBizId] || loadInitialBusinessData(nextBizId);

        set({
          currentUser: user,
          currentBusinessId: nextBizId,
          business: nextBiz,
          transactions: nextData.transactions,
          sources: nextData.sources,
          diaryDays: nextData.diaryDays,
          udhaar: nextData.udhaar,
          observations: nextData.observations,
          shares: nextData.shares,
          businessDataStore: updatedStore,
        });

        return { success: true };
      },

      loginAsDemoUser: (userId: string) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return;

        const currentBizId = state.currentBusinessId;
        const updatedStore = {
          ...state.businessDataStore,
          [currentBizId]: {
            transactions: state.transactions,
            sources: state.sources,
            diaryDays: state.diaryDays,
            udhaar: state.udhaar,
            observations: state.observations,
            shares: state.shares,
          },
        };

        const nextBizId = user.businessIds[0];
        const nextBiz = state.businesses[nextBizId] || initialBusinesses[nextBizId] || dataA.business;
        const nextData = updatedStore[nextBizId] || loadInitialBusinessData(nextBizId);

        set({
          currentUser: user,
          currentBusinessId: nextBizId,
          business: nextBiz,
          transactions: nextData.transactions,
          sources: nextData.sources,
          diaryDays: nextData.diaryDays,
          udhaar: nextData.udhaar,
          observations: nextData.observations,
          shares: nextData.shares,
          businessDataStore: updatedStore,
        });
      },

      register: (data) => {
        const state = get();
        const cleanEmail = data.email.trim().toLowerCase();
        const cleanPhone = data.phone.trim();

        // Check if user already exists
        const exists = state.users.some(
          (u) =>
            u.email.toLowerCase() === cleanEmail ||
            u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')
        );

        if (exists) {
          return { success: false, error: 'An account with this email or mobile number already exists.' };
        }

        const newUserId = `usr_${Date.now()}`;
        const newBizId = `biz_${Date.now()}`;

        const newBusiness: Business = {
          id: newBizId,
          ownerId: newUserId,
          name: data.businessName,
          category: data.category,
          ownership: 'sole_proprietorship',
          yearsOperating: 1,
          location: {
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            area: 'Main Market Road',
          },
          operatingDays: [1, 2, 3, 4, 5, 6],
          closedOnFestivals: true,
          language: 'en',
          isDemo: false,
        };

        const newUser: UserAccount = {
          id: newUserId,
          name: data.name,
          email: cleanEmail,
          phone: cleanPhone,
          password: data.password,
          businessIds: [newBizId],
          createdAt: new Date().toISOString(),
        };

        const newEmptyData: BusinessDataPayload = {
          transactions: [],
          sources: [],
          diaryDays: [],
          udhaar: [],
          observations: [],
          shares: [
            {
              token: `share_${Date.now()}`,
              sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
              recipientLabel: 'Institutional Review Share',
            },
          ],
        };

        // Save current business data first
        const currentBizId = state.currentBusinessId;
        const updatedStore = {
          ...state.businessDataStore,
          [currentBizId]: {
            transactions: state.transactions,
            sources: state.sources,
            diaryDays: state.diaryDays,
            udhaar: state.udhaar,
            observations: state.observations,
            shares: state.shares,
          },
          [newBizId]: newEmptyData,
        };

        set({
          users: [...state.users, newUser],
          currentUser: newUser,
          businesses: { ...state.businesses, [newBizId]: newBusiness },
          businessDataStore: updatedStore,
          currentBusinessId: newBizId,
          business: newBusiness,
          transactions: newEmptyData.transactions,
          sources: newEmptyData.sources,
          diaryDays: newEmptyData.diaryDays,
          udhaar: newEmptyData.udhaar,
          observations: newEmptyData.observations,
          shares: newEmptyData.shares,
        });

        return { success: true };
      },

      logout: () => {
        const state = get();
        // Persist active state into businessDataStore
        const currentBizId = state.currentBusinessId;
        const updatedStore = {
          ...state.businessDataStore,
          [currentBizId]: {
            transactions: state.transactions,
            sources: state.sources,
            diaryDays: state.diaryDays,
            udhaar: state.udhaar,
            observations: state.observations,
            shares: state.shares,
          },
        };

        set({
          currentUser: null,
          businessDataStore: updatedStore,
        });
      },

      getUserBusinesses: () => {
        const state = get();
        if (!state.currentUser) return [];
        return state.currentUser.businessIds
          .map((id) => state.businesses[id])
          .filter(Boolean);
      },

      switchBusiness: (businessId: string) => {
        const state = get();
        // Security check: only allow switching to businesses owned by current user
        if (!state.currentUser || !state.currentUser.businessIds.includes(businessId)) {
          console.warn(`Unauthorized attempt to access business ${businessId}`);
          return;
        }

        // Save current active state before switching
        const currentBizId = state.currentBusinessId;
        const updatedStore = {
          ...state.businessDataStore,
          [currentBizId]: {
            transactions: state.transactions,
            sources: state.sources,
            diaryDays: state.diaryDays,
            udhaar: state.udhaar,
            observations: state.observations,
            shares: state.shares,
          },
        };

        const targetBiz = state.businesses[businessId] || initialBusinesses[businessId];
        const targetData = updatedStore[businessId] || loadInitialBusinessData(businessId);

        set({
          currentBusinessId: businessId,
          business: targetBiz,
          transactions: targetData.transactions,
          sources: targetData.sources,
          diaryDays: targetData.diaryDays,
          udhaar: targetData.udhaar,
          observations: targetData.observations,
          shares: targetData.shares,
          businessDataStore: updatedStore,
        });
      },

      resetDemoData: () => {
        const state = get();
        const id = state.currentBusinessId;
        const data = loadInitialBusinessData(id);

        set((s) => ({
          business: data.business,
          transactions: data.transactions,
          sources: data.sources,
          diaryDays: data.diaryDays,
          udhaar: data.udhaar,
          observations: data.observations,
          shares: data.shares,
          businessDataStore: {
            ...s.businessDataStore,
            [id]: {
              transactions: data.transactions,
              sources: data.sources,
              diaryDays: data.diaryDays,
              udhaar: data.udhaar,
              observations: data.observations,
              shares: data.shares,
            },
          },
        }));
      },

      updateBusiness: (updates) => {
        set((state) => {
          const updatedBiz = { ...state.business, ...updates };
          return {
            business: updatedBiz,
            businesses: {
              ...state.businesses,
              [state.currentBusinessId]: updatedBiz,
            },
          };
        });
      },

      classifyTransaction: (id, category, confirmed = true) => {
        set((state) => {
          const updated = state.transactions.map((t) => {
            if (t.id === id) {
              const prevEvidenceClass = t.evidence.class;
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

          return {
            transactions: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                transactions: updated,
              },
            },
          };
        });
      },

      bulkClassifyTransactions: (ids, category) => {
        const idSet = new Set(ids);
        set((state) => {
          const updated = state.transactions.map((t) => {
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
          });

          return {
            transactions: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                transactions: updated,
              },
            },
          };
        });
      },

      confirmSuggestion: (id) => {
        set((state) => {
          const updated = state.transactions.map((t) => {
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
          });

          return {
            transactions: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                transactions: updated,
              },
            },
          };
        });
      },

      confirmAllSuggestions: () => {
        let count = 0;
        set((state) => {
          const updated = state.transactions.map((t) => {
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
          });

          return {
            transactions: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                transactions: updated,
              },
            },
          };
        });
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

          const updated = [...remaining, ...newEntries];
          return {
            transactions: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                transactions: updated,
              },
            },
          };
        });
      },

      addTransaction: (txn) => {
        const state = get();
        const newTxn: Transaction = {
          ...txn,
          id: `txn_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          businessId: state.currentBusinessId,
          ownerId: state.currentUser?.id,
        };
        const updated = [newTxn, ...state.transactions];
        set({
          transactions: updated,
          businessDataStore: {
            ...state.businessDataStore,
            [state.currentBusinessId]: {
              ...state.businessDataStore[state.currentBusinessId],
              transactions: updated,
            },
          },
        });
        return newTxn;
      },

      addSource: (src) => {
        const state = get();
        const newSrc: Source = {
          ...src,
          id: `src_user_${Date.now()}`,
          businessId: state.currentBusinessId,
          ownerId: state.currentUser?.id,
          authenticated: false,
        };
        const updated = [newSrc, ...state.sources];
        set({
          sources: updated,
          businessDataStore: {
            ...state.businessDataStore,
            [state.currentBusinessId]: {
              ...state.businessDataStore[state.currentBusinessId],
              sources: updated,
            },
          },
        });
        return newSrc;
      },

      removeSource: (id) => {
        set((state) => {
          const updated = state.sources.filter((s) => s.id !== id);
          return {
            sources: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                sources: updated,
              },
            },
          };
        });
      },

      saveDiaryDay: (day) => {
        set((state) => {
          const enhancedDay: DiaryDay = {
            ...day,
            businessId: state.currentBusinessId,
            ownerId: state.currentUser?.id,
          };
          const exists = state.diaryDays.some((d) => d.date === day.date);
          const updatedDays = exists
            ? state.diaryDays.map((d) => (d.date === day.date ? enhancedDay : d))
            : [...state.diaryDays, enhancedDay];

          return {
            diaryDays: updatedDays,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                diaryDays: updatedDays,
              },
            },
          };
        });
      },

      addUdhaar: (item) => {
        const state = get();
        const newUdh: Udhaar = {
          ...item,
          id: `udh_user_${Date.now()}`,
          businessId: state.currentBusinessId,
          ownerId: state.currentUser?.id,
          status: 'open',
          settlements: [],
        };
        const updated = [newUdh, ...state.udhaar];
        set({
          udhaar: updated,
          businessDataStore: {
            ...state.businessDataStore,
            [state.currentBusinessId]: {
              ...state.businessDataStore[state.currentBusinessId],
              udhaar: updated,
            },
          },
        });
      },

      settleUdhaar: (id, amount, note) => {
        set((state) => {
          const updated = state.udhaar.map((u) => {
            if (u.id === id) {
              const settlements = [
                ...u.settlements,
                { date: new Date().toISOString().split('T')[0], amount, note },
              ];
              const totalSettled = settlements.reduce((s, curr) => s + curr.amount, 0);
              const status = totalSettled >= u.amount ? ('settled' as const) : ('part' as const);
              return { ...u, status, settlements };
            }
            return u;
          });

          return {
            udhaar: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                udhaar: updated,
              },
            },
          };
        });
      },

      resolveObservation: (id, note) => {
        set((state) => {
          const updated = state.observations.map((o) =>
            o.id === id ? { ...o, resolved: true, resolutionNote: note } : o
          );
          return {
            observations: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                observations: updated,
              },
            },
          };
        });
      },

      dismissObservation: (id) => {
        set((state) => {
          const updated = state.observations.map((o) =>
            o.id === id ? { ...o, resolved: true, resolutionNote: 'Dismissed by merchant' } : o
          );
          return {
            observations: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                observations: updated,
              },
            },
          };
        });
      },

      addShareGrant: (grant) => {
        set((state) => {
          const enhancedGrant: ShareGrant = {
            ...grant,
            businessId: state.currentBusinessId,
            ownerId: state.currentUser?.id,
          };
          const updated = [enhancedGrant, ...state.shares];
          return {
            shares: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                shares: updated,
              },
            },
          };
        });
      },

      revokeShareGrant: (token) => {
        set((state) => {
          const updated = state.shares.map((s) =>
            s.token === token ? { ...s, revokedAt: new Date().toISOString() } : s
          );
          return {
            shares: updated,
            businessDataStore: {
              ...state.businessDataStore,
              [state.currentBusinessId]: {
                ...state.businessDataStore[state.currentBusinessId],
                shares: updated,
              },
            },
          };
        });
      },

      startTour: () => set({ tourActive: true, tourStep: 1 }),
      nextTourStep: () => set((state) => ({ tourStep: Math.min(6, state.tourStep + 1) })),
      prevTourStep: () => set((state) => ({ tourStep: Math.max(1, state.tourStep - 1) })),
      endTour: () => set({ tourActive: false, tourStep: 0 }),
    }),
    {
      name: 'arthsetu_primary_store_v2',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        businesses: state.businesses,
        businessDataStore: state.businessDataStore,
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

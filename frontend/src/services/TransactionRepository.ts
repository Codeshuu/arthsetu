// TransactionRepository interface & Local implementation
// NOTE: In a future cloud-backed architecture, a RemoteTransactionRepository would
// call GET/POST/PATCH /api/v1/transactions with cursor pagination.

import { Transaction, TransactionCategory } from './types';
import { useArthSetuStore } from '../store/useArthSetuStore';

export interface TransactionFilterOptions {
  startDate?: string;
  endDate?: string;
  direction?: 'in' | 'out';
  channel?: string;
  category?: string;
  evidenceClass?: string;
  account?: string;
  search?: string;
  flaggedOnly?: boolean;
}

export interface ITransactionRepository {
  getAll(): Transaction[];
  getById(id: string): Transaction | undefined;
  classify(id: string, category: TransactionCategory, confirmed?: boolean): Promise<Transaction>;
  bulkClassify(ids: string[], category: TransactionCategory): Promise<void>;
  confirmSuggestion(id: string): Promise<Transaction>;
  confirmAllSuggestions(): Promise<number>;
  splitTransaction(id: string, parts: { amount: number; category: TransactionCategory; description?: string }[]): Promise<void>;
  addTransaction(txn: Omit<Transaction, 'id'>): Promise<Transaction>;
}

class LocalTransactionRepository implements ITransactionRepository {
  getAll(): Transaction[] {
    return useArthSetuStore.getState().transactions;
  }

  getById(id: string): Transaction | undefined {
    return useArthSetuStore.getState().transactions.find((t) => t.id === id);
  }

  async classify(id: string, category: TransactionCategory, confirmed = true): Promise<Transaction> {
    useArthSetuStore.getState().classifyTransaction(id, category, confirmed);
    const updated = this.getById(id);
    if (!updated) throw new Error(`Transaction ${id} not found`);
    return updated;
  }

  async bulkClassify(ids: string[], category: TransactionCategory): Promise<void> {
    useArthSetuStore.getState().bulkClassifyTransactions(ids, category);
  }

  async confirmSuggestion(id: string): Promise<Transaction> {
    useArthSetuStore.getState().confirmSuggestion(id);
    const updated = this.getById(id);
    if (!updated) throw new Error(`Transaction ${id} not found`);
    return updated;
  }

  async confirmAllSuggestions(): Promise<number> {
    return useArthSetuStore.getState().confirmAllSuggestions();
  }

  async splitTransaction(id: string, parts: { amount: number; category: TransactionCategory; description?: string }[]): Promise<void> {
    useArthSetuStore.getState().splitTransaction(id, parts);
  }

  async addTransaction(txn: Omit<Transaction, 'id'>): Promise<Transaction> {
    return useArthSetuStore.getState().addTransaction(txn);
  }
}

export const transactionRepository: ITransactionRepository = new LocalTransactionRepository();


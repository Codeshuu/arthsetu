// DocumentStore interface & Local implementation
// NOTE: In a future cloud architecture, a RemoteDocumentStore would upload blobs
// to S3/GCS signed URLs and store document metadata in PostgreSQL/MongoDB.

import { Source } from './types';
import { useArthSetuStore } from '../store/useArthSetuStore';

export interface IDocumentStore {
  getAllSources(): Source[];
  getSourceById(id: string): Source | undefined;
  addSource(source: Omit<Source, 'id' | 'authenticated'>): Promise<Source>;
  removeSource(id: string): Promise<void>;
  createObjectUrl(file: File): string;
}

class LocalDocumentStore implements IDocumentStore {
  private objectUrls: Map<string, string> = new Map();

  getAllSources(): Source[] {
    return useArthSetuStore.getState().sources;
  }

  getSourceById(id: string): Source | undefined {
    return useArthSetuStore.getState().sources.find((s) => s.id === id);
  }

  async addSource(source: Omit<Source, 'id' | 'authenticated'>): Promise<Source> {
    return useArthSetuStore.getState().addSource(source);
  }

  async removeSource(id: string): Promise<void> {
    useArthSetuStore.getState().removeSource(id);
  }

  createObjectUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.objectUrls.set(file.name, url);
    return url;
  }
}

export const documentStore: IDocumentStore = new LocalDocumentStore();


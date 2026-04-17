import { mockGetDocument, mockListDocuments, mockUpsertDocument } from '../data/mock';
import type { DocumentInput, KnowledgeDocument } from '../types/api';
import { isNetworkError, requestJson } from './client';

export async function listDocuments(): Promise<KnowledgeDocument[]> {
  try {
    return await requestJson<KnowledgeDocument[]>('/api/knowledge/documents');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockListDocuments();
    }
    throw error;
  }
}

export async function getDocument(id: string): Promise<KnowledgeDocument | null> {
  try {
    return await requestJson<KnowledgeDocument>(`/api/knowledge/documents/${encodeURIComponent(id)}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockGetDocument(id) ?? null;
    }
    throw error;
  }
}

export async function upsertDocument(input: DocumentInput): Promise<KnowledgeDocument> {
  try {
    return await requestJson<KnowledgeDocument>('/api/knowledge/documents', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  } catch (error) {
    if (isNetworkError(error)) {
      return mockUpsertDocument(input);
    }
    throw error;
  }
}

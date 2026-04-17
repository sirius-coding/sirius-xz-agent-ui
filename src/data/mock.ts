import type { AgentAnswer, AgentSummary, BackendHealth, DocumentInput, KnowledgeDocument } from '../types/api';

const initialDocuments: KnowledgeDocument[] = [
  {
    id: 'agent-overview',
    title: 'Agent Overview',
    content: 'This document describes the current agent scope, summary endpoint, and answer contract.',
    tags: ['agent', 'summary', 'contract']
  },
  {
    id: 'knowledge-flow',
    title: 'Knowledge Flow',
    content: 'Knowledge documents are listed, viewed, and upserted through the knowledge API.',
    tags: ['knowledge', 'rag', 'documents']
  },
  {
    id: 'deployment-notes',
    title: 'Deployment Notes',
    content: 'The UI can run against a local backend proxy or fall back to mock data when the service is offline.',
    tags: ['ui', 'proxy', 'fallback']
  }
];

let documents = [...initialDocuments];

export function mockAgentSummary(name = 'Sirius'): AgentSummary {
  return {
    name,
    position: 'AI Agent Console',
    focus: ['Spring AI Alibaba', 'RAG', 'Agent', 'Knowledge Base']
  };
}

export function mockBackendHealth(): BackendHealth {
  return {
    status: 'UP',
    details: {
      mode: 'mock',
      message: 'Backend unavailable, using local fallback data'
    }
  };
}

export function mockListDocuments(): KnowledgeDocument[] {
  return [...documents];
}

export function mockGetDocument(id: string): KnowledgeDocument | undefined {
  return documents.find((document) => document.id === id);
}

export function mockUpsertDocument(input: DocumentInput): KnowledgeDocument {
  const next: KnowledgeDocument = {
    id: input.id,
    title: input.title,
    content: input.content,
    tags: input.tags
  };

  const index = documents.findIndex((document) => document.id === input.id);
  if (index >= 0) {
    documents = documents.map((document) => (document.id === input.id ? next : document));
  } else {
    documents = [next, ...documents];
  }

  return next;
}

export function mockAsk(question: string): AgentAnswer {
  const tokens = normalize(question);
  const scored = documents
    .map((document) => {
      const haystack = normalize([document.title, document.content, document.tags.join(' ')].join(' '));
      const matched = tokens.filter((token) => haystack.includes(token));
      return { document, matched };
    })
    .sort((left, right) => right.matched.length - left.matched.length);

  const topMatches = scored.filter((item) => item.matched.length > 0).slice(0, 3);
  const sources = topMatches.map((item) => item.document);
  const matchedTokens = [...new Set(topMatches.flatMap((item) => item.matched))];
  const confidence = sources.length === 0 ? 18 : Math.min(95, 40 + sources.length * 18 + matchedTokens.length * 4);

  return {
    answer:
      sources.length === 0
        ? 'No strong knowledge match was found. Use the knowledge editor to add a document that covers this question.'
        : `Based on ${sources.length} source document${sources.length > 1 ? 's' : ''}, the answer is synthesized from the current knowledge base.`,
    sources,
    confidence,
    matchedTokens
  };
}

function normalize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

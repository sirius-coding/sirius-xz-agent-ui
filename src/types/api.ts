export interface AgentSummary {
  name: string;
  position: string;
  focus: string[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface AgentAnswer {
  answer: string;
  sources: KnowledgeDocument[];
  confidence: number;
  matchedTokens: string[];
}

export interface BackendHealth {
  status: string;
  details?: Record<string, unknown>;
}

export interface DocumentInput {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

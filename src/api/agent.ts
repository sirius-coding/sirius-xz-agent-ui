import { mockAgentSummary, mockAsk } from '../data/mock';
import type { AgentAnswer, AgentSummary } from '../types/api';
import { isNetworkError, requestJson } from './client';

export async function getAgentSummary(name = 'Sirius'): Promise<AgentSummary> {
  try {
    return await requestJson<AgentSummary>(`/api/agent/summary?name=${encodeURIComponent(name)}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockAgentSummary(name);
    }
    throw error;
  }
}

export async function askAgent(question: string): Promise<AgentAnswer> {
  try {
    return await requestJson<AgentAnswer>(`/api/agent/ask?question=${encodeURIComponent(question)}`);
  } catch (error) {
    if (isNetworkError(error)) {
      return mockAsk(question);
    }
    throw error;
  }
}

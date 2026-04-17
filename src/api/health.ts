import { mockBackendHealth } from '../data/mock';
import type { BackendHealth } from '../types/api';
import { isNetworkError, requestJson } from './client';

export async function getBackendHealth(): Promise<BackendHealth> {
  try {
    return await requestJson<BackendHealth>('/actuator/health');
  } catch (error) {
    if (isNetworkError(error)) {
      return mockBackendHealth();
    }
    return {
      status: 'DOWN',
      details: {
        message: error instanceof Error ? error.message : 'Unknown backend error'
      }
    };
  }
}

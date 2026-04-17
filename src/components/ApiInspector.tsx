import type { BackendHealth } from '../types/api';
import { StatusPill } from './StatusPill';

type ApiInspectorProps = {
  apiBaseUrl: string;
  health: BackendHealth | null;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function ApiInspector({ apiBaseUrl, health, onRefresh, isRefreshing }: ApiInspectorProps) {
  const tone = health?.status === 'UP' ? 'success' : health?.status === 'DOWN' ? 'danger' : 'neutral';

  return (
    <div className="api-inspector">
      <div className="api-inspector__row">
        <div>
          <span className="muted-label">API Base URL</span>
          <strong>{apiBaseUrl}</strong>
        </div>
        <button className="button" type="button" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? '刷新中...' : '刷新健康状态'}
        </button>
      </div>

      <div className="api-inspector__health">
        <StatusPill tone={tone}>{health?.status ?? 'UNKNOWN'}</StatusPill>
        <p>{health?.details ? JSON.stringify(health.details, null, 2) : '尚未获取健康状态。'}</p>
      </div>

      <div className="code-block">
        <code>
          GET /api/agent/summary
          {'\n'}
          GET /api/agent/ask?question=...
          {'\n'}
          GET /api/knowledge/documents
          {'\n'}
          POST /api/knowledge/documents
          {'\n'}
          GET /api/knowledge/documents/{'{id}'}
        </code>
      </div>
    </div>
  );
}

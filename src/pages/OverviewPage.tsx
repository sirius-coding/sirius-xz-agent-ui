import { MetricCard } from '../components/MetricCard';
import { SectionCard } from '../components/SectionCard';
import { StatusPill } from '../components/StatusPill';
import type { BackendHealth, KnowledgeDocument, AgentSummary } from '../types/api';

type OverviewPageProps = {
  summary: AgentSummary | null;
  documentCount: number;
  selectedDocument: KnowledgeDocument | null;
  topFocus: string[];
  health: BackendHealth | null;
  lastSyncedAt: string;
  loading: boolean;
};

export function OverviewPage({ summary, documentCount, selectedDocument, topFocus, health, lastSyncedAt, loading }: OverviewPageProps) {
  const runtimeLabel = health?.details && typeof health.details === 'object' && health.details !== null && 'mode' in health.details
    ? String((health.details as Record<string, unknown>).mode)
    : 'live';

  return (
    <div className="page-stack">
      <SectionCard title="Agent Summary" description="从后端接口直接读取的 Agent 信息。">
        {loading && !summary ? (
          <div className="empty-state">Loading summary...</div>
        ) : (
          <>
            <div className="summary-grid">
              <MetricCard label="Name" value={summary?.name ?? 'Sirius'} hint="agent identity" />
              <MetricCard label="Position" value={summary?.position ?? 'Unknown'} hint="role" />
              <MetricCard label="Focus" value={String(topFocus.length)} hint={topFocus.join(' · ')} accent="violet" />
            </div>
            <div className="status-panel">
              {topFocus.map((item) => (
                <StatusPill key={item} tone="neutral">
                  {item}
                </StatusPill>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="System Snapshot" description="运行态、同步态和知识库状态的总览。">
        <div className="snapshot-grid">
          <div className="snapshot-card">
            <span className="muted-label">Runtime</span>
            <strong>{runtimeLabel}</strong>
            <p>{health?.status === 'UP' ? 'Backend endpoint is reachable.' : 'UI is running with local fallback.'}</p>
          </div>
          <div className="snapshot-card">
            <span className="muted-label">Last Sync</span>
            <strong>{lastSyncedAt}</strong>
            <p>Bootstrap, health refresh, or knowledge save will update this timestamp.</p>
          </div>
          <div className="snapshot-card">
            <span className="muted-label">Documents</span>
            <strong>{documentCount}</strong>
            <p>{selectedDocument?.title ?? 'Select a document to inspect and edit it.'}</p>
          </div>
        </div>
        <div className="summary-grid summary-grid--compact">
          <MetricCard label="Documents" value={String(documentCount)} hint="stored knowledge docs" />
          <MetricCard label="Health" value={health?.status ?? 'UNKNOWN'} hint="backend availability" accent="violet" />
        </div>
      </SectionCard>
    </div>
  );
}

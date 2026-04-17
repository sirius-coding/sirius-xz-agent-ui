import { useEffect, useMemo, useState } from 'react';
import { getAgentSummary, askAgent } from './api/agent';
import { getBackendHealth } from './api/health';
import { getDocument, listDocuments, upsertDocument } from './api/knowledge';
import { mockAgentSummary, mockBackendHealth, mockListDocuments } from './data/mock';
import { ApiInspector } from './components/ApiInspector';
import { ChatPanel } from './components/ChatPanel';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentList } from './components/DocumentList';
import { MetricCard } from './components/MetricCard';
import { SectionCard } from './components/SectionCard';
import { StatusPill } from './components/StatusPill';
import { TabBar } from './components/TabBar';
import type { AgentAnswer, AgentSummary, BackendHealth, DocumentInput, KnowledgeDocument } from './types/api';

type TabKey = 'overview' | 'chat' | 'knowledge' | 'api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'relative proxy';

const emptyDocument = (): DocumentInput => ({
  id: '',
  title: '',
  content: '',
  tags: []
});

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [editorValue, setEditorValue] = useState<DocumentInput>(emptyDocument());
  const [question, setQuestion] = useState('这个系统如何做知识库管理？');
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDocument, setSavingDocument] = useState(false);
  const [asking, setAsking] = useState(false);
  const [refreshingHealth, setRefreshingHealth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId]
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      setEditorValue({
        id: selectedDocument.id,
        title: selectedDocument.title,
        content: selectedDocument.content,
        tags: selectedDocument.tags
      });
    }
  }, [selectedDocument]);

  async function bootstrap() {
    try {
      setLoading(true);
      const [summaryResult, documentsResult, healthResult] = await Promise.allSettled([
        getAgentSummary('Sirius'),
        listDocuments(),
        getBackendHealth()
      ]);

      const nextSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : mockAgentSummary('Sirius');
      const nextDocuments = documentsResult.status === 'fulfilled' ? documentsResult.value : mockListDocuments();
      const nextHealth = healthResult.status === 'fulfilled' ? healthResult.value : mockBackendHealth();

      setSummary(nextSummary);
      setDocuments(nextDocuments);
      setHealth(nextHealth);
      setLastSyncedAt(new Date());
      setSelectedDocumentId((current) => current || nextDocuments[0]?.id || '');
      if (nextDocuments.length > 0) {
        setEditorValue({
          id: nextDocuments[0].id,
          title: nextDocuments[0].title,
          content: nextDocuments[0].content,
          tags: nextDocuments[0].tags
        });
      }
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '初始化失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed) {
      setError('请输入要提问的问题');
      return;
    }

    try {
      setAsking(true);
      setError(null);
      const nextAnswer = await askAgent(trimmed);
      setAnswer(nextAnswer);
      setActiveTab('chat');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '问答失败');
    } finally {
      setAsking(false);
    }
  }

  async function handleSaveDocument() {
    const trimmedTitle = editorValue.title.trim();
    const trimmedContent = editorValue.content.trim();
    const nextId = editorValue.id.trim() || createDocumentId(trimmedTitle);

    if (!nextId || !trimmedTitle || !trimmedContent || editorValue.tags.length === 0) {
      setError('文档 ID、标题、正文和至少一个标签都是必填项');
      return;
    }

    try {
      setSavingDocument(true);
      setError(null);
      const saved = await upsertDocument({
        id: nextId,
        title: trimmedTitle,
        content: trimmedContent,
        tags: editorValue.tags
      });
      const refreshed = await listDocuments().catch(() => {
        const merged = [saved, ...documents.filter((document) => document.id !== saved.id)];
        return merged;
      });
      setDocuments(refreshed);
      setLastSyncedAt(new Date());
      setSelectedDocumentId(saved.id);
      setEditorValue(saved);
      setActiveTab('knowledge');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存文档失败');
    } finally {
      setSavingDocument(false);
    }
  }

  async function handleDocumentSelect(document: KnowledgeDocument) {
    setSelectedDocumentId(document.id);
    try {
      const detail = await getDocument(document.id);
      const nextDocument = detail ?? document;
      setEditorValue({
        id: nextDocument.id,
        title: nextDocument.title,
        content: nextDocument.content,
        tags: nextDocument.tags
      });
    } catch (cause) {
      setEditorValue({
        id: document.id,
        title: document.title,
        content: document.content,
        tags: document.tags
      });
      setError(cause instanceof Error ? cause.message : '获取文档详情失败');
    }
  }

  async function handleRefreshHealth() {
    try {
      setRefreshingHealth(true);
      const nextHealth = await getBackendHealth();
      setHealth(nextHealth);
      setLastSyncedAt(new Date());
    } finally {
      setRefreshingHealth(false);
    }
  }

  const documentCount = documents.length;
  const topFocus = summary?.focus?.slice(0, 4) ?? [];
  const backendLabel = health?.status === 'UP' ? 'Connected' : 'Fallback';
  const runtimeLabel = health?.details && typeof health.details === 'object' && health.details !== null && 'mode' in health.details
    ? String((health.details as Record<string, unknown>).mode)
    : 'live';
  const healthTone = health?.status === 'UP' ? 'success' : health?.status === 'DOWN' ? 'danger' : 'warning';
  const tabCounts = {
    overview: 2,
    chat: answer ? 1 : 0,
    knowledge: documentCount,
    api: 1
  } as const;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <StatusPill tone={healthTone}>{backendLabel}</StatusPill>
            <span>Project: sirius-xz-agent-ui</span>
            <span>Runtime: {runtimeLabel}</span>
            <span>Sync: {lastSyncedAt ? formatTimestamp(lastSyncedAt) : 'pending'}</span>
          </div>
          <h1>Agent Console for sirius-xz-agent</h1>
          <p>
            一个面向接口定义和系统设计的前端控制台，覆盖问答、知识库管理和接口调试。
          </p>
        </div>
        <div className="hero__stats">
          <MetricCard label="Documents" value={String(documentCount)} hint="knowledge base entries" />
          <MetricCard label="Backend" value={health?.status ?? 'UNKNOWN'} hint={JSON.stringify(health?.details ?? {}, null, 0)} accent="violet" />
          <MetricCard label="Mode" value={summary?.position ?? 'Console'} hint={summary?.name ?? 'Sirius'} accent="teal" />
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar__meta">
          <StatusPill tone={healthTone}>{runtimeLabel === 'mock' ? 'Mock Fallback' : 'Live Backend'}</StatusPill>
          <span>{documentCount} documents</span>
          <span>{answer ? 'Answer ready' : 'No answer yet'}</span>
        </div>
        <button className="button" type="button" onClick={() => void bootstrap()} disabled={loading}>
          {loading ? '同步中...' : 'Refresh workspace'}
        </button>
      </div>

      <TabBar active={activeTab} onChange={(tab) => setActiveTab(tab)} counts={tabCounts} />

      {error ? <div className="notice notice--error">{error}</div> : null}

      <main className="content-grid">
        {activeTab === 'overview' ? (
          <>
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

            <SectionCard
              title="System Snapshot"
              description="把运行态、接口态和知识库态集中放在一个可视化区域。"
            >
              <div className="snapshot-grid">
                <div className="snapshot-card">
                  <span className="muted-label">Runtime</span>
                  <strong>{runtimeLabel}</strong>
                  <p>{health?.status === 'UP' ? 'Backend endpoint is reachable.' : 'UI is running with local fallback.'}</p>
                </div>
                <div className="snapshot-card">
                  <span className="muted-label">Last Sync</span>
                  <strong>{lastSyncedAt ? formatTimestamp(lastSyncedAt) : 'Pending'}</strong>
                  <p>Bootstrap, health refresh, or knowledge save will update this timestamp.</p>
                </div>
                <div className="snapshot-card">
                  <span className="muted-label">Selection</span>
                  <strong>{selectedDocument?.title ?? 'None'}</strong>
                  <p>{selectedDocument?.id ?? 'Select a document to inspect and edit it.'}</p>
                </div>
              </div>
              <div className="summary-grid summary-grid--compact">
                <MetricCard label="Documents" value={String(documentCount)} hint="stored knowledge docs" />
                <MetricCard label="Health" value={health?.status ?? 'UNKNOWN'} hint="backend availability" accent="violet" />
              </div>
            </SectionCard>
          </>
        ) : null}

        {activeTab === 'chat' ? (
          <SectionCard title="Ask the Agent" description="输入问题后查看结构化回答、来源和命中词。">
            <ChatPanel
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={() => void handleAsk()}
              isSubmitting={asking}
              answer={answer}
              error={error}
              promptHint="优先问与系统设计、知识库内容、接口行为相关的问题，便于验证当前后端能力。"
            />
          </SectionCard>
        ) : null}

        {activeTab === 'knowledge' ? (
          <div className="knowledge-layout">
            <SectionCard title="Document List" description="选择一个文档查看并编辑。">
              {documents.length > 0 ? (
                <DocumentList
                  documents={documents}
                  selectedId={selectedDocumentId}
                  onSelect={(document) => void handleDocumentSelect(document)}
                />
              ) : (
                <div className="empty-state">No knowledge documents found.</div>
              )}
            </SectionCard>

            <SectionCard title="Document Editor" description="用于创建或更新知识文档。">
              <DocumentEditor
                value={editorValue}
                onChange={setEditorValue}
                onSave={() => void handleSaveDocument()}
                isSaving={savingDocument}
              />
            </SectionCard>
          </div>
        ) : null}

        {activeTab === 'api' ? (
          <SectionCard title="API Inspector" description="查看接口状态和代理配置。">
            <ApiInspector
              apiBaseUrl={API_BASE_URL}
              health={health}
              onRefresh={() => void handleRefreshHealth()}
              isRefreshing={refreshingHealth}
            />
          </SectionCard>
        ) : null}
      </main>
    </div>
  );
}

function createDocumentId(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(value);
}

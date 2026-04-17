import { useEffect, useMemo, useState } from 'react';
import { getAgentSummary, askAgent } from './api/agent';
import { getBackendHealth } from './api/health';
import { getDocument, listDocuments, upsertDocument } from './api/knowledge';
import { mockAgentSummary, mockBackendHealth, mockListDocuments } from './data/mock';
import { ApiPage } from './pages/ApiPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { OverviewPage } from './pages/OverviewPage';
import { SideNav } from './components/SideNav';
import { MetricCard } from './components/MetricCard';
import { StatusPill } from './components/StatusPill';
import type { AgentAnswer, AgentSummary, BackendHealth, DocumentInput, KnowledgeDocument } from './types/api';

type PageKey = 'overview' | 'chat' | 'knowledge' | 'api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'relative proxy';

const emptyDocument = (): DocumentInput => ({
  id: '',
  title: '',
  content: '',
  tags: []
});

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>(() => readPageFromHash());
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
    const syncHash = () => setActivePage(readPageFromHash());
    window.addEventListener('hashchange', syncHash);
    if (!window.location.hash) {
      window.location.hash = 'overview';
    }
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

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
      navigateTo('chat');
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
      navigateTo('knowledge');
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
  const counts = {
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
          <MetricCard
            label="Backend"
            value={health?.status ?? 'UNKNOWN'}
            hint={JSON.stringify(health?.details ?? {}, null, 0)}
            accent="violet"
          />
          <MetricCard label="Mode" value={summary?.position ?? 'Console'} hint={summary?.name ?? 'Sirius'} accent="teal" />
        </div>
      </header>

      {error ? <div className="notice notice--error">{error}</div> : null}

      <div className="workspace">
        <SideNav
          activePage={activePage}
          counts={counts}
          lastSyncedAt={lastSyncedAt ? formatTimestamp(lastSyncedAt) : 'pending'}
          runtimeLabel={runtimeLabel === 'mock' ? 'Mock Fallback' : 'Live Backend'}
          onNavigate={navigateTo}
        />

        <main className="page-stage">
          <div className="page-head">
            <div>
              <span className="muted-label">Current Page</span>
              <h2>{pageMeta[activePage].title}</h2>
              <p>{pageMeta[activePage].description}</p>
            </div>
            <button className="button" type="button" onClick={() => void bootstrap()} disabled={loading}>
              {loading ? '同步中...' : 'Refresh workspace'}
            </button>
          </div>

          {activePage === 'overview' ? (
            <OverviewPage
              summary={summary}
              documentCount={documentCount}
              selectedDocument={selectedDocument}
              topFocus={topFocus}
              health={health}
              lastSyncedAt={lastSyncedAt ? formatTimestamp(lastSyncedAt) : 'pending'}
              loading={loading}
            />
          ) : null}

          {activePage === 'chat' ? (
            <ChatPage
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={() => void handleAsk()}
              isSubmitting={asking}
              answer={answer}
              error={error}
            />
          ) : null}

          {activePage === 'knowledge' ? (
            <KnowledgePage
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              editorValue={editorValue}
              onSelect={(document) => void handleDocumentSelect(document)}
              onChange={setEditorValue}
              onSave={() => void handleSaveDocument()}
              isSaving={savingDocument}
            />
          ) : null}

          {activePage === 'api' ? (
            <ApiPage
              apiBaseUrl={API_BASE_URL}
              health={health}
              onRefresh={() => void handleRefreshHealth()}
              isRefreshing={refreshingHealth}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function readPageFromHash(): PageKey {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'chat' || hash === 'knowledge' || hash === 'api' || hash === 'overview') {
    return hash;
  }
  return 'overview';
}

function navigateTo(page: PageKey) {
  window.location.hash = page;
}

const pageMeta: Record<PageKey, { title: string; description: string }> = {
  overview: {
    title: 'Overview',
    description: 'Agent summary, runtime metadata, and knowledge snapshot.'
  },
  chat: {
    title: 'Chat',
    description: 'Ask the agent and inspect structured retrieval answers.'
  },
  knowledge: {
    title: 'Knowledge',
    description: 'Browse and edit knowledge documents.'
  },
  api: {
    title: 'API Lab',
    description: 'Inspect backend health and endpoint wiring.'
  }
};

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

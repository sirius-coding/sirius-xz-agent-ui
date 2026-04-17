type PageKey = 'overview' | 'chat' | 'knowledge' | 'api';

type SideNavProps = {
  activePage: PageKey;
  counts: Record<PageKey, number>;
  lastSyncedAt: string;
  runtimeLabel: string;
  onNavigate: (page: PageKey) => void;
};

const items: Array<{ key: PageKey; label: string; detail: string }> = [
  { key: 'overview', label: 'Overview', detail: 'System snapshot' },
  { key: 'chat', label: 'Chat', detail: 'Ask the agent' },
  { key: 'knowledge', label: 'Knowledge', detail: 'Edit documents' },
  { key: 'api', label: 'API Lab', detail: 'Inspect endpoints' }
];

export function SideNav({ activePage, counts, lastSyncedAt, runtimeLabel, onNavigate }: SideNavProps) {
  return (
    <aside className="sidebar card">
      <div className="sidebar__brand">
        <div>
          <span className="muted-label">Project</span>
          <strong>sirius-xz-agent-ui</strong>
        </div>
        <span className="sidebar__runtime">{runtimeLabel}</span>
      </div>

      <div className="sidebar__meta">
        <div>
          <span className="muted-label">Sync</span>
          <strong>{lastSyncedAt}</strong>
        </div>
        <div>
          <span className="muted-label">Pages</span>
          <strong>{Object.values(counts).reduce((sum, value) => sum + value, 0)}</strong>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="页面导航">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar__item ${activePage === item.key ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="sidebar__item-main">
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </span>
            <span className="sidebar__count">{counts[item.key]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

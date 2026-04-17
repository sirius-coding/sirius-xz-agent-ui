type TabKey = 'overview' | 'chat' | 'knowledge' | 'api';

type TabBarProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  counts?: Partial<Record<TabKey, number>>;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: '概览' },
  { key: 'chat', label: '对话' },
  { key: 'knowledge', label: '知识库' },
  { key: 'api', label: '接口' }
];

export function TabBar({ active, onChange, counts }: TabBarProps) {
  return (
    <nav className="tabs" aria-label="主要区域">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tabs__item ${active === tab.key ? 'tabs__item--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span>{tab.label}</span>
          {typeof counts?.[tab.key] === 'number' ? <span className="tabs__count">{counts[tab.key]}</span> : null}
        </button>
      ))}
    </nav>
  );
}

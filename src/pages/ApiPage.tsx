import { SectionCard } from '../components/SectionCard';
import { ApiInspector } from '../components/ApiInspector';
import type { BackendHealth } from '../types/api';

type ApiPageProps = {
  apiBaseUrl: string;
  health: BackendHealth | null;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function ApiPage({ apiBaseUrl, health, onRefresh, isRefreshing }: ApiPageProps) {
  return (
    <SectionCard title="API Inspector" description="查看接口状态和代理配置。">
      <ApiInspector apiBaseUrl={apiBaseUrl} health={health} onRefresh={onRefresh} isRefreshing={isRefreshing} />
    </SectionCard>
  );
}

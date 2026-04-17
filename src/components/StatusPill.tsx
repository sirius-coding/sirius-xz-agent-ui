type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

import type { ReactNode } from 'react';

type StatusPillProps = {
  tone?: StatusTone;
  children: ReactNode;
};

export function StatusPill({ tone = 'neutral', children }: StatusPillProps) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
};

export function MetricCard({ label, value, hint, accent = 'cyan' }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${accent}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      {hint ? <span className="metric-card__hint">{hint}</span> : null}
    </article>
  );
}

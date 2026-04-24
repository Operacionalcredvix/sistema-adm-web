type UnitSummaryCardProps = {
  label: string;
  value: number;
  tone?: "default" | "warning" | "danger" | "primary";
};

export function UnitSummaryCard({
  label,
  value,
  tone = "default",
}: UnitSummaryCardProps) {
  return (
    <article className={`summary-card summary-card-${tone}`}>
      <span className="summary-label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

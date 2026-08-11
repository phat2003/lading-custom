// Thẻ số liệu tổng quan trên Dashboard.
export default function StatCard({ label, value, delta, valueClass = 'text-[var(--bd-text)]' }) {
  return (
    <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-2 text-xs text-[var(--bd-muted)]">{delta}</p>
    </div>
  )
}

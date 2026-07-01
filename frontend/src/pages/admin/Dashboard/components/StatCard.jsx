// Thẻ số liệu tổng quan trên Dashboard.
export default function StatCard({ label, value, delta, valueClass = 'text-white' }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{delta}</p>
    </div>
  )
}

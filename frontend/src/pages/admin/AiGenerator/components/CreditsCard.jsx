export default function CreditsCard({ used = 0, total = 1, resetAt }) {
  // total = 0 lúc chưa tải xong -> tránh chia cho 0.
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const resetLabel = resetAt ? new Date(resetAt).toLocaleDateString('vi-VN') : null
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725] p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
        Tín dụng còn lại
      </p>
      <p className="text-sm text-slate-400">
        <span className="text-lg font-bold text-white">{used}</span> / {total.toLocaleString()} Tokens
      </p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <button className="mt-3 w-full rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/30">
        Nâng cấp gói
      </button>
      {/* Hạn mức reset theo mốc reset_at của từng user, không phải ngày 1 hằng tháng */}
      <p className="mt-2 text-xs text-slate-500">
        {resetLabel ? `Hạn mức làm mới vào ${resetLabel}.` : 'Đang tải hạn mức...'}
      </p>
    </div>
  )
}

// Preview trừu tượng nhỏ cho từng Section mẫu (không render lại block thật).
const bar = (w, cls = 'bg-slate-400') => <div className={`h-1 rounded ${cls}`} style={{ width: w }} />

const THUMBS = {
  Hero: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-100">
      <div className="h-1.5 w-2/3 rounded bg-slate-500" />
      <div className="h-1 w-1/2 rounded bg-slate-400" />
      <div className="mt-1 h-2 w-8 rounded bg-blue-500" />
    </div>
  ),
  'Đầu trang': (
    <div className="flex h-full w-full items-center justify-between bg-white px-2">
      <div className="h-2 w-6 rounded bg-slate-700" />
      <div className="flex gap-1.5">
        <div className="h-1 w-4 rounded bg-slate-400" />
        <div className="h-1 w-4 rounded bg-slate-400" />
        <div className="h-1 w-4 rounded bg-slate-400" />
      </div>
      <div className="h-2.5 w-6 rounded bg-blue-500" />
    </div>
  ),
  'Giới thiệu': (
    <div className="flex h-full w-full items-center gap-2 bg-white px-2">
      <div className="h-8 w-10 shrink-0 rounded bg-slate-200" />
      <div className="flex-1 space-y-1">
        <div className="h-1.5 w-2/3 rounded bg-slate-500" />
        <div className="h-1 w-full rounded bg-slate-300" />
        <div className="h-1 w-4/5 rounded bg-slate-300" />
      </div>
    </div>
  ),
  'Tính năng': (
    <div className="flex h-full w-full items-center justify-center gap-1.5 bg-white">
      <div className="h-6 w-4 rounded bg-slate-200" />
      <div className="h-6 w-4 rounded bg-slate-200" />
      <div className="h-6 w-4 rounded bg-slate-200" />
    </div>
  ),
  'Bảng giá': (
    <div className="flex h-full w-full items-end justify-center gap-1.5 bg-slate-100 pb-1">
      <div className="h-6 w-4 rounded bg-white shadow" />
      <div className="h-8 w-4 rounded bg-blue-500" />
      <div className="h-6 w-4 rounded bg-white shadow" />
    </div>
  ),
  'Đánh giá': (
    <div className="flex h-full w-full items-center justify-center gap-2 bg-white">
      <div className="h-7 w-10 rounded bg-slate-100 shadow-sm" />
      <div className="h-7 w-10 rounded bg-slate-100 shadow-sm" />
    </div>
  ),
  FAQ: (
    <div className="flex h-full w-full flex-col justify-center gap-1 bg-slate-100 px-3">
      <div className="h-1.5 w-full rounded bg-slate-400" />
      <div className="h-1.5 w-5/6 rounded bg-slate-300" />
      <div className="h-1.5 w-4/6 rounded bg-slate-300" />
    </div>
  ),
  'Đội ngũ': (
    <div className="flex h-full w-full items-center justify-center gap-2 bg-white">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="h-5 w-5 rounded-full bg-slate-200" />
          <div className="h-1 w-4 rounded bg-slate-300" />
        </div>
      ))}
    </div>
  ),
  'Thống kê': (
    <div className="flex h-full w-full items-center justify-center gap-3 bg-slate-900">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="h-2 w-6 rounded bg-white" />
          <div className="h-1 w-5 rounded bg-slate-500" />
        </div>
      ))}
    </div>
  ),
  CTA: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-blue-600">
      <div className="h-1.5 w-1/2 rounded bg-white/80" />
      <div className="h-2 w-10 rounded bg-white" />
    </div>
  ),
  'Chân trang': (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-900">
      <div className="h-1 w-2/3 rounded bg-slate-500" />
      <div className="h-1 w-1/2 rounded bg-slate-600" />
    </div>
  ),
}

const BlockThumb = ({ label }) => (
  <div className="h-12 w-full overflow-hidden rounded-md border border-[var(--bd-border)]">
    {THUMBS[label] || <div className="h-full w-full bg-slate-200" />}
  </div>
)

export default BlockThumb

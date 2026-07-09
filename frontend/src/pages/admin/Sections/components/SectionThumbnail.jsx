// Preview thu nhỏ (trừu tượng) cho từng loại section — chỉ để minh hoạ.
export default function SectionThumbnail({ type }) {
  switch (type) {
    case 'hero':
      return (
        <div className="w-2/3 space-y-2">
          <div className="h-3 w-3/4 rounded bg-slate-500" />
          <div className="h-2 w-1/2 rounded bg-blue-500/60" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-14 rounded bg-blue-500/50" />
            <div className="h-4 w-14 rounded border border-slate-600" />
          </div>
        </div>
      )
    case 'header':
      return (
        <div className="flex w-3/4 items-center justify-between rounded bg-slate-700/40 px-3 py-2">
          <div className="h-2 w-10 rounded bg-slate-400" />
          <div className="flex gap-2">
            <div className="h-2 w-6 rounded bg-slate-500" />
            <div className="h-2 w-6 rounded bg-slate-500" />
            <div className="h-2 w-6 rounded bg-purple-400/60" />
          </div>
        </div>
      )
    case 'features':
      return (
        <div className="flex gap-2">
          <div className="h-12 w-12 rounded bg-teal-500/40" />
          <div className="h-12 w-12 rounded bg-teal-500/40" />
          <div className="h-12 w-12 rounded bg-teal-500/40" />
        </div>
      )
    case 'pricing':
      return (
        <div className="flex items-end gap-2">
          <div className="h-10 w-8 rounded bg-amber-500/20" />
          <div className="h-14 w-9 rounded bg-amber-500/60" />
          <div className="h-10 w-8 rounded bg-amber-500/20" />
        </div>
      )
    case 'cta':
      return (
        <div className="flex h-full w-full items-center justify-center rounded bg-gradient-to-br from-red-500/30 to-transparent">
          <div className="h-6 w-28 rounded bg-red-400/50" />
        </div>
      )
    case 'footer':
      return (
        <div className="w-3/4 space-y-1.5">
          <div className="h-2 rounded bg-slate-600" />
          <div className="h-2 w-5/6 rounded bg-slate-700" />
          <div className="h-2 w-4/6 rounded bg-slate-700" />
          <div className="h-2 w-3/6 rounded bg-slate-700" />
        </div>
      )
    default:
      return <div className="h-12 w-2/3 rounded bg-slate-700/50" />
  }
}

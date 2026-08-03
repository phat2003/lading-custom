const PREVIEW_STATUS_META = {
  idle: {
    label: 'Đang chuẩn bị bản xem trước',
    dotClassName: 'animate-pulse bg-[#8d90a0]',
    textClassName: 'text-[#c3c6d7]',
  },
  dirty: {
    label: 'Có thay đổi cục bộ',
    dotClassName: 'bg-[#ffe083]',
    textClassName: 'text-[#ffe083]',
  },
  updating: {
    label: 'Đang cập nhật preview…',
    dotClassName: 'animate-pulse bg-[#eec200]',
    textClassName: 'text-[#eec200]',
  },
  ready: {
    label: 'Preview đã cập nhật',
    dotClassName: 'bg-[#00eefc] shadow-[0_0_8px_rgba(0,238,252,0.65)]',
    textClassName: 'text-[#00eefc]',
  },
  error: {
    label: 'Lỗi preview',
    dotClassName: 'bg-[#ffb4ab]',
    textClassName: 'text-[#ffb4ab]',
  },
}

export default function EditorTopbar({
  landingPageName,
  previewStatus,
  previewError,
  onBack,
  onUndo,
  onRedo,
  onPreview,
  onRetryPreview,
  onPublish,
  publishBusy,
  isPublished,
}) {
  const statusMeta = PREVIEW_STATUS_META[previewStatus] || PREVIEW_STATUS_META.idle

  return (
    <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#434655]/20 bg-[#201f21] px-5">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white"
          title="Quay lại Kho Giao Diện"
        >
          <span className="grid h-7 w-7 grid-cols-2 gap-0.5">
            <span className="bg-white" />
            <span className="bg-white" />
            <span className="bg-white" />
            <span className="bg-white" />
          </span>
          <span className="text-lg font-bold">Myproject</span>
          <span className="rounded border border-white/10 bg-[#353437] px-2 py-1 font-mono text-[9px] text-[#c3c6d7]">
            FREE
          </span>
        </button>
        <div className="h-7 w-px bg-white/10" />
        <div className="flex gap-2 text-[#c3c6d7]">
          <button
            type="button"
            onClick={onUndo}
            className="rounded p-2 text-xl transition hover:bg-white/5 hover:text-white"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={onRedo}
            className="rounded p-2 text-xl transition hover:bg-white/5 hover:text-white"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="max-w-[300px] truncate font-mono text-xs text-[#c3c6d7]">
          Dự án: <span className="text-white">{landingPageName}</span>⌄
        </p>
        <div
          className="flex min-w-[185px] items-center gap-2"
          aria-live="polite"
          title={previewError || 'Bản xem trước cục bộ — chưa lưu lên máy chủ'}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusMeta.dotClassName}`}
          />
          <span
            className={`font-mono text-[9px] uppercase tracking-wider ${statusMeta.textClassName}`}
          >
            {statusMeta.label}
          </span>
          {previewStatus === 'error' && (
            <button
              type="button"
              onClick={onRetryPreview}
              className="ml-auto rounded px-1.5 py-1 text-[#ffb4ab] transition hover:bg-[#ffb4ab]/10"
              aria-label="Thử cập nhật lại bản xem trước"
              title="Thử lại"
            >
              ↻
            </button>
          )}
        </div>
        <div className="h-6 w-px bg-white/10" />
        <button
          type="button"
          onClick={onPreview}
          className="rounded border border-white/10 px-4 py-2 font-mono text-xs text-white transition hover:border-[#b4c5ff]/50 hover:text-[#b4c5ff]"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={publishBusy}
          className="rounded bg-[#eec200] px-5 py-2 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.2)] transition hover:bg-[#ffe083] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isPublished ? 'Mở quản lý xuất bản Landing Page' : 'Xuất bản Landing Page'}
        >
          {isPublished ? 'Xuất bản lại' : 'Xuất bản'}
        </button>
      </div>
    </header>
  )
}

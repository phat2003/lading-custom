const SAVE_STATUS = {
  saved: { label: 'Đã lưu', className: 'text-[#00eefc]' },
  dirty: { label: 'Chưa lưu', className: 'text-[#eec200]' },
  saving: { label: 'Đang lưu...', className: 'text-[#eec200]' },
  error: { label: 'Lưu thất bại', className: 'text-[#ffb4ab]' },
}

const EditorTopbar = ({
  landingPageName,
  planType,
  saveStatus,
  onBack,
  onSave,
  onSaveAsTemplate,
  onUndo,
  onRedo,
  onPreview,
  onPublish,
  publishing = false,
}) => {
  const status = SAVE_STATUS[saveStatus] || SAVE_STATUS.saved
  const planLabel = planType === 'pro' ? 'PRO' : 'FREE'

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
            {planLabel}
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
        <span
          className={`font-mono text-[9px] uppercase tracking-wider ${status.className}`}
        >
          {status.label}
        </span>
        <div className="h-6 w-px bg-white/10" />
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={
              publishing || saveStatus === 'saved' || saveStatus === 'saving'
            }
            className="rounded bg-[#2563eb] px-4 py-2 font-mono text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saveStatus === 'saving'
              ? 'Đang lưu...'
              : saveStatus === 'error'
                ? 'Thử lưu lại'
                : 'Lưu'}
          </button>
        )}
        {onSaveAsTemplate && (
          <button
            type="button"
            onClick={onSaveAsTemplate}
            disabled={publishing || saveStatus === 'saving'}
            className="rounded border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#00eefc]/50 hover:text-[#d3fbff] disabled:cursor-wait disabled:opacity-45"
          >
            Lưu thành mẫu
          </button>
        )}
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
          disabled={!onPublish || publishing || saveStatus === 'saving'}
          className="rounded bg-[#eec200] px-5 py-2 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.2)] transition hover:bg-[#ffe083] disabled:cursor-wait disabled:opacity-55"
        >
          {publishing ? 'Đang xuất bản...' : 'Xuất bản'}
        </button>
      </div>
    </header>
  )
}

export default EditorTopbar

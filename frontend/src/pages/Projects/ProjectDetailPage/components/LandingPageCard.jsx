import {
  ClockIcon,
  LayoutTemplateIcon,
  PencilIcon,
  TrashIcon,
} from '../../../../components/icons'

const formatUpdatedAt = (value) => {
  if (!value) return 'Chưa rõ thời gian cập nhật'

  const updatedAt = new Date(value)
  if (Number.isNaN(updatedAt.getTime())) return 'Chưa rõ thời gian cập nhật'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(updatedAt)
}

const getStatusLabel = (status) => {
  if (status === 'draft') return 'Bản nháp'
  if (status === 'published') return 'Đã xuất bản'
  return status
}

const LandingPageCard = ({ landingPage, onOpen, onRename, onDelete }) => (
  <article className="group overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/55 hover:shadow-[0_16px_40px_rgba(0,238,252,0.06)]">
    <div className="grid h-40 place-items-center border-b border-[var(--bd-border)] bg-[var(--bd-fill)] project-preview-grid">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-muted)]">
        <LayoutTemplateIcon size={30} />
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 truncate text-xl font-semibold text-[var(--bd-text)]">
          {landingPage.name}
        </h2>
        {landingPage.status && (
          <span className="shrink-0 rounded-full border border-[var(--bd-border)] bg-[var(--bd-topbar)] px-3 py-1 font-mono text-[10px] uppercase text-[var(--bd-dim)]">
            {getStatusLabel(landingPage.status)}
          </span>
        )}
      </div>

      <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[var(--bd-dim)]">
        <ClockIcon size={14} />
        Cập nhật {formatUpdatedAt(landingPage.updatedAt)}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRename}
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2.5 font-mono text-xs font-semibold text-[var(--bd-text)] transition hover:border-violet-300/55 hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          <PencilIcon size={15} />
          Đổi tên
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2.5 font-mono text-xs font-semibold text-red-400 transition hover:border-red-400/55 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <TrashIcon size={15} />
          Xóa
        </button>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 font-mono text-xs font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-violet-300"
      >
        <PencilIcon size={16} />
        Mở / Chỉnh sửa
      </button>
    </div>
  </article>
)

export default LandingPageCard

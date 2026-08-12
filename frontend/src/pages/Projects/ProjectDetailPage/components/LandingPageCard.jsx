import {
  ClockIcon,
  LayoutTemplateIcon,
  PencilIcon,
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

const LandingPageCard = ({ landingPage, onOpen }) => (
  <article className="group overflow-hidden rounded-xl border border-white/10 bg-[#1c1b1d] transition duration-300 hover:-translate-y-1 hover:border-[#00eefc]/55 hover:shadow-[0_16px_40px_rgba(0,238,252,0.06)]">
    <div className="grid h-40 place-items-center border-b border-white/10 bg-[#2a2a2c] project-preview-grid">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/10 bg-[#353437] text-[#8d90a0]">
        <LayoutTemplateIcon size={30} />
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 truncate text-xl font-semibold text-white">
          {landingPage.name}
        </h2>
        {landingPage.status && (
          <span className="shrink-0 rounded-full border border-white/10 bg-[#201f21] px-3 py-1 font-mono text-[10px] uppercase text-[#c3c6d7]">
            {getStatusLabel(landingPage.status)}
          </span>
        )}
      </div>

      <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#c3c6d7]">
        <ClockIcon size={14} />
        Cập nhật {formatUpdatedAt(landingPage.updatedAt)}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 font-mono text-xs font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-[#b4c5ff]"
      >
        <PencilIcon size={16} />
        Mở / Chỉnh sửa
      </button>
    </div>
  </article>
)

export default LandingPageCard

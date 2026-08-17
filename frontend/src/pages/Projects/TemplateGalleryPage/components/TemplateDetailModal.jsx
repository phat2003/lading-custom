import { LayoutTemplateIcon, XIcon } from '../../../../components/icons'

const STATUS_LABELS = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
}

const TIER_LABELS = {
  free: 'Miễn phí',
  premium: 'Premium',
}

const formatDate = (value) => {
  if (!value) return 'Chưa có thông tin'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa có thông tin'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const TemplateDetailModal = ({ template, onClose }) => {
  if (!template) return null

  const metadata = [
    ['Loại Template', 'User Template'],
    ['Trạng thái', STATUS_LABELS[template.status] || template.status || 'Chưa xác định'],
    [
      'Số section',
      typeof template.sectionCount === 'number'
        ? String(template.sectionCount)
        : 'Chưa có thông tin',
    ],
    ['Danh mục', template.category || 'Chưa phân loại'],
    ['Gói', TIER_LABELS[template.tier] || template.tier || 'Chưa xác định'],
    ['Nguồn', template.templateSource || 'Chưa có thông tin'],
    ['Ngày tạo', formatDate(template.createdAt)],
    ['Cập nhật', formatDate(template.updatedAt)],
  ]

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-detail-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          aria-label="Đóng chi tiết Template"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
          Template Detail
        </p>
        <h2
          id="template-detail-title"
          className="mt-3 pr-10 text-2xl font-semibold text-white"
        >
          {template.name}
        </h2>

        <div className="mt-7 grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="project-preview-grid relative grid min-h-40 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#0e0e10] text-[#596070]">
            <LayoutTemplateIcon size={54} />
            {template.thumbnailUrl ? (
              <img
                src={template.thumbnailUrl}
                alt={`Thumbnail ${template.name}`}
                className="absolute inset-0 h-full w-full object-cover object-top"
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
              />
            ) : null}
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {metadata.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-[#272629] px-4 py-3"
              >
                <dt className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0]">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 rounded-xl border border-[#b4c5ff]/20 bg-[#2563eb]/10 px-4 py-3 text-sm leading-6 text-[#dbe1ff]">
          Đây là thông tin metadata từ danh sách server. Xem trước đầy đủ nội
          dung section đang chờ User Template Detail API.
        </p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          >
            Đóng
          </button>
        </div>
      </section>
    </div>
  )
}

export default TemplateDetailModal

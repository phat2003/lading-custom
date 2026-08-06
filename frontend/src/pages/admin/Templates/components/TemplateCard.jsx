import Badge from '../../../../components/common/Badge'
import { PencilIcon, TrashIcon, LayersIcon, LayoutTemplateIcon } from '../../../../components/icons'

const CATEGORY_COLOR = {
  SaaS: 'blue',
  Agency: 'green',
  Startup: 'amber',
  Webinar: 'red',
  Portfolio: 'purple',
}
const STATUS_COLOR = { Published: 'green', Draft: 'amber' }
const TIER_COLOR = { Premium: 'purple', Free: 'gray' }

// Thẻ template trong thư viện admin.
export default function TemplateCard({ template, onEdit, onEditContent, onDelete }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--bd-border)] hover:shadow-xl hover:shadow-blue-500/5">
      {/* Thumbnail — rê chuột vào thẻ thì ảnh tự cuộn xuống xem hết trang */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-[var(--bd-border)] bg-[var(--bd-fill)]">
        <div className="absolute left-3 top-3 z-10">
          <Badge color={CATEGORY_COLOR[template.category] || 'gray'}>
            {/* Template cũ (trước migration 003) chưa có danh mục */}
            {template.category || 'Chưa phân loại'}
          </Badge>
        </div>
        {/* Ảnh thật do admin tải lên; chưa có thì hiện khung giả lập.
            Để chiều cao tự nhiên (không object-cover) mới cuộn được hết ảnh. */}
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            loading="lazy"
            className="thumb-scroll absolute inset-x-0 top-0 w-full"
          />
        ) : (
          <div className="w-2/3 space-y-2 opacity-40">
            <div className="h-2 rounded bg-[var(--bd-fill-hover)]" />
            <div className="h-2 w-4/5 rounded bg-[var(--bd-fill-hover)]" />
            <div className="h-2 w-3/5 rounded bg-[var(--bd-fill-hover)]" />
          </div>
        )}
        {/* Nền + chữ đều theo theme để đọc được trên ảnh sáng lẫn ảnh tối */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-md bg-[var(--bd-chip)] px-2 py-1 text-xs font-medium text-[var(--bd-text)] ring-1 ring-[var(--bd-border)] backdrop-blur-sm">
          <LayersIcon size={12} /> {template.sections} sections
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--bd-text)]">{template.name}</h3>
          <Badge color={STATUS_COLOR[template.status] || 'gray'}>{template.status}</Badge>
        </div>
        <div className="mt-2">
          <Badge color={TIER_COLOR[template.tier] || 'gray'}>{template.tier}</Badge>
        </div>

        {/* Mở builder để dựng lại nội dung (khác với Edit chỉ sửa tên/danh mục/gói). */}
        <button
          onClick={() => onEditContent?.(template)}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_0_16px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <LayoutTemplateIcon size={14} /> Sửa nội dung
        </button>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => onEdit?.(template)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-[var(--bd-border)] px-2.5 py-1.5 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]"
          >
            <PencilIcon size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete?.(template)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-red-500/40 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

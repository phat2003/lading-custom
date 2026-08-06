import Badge from '../../../../components/common/Badge'
import { PencilIcon, TrashIcon } from '../../../../components/icons'
import { getSectionType } from '../sectionTypes'
import SectionThumbnail from './SectionThumbnail'

// Thẻ section trong thư viện. Nút sửa/xóa hiện khi hover để giữ giao diện gọn.
export default function SectionCard({ section, onEdit, onDelete }) {
  const type = getSectionType(section.type)

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-800 bg-[#111725] transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5">
      {/* Thumbnail — có ảnh thật thì hiện ảnh (rê chuột tự cuộn), chưa có thì
          dùng hình minh hoạ trừu tượng theo loại section. */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-slate-800 bg-slate-900/40 p-4">
        {section.thumbnailUrl ? (
          <img
            src={section.thumbnailUrl}
            alt={section.name}
            loading="lazy"
            className="thumb-scroll absolute inset-x-0 top-0 w-full"
          />
        ) : (
          <SectionThumbnail type={section.type} />
        )}

        {/* Hành động khi hover */}
        <div className="absolute right-2 top-2 z-10 hidden gap-1 group-hover:flex">
          <button
            onClick={() => onEdit?.(section)}
            className="rounded-md border border-slate-700 bg-slate-900/80 p-1.5 text-slate-300 hover:bg-slate-800"
            title="Sửa"
          >
            <PencilIcon size={14} />
          </button>
          <button
            onClick={() => onDelete?.(section)}
            className="rounded-md border border-red-500/40 bg-slate-900/80 p-1.5 text-red-400 hover:bg-red-500/10"
            title="Xóa"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">{section.name}</h3>
          <p className="mt-1 text-xs text-slate-500">Dùng trong {section.usedIn} mẫu</p>
        </div>
        <Badge color={type.color}>{type.badge}</Badge>
      </div>
    </div>
  )
}

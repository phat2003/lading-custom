import {
  CopyIcon,
  LayoutTemplateIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '../../../../components/icons'

const TemplateCard = ({
  template,
  locked = false,
  interactive = true,
  onSelect,
  onUse,
  onRename,
  onDelete,
  onClone,
  onLocked,
}) => {
  const isPro = template.tier === 'premium'
  const isBlank = template.type === 'blank'
  const isUser = template.type === 'user'
  const hasManagementActions = Boolean(onRename || onDelete)
  const detail = isBlank
    ? template.description
    : [
        template.category || null,
        typeof template.sectionCount === 'number'
          ? `${template.sectionCount} section`
          : null,
        isUser && template.status === 'draft'
          ? 'Bản nháp'
          : isUser && template.status === 'published'
            ? 'Đã xuất bản'
            : null,
      ]
        .filter(Boolean)
        .join(' · ')

  const details = (
    <>
      <h3 className="text-lg font-semibold text-white transition group-hover:text-[#b4c5ff]">
        {template.name}
      </h3>
      <p className="mt-1 text-sm text-[#c3c6d7]">
        {detail || 'Chưa có thông tin mô tả'}
      </p>
      <span className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#8d90a0]">
        <LayoutTemplateIcon size={14} />
        {isBlank
          ? 'Trang trắng'
          : isUser
            ? 'User Template'
            : 'System Template'}
      </span>
    </>
  )

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-[#434655]/30 bg-[#201f21] transition duration-300 hover:-translate-y-1 hover:border-[#00eefc] ${
        onUse ? 'h-[430px]' : hasManagementActions ? 'h-[370px]' : 'h-[320px]'
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-[#0e0e10]">
        {isBlank ? (
          <div className="project-preview-grid absolute inset-0 grid place-items-center">
            <div className="flex h-28 w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#8d90a0]/45 bg-[#1c1b1d]/75 text-[#c3c6d7]">
              <PlusIcon size={30} className="text-[#b4c5ff]" />
              <span className="mt-2 font-mono text-[10px] uppercase tracking-wider">
                Blank canvas
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="project-preview-grid absolute inset-0 grid place-items-center text-[#596070]">
              <LayoutTemplateIcon size={54} />
            </div>
            {template.thumbnailUrl ? (
              <img
                src={template.thumbnailUrl}
                alt={`Preview ${template.name}`}
                className="relative h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
              />
            ) : null}
          </>
        )}

        <span
          className={`absolute right-3 top-3 z-20 rounded-full border px-3 py-1 font-mono text-[10px] uppercase backdrop-blur ${
            isPro
              ? 'border-[#eec200]/35 bg-[#cea700]/20 text-[#eec200] shadow-[0_0_10px_rgba(238,194,0,0.2)]'
              : isUser
                ? 'border-[#b4c5ff]/35 bg-[#2563eb]/25 text-[#dbe1ff]'
                : 'border-[#00eefc]/25 bg-[#00eefc]/10 text-[#00eefc]'
          }`}
        >
          {isPro ? '✦ PRO' : isUser ? 'CỦA BẠN' : 'FREE'}
        </span>

        {!isBlank && onClone && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (locked) {
                onLocked()
                return
              }
              onClone(template)
            }}
            className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-lg border border-white/15 bg-[#201f21]/95 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:border-[#00eefc]/50 hover:text-[#d3fbff] focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
            aria-label={`Nhân bản mẫu ${template.name}`}
          >
            <CopyIcon size={15} />
            Nhân bản
          </button>
        )}

        {interactive && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#131315]/65 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
          >
            {locked ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#eec200]/30 bg-[#353437] text-2xl text-[#eec200]">
                  ⌑
                </div>
                <p className="mt-3 font-semibold text-white">Yêu cầu gói Pro</p>
                <button
                  type="button"
                  onClick={onLocked}
                  className="mt-2 font-mono text-xs text-[#ffe083] hover:text-white"
                >
                  Nâng cấp ngay →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(template)}
                className="rounded-lg bg-[#2563eb] px-6 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition hover:scale-[1.02]"
              >
                {isBlank ? 'Bắt đầu thiết kế' : 'Sử dụng mẫu'}
              </button>
            )}
          </div>
        )}
      </div>

      {interactive ? (
        <button
          type="button"
          onClick={() => (locked ? onLocked() : onSelect(template))}
          className="flex flex-1 flex-col p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b4c5ff]"
        >
          {details}
        </button>
      ) : (
        <div className="flex flex-1 flex-col p-4 text-left">{details}</div>
      )}

      {onUse && (
        <div className="border-t border-white/10 px-3 pt-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (locked) {
                onLocked()
                return
              }
              onUse(template)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(37,99,235,0.3)] transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-[#b4c5ff]/60"
            aria-label={`Sử dụng Template ${template.name}`}
          >
            <PlusIcon size={16} />
            Sử dụng mẫu
          </button>
        </div>
      )}

      {hasManagementActions && (
        <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRename?.(template)
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[#dbe1ff] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
            aria-label={`Đổi tên Template ${template.name}`}
          >
            <PencilIcon size={15} />
            Đổi tên
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete?.(template)
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[#ffb4ab] transition hover:bg-[#3b2526] focus:outline-none focus:ring-2 focus:ring-[#ffb4ab]/40"
            aria-label={`Xóa Template ${template.name}`}
          >
            <TrashIcon size={15} />
            Xóa
          </button>
        </div>
      )}
    </article>
  )
}

export default TemplateCard

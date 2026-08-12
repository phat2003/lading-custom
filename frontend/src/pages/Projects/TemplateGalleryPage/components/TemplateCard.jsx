import { LayoutTemplateIcon, PlusIcon } from '../../../../components/icons'

const TemplateCard = ({ template, locked = false, onSelect, onLocked }) => {
  const isPro = template.tier === 'premium'
  const isBlank = template.type === 'blank'
  const isUser = template.type === 'user'
  const detail = isBlank
    ? template.description
    : [
        template.category || null,
        typeof template.sectionCount === 'number'
          ? `${template.sectionCount} section`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')

  return (
    <article className="group relative flex h-[320px] flex-col overflow-hidden rounded-xl border border-[#434655]/30 bg-[#201f21] transition duration-300 hover:-translate-y-1 hover:border-[#00eefc]">
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
      </div>

      <button
        type="button"
        onClick={() => (locked ? onLocked() : onSelect(template))}
        className="flex flex-1 flex-col p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b4c5ff]"
      >
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
      </button>
    </article>
  )
}

export default TemplateCard

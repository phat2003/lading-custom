import { EyeIcon } from '../../../../components/icons'
import { ELEMENT_GROUPS } from '../sectionPresets'

export default function ElementsPanel({ readOnly = false, onAddSection, onMessage }) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-white/5 bg-[#201f21]">
      <div className="border-b border-white/5 p-5">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
          Thành phần
        </h2>
        <p className="mt-2 text-xs text-[#c3c6d7]">
          {readOnly ? 'Chỉnh sửa chỉ khả dụng ở Desktop' : 'Nhấn để thêm vào canvas'}
        </p>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto p-5">
        {readOnly && (
          <div className="rounded-lg border border-[#eec200]/30 bg-[#eec200]/10 p-3 text-xs leading-5 text-[#ffe083]">
            Tablet và Mobile đang ở chế độ chỉ đọc. Chuyển về Desktop để thêm hoặc chỉnh sửa Section.
          </div>
        )}

        {ELEMENT_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#eec200]">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onAddSection(item.type)}
                  className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#2a2a2c] text-[#c3c6d7] transition hover:border-[#b4c5ff]/50 hover:text-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/5 disabled:hover:text-[#c3c6d7]"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#eec200]">
            Nâng cao
          </h3>
          <div className="space-y-2">
            {['Video Player', 'Form liên hệ'].map((item) => (
              <button
                key={item}
                type="button"
                disabled={readOnly}
                onClick={() => onMessage(`${item} yêu cầu gói Pro.`)}
                className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-[#2a2a2c] px-4 py-3 text-left text-xs text-[#8d90a0] opacity-60 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <EyeIcon size={18} />
                {item}
                <span className="ml-auto">⌑</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-3 p-5">
        <div className="rounded-lg border border-[#eec200]/35 bg-[#eec200]/10 p-3">
          <p className="text-xs font-semibold text-white">Mở khóa tính năng cao cấp</p>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onMessage('Luồng nâng cấp Pro nằm ngoài task hiện tại.')}
            className="mt-3 w-full rounded bg-[#eec200] py-2 text-xs font-bold text-[#231b00] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Nâng cấp Pro
          </button>
        </div>
        <div className="rounded border border-[#b4c5ff]/20 bg-[#2563eb]/10 p-3">
          <p className="text-xs font-bold text-[#b4c5ff]">💡 Mẹo nhỏ</p>
          <p className="mt-1 text-[10px] leading-relaxed text-[#c3c6d7]">
            Chọn một Section trên canvas để chỉnh sửa thuộc tính bên phải.
          </p>
        </div>
      </div>
    </aside>
  )
}

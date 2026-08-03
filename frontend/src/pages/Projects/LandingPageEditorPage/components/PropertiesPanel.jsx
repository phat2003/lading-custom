export default function PropertiesPanel({ section, readOnly = false, onChange }) {
  const update = (field, value) => {
    if (!section || readOnly) return
    onChange({ ...section, [field]: value })
  }

  return (
    <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-white/5 bg-[#201f21]">
      <div className="flex border-b border-white/5">
        {['Thiết kế', 'Cài đặt', 'Lớp'].map((tab, index) => (
          <button
            key={tab}
            type="button"
            disabled={readOnly}
            className={`flex-1 py-4 font-mono text-xs ${
              index === 0
                ? 'border-b-2 border-[#b4c5ff] text-[#b4c5ff]'
                : 'text-[#c3c6d7]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {readOnly && (
        <div className="mx-5 mt-5 rounded-lg border border-[#eec200]/30 bg-[#eec200]/10 p-3 text-xs leading-5 text-[#ffe083]">
          Chế độ chỉ đọc. Chuyển về Desktop để thay đổi thuộc tính.
        </div>
      )}

      {!section ? (
        <div className="p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-dashed border-white/15 bg-[#2a2a2c] text-2xl text-[#8d90a0]">
            ◇
          </div>
          <h2 className="mt-4 font-semibold text-white">Chưa chọn Section</h2>
          <p className="mt-2 text-xs leading-5 text-[#c3c6d7]">
            Chọn một Section trên canvas để chỉnh sửa nội dung và màu sắc.
          </p>
        </div>
      ) : (
        <div className="space-y-7 p-5">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Nội dung</h2>
              <span className="rounded bg-[#2563eb]/20 px-2 py-1 font-mono text-[9px] uppercase text-[#b4c5ff]">
                {section.type}
              </span>
            </div>

            {section.type !== 'text' && section.type !== 'image' && (
              <label className="mt-5 block font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                Tiêu đề
                <input
                  value={section.title}
                  disabled={readOnly}
                  onChange={(event) => update('title', event.target.value)}
                  className="mt-2 w-full rounded border border-white/5 bg-[#2a2a2c] p-3 text-sm normal-case text-white outline-none focus:border-[#b4c5ff]"
                />
              </label>
            )}

            {section.type !== 'heading' && (
              <label className="mt-4 block font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                Văn bản
                <textarea
                  value={section.text}
                  disabled={readOnly}
                  onChange={(event) => update('text', event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded border border-white/5 bg-[#2a2a2c] p-3 text-sm normal-case text-white outline-none focus:border-[#b4c5ff]"
                />
              </label>
            )}

            {(section.type === 'hero' || section.type === 'button') && (
              <label className="mt-4 block font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                Nội dung nút
                <input
                  value={section.buttonText}
                  disabled={readOnly}
                  onChange={(event) => update('buttonText', event.target.value)}
                  className="mt-2 w-full rounded border border-white/5 bg-[#2a2a2c] p-3 text-sm normal-case text-white outline-none focus:border-[#b4c5ff]"
                />
              </label>
            )}
          </section>

          <section className="border-t border-white/5 pt-6">
            <h2 className="font-semibold text-white">Căn chỉnh</h2>
            <div className="mt-4 grid grid-cols-3 overflow-hidden rounded bg-[#2a2a2c]">
              {[
                { value: 'left', label: '≡' },
                { value: 'center', label: '≣' },
                { value: 'right', label: '≡' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => update('align', option.value)}
                  className={`py-3 ${
                    section.align === option.value
                      ? 'bg-[#2563eb] text-white'
                      : 'text-[#c3c6d7]'
                  }`}
                  aria-label={`Căn ${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-white/5 pt-6">
            <h2 className="font-semibold text-white">Màu sắc</h2>
            <div className="mt-4 space-y-4 text-sm">
              <label className="flex items-center gap-3">
                <input
                  type="color"
                  value={section.backgroundColor}
                  disabled={readOnly}
                  onChange={(event) => update('backgroundColor', event.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent"
                />
                <span>Nền chính</span>
                <span className="ml-auto font-mono text-[10px] uppercase text-[#c3c6d7]">
                  {section.backgroundColor}
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="color"
                  value={section.textColor}
                  disabled={readOnly}
                  onChange={(event) => update('textColor', event.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent"
                />
                <span>Văn bản</span>
                <span className="ml-auto font-mono text-[10px] uppercase text-[#c3c6d7]">
                  {section.textColor}
                </span>
              </label>
            </div>
          </section>

          <section className="border-t border-white/5 pt-6">
            <h2 className="font-semibold text-white">Khoảng cách & Kích thước</h2>
            <div className="mt-4 grid h-28 place-items-center rounded-lg border border-dashed border-white/10 bg-[#2a2a2c] font-mono text-[10px] text-[#c3c6d7]">
              MARGIN · PADDING
            </div>
          </section>
        </div>
      )}
    </aside>
  )
}

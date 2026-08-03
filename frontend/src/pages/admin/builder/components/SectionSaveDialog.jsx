import { useEffect, useState } from 'react'
import { SECTION_TYPES } from '../../Sections/sectionTypes'

const inputCls =
  'mt-1.5 w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2.5 text-sm text-[var(--bd-text)] transition-all duration-200 placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'

// Hộp thoại lưu Section mẫu: nhập tên + chọn loại rồi lưu vào thư viện.
// Dùng trong builder (nền tối) khi chạy ở chế độ Section.
const SectionSaveDialog = ({ open, initial, onCancel, onConfirm }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('hero')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setType(initial?.type || 'hero')
    }
  }, [open, initial])

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm({ name: name.trim(), type })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onPointerDown={onCancel}
    >
      <form
        onSubmit={submit}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-pop-in rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-6 text-[var(--bd-text)] shadow-[0_30px_80px_-20px_rgba(139,92,246,.4)]"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--bd-text)]">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          {initial ? 'Cập nhật Section mẫu' : 'Lưu Section mẫu'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--bd-muted)]">
          Section này sẽ xuất hiện trong thư viện để tái sử dụng cho nhiều template.
        </p>

        <div className="mt-5">
          <label className={labelCls}>Tên section</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="VD: Hero Chia Đôi Hiện Đại"
            className={inputCls}
          />
        </div>

        <div className="mt-4">
          <label className={labelCls}>Loại section</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[var(--bd-panel-solid)]">
                {t.tab}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--bd-border)] px-4 py-2 text-sm text-[var(--bd-dim)] transition-colors duration-200 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_22px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] active:translate-y-0"
          >
            {initial ? 'Cập nhật' : 'Lưu Section'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SectionSaveDialog

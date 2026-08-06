import { useEffect, useState } from 'react'

const CATEGORIES = ['SaaS', 'Agency', 'Startup', 'Webinar', 'Portfolio']

const inputCls =
  'mt-1.5 w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2.5 text-sm text-[var(--bd-text)] transition-all duration-200 placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'

// Hộp thoại nhập metadata trước khi lưu template.
// publish = true -> lưu kèm trạng thái published; false -> giữ bản nháp.
const TemplateSaveDialog = ({ open, initial, publish, saving = false, error = '', onCancel, onConfirm }) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tier, setTier] = useState('free')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setCategory(initial?.category || CATEGORIES[0])
      setTier(initial?.tier || 'free')
    }
  }, [open, initial])

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm({ name: name.trim(), category, tier })
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
          {publish ? 'Xuất bản Template' : 'Lưu bản nháp'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--bd-muted)]">
          {publish
            ? 'Template sẽ hiển thị trong thư viện để người dùng chọn và tạo landing page.'
            : 'Lưu lại để sửa tiếp. Bản nháp chưa hiện cho người dùng.'}
        </p>

        <div className="mt-5">
          <label className={labelCls}>Tên template</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="VD: SaaS Landing Pro"
            className={inputCls}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Danh mục</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[var(--bd-panel-solid)]">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Gói</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputCls}>
              <option value="free" className="bg-[var(--bd-panel-solid)]">Free</option>
              <option value="premium" className="bg-[var(--bd-panel-solid)]">Premium</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-[var(--bd-border)] px-4 py-2 text-sm text-[var(--bd-dim)] transition-colors duration-200 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_22px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? 'Đang lưu…' : publish ? 'Xuất bản' : 'Lưu nháp'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TemplateSaveDialog

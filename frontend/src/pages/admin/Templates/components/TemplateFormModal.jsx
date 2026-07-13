import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'

const CATEGORIES = ['SaaS', 'Agency', 'Startup', 'Webinar', 'Portfolio']
const EMPTY = { name: '', category: 'SaaS', tier: 'Free', status: 'Draft', sections: 1 }

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Modal tạo mới / chỉnh sửa template. initial = null nghĩa là tạo mới.
export default function TemplateFormModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const isEdit = Boolean(initial)

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : EMPTY)
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ ...form, sections: Number(form.sections) || 0 })
  }

  return (
    <AdminModal open={open} onClose={onClose} title={isEdit ? 'Sửa Template' : 'Tạo Template mới'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Tên template</label>
          <input
            value={form.name}
            onChange={set('name')}
            className={inputCls}
            placeholder="VD: SaaS Landing Pro"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Danh mục</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Số sections</label>
            <input
              type="number"
              min="0"
              value={form.sections}
              onChange={set('sections')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Gói</label>
            <select value={form.tier} onChange={set('tier')} className={inputCls}>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {isEdit ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

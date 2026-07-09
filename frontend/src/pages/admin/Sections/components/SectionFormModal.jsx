import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'
import { SECTION_TYPES } from '../sectionTypes'

const EMPTY = { name: '', type: 'hero' }

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Modal tạo mới / chỉnh sửa section. initial = null nghĩa là tạo mới.
export default function SectionFormModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const isEdit = Boolean(initial)

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : EMPTY)
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <AdminModal open={open} onClose={onClose} title={isEdit ? 'Sửa Thành phần' : 'Tạo Thành phần Mới'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Tên thành phần</label>
          <input
            value={form.name}
            onChange={set('name')}
            className={inputCls}
            placeholder="VD: Hero Chia Đôi Hiện Đại"
            autoFocus
          />
        </div>
        <div>
          <label className={labelCls}>Loại section</label>
          <select value={form.type} onChange={set('type')} className={inputCls}>
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.tab}
              </option>
            ))}
          </select>
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

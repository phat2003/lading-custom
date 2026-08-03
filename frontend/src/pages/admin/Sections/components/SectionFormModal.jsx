import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'
import { SECTION_TYPES } from '../sectionTypes'

// content là chuỗi JSON để admin gõ trực tiếp; khi submit mới parse ra object.
const EMPTY = { name: '', type: 'hero', content: '{}' }

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Modal tạo mới / chỉnh sửa section. initial = null nghĩa là tạo mới.
const SectionFormModal = ({ open, initial, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY)
  const [jsonError, setJsonError] = useState('')
  const isEdit = Boolean(initial)

  useEffect(() => {
    if (!open) return
    setJsonError('')
    setForm(
      initial
        ? {
            name: initial.name,
            type: initial.type,
            // JSONB từ API là object -> đưa về chuỗi cho textarea.
            content: JSON.stringify(initial.defaultContent ?? {}, null, 2),
          }
        : EMPTY,
    )
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (submitting || !form.name.trim()) return

    // Parse tại đây để báo lỗi cú pháp ngay, thay vì để backend trả 400 khó hiểu.
    let content
    try {
      content = JSON.parse(form.content)
    } catch {
      setJsonError('Nội dung mặc định phải là JSON hợp lệ.')
      return
    }
    setJsonError('')

    onSubmit({ name: form.name.trim(), type: form.type, defaultContent: content })
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Sửa Thành phần' : 'Tạo Thành phần Mới'}
    >
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
        <div>
          <label className={labelCls}>Nội dung mặc định (JSON)</label>
          <textarea
            value={form.content}
            onChange={set('content')}
            rows={6}
            className={`${inputCls} font-mono text-xs`}
            placeholder='{"title": "Tiêu đề", "subtitle": "Mô tả"}'
          />
          <p className="mt-1 text-xs text-slate-600">
            Nội dung placeholder được sao chép khi kéo section vào trang. Sửa ở đây
            không ảnh hưởng tới các trang đã dùng mẫu này.
          </p>
        </div>

        {(jsonError || error) && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {jsonError || error}
          </p>
        )}

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
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default SectionFormModal

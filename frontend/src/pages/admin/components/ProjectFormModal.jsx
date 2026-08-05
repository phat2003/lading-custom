import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Modal tạo dự án mới. Backend chỉ có POST /projects (tạo cho chính người đăng
// nhập) nên dự án sinh ra thuộc về tài khoản admin đang dùng — note cho biết rõ.
const ProjectFormModal = ({ open, submitting, error, onClose, onSubmit }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim() })
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Tạo Dự án Mới">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Tên dự án</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="VD: Chiến dịch Tháng 8"
            autoFocus
          />
        </div>

        <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-500">
          Dự án được tạo dưới tài khoản admin đang đăng nhập. Hiện chưa có API tạo
          dự án hộ người dùng khác.
        </p>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {submitting ? 'Đang tạo...' : 'Tạo'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default ProjectFormModal

import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'

// Chỉ dùng để TẠO user mới (nút "Add User").
// Sửa thông tin user làm ở panel chi tiết bên phải, không qua modal này.
const EMPTY = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'user',
  plan_type: 'free',
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

const UserFormModal = ({ open, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY)

  // Mỗi lần mở lại modal thì reset form, tránh còn dữ liệu của lần tạo trước.
  useEffect(() => {
    if (open) setForm(EMPTY)
  }, [open])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (submitting) return
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) return
    onSubmit({ ...form, full_name: form.full_name.trim(), email: form.email.trim() })
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Thêm User mới">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Họ tên</label>
          <input
            value={form.full_name}
            onChange={set('full_name')}
            className={inputCls}
            placeholder="VD: Nguyễn Văn A"
            autoFocus
          />
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            className={inputCls}
            placeholder="user@mail.com"
          />
        </div>

        <div>
          <label className={labelCls}>Mật khẩu</label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            className={inputCls}
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input
              value={form.phone}
              onChange={set('phone')}
              className={inputCls}
              placeholder="0901234567"
            />
          </div>
          <div>
            <label className={labelCls}>Vai trò</label>
            <select value={form.role} onChange={set('role')} className={inputCls}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Gói dịch vụ</label>
          <select value={form.plan_type} onChange={set('plan_type')} className={inputCls}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
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
            {submitting ? 'Đang tạo...' : 'Tạo user'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default UserFormModal

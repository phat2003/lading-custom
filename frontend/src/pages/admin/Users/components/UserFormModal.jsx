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

const NO_ERRORS = { full_name: '', email: '', password: '', phone: '' }

const baseInputCls =
  'w-full rounded-lg border bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Viền đỏ khi ô đó có lỗi để mắt bắt được ngay.
const inputCls = (hasError) =>
  `${baseInputCls} ${
    hasError ? 'border-red-500/60 focus:border-red-500' : 'border-slate-700 focus:border-slate-500'
  }`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Khớp luật ở trang Đăng ký: tối thiểu 6 ký tự, có số và có ký tự đặc biệt.
const PASSWORD_RE = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/
const PHONE_RE = /^[0-9+\s.-]{8,20}$/

const UserFormModal = ({ open, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY)
  const [fieldErrors, setFieldErrors] = useState(NO_ERRORS)

  // Mỗi lần mở lại modal thì reset form, tránh còn dữ liệu của lần tạo trước.
  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setFieldErrors(NO_ERRORS)
    }
  }, [open])

  // Gõ lại vào ô nào thì xoá lỗi của ô đó cho đỡ rối mắt.
  const set = (key) => (e) => {
    const { value } = e.target
    setForm((f) => ({ ...f, [key]: value }))
    setFieldErrors((errs) => (errs[key] ? { ...errs, [key]: '' } : errs))
  }

  const validate = () => {
    const next = { ...NO_ERRORS }

    if (!form.full_name.trim()) next.full_name = 'Họ tên không được để trống'

    if (!form.email.trim()) next.email = 'Email không được để trống'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Email không hợp lệ'

    if (!form.password) next.password = 'Mật khẩu không được để trống'
    else if (!PASSWORD_RE.test(form.password))
      next.password = 'Mật khẩu phải từ 6 ký tự, có ít nhất 1 chữ số và 1 ký tự đặc biệt'

    // Số điện thoại không bắt buộc, chỉ kiểm tra khi có nhập.
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim()))
      next.phone = 'Số điện thoại không hợp lệ'

    setFieldErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const submit = (e) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return // lỗi đã hiện dưới từng ô, không im lặng nữa
    onSubmit({
      ...form,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
  }

  // Dòng chữ đỏ dưới ô nhập.
  const FieldError = ({ name }) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-400">{fieldErrors[name]}</p> : null

  return (
    <AdminModal open={open} onClose={onClose} title="Thêm User mới">
      {/* noValidate: tự kiểm tra bằng tay để thông báo tiếng Việt thống nhất,
          tránh bong bóng mặc định của trình duyệt chặn submit mà không rõ lý do. */}
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className={labelCls}>Họ tên</label>
          <input
            value={form.full_name}
            onChange={set('full_name')}
            className={inputCls(fieldErrors.full_name)}
            placeholder="VD: Nguyễn Văn A"
            autoFocus
          />
          <FieldError name="full_name" />
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            className={inputCls(fieldErrors.email)}
            placeholder="user@mail.com"
          />
          <FieldError name="email" />
        </div>

        <div>
          <label className={labelCls}>Mật khẩu</label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            className={inputCls(fieldErrors.password)}
            placeholder="Tối thiểu 6 ký tự, có số và ký tự đặc biệt"
          />
          <FieldError name="password" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input
              value={form.phone}
              onChange={set('phone')}
              className={inputCls(fieldErrors.phone)}
              placeholder="0901234567"
            />
            <FieldError name="phone" />
          </div>
          <div>
            <label className={labelCls}>Vai trò</label>
            <select value={form.role} onChange={set('role')} className={inputCls(false)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Gói dịch vụ</label>
          <select value={form.plan_type} onChange={set('plan_type')} className={inputCls(false)}>
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

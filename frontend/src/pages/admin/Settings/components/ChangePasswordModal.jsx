import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'

const EMPTY = { current_password: '', new_password: '', confirm_password: '' }

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Đổi mật khẩu của chính admin đang đăng nhập.
// Backend bắt buộc nhập đúng mật khẩu hiện tại nên form phải có 3 ô.
const ChangePasswordModal = ({ open, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setLocalError('')
    }
  }, [open])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (submitting) return

    if (form.new_password.length < 6) {
      setLocalError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (form.new_password !== form.confirm_password) {
      setLocalError('Xác nhận mật khẩu không khớp.')
      return
    }
    setLocalError('')

    onSubmit({
      current_password: form.current_password,
      new_password: form.new_password,
    })
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Đổi mật khẩu">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={form.current_password}
            onChange={set('current_password')}
            className={inputCls}
            autoFocus
          />
        </div>
        <div>
          <label className={labelCls}>Mật khẩu mới</label>
          <input
            type="password"
            value={form.new_password}
            onChange={set('new_password')}
            className={inputCls}
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>
        <div>
          <label className={labelCls}>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={form.confirm_password}
            onChange={set('confirm_password')}
            className={inputCls}
          />
        </div>

        {(localError || error) && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {localError || error}
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
            {submitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default ChangePasswordModal

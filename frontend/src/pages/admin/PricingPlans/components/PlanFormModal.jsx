import { useState, useEffect } from 'react'
import AdminModal from '../../components/AdminModal'
import { PlusIcon, TrashIcon, CheckIcon, XIcon } from '../../../../components/icons'

const EMPTY = {
  code: '',
  name: '',
  label: '',
  price: 0,
  unit: '/tháng',
  badge: '',
  highlighted: false,
  sort_order: 0,
  features: [{ label: '', included: true }],
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-slate-400'

// Modal tạo mới / chỉnh sửa gói dịch vụ. initial = null nghĩa là tạo mới.
const PlanFormModal = ({ open, initial, submitting, error, onClose, onSubmit, onDelete }) => {
  const [form, setForm] = useState(EMPTY)
  const isEdit = Boolean(initial)

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? {
            code: initial.code,
            name: initial.name,
            label: initial.label || '',
            price: initial.price,
            unit: initial.unit,
            badge: initial.badge || '',
            highlighted: initial.highlighted,
            sort_order: initial.sort_order,
            features: initial.features.length
              ? initial.features.map((f) => ({ label: f.label, included: f.included }))
              : [{ label: '', included: true }],
          }
        : EMPTY,
    )
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const setFeature = (index, patch) =>
    setForm((f) => ({
      ...f,
      features: f.features.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, { label: '', included: true }] }))

  const removeFeature = (index) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== index) }))

  const submit = (e) => {
    e.preventDefault()
    if (submitting || !form.code.trim() || !form.name.trim()) return

    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      label: form.label.trim(),
      price: Number(form.price) || 0,
      unit: form.unit.trim() || '/tháng',
      badge: form.badge.trim(),
      highlighted: form.highlighted,
      sort_order: Number(form.sort_order) || 0,
      // Bỏ dòng tính năng để trống — backend sẽ từ chối label rỗng.
      features: form.features
        .filter((f) => f.label.trim())
        .map((f) => ({ label: f.label.trim(), included: f.included })),
    })
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Sửa gói: ${initial.name}` : 'Thêm gói mới'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Mã gói (code)</label>
            <input
              value={form.code}
              onChange={set('code')}
              className={`${inputCls} font-mono`}
              placeholder="pro"
              autoFocus
            />
          </div>
          <div>
            <label className={labelCls}>Tên hiển thị</label>
            <input value={form.name} onChange={set('name')} className={inputCls} placeholder="Pro" />
          </div>
          <div>
            <label className={labelCls}>Nhãn phụ</label>
            <input
              value={form.label}
              onChange={set('label')}
              className={inputCls}
              placeholder="Doanh nghiệp"
            />
          </div>
          <div>
            <label className={labelCls}>Nhãn nổi bật</label>
            <input
              value={form.badge}
              onChange={set('badge')}
              className={inputCls}
              placeholder="Phổ biến nhất"
            />
          </div>
          <div>
            <label className={labelCls}>Giá (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={set('price')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Đơn vị</label>
            <input value={form.unit} onChange={set('unit')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={set('sort_order')}
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.highlighted}
                onChange={(e) => setForm((f) => ({ ...f, highlighted: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900"
              />
              Gói nổi bật
            </label>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={`${labelCls} mb-0`}>Tính năng</label>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <PlusIcon size={14} /> Thêm dòng
            </button>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {form.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* Bấm để đổi giữa "có" (✓) và "không có" (✕) tính năng này */}
                <button
                  type="button"
                  onClick={() => setFeature(i, { included: !f.included })}
                  title={f.included ? 'Có trong gói' : 'Không có trong gói'}
                  className={`shrink-0 rounded-md border p-1.5 ${
                    f.included
                      ? 'border-green-500/40 text-green-400'
                      : 'border-slate-700 text-slate-600'
                  }`}
                >
                  {f.included ? <CheckIcon size={14} /> : <XIcon size={14} />}
                </button>
                <input
                  value={f.label}
                  onChange={(e) => setFeature(i, { label: e.target.value })}
                  className={inputCls}
                  placeholder="VD: Không giới hạn số lượng Project"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="shrink-0 rounded-md border border-red-500/40 p-1.5 text-red-400 hover:bg-red-500/10"
                  title="Xóa dòng"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => onDelete?.(initial)}
              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              Xóa gói
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
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
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Tạo gói'}
            </button>
          </div>
        </div>
      </form>
    </AdminModal>
  )
}

export default PlanFormModal

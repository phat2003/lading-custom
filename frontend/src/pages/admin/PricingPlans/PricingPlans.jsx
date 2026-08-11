import { useCallback, useEffect, useState } from 'react'
import { PlusIcon, DownloadIcon } from '../../../components/icons'
import PlanCard from './components/PlanCard'
import FeatureComparison from './components/FeatureComparison'
import PlanFormModal from './components/PlanFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { plansApi } from '../../../api/plans'
import { errMsg } from '../adapters'
import { downloadCsv, csvFilename } from '../exportCsv'

// price là số nguyên VNĐ trong DB; card cần chuỗi hiển thị sẵn.
const formatPrice = (price) => (price === 0 ? '0' : `${price.toLocaleString('vi-VN')} VNĐ`)

// Giữ nguyên bản gốc (price số, features) để đổ ngược vào form khi sửa.
const toUI = (p) => ({
  ...p,
  id: p.plan_id,
  priceText: formatPrice(p.price),
  features: p.features || [],
})

// Bảng so sánh dựng từ chính features của các gói:
// mỗi nhãn tính năng thành 1 dòng, mỗi gói thành 1 cột, ô là ✓/✕.
const buildComparison = (plans) => {
  const labels = []
  plans.forEach((p) =>
    p.features.forEach((f) => {
      if (!labels.includes(f.label)) labels.push(f.label)
    }),
  )

  return {
    columns: plans.map((p) => p.name),
    rows: labels.map((label) => ({
      feature: label,
      values: plans.map((p) => {
        const found = p.features.find((f) => f.label === label)
        // Gói không có dòng tính năng này -> coi như không bao gồm.
        return Boolean(found && found.included)
      }),
    })),
  }
}

const PricingPlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchPlans = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      // include_inactive: trang admin phải thấy cả gói đang ẩn để bật lại được.
      const res = await plansApi.list({ include_inactive: true }, { signal })
      setPlans((res.data.data || []).map(toUI))
    } catch (err) {
      if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
      setError(errMsg(err, 'Không tải được bảng giá.'))
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchPlans(controller.signal)
    return () => controller.abort()
  }, [fetchPlans])

  const openCreate = () => {
    setEditing(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (plan) => {
    setEditing(plan)
    setFormError('')
    setFormOpen(true)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setFormError('')
    try {
      if (editing) {
        await plansApi.update(editing.id, payload)
      } else {
        await plansApi.create(payload)
      }
      setFormOpen(false)
      setEditing(null)
      await fetchPlans()
    } catch (err) {
      // Lỗi hiện trong modal để không mất dữ liệu đang nhập (vd trùng mã gói).
      setFormError(errMsg(err, editing ? 'Cập nhật gói thất bại.' : 'Tạo gói thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await plansApi.remove(deleting.id)
      setDeleting(null)
      setFormOpen(false)
      setEditing(null)
      await fetchPlans()
    } catch (err) {
      setError(errMsg(err, 'Xóa gói thất bại.'))
      setDeleting(null)
    } finally {
      setSubmitting(false)
    }
  }

  const comparison = buildComparison(plans)

  // Xuất bảng so sánh ra CSV. Dòng đầu là giá, các dòng sau là từng tính năng.
  // Ô boolean quy đổi thành Có/Không cho dễ đọc trong Excel.
  const handleExportCsv = () => {
    const columns = [
      { label: 'Tính năng', value: (r) => r.feature },
      ...comparison.columns.map((planName, i) => ({
        label: planName,
        value: (r) => (typeof r.values[i] === 'boolean' ? (r.values[i] ? 'Có' : 'Không') : r.values[i]),
      })),
    ]
    const rows = [{ feature: 'Giá', values: plans.map((p) => p.priceText) }, ...comparison.rows]
    downloadCsv(csvFilename('bang-gia'), columns, rows)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--bd-text)]">Gói dịch vụ &amp; Thanh toán</h1>
        <p className="mt-1 text-sm text-[var(--bd-dim)]">
          Cấu hình và quản lý chiến lược doanh thu của nền tảng. Cân bằng các tính năng
          giữa các gói để tối ưu hóa chuyển đổi.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]"
            />
          ))
        ) : (
          <>
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={{ ...p, price: p.priceText }}
                onEdit={() => openEdit(p)}
              />
            ))}
            <button
              onClick={openCreate}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--bd-border)] p-6 text-center hover:border-violet-400/40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--bd-border)] text-[var(--bd-dim)]">
                <PlusIcon size={20} />
              </span>
              <span className="font-medium text-[var(--bd-dim)]">Thêm gói mới</span>
              <span className="text-xs text-[var(--bd-muted)]">
                Tạo gói cấp độ tùy chỉnh mới cho các quy tắc và tính năng cụ thể.
              </span>
            </button>
          </>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--bd-text)]">So sánh tính năng</h2>
            <p className="text-sm text-[var(--bd-dim)]">
              Tổng hợp từ danh sách tính năng của từng gói ở trên.
            </p>
          </div>
          {/* Xuất phía client — dữ liệu đã có sẵn, không cần endpoint riêng. */}
          <button
            onClick={handleExportCsv}
            disabled={loading || comparison.rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-40"
          >
            <DownloadIcon size={16} /> Xuất CSV
          </button>
        </div>
        <div className="mt-4">
          {comparison.rows.length === 0 ? (
            <p className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-5 py-10 text-center text-sm text-[var(--bd-muted)]">
              Chưa có tính năng nào để so sánh.
            </p>
          ) : (
            <FeatureComparison columns={comparison.columns} rows={comparison.rows} />
          )}
        </div>
      </div>

      <PlanFormModal
        open={formOpen}
        initial={editing}
        submitting={submitting}
        error={formError}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        onDelete={setDeleting}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa gói dịch vụ"
        message={
          deleting
            ? `Xóa gói "${deleting.name}" khỏi bảng giá? Người dùng đang ở gói này KHÔNG bị ảnh hưởng — họ vẫn giữ quyền lợi hiện tại. Muốn ngừng bán mà giữ dữ liệu thì nên ẩn gói thay vì xóa.`
            : ''
        }
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default PricingPlans

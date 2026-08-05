import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '../../../components/icons'
import FilterTabs from '../components/FilterTabs'
import ConfirmDialog from '../components/ConfirmDialog'
import SectionCard from './components/SectionCard'
import { SECTION_TYPES } from './sectionTypes'
import { sectionsApi } from '../../../api/sections'

const TABS = [
  { label: 'Tất cả', value: 'All' },
  ...SECTION_TYPES.map((t) => ({ label: t.tab, value: t.value })),
]

const PAGE_SIZE = 9 // vừa đúng 3 hàng x 3 cột của lưới

// Backend trả snake_case; UI dùng tên ngắn gọn.
// Giữ defaultContent để form sửa hiển thị lại đúng JSON đang lưu.
const toUI = (s) => ({
  id: s.section_template_id,
  name: s.display_name,
  type: s.section_type,
  usedIn: s.used_in ?? 0,
  defaultContent: s.default_content,
})

const errMsg = (err, fallback) => err?.response?.data?.error || fallback

const Sections = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Đổi tab thì luôn về trang 1.
  useEffect(() => {
    setPage(1)
  }, [filter])

  const fetchSections = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const res = await sectionsApi.list(
          { page, limit: PAGE_SIZE, type: filter === 'All' ? 'all' : filter },
          { signal },
        )
        setItems((res.data.data || []).map(toUI))
        setMeta(res.data.meta || { page, total: 0, total_pages: 1 })
      } catch (err) {
        if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
        setError(errMsg(err, 'Không tải được thư viện thành phần.'))
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [page, filter],
  )

  // AbortController: hủy request cũ khi đổi tab nhanh,
  // để response về trễ không ghi đè kết quả mới.
  useEffect(() => {
    const controller = new AbortController()
    fetchSections(controller.signal)
    return () => controller.abort()
  }, [fetchSections])

  // Tạo/sửa section mẫu = mở builder (kéo-thả dựng nội dung thật),
  // không dùng modal nhập JSON nữa. Builder tự gọi API lưu khi bấm "Lưu Section".
  const openCreate = () => navigate('/admin/sections/new')
  const openEdit = (s) => navigate(`/admin/sections/${s.id}/edit`)

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await sectionsApi.remove(deleting.id)
      const isLastItemOnPage = items.length === 1 && page > 1
      setDeleting(null)
      if (isLastItemOnPage) {
        setPage((p) => p - 1) // đổi page -> useEffect tự fetch lại
      } else {
        await fetchSections()
      }
    } catch (err) {
      setError(errMsg(err, 'Xóa thành phần thất bại.'))
      setDeleting(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cấu trúc</p>
          <h1 className="text-2xl font-bold text-white">Thư viện Thành phần</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <PlusIcon size={16} /> Tạo Thành phần Mới
        </button>
      </div>

      {/* Tabs */}
      <FilterTabs tabs={TABS} active={filter} onChange={setFilter} />

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-60 animate-pulse rounded-xl border border-slate-800 bg-[#111725]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-[#111725] px-5 py-10 text-center text-sm text-slate-500">
          Không có thành phần nào.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <SectionCard key={s.id} section={s} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* Phân trang */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-[#111725] px-4 py-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-slate-400 hover:text-white disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm text-slate-300">
            Trang {page}/{meta.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page >= meta.total_pages}
            className="text-slate-400 hover:text-white disabled:opacity-40"
          >
            ›
          </button>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Đang hiển thị {items.length} trên {meta.total} thành phần
        </span>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa Thành phần"
        message={
          deleting
            ? `Xóa "${deleting.name}"? Các template đã dùng mẫu này (${deleting.usedIn}) vẫn giữ nguyên nội dung, chỉ mất dấu vết nguồn gốc.`
            : ''
        }
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default Sections

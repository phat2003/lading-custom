import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '../../../components/icons'
import SearchInput from '../components/SearchInput'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import TemplateCard from './components/TemplateCard'
import TemplateFormModal from './components/TemplateFormModal'
import { templatesApi } from '../../../api/templates'

const TABS = ['All', 'SaaS', 'Agency', 'Startup', 'Webinar', 'Portfolio'].map((v) => ({
  label: v,
  value: v,
}))

const PAGE_SIZE = 9 // vừa đúng 3 hàng x 3 cột của lưới
const SEARCH_DELAY = 400 // ms chờ người dùng ngừng gõ trước khi gọi API

// Backend trả snake_case + enum chữ thường ('draft'/'premium'),
// còn UI hiển thị nhãn viết hoa ('Draft'/'Premium') -> quy đổi ở đây
// để TemplateCard và TemplateFormModal giữ nguyên như cũ.
const toUI = (t) => ({
  id: t.template_id,
  name: t.name,
  category: t.category || '',
  status: t.status === 'published' ? 'Published' : 'Draft',
  tier: t.tier === 'premium' ? 'Premium' : 'Free',
  sections: t.section_count ?? 0,
  thumbnailUrl: t.thumbnail_url || '',
  updatedAt: t.updated_at,
})

// Chiều ngược lại: form UI -> payload API.
// sections KHÔNG gửi lên: backend tự đếm từ bảng template_section.
const toPayload = (form) => ({
  name: form.name.trim(),
  category: form.category,
  status: form.status.toLowerCase(),
  tier: form.tier.toLowerCase(),
  thumbnail_url: form.thumbnailUrl || '',
})

// Lấy thông báo lỗi backend trả về; không có thì dùng câu mặc định.
const errMsg = (err, fallback) => err?.response?.data?.error || fallback

const Templates = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('') // bản đã debounce, dùng để gọi API
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // template đang sửa; null = tạo mới
  const [deleting, setDeleting] = useState(null) // template chờ xác nhận xóa
  const [submitting, setSubmitting] = useState(false)

  // Debounce ô tìm kiếm để mỗi ký tự gõ không thành một request.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [query])

  // Đổi từ khóa hoặc danh mục thì luôn về trang 1,
  // tránh trường hợp đang ở trang 3 mà kết quả mới chỉ có 1 trang.
  useEffect(() => {
    setPage(1)
  }, [search, filter])

  const fetchTemplates = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const res = await templatesApi.list(
          {
            page,
            limit: PAGE_SIZE,
            search,
            category: filter === 'All' ? 'all' : filter,
          },
          { signal },
        )
        setItems((res.data.data || []).map(toUI))
        setMeta(res.data.meta || { page, total: 0, total_pages: 1 })
      } catch (err) {
        if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
        setError(errMsg(err, 'Không tải được danh sách template.'))
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [page, search, filter],
  )

  // AbortController: hủy request cũ khi bộ lọc đổi nhanh,
  // để response về trễ không ghi đè kết quả mới.
  useEffect(() => {
    const controller = new AbortController()
    fetchTemplates(controller.signal)
    return () => controller.abort()
  }, [fetchTemplates])

  // Tạo template mới = mở builder để kéo-thả dựng giao diện thật.
  const openCreate = () => navigate('/admin/templates/new')

  // Sửa = mở modal chỉnh metadata (tên, danh mục, gói, trạng thái).
  const openEdit = (t) => {
    setEditing(t)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await templatesApi.update(editing.id, toPayload(data))
      } else {
        await templatesApi.create(toPayload(data))
      }
      setFormOpen(false)
      setEditing(null)
      await fetchTemplates()
    } catch (err) {
      setError(errMsg(err, editing ? 'Cập nhật template thất bại.' : 'Tạo template thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await templatesApi.remove(deleting.id)
      // Xóa phần tử cuối cùng của trang thì lùi về trang trước,
      // nếu không người dùng sẽ nhìn thấy một trang trống.
      const isLastItemOnPage = items.length === 1 && page > 1
      setDeleting(null)
      if (isLastItemOnPage) {
        setPage((p) => p - 1) // đổi page -> useEffect tự fetch lại
      } else {
        await fetchTemplates()
      }
    } catch (err) {
      setError(errMsg(err, 'Xóa template thất bại.'))
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Library</p>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <PlusIcon size={16} /> Create Template
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs tabs={TABS} active={filter} onChange={setFilter} />
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search templates..."
            className="w-56"
          />
          <span className="text-sm text-slate-400">{meta.total} Templates</span>
        </div>
      </div>

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
              className="h-64 animate-pulse rounded-xl border border-slate-800 bg-[#111725]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-[#111725] px-5 py-10 text-center text-sm text-slate-500">
          Không có template nào.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={openEdit}
              onEditContent={(tpl) => navigate(`/admin/templates/${tpl.id}/edit`)}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Phân trang — chỉ hiện khi có nhiều hơn 1 trang */}
      {!loading && meta.total_pages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={meta.total_pages} onChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <TemplateFormModal
        open={formOpen}
        initial={editing}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa Template"
        message={
          deleting
            ? `Bạn có chắc muốn xóa "${deleting.name}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default Templates

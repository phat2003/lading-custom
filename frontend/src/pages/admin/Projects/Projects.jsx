import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import ProjectTable from './components/ProjectTable'
import { adminProjectsApi } from '../../../api/projects'
import { errMsg } from '../adapters'

const PAGE_SIZE = 10

// Backend đã JOIN sẵn owner/template; ở đây chỉ làm phẳng cho bảng.
const toUI = (p) => ({
  id: p.project_id,
  name: p.name,
  owner: p.owner?.full_name || p.owner?.email || '—',
  email: p.owner?.email || '—',
  // Dự án mà mọi trang đều tạo từ Blank thì không có template gốc.
  template: p.template_name || 'Blank',
  status: p.status,
  pageCount: p.page_count,
  publishedUrl: p.published_url,
})

const Projects = () => {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const res = await adminProjectsApi.list({ page, limit: PAGE_SIZE }, { signal })
        setItems((res.data.data || []).map(toUI))
        setMeta(res.data.meta || { page, total: 0, total_pages: 1 })
      } catch (err) {
        if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
        setError(errMsg(err, 'Không tải được danh sách dự án.'))
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [page],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchProjects(controller.signal)
    return () => controller.abort()
  }, [fetchProjects])

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await adminProjectsApi.remove(deleting.id)
      const isLastItemOnPage = items.length === 1 && page > 1
      setDeleting(null)
      if (isLastItemOnPage) {
        setPage((p) => p - 1) // đổi page -> useEffect tự fetch lại
      } else {
        await fetchProjects()
      }
    } catch (err) {
      setError(errMsg(err, 'Xóa dự án thất bại.'))
      setDeleting(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bd-text)]">Dự án</h1>
          <p className="mt-1 text-sm text-[var(--bd-dim)]">
            Giám sát các bản triển khai đang hoạt động và việc sử dụng mẫu trong studio của bạn.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]" />
      ) : (
        <ProjectTable projects={items} onView={() => {}} onDelete={setDeleting} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--bd-muted)]">
          Đang hiển thị {items.length} trong số {meta.total} dự án
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-40"
          >
            Trước
          </button>
          <span className="text-sm text-[var(--bd-dim)]">
            {page}/{meta.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page >= meta.total_pages || loading}
            className="rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-40"
          >
            Tiếp
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa Dự án"
        message={
          deleting
            ? `Xóa dự án "${deleting.name}" của ${deleting.owner}? Toàn bộ ${deleting.pageCount} landing page bên trong sẽ bị xóa theo${
                deleting.publishedUrl ? ` và link công khai /p/${deleting.publishedUrl} sẽ chết ngay` : ''
              }. Hành động không thể hoàn tác.`
            : ''
        }
        confirmText={submitting ? 'Đang xóa...' : 'Xóa'}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default Projects

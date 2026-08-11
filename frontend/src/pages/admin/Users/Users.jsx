import { useCallback, useEffect, useState } from 'react'
import { DownloadIcon, UserIcon } from '../../../components/icons'
import SearchInput from '../components/SearchInput'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import UserTable from './components/UserTable'
import UserDetailPanel from './components/UserDetailPanel'
import UserFormModal from './components/UserFormModal'
import { usersApi } from '../../../api/users'
import { toUserUI, errMsg } from '../adapters'
import { downloadCsv, csvFilename } from '../exportCsv'

const TABS = [
  { label: 'All', value: 'All' },
  { label: 'Pro', value: 'Pro' },
  { label: 'Free', value: 'Free' },
]

const PAGE_SIZE = 10
const SEARCH_DELAY = 400 // ms chờ người dùng ngừng gõ trước khi gọi API
const EXPORT_PAGE_SIZE = 100 // trần backend cho mỗi request
const EXPORT_MAX_PAGES = 200 // chặn vòng lặp vô hạn nếu meta trả sai

const CSV_COLUMNS = [
  { label: 'Họ tên', value: (u) => u.name },
  { label: 'Email', value: (u) => u.email },
  { label: 'Số điện thoại', value: (u) => (u.phone === '—' ? '' : u.phone) },
  { label: 'Gói', value: (u) => u.plan },
  { label: 'Trạng thái', value: (u) => u.status },
  { label: 'Vai trò', value: (u) => u.role },
  { label: 'Ngày tham gia', value: (u) => u.joined },
]

const Users = () => {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('') // bản đã debounce, dùng để gọi API
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState(null) // user đang xem (dữ liệu từ bảng)
  const [detail, setDetail] = useState(null) // dữ liệu chi tiết từ GET /users/:id
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null) // user chờ xác nhận xoá
  const [exporting, setExporting] = useState(false)

  // Debounce ô tìm kiếm để mỗi ký tự gõ không thành một request.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [query])

  // Đổi từ khóa hoặc tab thì luôn về trang 1.
  useEffect(() => {
    setPage(1)
  }, [search, filter])

  const fetchUsers = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const res = await usersApi.list(
          {
            page,
            limit: PAGE_SIZE,
            search,
            plan: filter === 'All' ? 'all' : filter.toLowerCase(),
          },
          { signal },
        )
        setItems((res.data.data || []).map(toUserUI))
        setMeta(res.data.meta || { page, total: 0, total_pages: 1 })
      } catch (err) {
        if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
        setError(errMsg(err, 'Không tải được danh sách user.'))
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
    fetchUsers(controller.signal)
    return () => controller.abort()
  }, [fetchUsers])

  // Xuất CSV toàn bộ user khớp bộ lọc hiện tại (không chỉ trang đang xem).
  // Backend chặn limit ở 100 nên phải lấy lần lượt từng trang.
  const handleExportCsv = async () => {
    setExporting(true)
    setError('')
    try {
      const all = []
      let current = 1
      let totalPages = 1
      do {
        const res = await usersApi.list({
          page: current,
          limit: EXPORT_PAGE_SIZE,
          search,
          plan: filter === 'All' ? 'all' : filter.toLowerCase(),
        })
        all.push(...(res.data.data || []).map(toUserUI))
        totalPages = res.data.meta?.total_pages || 1
        current += 1
      } while (current <= totalPages && current <= EXPORT_MAX_PAGES)

      if (all.length === 0) {
        setError('Không có user nào để xuất.')
        return
      }
      downloadCsv(csvFilename('users'), CSV_COLUMNS, all)
    } catch (err) {
      setError(errMsg(err, 'Xuất CSV thất bại.'))
    } finally {
      setExporting(false)
    }
  }

  // Bấm "View": hiện ngay dữ liệu đã có ở bảng, rồi nạp thêm
  // project_count / subscription từ API chi tiết.
  const openDetail = async (user) => {
    setSelected(user)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await usersApi.get(user.id)
      setDetail(res.data.data)
    } catch (err) {
      setError(errMsg(err, 'Không tải được chi tiết user.'))
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setSelected(null)
    setDetail(null)
  }

  const handleCreate = async (payload) => {
    setSubmitting(true)
    setFormError('')
    try {
      await usersApi.create(payload)
      setFormOpen(false)
      await fetchUsers()
    } catch (err) {
      // Lỗi hiển thị ngay trong modal để không mất dữ liệu đang nhập.
      setFormError(errMsg(err, 'Tạo user thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  // Dùng chung cho đổi gói và khoá/mở tài khoản.
  const patchUser = async (id, payload) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await usersApi.update(id, payload)
      const updated = toUserUI(res.data.data)
      setSelected(updated)
      setDetail((d) => (d ? { ...d, ...res.data.data } : d))
      setItems((list) => list.map((u) => (u.id === id ? updated : u)))

      // Đang lọc theo gói mà vừa đổi gói thì user có thể không còn thuộc tab
      // hiện tại nữa -> tải lại để danh sách khớp bộ lọc.
      if (payload.plan_type && filter !== 'All') {
        await fetchUsers()
      }
    } catch (err) {
      setError(errMsg(err, 'Cập nhật user thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await usersApi.remove(deleting.id)
      const isLastItemOnPage = items.length === 1 && page > 1
      setDeleting(null)
      closeDetail()
      if (isLastItemOnPage) {
        setPage((p) => p - 1) // đổi page -> useEffect tự fetch lại
      } else {
        await fetchUsers()
      }
    } catch (err) {
      setError(errMsg(err, 'Xoá user thất bại.'))
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
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">
            Management
          </p>
          <h1 className="text-2xl font-bold text-[var(--bd-text)]">Users</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Export CSV chưa có API — giữ nguyên nút, chưa nối */}
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            title="Xuất toàn bộ user khớp bộ lọc hiện tại"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-40"
          >
            <DownloadIcon size={16} /> {exporting ? 'Đang xuất...' : 'Export CSV'}
          </button>
          <button
            onClick={() => {
              setFormError('')
              setFormOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-3.5 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_26px_-2px_rgba(139,92,246,1)]"
          >
            <UserIcon size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, email..."
            className="w-64"
          />
          <FilterTabs tabs={TABS} active={filter} onChange={setFilter} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--bd-dim)]">
            All Users:{' '}
            <span className="font-semibold text-[var(--bd-text)]">{meta.total} RECORDS</span>
          </span>
          <Pagination page={page} totalPages={meta.total_pages} onChange={setPage} />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Table + panel chi tiết */}
      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          {loading ? (
            <div className="h-72 animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]" />
          ) : (
            <UserTable users={items} onView={openDetail} selectedId={selected?.id} />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--bd-muted)]">
              Showing {items.length} of {meta.total} records
            </p>
            <Pagination page={page} totalPages={meta.total_pages} onChange={setPage} />
          </div>
        </div>

        {selected && (
          <UserDetailPanel
            user={selected}
            detail={detail}
            loading={detailLoading}
            pending={submitting}
            onClose={closeDetail}
            onChangePlan={(planType) => patchUser(selected.id, { plan_type: planType })}
            onToggleActive={() => patchUser(selected.id, { is_active: !selected.isActive })}
            onDelete={() => setDeleting(selected)}
          />
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        submitting={submitting}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xoá User"
        message={
          deleting
            ? `Xoá "${deleting.name}" sẽ xoá luôn toàn bộ project và landing page của user này. Hành động không thể hoàn tác.`
            : ''
        }
        confirmText="Xoá vĩnh viễn"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

export default Users

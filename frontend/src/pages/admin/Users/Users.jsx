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

const TABS = [
  { label: 'All', value: 'All' },
  { label: 'Pro', value: 'Pro' },
  { label: 'Free', value: 'Free' },
]

const PAGE_SIZE = 10
const SEARCH_DELAY = 400 // ms chờ người dùng ngừng gõ trước khi gọi API

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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Management
          </p>
          <h1 className="text-2xl font-bold text-white">Users</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Export CSV chưa có API — giữ nguyên nút, chưa nối */}
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            <DownloadIcon size={16} /> Export CSV
          </button>
          <button
            onClick={() => {
              setFormError('')
              setFormOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
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
          <span className="text-sm text-slate-400">
            All Users:{' '}
            <span className="font-semibold text-white">{meta.total} RECORDS</span>
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
            <div className="h-72 animate-pulse rounded-xl border border-slate-800 bg-[#111725]" />
          ) : (
            <UserTable users={items} onView={openDetail} selectedId={selected?.id} />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
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

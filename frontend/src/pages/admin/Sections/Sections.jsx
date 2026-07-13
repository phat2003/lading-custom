import { useState } from 'react'
import { PlusIcon } from '../../../components/icons'
import FilterTabs from '../components/FilterTabs'
import ConfirmDialog from '../components/ConfirmDialog'
import SectionCard from './components/SectionCard'
import SectionFormModal from './components/SectionFormModal'
import { SECTION_TYPES } from './sectionTypes'
import { sectionsMock } from '../mock/sections'
// Khi backend sẵn sàng: import { sectionsApi } from '../../../api/sections'

const TABS = [
  { label: 'Tất cả', value: 'All' },
  ...SECTION_TYPES.map((t) => ({ label: t.tab, value: t.value })),
]

const TOTAL_MOCK = 64 // tổng "thành phần" giả lập cho phần phân trang

export default function Sections() {
  const [items, setItems] = useState(sectionsMock)
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const totalPages = 5 // mock

  const filtered = items.filter((s) => filter === 'All' || s.type === filter)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setFormOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) {
      // TODO(API): await sectionsApi.update(editing.id, data)
      setItems((list) => list.map((s) => (s.id === editing.id ? { ...s, ...data } : s)))
    } else {
      // TODO(API): await sectionsApi.create(data)
      setItems((list) => [{ id: Date.now(), usedIn: 0, ...data }, ...list])
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    // TODO(API): await sectionsApi.remove(deleting.id)
    setItems((list) => list.filter((s) => s.id !== deleting.id))
    setDeleting(null)
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-[#111725] px-5 py-10 text-center text-sm text-slate-500">
          Không có thành phần nào.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SectionCard key={s.id} section={s} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* Pagination (mock) */}
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
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-slate-400 hover:text-white disabled:opacity-40"
          >
            ›
          </button>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Đang hiển thị {filtered.length} trên {TOTAL_MOCK} thành phần
        </span>
      </div>

      {/* Modals */}
      <SectionFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa Thành phần"
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

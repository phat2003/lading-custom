import { useState } from 'react'
import { PlusIcon } from '../../../components/icons'
import SearchInput from '../components/SearchInput'
import FilterTabs from '../components/FilterTabs'
import ConfirmDialog from '../components/ConfirmDialog'
import TemplateCard from './components/TemplateCard'
import TemplateFormModal from './components/TemplateFormModal'
import { templatesMock } from '../mock/templates'
// Khi backend sẵn sàng: import { templatesApi } from '../../../api/templates'
// rồi thay các thao tác setItems bên dưới bằng gọi API + refetch.

const TABS = ['All', 'SaaS', 'Agency', 'Startup', 'Webinar', 'Portfolio'].map((v) => ({
  label: v,
  value: v,
}))

export default function Templates() {
  const [items, setItems] = useState(templatesMock)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // template đang sửa; null = tạo mới
  const [deleting, setDeleting] = useState(null) // template chờ xác nhận xóa

  const filtered = items.filter((t) => {
    const matchTab = filter === 'All' || t.category === filter
    const matchQuery = t.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchTab && matchQuery
  })

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setFormOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) {
      // TODO(API): await templatesApi.update(editing.id, data)
      setItems((list) => list.map((t) => (t.id === editing.id ? { ...t, ...data } : t)))
    } else {
      // TODO(API): const { data: created } = await templatesApi.create(data)
      setItems((list) => [{ id: Date.now(), updatedAt: 'vừa xong', ...data }, ...list])
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    // TODO(API): await templatesApi.remove(deleting.id)
    setItems((list) => list.filter((t) => t.id !== deleting.id))
    setDeleting(null)
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
          <span className="text-sm text-slate-400">{filtered.length} Templates</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-[#111725] px-5 py-10 text-center text-sm text-slate-500">
          Không có template nào.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* Modals */}
      <TemplateFormModal
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

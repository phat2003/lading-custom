import { useState } from 'react'
import { DownloadIcon, UserIcon } from '../../../components/icons'
import SearchInput from '../components/SearchInput'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import UserTable from './components/UserTable'
import UserDetailPanel from './components/UserDetailPanel'
import { users as allUsers } from '../mock/users'

const TABS = [
  { label: 'All', value: 'All' },
  { label: 'Pro', value: 'Pro' },
  { label: 'Free', value: 'Free' },
]

export default function Users() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = allUsers.filter((u) => {
    const matchFilter = filter === 'All' || u.plan === filter
    const q = query.trim().toLowerCase()
    const matchQuery =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchFilter && matchQuery
  })

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
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            <DownloadIcon size={16} /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
            <UserIcon size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v)
              setPage(1)
            }}
            placeholder="Search by name, email..."
            className="w-64"
          />
          <FilterTabs
            tabs={TABS}
            active={filter}
            onChange={(v) => {
              setFilter(v)
              setPage(1)
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            All Users:{' '}
            <span className="font-semibold text-white">{filtered.length} RECORDS</span>
          </span>
          <Pagination page={page} totalPages={4} onChange={setPage} />
        </div>
      </div>

      {/* Table + panel chi tiết */}
      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <UserTable
            users={filtered}
            onView={setSelected}
            selectedId={selected?.id}
          />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {filtered.length} of {allUsers.length} records
            </p>
            <Pagination page={page} totalPages={4} onChange={setPage} />
          </div>
        </div>

        {selected && (
          <UserDetailPanel user={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}

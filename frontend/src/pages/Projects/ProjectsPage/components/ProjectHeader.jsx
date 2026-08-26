import {
  ChevronsUpDownIcon,
  PlusIcon,
  SearchIcon,
} from '../../../../components/icons'

export default function ProjectHeader({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  onCreateProject,
}) {
  return (
    <header className="sticky top-16 z-20 border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-4 py-6 backdrop-blur-xl sm:px-8 lg:top-0 lg:px-10 lg:py-7">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--bd-info)]">
            Dự án
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--bd-text)] sm:text-4xl">
            Dự án của bạn
          </h2>
          <p className="mt-2 text-sm text-[var(--bd-dim)] sm:text-base">
            Quản lý và chỉnh sửa các Landing Page.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:grid-cols-[minmax(18rem,24rem)_auto_auto]">
          <label className="relative block sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Tìm kiếm dự án</span>
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm dự án..."
              className="h-12 w-full rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] pl-10 pr-4 text-sm text-[var(--bd-text)] outline-none transition placeholder:text-[var(--bd-muted)] focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>

          <label className="relative min-w-0 sm:min-w-52">
            <span className="sr-only">Sắp xếp dự án</span>
            <ChevronsUpDownIcon
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]"
            />
            <select
              value={sortOrder}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Sắp xếp dự án"
              className="h-12 w-full appearance-none rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] pl-10 pr-9 text-sm text-[var(--bd-text)] outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="updated-desc">Cập nhật gần nhất</option>
              <option value="updated-asc">Cập nhật cũ nhất</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--bd-muted)]">
              ▾
            </span>
          </label>

          <button
            type="button"
            onClick={onCreateProject}
            className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 font-semibold text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bd-app)] active:translate-y-0"
          >
            <PlusIcon size={20} />
            Dự án mới
          </button>
        </div>
      </div>
    </header>
  )
}

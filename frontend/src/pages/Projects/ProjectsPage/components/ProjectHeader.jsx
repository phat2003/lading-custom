import { PlusIcon, SearchIcon } from '../../../../components/icons'

export default function ProjectHeader({
  searchTerm,
  onSearchChange,
  onCreateProject,
}) {
  return (
    <header className="sticky top-16 z-20 border-b border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-6 backdrop-blur sm:px-8 lg:top-0 lg:px-10 lg:py-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--bd-text)] sm:text-4xl">
            Dự án của bạn
          </h2>
          <p className="mt-2 text-sm text-[var(--bd-dim)] sm:text-base">
            Quản lý và chỉnh sửa các Landing Page.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-72">
            <span className="sr-only">Tìm kiếm Project</span>
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm Project..."
              className="h-12 w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] pl-10 pr-4 font-mono text-xs text-[var(--bd-text)] outline-none transition placeholder:text-[var(--bd-muted)] focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>

          <button
            type="button"
            onClick={onCreateProject}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-6 font-semibold text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] active:translate-y-0"
          >
            <PlusIcon size={20} />
            New Project
          </button>
        </div>
      </div>
    </header>
  )
}

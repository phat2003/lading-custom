import { PlusIcon, SearchIcon } from '../../../../components/icons'

export default function ProjectHeader({
  searchTerm,
  onSearchChange,
  onCreateProject,
}) {
  return (
    <header className="sticky top-16 z-20 border-b border-white/5 bg-[#131315]/90 px-4 py-6 backdrop-blur sm:px-8 lg:top-0 lg:px-10 lg:py-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Dự án của bạn
          </h2>
          <p className="mt-2 text-sm text-[#c3c6d7] sm:text-base">
            Quản lý và chỉnh sửa các Landing Page.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block sm:w-72">
            <span className="sr-only">Tìm kiếm Project</span>
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm kiếm Project..."
              className="h-12 w-full rounded-lg border border-white/10 bg-[#1c1b1d] pl-10 pr-4 font-mono text-xs text-white outline-none transition placeholder:text-[#8d90a0] focus:border-[#b4c5ff] focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </label>

          <button
            type="button"
            onClick={onCreateProject}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#eec200] px-6 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.18)] transition hover:bg-[#ffe083] hover:shadow-[0_0_26px_rgba(238,194,0,0.32)] active:scale-[0.98]"
          >
            <PlusIcon size={20} />
            New Project
          </button>
        </div>
      </div>
    </header>
  )
}

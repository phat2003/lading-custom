import { FolderIcon, PlusIcon } from '../../../../components/icons'

export default function EmptyProjectState({ onCreateProject }) {
  return (
    <section className="relative mx-auto flex min-h-[480px] max-w-4xl items-center justify-center">
      <div className="w-full overflow-hidden rounded-3xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-6 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:px-12 sm:py-16">
        <div className="relative mx-auto mb-8 grid h-36 w-44 place-items-center rounded-3xl border border-dashed border-violet-400/30 bg-gradient-to-br from-violet-500/10 via-[var(--bd-fill)] to-cyan-400/10">
          <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-violet-400/50" />
          <span className="absolute bottom-5 right-5 h-3 w-3 rounded-full bg-cyan-400/40" />
          <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] text-[var(--bd-accent)] shadow-xl">
            <FolderIcon size={34} />
            <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-lg">
              <PlusIcon size={16} />
            </span>
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-[var(--bd-text)] sm:text-4xl">
          Chưa có dự án nào
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--bd-dim)] sm:text-lg">
          Tạo dự án đầu tiên để bắt đầu xây dựng và quản lý Landing Page của bạn.
        </p>
        <button
          type="button"
          onClick={onCreateProject}
          className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3.5 font-semibold text-white shadow-[0_0_28px_-8px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_36px_-4px_rgba(139,92,246,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:translate-y-0"
        >
          <PlusIcon size={21} />
          Tạo dự án
        </button>
      </div>
    </section>
  )
}

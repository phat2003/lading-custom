import { PlusIcon } from '../../../../components/icons'

export default function EmptyProjectState({ onCreateProject }) {
  return (
    <section className="relative mx-auto flex min-h-[620px] max-w-4xl items-center justify-center">
      <div className="w-full rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-6 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.2)] backdrop-blur sm:px-12 sm:py-20">
        <div className="mx-auto mb-8 grid h-44 w-52 place-items-center rounded-2xl border border-dashed border-[var(--bd-border)] bg-[var(--bd-fill)]">
          <div className="relative h-28 w-36 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)]">
            <span className="absolute -left-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-violet-300/35 bg-var(--bd-border) text-[var(--bd-accent)]">
              <PlusIcon size={18} />
            </span>
            <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--bd-border)]" />
            <span className="absolute -right-3 -top-3 h-8 w-8 rounded-md border border-[var(--bd-border)] bg-var(--bd-fill)" />
            <span className="absolute -bottom-3 left-5 h-7 w-14 rounded-md border border-[var(--bd-border)] bg-var(--bd-fill)" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-[var(--bd-text)] sm:text-5xl">
          Chưa có dự án nào
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--bd-dim)] sm:text-lg">
          Tạo dự án đầu tiên của bạn để bắt đầu thiết kế, xây dựng và quản lý các
          Landing Page chuyên nghiệp.
        </p>
        <button
          type="button"
          onClick={onCreateProject}
          className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-8 py-4 text-lg font-bold text-white shadow-[0_0_28px_-8px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_36px_-4px_rgba(139,92,246,1)] active:translate-y-0"
        >
          <PlusIcon size={21} />
          Tạo Project mới
        </button>
      </div>
    </section>
  )
}

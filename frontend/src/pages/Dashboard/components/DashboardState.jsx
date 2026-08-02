import {
  FolderIcon,
  LayoutTemplateIcon,
} from '../../../components/icons'

const DashboardState = ({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}) => (
  <main className="editor-canvas-grid grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-[#e5e1e4]">
    <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#201f21]/95 p-8 text-center shadow-2xl backdrop-blur sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#b4c5ff]/20 bg-[#2563eb]/15 text-[#b4c5ff] shadow-[0_0_28px_rgba(37,99,235,0.18)]">
        <LayoutTemplateIcon size={30} />
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#00eefc]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#c3c6d7]">
        {description}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#eec200] px-5 py-3 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.2)] transition hover:bg-[#ffe083]"
        >
          <FolderIcon size={18} />
          {actionLabel}
        </button>
        {secondaryLabel && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="rounded-lg border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-[#b4c5ff]/40 hover:bg-white/5"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </section>
  </main>
)

export default DashboardState

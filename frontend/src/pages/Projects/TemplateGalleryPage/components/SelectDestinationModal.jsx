import { useEffect } from 'react'
import { XIcon } from '../../../../components/icons'

const SelectDestinationModal = ({
  open,
  source,
  step,
  projects,
  isLoading,
  error,
  onClose,
  onChooseNew,
  onChooseExisting,
  onSelectProject,
  onBack,
  onRetry,
}) => {
  useEffect(() => {
    if (!open || !source) return undefined

    document.body.style.overflow = 'hidden'
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open, source])

  if (!open || !source) return null

  const isExistingProjectStep = step === 'existing-project'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="destination-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
          aria-label="Đóng modal"
        >
          <XIcon size={22} />
        </button>

        <div className="border-b border-[var(--bd-border)] px-7 pb-5 pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
            {source.type === 'blank'
              ? 'Blank'
              : source.type === 'user'
                ? 'User Template'
                : 'System Template'}
          </p>
          <h2
            id="destination-modal-title"
            className="mt-2 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
          >
            {isExistingProjectStep
              ? 'Chọn Project có sẵn'
              : 'Bạn muốn tạo Landing Page ở đâu?'}
          </h2>
          <p className="mt-2 text-sm text-[var(--bd-dim)]">
            Nguồn khởi tạo: <span className="text-[var(--bd-text)]">{source.name}</span>
          </p>
        </div>

        {isExistingProjectStep ? (
          <div className="px-7 py-6">
            {isLoading ? (
              <div
                className="space-y-3"
                aria-label="Đang tải danh sách Project"
                aria-busy="true"
              >
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)]"
                  />
                ))}
              </div>
            ) : error ? (
              <div
                className="rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-center"
                role="alert"
              >
                <p className="text-sm text-[var(--bd-danger)]">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
                >
                  Thử lại
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--bd-border)] bg-var(--bd-fill) p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--bd-text)]">
                  Bạn chưa có Project
                </h3>
                <p className="mt-2 text-sm text-[var(--bd-dim)]">
                  Quay lại và chọn Project mới để tiếp tục tạo Landing Page.
                </p>
              </div>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-5 py-4 text-left transition hover:border-violet-300/50 hover:bg-[var(--bd-fill)]"
                  >
                    <span>
                      <span className="block font-semibold text-[var(--bd-text)]">
                        {project.name}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--bd-muted)]">
                        Project có sẵn
                      </span>
                    </span>
                    <span className="text-[var(--bd-accent)]" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 px-7 py-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={onChooseNew}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-5 text-left transition hover:border-cyan-400 hover:bg-cyan-400/15"
            >
              <span className="block text-lg font-semibold text-[var(--bd-text)]">
                Project mới
              </span>
              <span className="mt-2 block text-sm text-[var(--bd-dim)]">
                Tạo Project mới rồi tiếp tục với nguồn đã chọn.
              </span>
            </button>
            <button
              type="button"
              onClick={onChooseExisting}
              className="rounded-xl border border-violet-300/35 bg-violet-500/15 p-5 text-left transition hover:border-violet-300 hover:bg-violet-500/25"
            >
              <span className="block text-lg font-semibold text-[var(--bd-text)]">
                Project có sẵn
              </span>
              <span className="mt-2 block text-sm text-[var(--bd-dim)]">
                Chọn một Project server-backed của bạn.
              </span>
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-[var(--bd-border)] bg-black/50 px-7 py-5">
          {isExistingProjectStep && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg px-5 py-2.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--bd-border)] px-5 py-2.5 text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)]"
          >
            Hủy bỏ
          </button>
        </div>
      </section>
    </div>
  )
}

export default SelectDestinationModal

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
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#1c1b1d] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="destination-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
          aria-label="Đóng modal"
        >
          <XIcon size={22} />
        </button>

        <div className="border-b border-white/10 px-7 pb-5 pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
            {source.type === 'blank'
              ? 'Blank'
              : source.type === 'user'
                ? 'User Template'
                : 'System Template'}
          </p>
          <h2
            id="destination-modal-title"
            className="mt-2 pr-10 text-2xl font-semibold text-white"
          >
            {isExistingProjectStep
              ? 'Chọn Project có sẵn'
              : 'Bạn muốn tạo Landing Page ở đâu?'}
          </h2>
          <p className="mt-2 text-sm text-[#c3c6d7]">
            Nguồn khởi tạo: <span className="text-white">{source.name}</span>
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
                    className="h-16 animate-pulse rounded-xl border border-white/10 bg-[#2a2a2c]"
                  />
                ))}
              </div>
            ) : error ? (
              <div
                className="rounded-xl border border-[#ffb4ab]/30 bg-[#2a2021] p-5 text-center"
                role="alert"
              >
                <p className="text-sm text-[#ffb4ab]">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 rounded-lg bg-[#b4c5ff] px-4 py-2 text-sm font-semibold text-[#002a78]"
                >
                  Thử lại
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#151517] p-6 text-center">
                <h3 className="text-lg font-semibold text-white">
                  Bạn chưa có Project
                </h3>
                <p className="mt-2 text-sm text-[#c3c6d7]">
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
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#2a2a2c] px-5 py-4 text-left transition hover:border-[#b4c5ff]/50 hover:bg-[#353437]"
                  >
                    <span>
                      <span className="block font-semibold text-white">
                        {project.name}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#8d90a0]">
                        Project có sẵn
                      </span>
                    </span>
                    <span className="text-[#b4c5ff]" aria-hidden="true">
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
              className="rounded-xl border border-[#00eefc]/30 bg-[#00eefc]/10 p-5 text-left transition hover:border-[#00eefc] hover:bg-[#00eefc]/15"
            >
              <span className="block text-lg font-semibold text-white">
                Project mới
              </span>
              <span className="mt-2 block text-sm text-[#c3c6d7]">
                Tạo Project mới rồi tiếp tục với nguồn đã chọn.
              </span>
            </button>
            <button
              type="button"
              onClick={onChooseExisting}
              className="rounded-xl border border-[#b4c5ff]/35 bg-[#2563eb]/15 p-5 text-left transition hover:border-[#b4c5ff] hover:bg-[#2563eb]/25"
            >
              <span className="block text-lg font-semibold text-white">
                Project có sẵn
              </span>
              <span className="mt-2 block text-sm text-[#c3c6d7]">
                Chọn một Project server-backed của bạn.
              </span>
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 bg-[#0e0e10]/40 px-7 py-5">
          {isExistingProjectStep && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg px-5 py-2.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-white transition hover:bg-white/5"
          >
            Hủy bỏ
          </button>
        </div>
      </section>
    </div>
  )
}

export default SelectDestinationModal

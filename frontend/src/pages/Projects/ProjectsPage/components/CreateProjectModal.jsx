import { useEffect, useRef, useState } from 'react'
import { PlusIcon, UserIcon, XIcon } from '../../../../components/icons'

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 150

const CreateProjectModal = ({
  open,
  source,
  onClose,
  onBack,
  onCreate,
  onUpgrade,
  submitting,
  serverError,
  onErrorClear,
}) => {
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    setProjectName('')
    setError('')
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => inputRef.current?.focus(), 0)

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const displayError = error || serverError

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const normalizedName = projectName.trim()

    if (normalizedName.length < MIN_NAME_LENGTH) {
      setError('Tên Project phải có ít nhất 3 ký tự.')
      return
    }

    if (normalizedName.length > MAX_NAME_LENGTH) {
      setError('Tên Project không được dài quá 150 ký tự.')
      return
    }

    onCreate(normalizedName)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-fill)] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng modal"
        >
          <XIcon size={23} />
        </button>

        <div className="border-b border-[var(--bd-border)] px-6 pb-5 pt-8 sm:px-8">
          <h2 id="create-project-title" className="text-3xl font-semibold text-[var(--bd-text)]">
            Khởi tạo dự án
          </h2>
          <p className="mt-2 text-[var(--bd-dim)]">
            Thiết lập thông tin cơ bản cho dự án mới của bạn.
          </p>
          {source && (
            <p className="mt-2 text-sm text-[var(--bd-dim)]">
              Nguồn Landing Page:{' '}
              <span className="text-[var(--bd-text)]">{source.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-7 px-6 py-6 sm:px-8">
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--bd-text)]">
              Tên Project <span className="text-[var(--bd-danger)]">*</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              maxLength={MAX_NAME_LENGTH + 1}
              disabled={submitting}
              onChange={(event) => {
                setProjectName(event.target.value)
                if (error) setError('')
                if (serverError) onErrorClear()
              }}
              placeholder="Ví dụ: Chiến dịch Q4, Landing Page sản phẩm mới..."
              className={`mt-3 w-full rounded-lg border bg-[var(--bd-fill)] px-4 py-3 text-[var(--bd-text)] outline-none transition placeholder:text-[var(--bd-muted)] focus:ring-2 disabled:cursor-wait disabled:opacity-70 ${
                displayError
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-[var(--bd-border)] focus:border-violet-300 focus:ring-violet-500/20'
              }`}
              aria-invalid={Boolean(displayError)}
              aria-describedby={displayError ? 'project-name-error' : 'project-name-help'}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              {displayError ? (
                <p id="project-name-error" className="text-sm text-[var(--bd-danger)]" role="alert">
                  {displayError}
                </p>
              ) : (
                <p id="project-name-help" className="text-xs text-[var(--bd-muted)]">
                  Từ 3 đến 150 ký tự.
                </p>
              )}
              <span className="ml-auto font-mono text-[10px] text-[var(--bd-muted)]">
                {projectName.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </label>

          <div>
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em] text-[var(--bd-text)]">
              <span>Thêm thành viên</span>
              <span className="text-[var(--bd-warn)]" aria-label="Yêu cầu gói Pro">
                Khóa
              </span>
            </div>
            <div className="relative mt-3 overflow-hidden rounded-xl border border-amber-400/35 bg-amber-400/10 p-5 text-center">
              <div className="relative z-10 flex flex-col items-center">
                <UserIcon size={30} className="text-[var(--bd-warn)]" />
                <p className="mt-3 text-[var(--bd-text)]">Tính năng Team yêu cầu gói Pro</p>
                <button
                  type="button"
                  onClick={onUpgrade}
                  disabled={submitting}
                  className="mt-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-[0_8px_24px_-12px_rgba(250,204,21,.9)] transition-all duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55"
                >
                  Nâng cấp ngay →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--bd-border)] bg-black/50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="rounded-lg px-6 py-3 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-6 py-3 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            <PlusIcon size={18} />
            {submitting ? 'Đang tạo...' : 'Tạo dự án'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProjectModal

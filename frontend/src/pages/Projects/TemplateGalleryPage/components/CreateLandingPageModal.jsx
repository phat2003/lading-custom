import { useEffect, useRef, useState } from 'react'
import { PlusIcon, XIcon } from '../../../../components/icons'

const MAX_NAME_LENGTH = 150

const CreateLandingPageModal = ({
  open,
  template,
  project,
  onClose,
  onBack,
  onCreate,
  submitting,
  serverError,
  onErrorClear,
}) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open || !template) return undefined

    setName(
      template.type === 'blank'
        ? 'Landing Page mới'
        : `${template.name} Landing Page`,
    )
    setError('')
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => inputRef.current?.select(), 0)

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, template])

  if (!open || !template) return null

  const displayError = error || serverError

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const normalizedName = name.trim()

    if (normalizedName.length < 3) {
      setError('Tên Landing Page phải có ít nhất 3 ký tự.')
      return
    }

    if (normalizedName.length > MAX_NAME_LENGTH) {
      setError('Tên Landing Page không được dài quá 150 ký tự.')
      return
    }

    onCreate(normalizedName)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-landing-page-title"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng modal"
        >
          <XIcon size={22} />
        </button>

        <div className="border-b border-[var(--bd-border)] px-7 pb-5 pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
            {template.type === 'blank'
              ? 'Blank'
              : template.type === 'user'
                ? 'User Template'
                : 'System Template'}
          </p>
          <h2 id="create-landing-page-title" className="mt-2 text-2xl font-semibold text-[var(--bd-text)]">
            Tạo Landing Page
          </h2>
          <p className="mt-2 text-sm text-[var(--bd-dim)]">
            Nguồn khởi tạo: <span className="text-[var(--bd-text)]">{template.name}</span>
          </p>
          {project && (
            <p className="mt-1 text-sm text-[var(--bd-dim)]">
              Project đích: <span className="text-[var(--bd-text)]">{project.name}</span>
            </p>
          )}
        </div>

        <div className="px-7 py-6">
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--bd-text)]">
              Tên Landing Page <span className="text-[var(--bd-danger)]">*</span>
            </span>
            <input
              ref={inputRef}
              value={name}
              maxLength={MAX_NAME_LENGTH + 1}
              disabled={submitting}
              onChange={(event) => {
                setName(event.target.value)
                if (error) setError('')
                if (serverError) onErrorClear()
              }}
              className={`mt-3 w-full rounded-lg border bg-[var(--bd-fill)] px-4 py-3 text-[var(--bd-text)] outline-none transition focus:ring-2 disabled:cursor-wait disabled:opacity-70 ${
                displayError
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-[var(--bd-border)] focus:border-violet-300 focus:ring-violet-500/20'
              }`}
              aria-invalid={Boolean(displayError)}
              aria-describedby={displayError ? 'landing-page-name-error' : undefined}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p
                id={displayError ? 'landing-page-name-error' : undefined}
                className={`text-xs ${displayError ? 'text-[var(--bd-danger)]' : 'text-[var(--bd-muted)]'}`}
                role={displayError ? 'alert' : undefined}
              >
                {displayError || 'Từ 3 đến 150 ký tự.'}
              </p>
              <span className="font-mono text-[10px] text-[var(--bd-muted)]">
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--bd-border)] bg-black/50 px-7 py-5 sm:flex-row sm:justify-end">
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
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
          >
            <PlusIcon size={18} />
            {submitting ? 'Đang tạo...' : 'Tạo và mở Editor'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateLandingPageModal

import { useEffect, useRef, useState } from 'react'
import { XIcon } from '../../../../components/icons'

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 150

const RenameLandingPageModal = ({
  landingPage,
  submitting,
  serverError,
  onClose,
  onSubmit,
  onErrorClear,
}) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!landingPage) return

    setName(landingPage.name)
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [landingPage])

  if (!landingPage) return null

  const displayError = error || serverError

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const normalizedName = name.trim()
    if (normalizedName.length < MIN_NAME_LENGTH) {
      setError('Tên Landing Page phải có ít nhất 3 ký tự.')
      return
    }
    if (normalizedName.length > MAX_NAME_LENGTH) {
      setError('Tên Landing Page không được vượt quá 150 ký tự.')
      return
    }

    setError('')
    onSubmit(normalizedName)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-6 text-[var(--bd-text)] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-landing-page-title"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng modal đổi tên"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
          Rename Landing Page
        </p>
        <h2
          id="rename-landing-page-title"
          className="mt-3 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
        >
          Đổi tên Landing Page
        </h2>

        <label className="mt-7 block text-sm font-medium text-[var(--bd-text)]">
          Tên Landing Page
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
            aria-describedby={displayError ? 'rename-page-error' : undefined}
          />
        </label>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            id={displayError ? 'rename-page-error' : undefined}
            className={`text-xs ${displayError ? 'text-[var(--bd-danger)]' : 'text-[var(--bd-muted)]'}`}
            role={displayError ? 'alert' : undefined}
          >
            {displayError || 'Từ 3 đến 150 ký tự.'}
          </p>
          <span className="font-mono text-[10px] text-[var(--bd-muted)]">
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-5 py-2.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Đang lưu...' : 'Lưu tên mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RenameLandingPageModal

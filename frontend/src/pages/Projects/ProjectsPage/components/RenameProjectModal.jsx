import { useEffect, useRef, useState } from 'react'
import { XIcon } from '../../../../components/icons'

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 150

const RenameProjectModal = ({
  project,
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
    if (!project) return

    setName(project.name)
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [project])

  if (!project) return null

  const displayError = error || serverError

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const normalizedName = name.trim()
    if (normalizedName.length < MIN_NAME_LENGTH) {
      setError('Tên Project phải có ít nhất 3 ký tự.')
      return
    }
    if (normalizedName.length > MAX_NAME_LENGTH) {
      setError('Tên Project không được vượt quá 150 ký tự.')
      return
    }

    setError('')
    onSubmit(normalizedName)
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-project-title"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng modal đổi tên Project"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
          Rename Project
        </p>
        <h2
          id="rename-project-title"
          className="mt-3 pr-10 text-2xl font-semibold text-white"
        >
          Đổi tên Project
        </h2>

        <label className="mt-7 block text-sm font-medium text-[#e5e1e4]">
          Tên Project
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
            className={`mt-3 w-full rounded-lg border bg-[#353437] px-4 py-3 text-white outline-none transition focus:ring-2 disabled:cursor-wait disabled:opacity-70 ${
              displayError
                ? 'border-[#ffb4ab] focus:ring-red-400/20'
                : 'border-white/10 focus:border-[#b4c5ff] focus:ring-[#2563eb]/20'
            }`}
            aria-invalid={Boolean(displayError)}
            aria-describedby={displayError ? 'rename-project-error' : undefined}
          />
        </label>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            id={displayError ? 'rename-project-error' : undefined}
            className={`text-xs ${displayError ? 'text-[#ffb4ab]' : 'text-[#8d90a0]'}`}
            role={displayError ? 'alert' : undefined}
          >
            {displayError || 'Từ 3 đến 150 ký tự.'}
          </p>
          <span className="font-mono text-[10px] text-[#8d90a0]">
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-5 py-2.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Đang lưu...' : 'Lưu tên mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RenameProjectModal

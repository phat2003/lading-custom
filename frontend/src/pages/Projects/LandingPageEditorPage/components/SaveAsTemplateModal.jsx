import { useEffect, useRef, useState } from 'react'
import { XIcon } from '../../../../components/icons'
import {
  getTemplateNameValidationError,
  TEMPLATE_NAME_MAX_LENGTH,
} from '../../templateNameValidation'

const SaveAsTemplateModal = ({
  open,
  initialName,
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
    if (!open) return

    setName(initialName || '')
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [initialName, open])

  if (!open) return null

  const displayError = error || serverError

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const normalizedName = name.trim()
    const validationError = getTemplateNameValidationError(normalizedName)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onSubmit(normalizedName)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-as-template-title"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng modal lưu thành mẫu"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
          Save as Template
        </p>
        <h2
          id="save-as-template-title"
          className="mt-3 pr-10 text-2xl font-semibold text-white"
        >
          Lưu Landing Page thành mẫu
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#c3c6d7]">
          Mẫu cá nhân mới sẽ xuất hiện trong khu vực Mẫu của tôi.
        </p>

        <label className="mt-7 block text-sm font-medium text-[#e5e1e4]">
          Tên Template
          <input
            ref={inputRef}
            value={name}
            maxLength={TEMPLATE_NAME_MAX_LENGTH + 1}
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
            aria-describedby={displayError ? 'save-as-template-error' : undefined}
          />
        </label>

        <p
          id={displayError ? 'save-as-template-error' : undefined}
          className={`mt-2 text-xs ${displayError ? 'text-[#ffb4ab]' : 'text-[#8d90a0]'}`}
          role={displayError ? 'alert' : undefined}
        >
          {displayError || 'Từ 2 đến 200 ký tự.'}
        </p>

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
            {submitting ? 'Đang lưu thành mẫu...' : 'Lưu thành mẫu'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SaveAsTemplateModal

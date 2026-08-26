import { useEffect, useRef, useState } from 'react'
import { PencilIcon, XIcon } from '../../../../components/icons'
import {
  getTemplateNameValidationError,
  TEMPLATE_NAME_MAX_LENGTH,
} from '../../templateNameValidation'

const RenameTemplateModal = ({ template, onClose }) => {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!template) return

    setName(template.name)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [template])

  if (!template) return null

  const validationError = getTemplateNameValidationError(name)

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="relative w-full max-w-lg rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-6 text-[var(--bd-text)] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-template-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Đóng modal đổi tên Template"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
          Rename Template
        </p>
        <h2
          id="rename-template-title"
          className="mt-3 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
        >
          Đổi tên Template
        </h2>

        <label className="mt-7 block text-sm font-medium text-[var(--bd-text)]">
          Tên Template
          <input
            ref={inputRef}
            value={name}
            maxLength={TEMPLATE_NAME_MAX_LENGTH + 1}
            onChange={(event) => setName(event.target.value)}
            className={`mt-3 w-full rounded-lg border bg-[var(--bd-fill)] px-4 py-3 text-[var(--bd-text)] outline-none transition focus:ring-2 ${
              validationError
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-[var(--bd-border)] focus:border-violet-300 focus:ring-violet-500/20'
            }`}
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError
                ? 'rename-template-error'
                : 'rename-template-hint'
            }
          />
        </label>

        <p
          id={validationError ? 'rename-template-error' : 'rename-template-hint'}
          className={`mt-2 text-xs ${validationError ? 'text-[var(--bd-danger)]' : 'text-[var(--bd-muted)]'}`}
          role={validationError ? 'alert' : undefined}
        >
          {validationError || 'Từ 2 đến 200 ký tự.'}
        </p>

        <div
          id="rename-template-unavailable"
          className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-300"
          role="status"
        >
          Đổi tên User Template đang chờ Backend cung cấp API dành cho chủ sở
          hữu. Tên hiện tại chưa được thay đổi.
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled
            aria-describedby="rename-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
          >
            <PencilIcon size={17} />
            Lưu tên mới
          </button>
        </div>
      </form>
    </div>
  )
}

export default RenameTemplateModal

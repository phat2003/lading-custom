import { useEffect, useRef, useState } from 'react'
import { CopyIcon, XIcon } from '../../../../components/icons'
import {
  getTemplateNameValidationError,
  TEMPLATE_NAME_MAX_LENGTH,
} from '../../templateNameValidation'

// Quy tắc này dùng lại UX đặt tên Template hiện tại, không phải contract Clone API.
const COPY_SUFFIX = ' - Bản sao'

const createInitialName = (sourceName) => {
  const name = typeof sourceName === 'string' ? sourceName.trim() : ''
  return `${name.slice(0, TEMPLATE_NAME_MAX_LENGTH - COPY_SUFFIX.length)}${COPY_SUFFIX}`
}

const CloneTemplateModal = ({ template, onClose }) => {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!template) return

    setName(createInitialName(template.name))
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
        aria-labelledby="clone-template-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Đóng modal nhân bản mẫu"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
          Clone Template
        </p>
        <h2
          id="clone-template-title"
          className="mt-3 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
        >
          Nhân bản mẫu
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--bd-dim)]">
          Mẫu nguồn: <span className="font-semibold text-[var(--bd-text)]">{template.name}</span>
        </p>

        <label className="mt-7 block text-sm font-medium text-[var(--bd-text)]">
          Tên Template bản sao
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
                ? 'clone-template-name-error'
                : 'clone-template-name-hint'
            }
          />
        </label>

        <p
          id={
            validationError
              ? 'clone-template-name-error'
              : 'clone-template-name-hint'
          }
          className={`mt-2 text-xs ${validationError ? 'text-[var(--bd-danger)]' : 'text-[var(--bd-muted)]'}`}
          role={validationError ? 'alert' : undefined}
        >
          {validationError || 'Từ 2 đến 200 ký tự.'}
        </p>

        <div
          id="clone-template-unavailable"
          className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-300"
          role="status"
        >
          Chức năng nhân bản đang chờ Backend hỗ trợ. Chưa có Template mới nào
          được tạo ở bước này.
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
            aria-describedby="clone-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
          >
            <CopyIcon size={17} />
            Nhân bản
          </button>
        </div>
      </form>
    </div>
  )
}

export default CloneTemplateModal

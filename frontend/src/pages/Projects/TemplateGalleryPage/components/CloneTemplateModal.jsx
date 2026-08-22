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
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clone-template-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          aria-label="Đóng modal nhân bản mẫu"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
          Clone Template
        </p>
        <h2
          id="clone-template-title"
          className="mt-3 pr-10 text-2xl font-semibold text-white"
        >
          Nhân bản mẫu
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#c3c6d7]">
          Mẫu nguồn: <span className="font-semibold text-white">{template.name}</span>
        </p>

        <label className="mt-7 block text-sm font-medium text-[#e5e1e4]">
          Tên Template bản sao
          <input
            ref={inputRef}
            value={name}
            maxLength={TEMPLATE_NAME_MAX_LENGTH + 1}
            onChange={(event) => setName(event.target.value)}
            className={`mt-3 w-full rounded-lg border bg-[#353437] px-4 py-3 text-white outline-none transition focus:ring-2 ${
              validationError
                ? 'border-[#ffb4ab] focus:ring-red-400/20'
                : 'border-white/10 focus:border-[#b4c5ff] focus:ring-[#2563eb]/20'
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
          className={`mt-2 text-xs ${validationError ? 'text-[#ffb4ab]' : 'text-[#8d90a0]'}`}
          role={validationError ? 'alert' : undefined}
        >
          {validationError || 'Từ 2 đến 200 ký tự.'}
        </p>

        <div
          id="clone-template-unavailable"
          className="mt-6 rounded-xl border border-[#eec200]/25 bg-[#eec200]/5 px-4 py-3 text-sm leading-6 text-[#ffe083]"
          role="status"
        >
          Chức năng nhân bản đang chờ Backend hỗ trợ. Chưa có Template mới nào
          được tạo ở bước này.
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled
            aria-describedby="clone-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
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

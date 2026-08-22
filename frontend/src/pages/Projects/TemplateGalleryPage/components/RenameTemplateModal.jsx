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
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-template-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          aria-label="Đóng modal đổi tên Template"
        >
          <XIcon size={21} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
          Rename Template
        </p>
        <h2
          id="rename-template-title"
          className="mt-3 pr-10 text-2xl font-semibold text-white"
        >
          Đổi tên Template
        </h2>

        <label className="mt-7 block text-sm font-medium text-[#e5e1e4]">
          Tên Template
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
                ? 'rename-template-error'
                : 'rename-template-hint'
            }
          />
        </label>

        <p
          id={validationError ? 'rename-template-error' : 'rename-template-hint'}
          className={`mt-2 text-xs ${validationError ? 'text-[#ffb4ab]' : 'text-[#8d90a0]'}`}
          role={validationError ? 'alert' : undefined}
        >
          {validationError || 'Từ 2 đến 200 ký tự.'}
        </p>

        <div
          id="rename-template-unavailable"
          className="mt-6 rounded-xl border border-[#eec200]/25 bg-[#eec200]/5 px-4 py-3 text-sm leading-6 text-[#ffe083]"
          role="status"
        >
          Đổi tên User Template đang chờ Backend cung cấp API dành cho chủ sở
          hữu. Tên hiện tại chưa được thay đổi.
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
            aria-describedby="rename-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
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

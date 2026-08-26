import { TrashIcon, XIcon } from '../../../../components/icons'

const DeleteTemplateModal = ({ template, onClose }) => {
  if (!template) return null

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        className="relative w-full max-w-lg rounded-2xl border border-red-400/25 bg-[var(--bd-panel-solid)] p-6 text-[var(--bd-text)] shadow-2xl sm:p-8"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-template-title"
        aria-describedby="delete-template-description delete-template-unavailable"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Đóng xác nhận xóa Template"
        >
          <XIcon size={21} />
        </button>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-400">
          <TrashIcon size={23} />
        </div>
        <h2
          id="delete-template-title"
          className="mt-5 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
        >
          Xóa Template?
        </h2>
        <p
          id="delete-template-description"
          className="mt-3 text-sm leading-6 text-[var(--bd-dim)]"
        >
          Template “{template.name}” và nội dung section của mẫu sẽ bị xóa vĩnh
          viễn. Các Landing Page đã tạo từ mẫu vẫn là entity độc lập.
        </p>

        <div
          id="delete-template-unavailable"
          className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-300"
          role="status"
        >
          Xóa User Template đang chờ Backend cung cấp API dành cho chủ sở hữu.
          Chưa có dữ liệu nào bị xóa ở bước này.
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
            aria-describedby="delete-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
          >
            <TrashIcon size={17} />
            Xóa Template
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeleteTemplateModal

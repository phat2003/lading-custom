import { TrashIcon, XIcon } from '../../../../components/icons'

const DeleteTemplateModal = ({ template, onClose }) => {
  if (!template) return null

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        className="relative w-full max-w-lg rounded-2xl border border-[#ffb4ab]/25 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-template-title"
        aria-describedby="delete-template-description delete-template-unavailable"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00eefc]/50"
          aria-label="Đóng xác nhận xóa Template"
        >
          <XIcon size={21} />
        </button>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#3b2526] text-[#ffb4ab]">
          <TrashIcon size={23} />
        </div>
        <h2
          id="delete-template-title"
          className="mt-5 pr-10 text-2xl font-semibold text-white"
        >
          Xóa Template?
        </h2>
        <p
          id="delete-template-description"
          className="mt-3 text-sm leading-6 text-[#c3c6d7]"
        >
          Template “{template.name}” và nội dung section của mẫu sẽ bị xóa vĩnh
          viễn. Các Landing Page đã tạo từ mẫu vẫn là entity độc lập.
        </p>

        <div
          id="delete-template-unavailable"
          className="mt-6 rounded-xl border border-[#eec200]/25 bg-[#eec200]/5 px-4 py-3 text-sm leading-6 text-[#ffe083]"
          role="status"
        >
          Xóa User Template đang chờ Backend cung cấp API dành cho chủ sở hữu.
          Chưa có dữ liệu nào bị xóa ở bước này.
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
            aria-describedby="delete-template-unavailable"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#ba1a1a] px-5 py-2.5 font-semibold text-white opacity-45 disabled:cursor-not-allowed"
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

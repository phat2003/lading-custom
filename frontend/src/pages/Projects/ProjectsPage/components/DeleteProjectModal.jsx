import { TrashIcon, XIcon } from '../../../../components/icons'

const DeleteProjectModal = ({
  project,
  submitting,
  error,
  onClose,
  onConfirm,
}) => {
  if (!project) return null

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
      <section
        className="relative w-full max-w-lg rounded-2xl border border-[#ffb4ab]/25 bg-[#1c1b1d] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
        aria-busy={submitting}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Đóng xác nhận xóa Project"
        >
          <XIcon size={21} />
        </button>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#3b2526] text-[#ffb4ab]">
          <TrashIcon size={23} />
        </div>
        <h2
          id="delete-project-title"
          className="mt-5 pr-10 text-2xl font-semibold text-white"
        >
          Xóa Project?
        </h2>
        <p
          id="delete-project-description"
          className="mt-3 text-sm leading-6 text-[#c3c6d7]"
        >
          Project “{project.name}” và toàn bộ Landing Page bên trong sẽ bị xóa
          vĩnh viễn. Thao tác này không thể hoàn tác.
        </p>

        {error && (
          <p
            className="mt-5 rounded-lg border border-[#ffb4ab]/25 bg-[#3b2526] px-4 py-3 text-sm text-[#ffb4ab]"
            role="alert"
          >
            {error}
          </p>
        )}

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
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-[#ba1a1a] px-5 py-2.5 font-semibold text-white transition hover:bg-[#dc2626] disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Đang xóa...' : 'Xóa Project'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeleteProjectModal

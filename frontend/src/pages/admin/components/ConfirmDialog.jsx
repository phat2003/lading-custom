import AdminModal from './AdminModal'

// Hộp thoại xác nhận dùng chung (xóa template, xóa user...).
export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <AdminModal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${
            danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </AdminModal>
  )
}

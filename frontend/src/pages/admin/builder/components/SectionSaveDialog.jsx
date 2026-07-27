import { useEffect, useState } from 'react'
import { SECTION_TYPES } from '../../Sections/sectionTypes'

// Hộp thoại lưu Section mẫu: nhập tên + chọn loại rồi lưu vào thư viện.
// Dùng trong builder (nền tối) khi chạy ở chế độ Section.
const SectionSaveDialog = ({ open, initial, onCancel, onConfirm }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('hero')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setType(initial?.type || 'hero')
    }
  }, [open, initial])

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm({ name: name.trim(), type })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onPointerDown={onCancel}
    >
      <form
        onSubmit={submit}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1c1c1f] p-5 text-gray-200 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-white">
          {initial ? 'Cập nhật Section mẫu' : 'Lưu Section mẫu'}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Section này sẽ xuất hiện trong thư viện để tái sử dụng cho nhiều template.
        </p>

        <label className="mt-4 block text-xs font-medium text-gray-400">Tên section</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="VD: Hero Chia Đôi Hiện Đại"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-yellow-400/50 focus:outline-none"
        />

        <label className="mt-3 block text-xs font-medium text-gray-400">Loại section</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 focus:border-yellow-400/50 focus:outline-none"
        >
          {SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="bg-[#1c1c1f]">
              {t.tab}
            </option>
          ))}
        </select>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            {initial ? 'Cập nhật' : 'Lưu Section'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SectionSaveDialog

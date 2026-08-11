import { useEffect, useRef, useState } from 'react'
import { SECTION_TYPES } from '../../Sections/sectionTypes'
import { ImageIcon } from '../../../../components/icons'
import { mediaApi } from '../../../../api/media'

const inputCls =
  'mt-1.5 w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2.5 text-sm text-[var(--bd-text)] transition-all duration-200 placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'

// Hộp thoại lưu Section mẫu: nhập tên + chọn loại rồi lưu vào thư viện.
// Dùng trong builder (nền tối) khi chạy ở chế độ Section.
const SectionSaveDialog = ({ open, initial, saving = false, error = '', onCancel, onConfirm }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState('hero')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setType(initial?.type || 'hero')
      setThumbnailUrl(initial?.thumbnailUrl || '')
      setUploadError('')
    }
  }, [open, initial])

  // Chọn ảnh -> upload ngay -> giữ file_url backend trả về.
  const handlePickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset để chọn lại đúng file đó vẫn kích hoạt onChange
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const res = await mediaApi.uploadImage(file)
      setThumbnailUrl(res.data.data.file_url)
    } catch (err) {
      setUploadError(err?.response?.data?.error || 'Tải ảnh thất bại.')
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || uploading) return
    onConfirm({ name: name.trim(), type, thumbnailUrl })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onPointerDown={onCancel}
    >
      <form
        onSubmit={submit}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-pop-in rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-6 text-[var(--bd-text)] shadow-[0_30px_80px_-20px_rgba(139,92,246,.4)]"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--bd-text)]">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          {initial ? 'Cập nhật Section mẫu' : 'Lưu Section mẫu'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--bd-muted)]">
          Section này sẽ xuất hiện trong thư viện để tái sử dụng cho nhiều template.
        </p>

        <div className="mt-5">
          <label className={labelCls}>Tên section</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="VD: Hero Chia Đôi Hiện Đại"
            className={inputCls}
          />
        </div>

        <div className="mt-4">
          <label className={labelCls}>Loại section</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[var(--bd-panel-solid)]">
                {t.tab}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Ảnh xem trước</label>
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-dashed border-[var(--bd-border)] p-3">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Ảnh xem trước section"
                className="h-12 w-16 shrink-0 rounded-md border border-[var(--bd-border)] object-cover"
              />
            ) : (
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-muted)]">
                <ImageIcon size={18} />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--bd-dim)]">
                {thumbnailUrl ? 'Đã có ảnh' : 'Chưa chọn (sẽ dùng hình minh hoạ)'}
              </p>
              <p className="text-[11px] text-[var(--bd-muted)]">PNG, JPG, WebP · tối đa 5MB</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePickImage}
              className="hidden"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || saving}
                className="rounded-lg border border-[var(--bd-border)] px-2.5 py-1.5 text-xs text-[var(--bd-dim)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:opacity-40"
              >
                {uploading ? 'Đang tải...' : thumbnailUrl ? 'Đổi' : 'Chọn ảnh'}
              </button>
              {thumbnailUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  title="Bỏ ảnh"
                  className="rounded-lg border border-[var(--bd-border)] px-2 py-1.5 text-xs text-[var(--bd-muted)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-red-400"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          {uploadError && <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-[var(--bd-border)] px-4 py-2 text-sm text-[var(--bd-dim)] transition-colors duration-200 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_22px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? 'Đang lưu…' : initial ? 'Cập nhật' : 'Lưu Section'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SectionSaveDialog

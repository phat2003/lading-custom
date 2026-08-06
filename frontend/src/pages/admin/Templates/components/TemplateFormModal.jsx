import { useState, useEffect, useRef } from 'react'
import AdminModal from '../../components/AdminModal'
import { ImageIcon } from '../../../../components/icons'
import { mediaApi } from '../../../../api/media'
import { errMsg } from '../../adapters'

const CATEGORIES = ['SaaS', 'Agency', 'Startup', 'Webinar', 'Portfolio']
const EMPTY = { name: '', category: 'SaaS', tier: 'Free', status: 'Draft', thumbnailUrl: '' }

const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] focus:border-violet-400/60 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-[var(--bd-dim)]'

// Modal tạo mới / chỉnh sửa template. initial = null nghĩa là tạo mới.
export default function TemplateFormModal({ open, initial, submitting, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)
  const isEdit = Boolean(initial)

  useEffect(() => {
    // Template chưa có danh mục thì rơi về lựa chọn đầu tiên,
    // nếu không select sẽ hiện "SaaS" nhưng lại gửi lên chuỗi rỗng.
    if (open) {
      setForm(
        initial ? { ...EMPTY, ...initial, category: initial.category || EMPTY.category } : EMPTY,
      )
      setUploadError('')
    }
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Chọn ảnh -> upload ngay -> lấy file_url backend trả về.
  const handlePickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset để chọn lại đúng file đó vẫn kích hoạt onChange
    if (!file) return

    setUploading(true)
    setUploadError('')
    try {
      const res = await mediaApi.uploadImage(file)
      setForm((f) => ({ ...f, thumbnailUrl: res.data.data.file_url }))
    } catch (err) {
      setUploadError(errMsg(err, 'Tải ảnh thất bại.'))
    } finally {
      setUploading(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || submitting || uploading) return
    onSubmit(form)
  }

  return (
    <AdminModal open={open} onClose={onClose} title={isEdit ? 'Sửa Template' : 'Tạo Template mới'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>Tên template</label>
          <input
            value={form.name}
            onChange={set('name')}
            className={inputCls}
            placeholder="VD: SaaS Landing Pro"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Danh mục</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            {/* Số sections do backend đếm từ template_section, không sửa tay được */}
            <label className={labelCls}>Số sections</label>
            <p className="rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-muted)]">
              {isEdit ? `${initial.sections ?? 0} sections` : 'Thêm sau khi tạo'}
            </p>
          </div>
          <div>
            <label className={labelCls}>Gói</label>
            <select value={form.tier} onChange={set('tier')} className={inputCls}>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Ảnh thumbnail</label>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--bd-border)] p-3">
            {form.thumbnailUrl ? (
              <img
                src={form.thumbnailUrl}
                alt="Thumbnail template"
                className="h-14 w-20 shrink-0 rounded-md border border-[var(--bd-border)] object-cover"
              />
            ) : (
              <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-muted)]">
                <ImageIcon size={20} />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--bd-dim)]">
                {form.thumbnailUrl ? 'Đã có ảnh' : 'Chưa chọn ảnh'}
              </p>
              <p className="text-xs text-[var(--bd-muted)]">PNG, JPG hoặc WebP · tối đa 5MB</p>
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
                disabled={uploading}
                className="rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-50"
              >
                {uploading ? 'Đang tải...' : form.thumbnailUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
              </button>
              {form.thumbnailUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, thumbnailUrl: '' }))}
                  className="rounded-lg border border-[var(--bd-border)] px-2 py-1.5 text-xs text-[var(--bd-muted)] hover:bg-[var(--bd-fill-hover)] hover:text-red-400"
                  title="Bỏ ảnh"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          {uploadError && <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--bd-border)] px-3 py-2 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_26px_-2px_rgba(139,92,246,1)] disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

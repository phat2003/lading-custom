import { useEffect, useMemo, useState } from 'react'
import { XIcon } from '../../../../components/icons'

const EMPTY_SETTINGS = {
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
  favicon: '',
}

const inputClass =
  'w-full rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2.5 text-sm text-[var(--bd-text)] outline-none transition placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20'
const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--bd-dim)]'

const validAssetURL = (value) => {
  const normalized = value.trim()
  if (!normalized || normalized.startsWith('/uploads/')) return true
  try {
    return ['http:', 'https:'].includes(new URL(normalized).protocol)
  } catch {
    return false
  }
}

const SeoSettingsDialog = ({ open, initialSettings, saving, serverError, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_SETTINGS)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY_SETTINGS, ...(initialSettings || {}) })
    setFieldError('')
  }, [initialSettings, open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, open, saving])

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify({ ...EMPTY_SETTINGS, ...(initialSettings || {}) }),
    [form, initialSettings],
  )

  if (!open) return null

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    if (fieldError) setFieldError('')
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validAssetURL(form.ogImage) || !validAssetURL(form.favicon)) {
      setFieldError('Ảnh chia sẻ và favicon phải là URL http(s) hoặc đường dẫn /uploads hợp lệ.')
      return
    }
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      keywords: form.keywords.trim(),
      og_image: form.ogImage.trim(),
      favicon: form.favicon.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="seo-settings-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[var(--bd-border)] px-6 py-5">
          <div>
            <h2 id="seo-settings-title" className="font-semibold text-[var(--bd-text)]">
              SEO & Social
            </h2>
            <p className="mt-1 text-xs text-[var(--bd-dim)]">
              Metadata được áp dụng vào public page ở lần xuất bản tiếp theo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Đóng thiết lập SEO"
            className="rounded-lg p-1.5 text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:opacity-40"
          >
            <XIcon size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <label htmlFor="seo-title" className={labelClass}>Tiêu đề trang</label>
            <input id="seo-title" value={form.title} onChange={update('title')} className={inputClass} placeholder="Tên hiển thị trên kết quả tìm kiếm" />
            <p className="mt-1 text-[11px] text-[var(--bd-muted)]">Khuyến nghị dưới 60 ký tự · {form.title.length}</p>
          </div>
          <div>
            <label htmlFor="seo-description" className={labelClass}>Mô tả</label>
            <textarea id="seo-description" value={form.description} onChange={update('description')} rows={3} className={`${inputClass} resize-y`} placeholder="Mô tả ngắn về Landing Page" />
            <p className="mt-1 text-[11px] text-[var(--bd-muted)]">Khuyến nghị dưới 160 ký tự · {form.description.length}</p>
          </div>
          <div>
            <label htmlFor="seo-keywords" className={labelClass}>Từ khóa</label>
            <input id="seo-keywords" value={form.keywords} onChange={update('keywords')} className={inputClass} placeholder="landing page, sản phẩm, chiến dịch" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="seo-og-image" className={labelClass}>Ảnh chia sẻ (OG image)</label>
              <input id="seo-og-image" value={form.ogImage} onChange={update('ogImage')} className={inputClass} placeholder="https://... hoặc /uploads/..." />
            </div>
            <div>
              <label htmlFor="seo-favicon" className={labelClass}>Favicon</label>
              <input id="seo-favicon" value={form.favicon} onChange={update('favicon')} className={inputClass} placeholder="https://... hoặc /uploads/..." />
            </div>
          </div>

          {(fieldError || serverError) && (
            <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {fieldError || serverError}
            </p>
          )}

          <footer className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-[var(--bd-border)] px-4 py-2 text-sm text-[var(--bd-dim)] hover:text-[var(--bd-text)] disabled:opacity-40">
              Hủy
            </button>
            <button type="submit" disabled={saving || !dirty} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-45">
              {saving ? 'Đang lưu...' : 'Lưu SEO'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default SeoSettingsDialog

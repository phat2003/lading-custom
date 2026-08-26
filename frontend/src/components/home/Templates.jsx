import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { mapTemplateFromApi, publicTemplatesApi } from '../../api/templates'

// Trang chủ là trang CÔNG KHAI nên gọi /p/templates (không cần JWT) thay vì
// /templates — endpoint kia nằm sau AuthRequired, khách vãng lai sẽ nhận 401 và
// bị interceptor trong api/client.js đá thẳng sang /login.
const HOME_TEMPLATE_LIMIT = 4

// Màu nền gradient xoay vòng theo vị trí thẻ — dữ liệu thật không có màu,
// nhưng vẫn giữ được nhịp màu của thiết kế cũ.
const ACCENTS = [
  'from-violet-500 to-cyan-400',
  'from-fuchsia-500 to-violet-500',
  'from-cyan-400 to-emerald-400',
  'from-amber-400 to-fuchsia-500',
]

const TIER_LABEL = { premium: 'Pro', free: 'Miễn phí' }

// Bảng Template không có cột mô tả, nên ghép câu giới thiệu từ dữ liệu thật
// (số section + phân hạng) thay vì bịa nội dung.
const describe = (template) => {
  const parts = []
  if (template.sectionCount) parts.push(`${template.sectionCount} section dựng sẵn`)
  if (TIER_LABEL[template.tier]) parts.push(TIER_LABEL[template.tier])
  return parts.length
    ? `Mẫu ${parts.join(' · ')}. Nhân bản và chỉnh sửa trực tiếp trong trình dựng trang.`
    : 'Nhân bản và chỉnh sửa trực tiếp trong trình dựng trang.'
}

const Templates = () => {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // Hủy setState nếu component đã unmount trước khi request xong.
    const controller = new AbortController()

    publicTemplatesApi
      .list({ page: 1, limit: HOME_TEMPLATE_LIMIT }, { signal: controller.signal })
      .then((response) => {
        const source = response?.data?.data
        const items = Array.isArray(source) ? source.map(mapTemplateFromApi).filter(Boolean) : []
        setTemplates(items)
        setLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setFailed(true)
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  // Thư viện mẫu trong khu làm việc bắt buộc đăng nhập.
  // "Xem tất cả" -> mở thư viện chung.
  // "Sử dụng template" -> mở thư viện KÈM ?template=<id> để trang kia tự chọn
  // sẵn mẫu đó và mở luôn bước chọn dự án đích.
  const galleryPath = (templateId) =>
    templateId ? `/templates?template=${encodeURIComponent(templateId)}` : '/templates'

  // Khách vãng lai: đẩy qua /login nhưng nhớ đích đến trong location.state,
  // Login sẽ quay lại đúng chỗ này sau khi đăng nhập xong.
  const linkTo = (templateId) => (user ? galleryPath(templateId) : '/login')
  const linkState = (templateId) => (user ? undefined : { from: galleryPath(templateId) })

  return (
    <section id="templates" className="lp-section">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div className="space-y-4 max-w-xl">
            <h2 className="lp-title">Templates đẹp mắt</h2>
            <p className="lp-sub">
              Bắt đầu nhanh chóng với thư viện thiết kế đa dạng được tối ưu hóa cho chuyển đổi.
            </p>
          </div>
          <Link
            to={linkTo(null)}
            state={linkState(null)}
            className="group inline-flex items-center gap-1 self-start text-sm font-semibold text-[var(--bd-accent)] transition-colors hover:text-cyan-400 sm:self-auto"
          >
            <span>Xem tất cả</span>
            <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: HOME_TEMPLATE_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-xl"
              >
                <div className="h-64 bg-[var(--bd-fill-hover)]" />
                <div className="space-y-3 p-6">
                  <div className="h-3 w-32 rounded bg-[var(--bd-fill-hover)]" />
                  <div className="h-5 w-48 rounded bg-[var(--bd-fill-hover)]" />
                  <div className="h-3 w-full rounded bg-[var(--bd-fill-hover)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] py-16 text-center">
            <p className="font-medium text-[var(--bd-text)]">
              {failed ? 'Chưa tải được thư viện mẫu' : 'Thư viện mẫu đang được cập nhật'}
            </p>
            <p className="mt-2 text-sm text-[var(--bd-muted)]">
              {failed
                ? 'Vui lòng thử lại sau ít phút.'
                : 'Các mẫu mới sẽ xuất hiện tại đây ngay khi được xuất bản.'}
            </p>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map((temp, index) => (
              <div
                key={temp.id}
                className="lp-card group overflow-hidden"
              >
                <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[var(--bd-fill)] p-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[index % ACCENTS.length]} opacity-20 group-hover:opacity-35 transition-opacity duration-500`} />
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(var(--bd-grid) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                  {temp.tier === 'premium' && (
                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-slate-950 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      Pro
                    </div>
                  )}

                  <div className="relative h-full w-full translate-y-6 transform overflow-hidden rounded-t-lg border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-2xl transition-transform duration-500 group-hover:translate-y-2">
                    {temp.thumbnailUrl ? (
                      <img
                        src={temp.thumbnailUrl}
                        alt={temp.name}
                        loading="lazy"
                        // Chiều cao tự nhiên (không h-full/object-cover) thì mới có phần
                        // dôi ra để cuộn. --thumb-h khớp chiều cao khung: h-64 trừ p-8 = 12rem.
                        style={{ '--thumb-h': '12rem', '--thumb-speed': '3.4s' }}
                        className="thumb-scroll absolute inset-x-0 top-0 w-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[var(--bd-muted)]">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bd-panel-solid)] via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 rounded-full border border-[var(--bd-border)] bg-[var(--bd-chip)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--bd-text)] backdrop-blur-sm">
                      Preview
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--bd-accent)]">
                    {temp.category || 'Mẫu hệ thống'}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--bd-text)] transition-colors group-hover:text-[var(--bd-accent)]">
                    {temp.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--bd-dim)]">
                    {describe(temp)}
                  </p>

                  {/* Mặc định là nút viền mờ để 4 thẻ không tranh nhau gây rối;
                      rê chuột mới chuyển thành gradient tím→cyan như nút chính. */}
                  <Link
                    to={linkTo(temp.id)}
                    state={linkState(temp.id)}
                    className="!mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-2.5 text-sm font-semibold text-[var(--bd-dim)] transition-all duration-200 hover:border-transparent hover:bg-gradient-to-r hover:from-violet-500 hover:to-cyan-400 hover:text-white hover:shadow-[0_0_24px_-8px_rgba(139,92,246,.9)]"
                  >
                    <span>Sử dụng template</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Templates

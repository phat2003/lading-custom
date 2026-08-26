import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CHECKLIST = ['Không thẻ tín dụng', 'Thiết lập dưới 10 phút']

// Danh sách phần tử trong mockup panel trái của builder.
const MOCK_COMPONENTS = [
  { label: 'Văn bản', glyph: 'T', tint: 'bg-violet-500/15 text-violet-400' },
  { label: 'Hình ảnh', glyph: '▣', tint: 'bg-cyan-500/15 text-cyan-400' },
  { label: 'Nút bấm', glyph: '▭', tint: 'bg-amber-500/15 text-amber-400' },
  { label: 'Biểu mẫu', glyph: '☰', tint: 'bg-emerald-500/15 text-emerald-400' },
]

const Hero = () => {
  // dashboardPath: user thường -> /projects, admin -> /admin.
  // Dùng nó thay vì gán cứng '/projects' để admin không bị đẩy vào khu My Project
  // của user (lỗi luồng đã gặp trước đây).
  const { user, dashboardPath } = useAuth()

  // Chưa đăng nhập thì mời đăng nhập; Login sẽ tự đưa về dashboardPath sau khi
  // thành công, nên bấm nút này là đi thẳng tới nơi cần đến.
  const startTo = user ? dashboardPath : '/login'

  return (
    <section className="relative overflow-hidden pb-16 pt-20 md:pb-24 md:pt-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Cột trái: nội dung + hành động */}
          <div className="animate-fade-in-up space-y-8 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-[var(--bd-accent)] backdrop-blur-sm">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              LẬP TRÌNH WEBSITE KHÔNG CẦN CODE
            </div>

            <h1 className="font-serif text-4xl font-normal leading-tight text-[var(--bd-text)] sm:text-5xl lg:text-6xl">
              Xây dựng trang đích hiệu suất cao trong{' '}
              <span className="lp-accent-text">vài phút</span> — không cần code
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-[var(--bd-dim)]">
              Kéo thả, tùy chỉnh và xuất bản trang web chuyên nghiệp của bạn chỉ trong vài phút.
              Chọn từ thư viện template đa dạng và bắt đầu xây dựng ngay hôm nay.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to={startTo}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0"
              >
                <span>{user ? 'Vào dự án của bạn' : 'Bắt đầu — Miễn phí'}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <a
                href="#video"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-6 py-3.5 text-sm font-semibold text-[var(--bd-dim)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] active:translate-y-0"
              >
                <svg className="h-4 w-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Video</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm text-[var(--bd-dim)]">
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cột phải: mockup cửa sổ builder — dùng token nên đổi theo sáng/tối */}
          <div className="relative lg:col-span-6">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 opacity-20 blur-xl" />

            <div className="relative overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[var(--bd-page-shadow)]">
              {/* Thanh tiêu đề cửa sổ */}
              <div className="flex items-center justify-between border-b border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="font-mono text-xs text-[var(--bd-muted)]">lp-builder.co/app/editor</div>
                <div className="w-12" />
              </div>

              <div className="grid h-[340px] grid-cols-12 text-xs">
                {/* Panel trái: danh sách phần tử */}
                <div className="col-span-3 space-y-4 border-r border-[var(--bd-border)] bg-[var(--bd-app)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--bd-muted)]">
                    Components
                  </div>
                  <div className="space-y-2">
                    {MOCK_COMPONENTS.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 rounded border border-[var(--bd-border)] bg-[var(--bd-fill)] p-2 text-[var(--bd-dim)]"
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold ${item.tint}`}>
                          {item.glyph}
                        </div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canvas giữa */}
                <div className="relative col-span-6 flex flex-col justify-between overflow-hidden bg-[var(--bd-fill)] p-4">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        'linear-gradient(var(--bd-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bd-grid) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Trang mẫu bên trong canvas */}
                  <div className="relative z-10 space-y-3 rounded border border-violet-400/40 bg-[var(--bd-panel-solid)] p-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[var(--bd-border)] pb-2">
                      <div className="text-[10px] font-bold text-[var(--bd-text)]">My SaaS Page</div>
                      <div className="flex h-3 w-8 scale-75 items-center justify-center rounded bg-gradient-to-r from-violet-500 to-cyan-400 text-[8px] text-white">
                        Sign up
                      </div>
                    </div>
                    <div className="space-y-1.5 py-2 text-center">
                      <div className="mx-auto h-2.5 w-3/4 rounded bg-[var(--bd-fill-hover)]" />
                      <div className="mx-auto h-1.5 w-1/2 rounded bg-[var(--bd-muted)]" />
                    </div>
                    <div className="mx-auto flex h-6 w-16 scale-90 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_10px_-2px_rgba(139,92,246,.9)]">
                      <div className="h-1.5 w-8 rounded bg-white/90" />
                    </div>
                  </div>

                  {/* Thẻ thông báo nổi */}
                  <div className="relative z-10 flex w-40 -translate-y-2 translate-x-2 items-center gap-3 self-end rounded-lg border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-2.5 shadow-xl">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">
                      ✓
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[var(--bd-text)]">Xuất bản thành công</div>
                      <div className="text-[8px] text-[var(--bd-muted)]">lp-builder.co/demo</div>
                    </div>
                  </div>
                </div>

                {/* Panel phải: cấu hình */}
                <div className="col-span-3 space-y-4 border-l border-[var(--bd-border)] bg-[var(--bd-app)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--bd-muted)]">
                    Cấu hình
                  </div>
                  <div className="space-y-3 text-[10px]">
                    <div className="space-y-1">
                      <div className="font-medium text-[var(--bd-muted)]">Màu chủ đạo</div>
                      <div className="flex gap-1.5">
                        <div className="h-4 w-4 rounded-full border border-[var(--bd-text)] bg-violet-500" />
                        <div className="h-4 w-4 rounded-full bg-cyan-400" />
                        <div className="h-4 w-4 rounded-full bg-indigo-500" />
                        <div className="h-4 w-4 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-[var(--bd-muted)]">Bo góc</div>
                      <div className="relative h-1.5 w-full rounded-full bg-[var(--bd-fill-hover)]">
                        <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-[var(--bd-muted)]">Bóng đổ</div>
                      <div className="rounded border border-[var(--bd-border)] bg-[var(--bd-fill)] p-1 text-center text-[var(--bd-dim)]">
                        Trung bình
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

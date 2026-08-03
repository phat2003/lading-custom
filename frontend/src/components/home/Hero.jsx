import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden bg-slate-950 md:pt-32 md:pb-24">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="space-y-8 lg:col-span-6">
            
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-sm">
              <span className="flex w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
               LẬP TRÌNH WEBSITE KHÔNG CẦN CODE
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl font-normal text-white leading-[6rem] sm:text-5xl lg:text-6xl lg:leading-[4.8rem]">
              Xây dựng trang đích hiệu suất cao trong{' '}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 decoration-blue-500">
                vài phút
              </span>{' '}
              — không cần code
            </h1>

            {/* Description */}
            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              Kéo thả, tùy chỉnh và xuất bản trang web chuyên nghiệp của bạn chỉ trong vài phút. Chọn từ hơn 100 template và bắt đầu xây dựng ngay hôm nay.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Bắt đầu — Miễn phí</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              
              <a
                href="#video"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Video</span>
              </a>
            </div>

            {/* Small Checklist */}
            <div className="flex flex-wrap pt-2 text-sm gap-x-8 gap-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Không thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Thiết lập dưới 10 phút</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Mockup (Builder Preview) */}
          <div className="relative lg:col-span-6">
            {/* Glowing borders behind mockup */}
            <div className="absolute transition duration-1000 -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-xl group-hover:opacity-100 group-hover:duration-200"></div>
            
            {/* Mockup UI Window */}
            <div className="relative overflow-hidden border shadow-2xl border-slate-800 bg-slate-950/80 rounded-2xl backdrop-blur-sm">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="font-mono text-xs text-slate-500">lp-builder.co/app/editor</div>
                <div className="w-12" />
              </div>

              {/* Editor Workspace Mockup */}
              <div className="grid grid-cols-12 h-[340px] text-xs">
                
                {/* Left Sidebar: Components */}
                <div className="col-span-3 p-3 space-y-4 border-r border-slate-900 bg-slate-950">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Components</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-900 border-slate-800 text-slate-300">
                      <div className="w-4 h-4 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-serif text-[10px]">T</div>
                      <span>Văn bản</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-900 border-slate-800 text-slate-300">
                      <div className="w-4 h-4 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-[10px]">🖼️</div>
                      <span>Hình ảnh</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-900 border-slate-800 text-slate-300">
                      <div className="w-4 h-4 rounded bg-amber-600/20 text-amber-400 flex items-center justify-center text-[10px]">🔳</div>
                      <span>Nút bấm</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded bg-slate-900 border-slate-800 text-slate-300">
                      <div className="w-4 h-4 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px]">📋</div>
                      <span>Biểu mẫu</span>
                    </div>
                  </div>
                </div>

                {/* Main Canvas Area */}
                <div className="relative flex flex-col justify-between col-span-6 p-4 overflow-hidden bg-slate-900/40">
                  {/* Decorative background grid pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                  {/* Sample Landing Page inside Canvas */}
                  <div className="relative z-10 p-4 space-y-3 border rounded shadow-lg border-blue-500/40 bg-slate-950">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <div className="font-bold text-white text-[10px]">My SaaS Page</div>
                      <div className="w-8 h-3 rounded bg-blue-600 text-[8px] flex items-center justify-center text-white scale-75">Sign up</div>
                    </div>
                    <div className="space-y-1.5 text-center py-2">
                      <div className="h-2.5 w-3/4 bg-white/10 rounded mx-auto" />
                      <div className="h-1.5 w-1/2 bg-slate-600 rounded mx-auto" />
                    </div>
                    <div className="h-6 w-16 bg-blue-600 rounded-md mx-auto flex items-center justify-center scale-90 border border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.4)]">
                      <div className="h-1.5 w-8 bg-white/90 rounded" />
                    </div>
                  </div>

                  {/* Notification card floating */}
                  <div className="relative z-10 self-end bg-slate-950 border border-slate-800 rounded-lg p-2.5 shadow-xl flex items-center gap-3 w-40 translate-x-2 -translate-y-2">
                    <div className="flex items-center justify-center w-6 h-6 font-bold text-green-400 rounded-full bg-green-500/20">✓</div>
                    <div>
                      <div className="font-bold text-white text-[9px]">Xuất bản thành công</div>
                      <div className="text-slate-500 text-[8px]">lp-builder.co/demo</div>
                    </div>
                  </div>
                </div>

                {/* Right Settings Sidebar */}
                <div className="col-span-3 p-3 space-y-4 border-l border-slate-900 bg-slate-950">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cấu hình</div>
                  <div className="space-y-3 text-[10px]">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-500">Màu chủ đạo</div>
                      <div className="flex gap-1.5">
                        <div className="w-4 h-4 bg-blue-600 border border-white rounded-full" />
                        <div className="w-4 h-4 bg-purple-600 rounded-full" />
                        <div className="w-4 h-4 bg-indigo-600 rounded-full" />
                        <div className="w-4 h-4 bg-teal-600 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-slate-500">Bo góc</div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-blue-600 border border-slate-950 shadow" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-slate-500">Bóng đổ</div>
                      <div className="p-1 text-center border rounded bg-slate-900 border-slate-800 text-slate-300">Trung bình</div>
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

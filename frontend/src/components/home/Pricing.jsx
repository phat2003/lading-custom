import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-950 py-20 border-t border-slate-900 relative">
      {/* Background glow behind pricing cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Bảng giá đơn giản
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Chọn gói phù hợp nhất với quy mô hoạt động và nhu cầu thực tế của bạn.
          </p>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <div className="border border-slate-900 bg-slate-950/60 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800 transition-all duration-300 shadow-xl backdrop-blur-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Free</h3>
                <p className="text-sm text-slate-400">Khởi đầu cho dự án nhỏ hoàn toàn miễn phí</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">0 VNĐ</span>
                <span className="ml-1 text-sm text-slate-500 font-medium">/tháng</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 border-t border-slate-900 pt-6 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1 Website</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tên miền subdomain của LP Builder</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hơn 10+ template cơ bản</span>
                </li>
              </ul>
            </div>

            {/* Action */}
            <div className="pt-8">
              <Link
                to="/register"
                className="block w-full text-center rounded-xl border border-slate-800 bg-slate-900/50 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
              >
                Bắt đầu miễn phí
              </Link>
            </div>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="relative border-2 border-blue-600 bg-slate-950/80 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-300 shadow-2xl backdrop-blur-sm">
            {/* Best Seller Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
              BÁN CHẠY NHẤT
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <p className="text-sm text-slate-400">Lựa chọn tốt nhất cho doanh nghiệp chuyên nghiệp</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">299.000 VNĐ</span>
                <span className="ml-1 text-sm text-slate-500 font-medium">/tháng</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 border-t border-slate-900 pt-6 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Không giới hạn trang web</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tên miền tùy chỉnh (.com, .vn, ...)</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hỗ trợ ưu tiên 24/7</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tất cả mẫu template cao cấp</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tích hợp Analytics & Marketing nâng cao</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hỗ trợ tối ưu SEO chuyên sâu</span>
                </li>
              </ul>
            </div>

            {/* Action */}
            <div className="pt-8">
              <Link
                to="/register"
                className="block w-full text-center rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Đăng ký Pro
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

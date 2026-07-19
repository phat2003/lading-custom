import { Link } from 'react-router-dom'

export default function Templates() {
  const templates = [
    {
      name: 'Tech SaaS',
      category: 'Công nghệ & Phần mềm',
      desc: 'Thiết kế hiện đại dành cho các sản phẩm SaaS, dịch vụ đám mây hoặc startup công nghệ.',
      color: 'from-blue-600 to-indigo-600',
      label: 'POPULAR',
    },
    {
      name: 'Marketing Portfolio',
      category: 'Cá nhân & Portfolio',
      desc: 'Giới thiệu bản thân và các dự án của bạn một cách chuyên nghiệp và ấn tượng.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      name: 'E-Commerce Promo',
      category: 'Bán lẻ & Thương mại',
      desc: 'Trang đích khuyến mại cho các chiến dịch bán hàng trực tuyến hoặc ra mắt sản phẩm mới.',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      name: 'Education Landing',
      category: 'Giáo dục & Khóa học',
      desc: 'Tuyển sinh và giới thiệu khóa học, hội thảo trực tuyến hiệu quả.',
      color: 'from-amber-600 to-orange-600',
    },
  ]

  return (
    <section id="templates" className="bg-slate-950 py-20 border-t border-slate-900 relative">
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div className="space-y-4 max-w-xl">
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Templates đẹp mắt
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Bắt đầu nhanh chóng với thư viện thiết kế đa dạng được tối ưu hóa cho chuyển đổi.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group self-start sm:self-auto"
          >
            <span>Xem tất cả</span>
            <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((temp, index) => (
            <div
              key={index}
              className="group border border-slate-900 bg-slate-950/60 rounded-2xl overflow-hidden hover:border-slate-800 transition-all duration-300 shadow-xl"
            >
              {/* Template Preview Box */}
              <div className="relative h-64 overflow-hidden bg-slate-900 flex items-center justify-center p-8">
                {/* Abstract background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${temp.color} opacity-20 group-hover:opacity-35 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

                {/* Popular label */}
                {temp.label && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                    {temp.label}
                  </div>
                )}

                {/* Template Mockup Design */}
                <div className="relative w-full h-full border border-slate-800 bg-slate-950/90 rounded-t-lg shadow-2xl p-4 flex flex-col justify-between transform translate-y-6 group-hover:translate-y-2 transition-transform duration-500">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="h-2 w-12 bg-white/20 rounded" />
                    <div className="flex gap-1.5">
                      <div className="h-2 w-6 bg-blue-600/50 rounded" />
                      <div className="h-2 w-6 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 py-4">
                    <div className="h-3.5 w-3/4 bg-white/25 rounded" />
                    <div className="h-2 w-5/6 bg-white/10 rounded" />
                    <div className="h-2 w-2/3 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-full border border-dashed border-slate-800 rounded flex items-center justify-center text-[9px] text-slate-600">
                    ➕ Click to Edit
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6 space-y-3 bg-slate-950">
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {temp.category}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {temp.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {temp.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

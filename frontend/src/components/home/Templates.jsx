import { Link } from 'react-router-dom'

export default function Templates() {
  const templates = [
    {
      name: 'Tech SaaS',
      category: 'Công nghệ & Phần mềm',
      desc: 'Thiết kế hiện đại dành cho các sản phẩm SaaS, dịch vụ đám mây hoặc startup công nghệ.',
      color: 'from-blue-600 to-indigo-600',
      label: 'POPULAR',
      image: '/mock-home/Temp1.PNG',
    },
    {
      name: 'Marketing Portfolio',
      category: 'Cá nhân & Portfolio',
      desc: 'Giới thiệu bản thân và các dự án của bạn một cách chuyên nghiệp và ấn tượng.',
      color: 'from-purple-600 to-pink-600',
      image: '/mock-home/Temp2.PNG',
    },
    {
      name: 'E-Commerce Promo',
      category: 'Bán lẻ & Thương mại',
      desc: 'Trang đích khuyến mại cho các chiến dịch bán hàng trực tuyến hoặc ra mắt sản phẩm mới.',
      color: 'from-emerald-600 to-teal-600',
      image: '/mock-home/Temp3.PNG',
    },
    {
      name: 'Education Landing',
      category: 'Giáo dục & Khóa học',
      desc: 'Tuyển sinh và giới thiệu khóa học, hội thảo trực tuyến hiệu quả.',
      color: 'from-amber-600 to-orange-600',
      image: '/mock-home/Temp4.PNG',
    },
  ]

  return (
    <section id="templates" className="bg-slate-950 py-20 border-t border-slate-900 relative">
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((temp, index) => (
            <div
              key={index}
              className="group border border-slate-900 bg-slate-950/60 rounded-2xl overflow-hidden hover:border-slate-800 transition-all duration-300 shadow-xl"
            >
              <div className="relative h-64 overflow-hidden bg-slate-900 flex items-center justify-center p-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${temp.color} opacity-20 group-hover:opacity-35 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

                {temp.label && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                    {temp.label}
                  </div>
                )}

                <div className="relative w-full h-full border border-slate-800 bg-slate-950/90 rounded-t-lg shadow-2xl overflow-hidden transform translate-y-6 group-hover:translate-y-2 transition-transform duration-500">
                  <img
                    src={temp.image}
                    alt={temp.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-slate-950/55 px-2.5 py-1 text-[9px] font-semibold tracking-[0.25em] text-slate-200 backdrop-blur-sm uppercase">
                    Preview
                  </div>
                </div>
              </div>

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

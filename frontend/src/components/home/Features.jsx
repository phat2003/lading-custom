export default function Features() {
  const items = [
    {
      title: 'Kéo và thả trực quan',
      desc: 'Xây dựng bố cục phức tạp chỉ bằng các thao tác kéo thả kéo dài vài giây. Không cần kiến thức lập trình.',
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      badgeColor: 'bg-blue-600/10 border-blue-500/20',
    },
    {
      title: 'Responsive hoàn hảo',
      desc: 'Thiết kế tự động điều chỉnh tối ưu hiển thị mượt mà trên tất cả các loại màn hình di động, máy tính bảng và desktop.',
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM9 17h6" />
        </svg>
      ),
      badgeColor: 'bg-emerald-600/10 border-emerald-500/20',
    },
    {
      title: 'Tốc độ tải siêu tốc',
      desc: 'Mã nguồn HTML được tối ưu hóa ở mức tối đa giúp landing page của bạn tải ngay lập tức để giữ chân khách hàng.',
      icon: (
        <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badgeColor: 'bg-amber-600/10 border-amber-500/20',
    },
    {
      title: 'Tích hợp Analytics',
      desc: 'Theo dõi chi tiết lưu lượng truy cập và hành vi người dùng bằng các biểu đồ trực quan tích hợp sẵn.',
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
      ),
      badgeColor: 'bg-indigo-600/10 border-indigo-500/20',
    },
    {
      title: 'Kết nối đa dạng',
      desc: 'Tích hợp mượt mà với hàng loạt nhà cung cấp tên miền, dịch vụ email marketing và hệ thống CRM.',
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      badgeColor: 'bg-cyan-600/10 border-cyan-500/20',
    },
    {
      title: 'Trợ lý AI',
      desc: 'Tạo nội dung văn bản và đề xuất thiết kế tự động chỉ với vài gợi ý ngắn gọn giúp bạn tăng tốc tối đa.',
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      badgeColor: 'bg-purple-600/10 border-purple-500/20',
    },
  ]

  return (
    <section id="features" className="bg-slate-950 py-20 border-t border-slate-900 relative">
      {/* Absolute glow background */}
      <div className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Tính năng nổi bật
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Những công cụ mạnh mẽ giúp bạn xây dựng trang web nhanh chóng và hiệu quả.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-slate-900 bg-slate-950/60 p-8 hover:border-slate-800 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm shadow-xl"
            >
              {/* Card glow hover */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon container */}
              <div className={`inline-flex items-center justify-center p-3 rounded-xl border mb-6 ${item.badgeColor}`}>
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

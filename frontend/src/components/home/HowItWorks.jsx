export default function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Chọn Template',
      desc: 'Bắt đầu nhanh chóng bằng cách chọn một mẫu giao diện chuyên nghiệp phù hợp với lĩnh vực của bạn.',
    },
    {
      step: '2',
      title: 'Tùy chỉnh',
      desc: 'Sử dụng trình biên tập trực quan kéo thả để chỉnh sửa văn bản, màu sắc, font chữ, bố cục và ảnh.',
    },
    {
      step: '3',
      title: 'Kết nối',
      desc: 'Dễ dàng thiết lập cấu hình trỏ tên miền cá nhân của riêng bạn hoặc sử dụng subdomain có sẵn.',
    },
    {
      step: '4',
      title: 'Xuất bản',
      desc: 'Chỉ với một click chuột, trang đích của bạn sẽ ngay lập tức được xuất bản lên internet và sẵn sàng đón khách.',
    },
  ]

  return (
    <section className="bg-slate-950 py-20 border-t border-slate-900 relative">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Hoạt động như thế nào?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Chỉ với 4 bước đơn giản để sở hữu một trang web hoàn hảo phục vụ cho mục tiêu của bạn.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting line (Desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-900 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((item, index) => (
              <div key={index} className="text-center space-y-6 group">
                
                {/* Number Bubble */}
                <div className="mx-auto h-24 w-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300">
                  <span className="font-serif italic">{item.step}</span>
                </div>

                {/* Step Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-slate-400 leading-relaxed px-4">
                  {item.desc}
                </p>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

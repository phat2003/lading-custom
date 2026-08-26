// Bảng màu icon xoay quanh trục tím→cyan của hệ thiết kế, thay cho dải xanh cũ.
const ITEMS = [
  {
    title: 'Kéo và thả trực quan',
    desc: 'Xây dựng bố cục phức tạp chỉ bằng các thao tác kéo thả kéo dài vài giây. Không cần kiến thức lập trình.',
    tint: 'border-violet-400/25 bg-violet-500/10 text-violet-400',
    path: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
  },
  {
    title: 'Responsive hoàn hảo',
    desc: 'Thiết kế tự động điều chỉnh tối ưu hiển thị mượt mà trên tất cả các loại màn hình di động, máy tính bảng và desktop.',
    tint: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-400',
    path: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM9 17h6',
  },
  {
    title: 'Tốc độ tải siêu tốc',
    desc: 'Mã nguồn HTML được tối ưu hóa ở mức tối đa giúp landing page của bạn tải ngay lập tức để giữ chân khách hàng.',
    tint: 'border-amber-400/25 bg-amber-500/10 text-amber-400',
    path: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Tích hợp Analytics',
    desc: 'Theo dõi chi tiết lưu lượng truy cập và hành vi người dùng bằng các biểu đồ trực quan tích hợp sẵn.',
    tint: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-400',
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2',
  },
  {
    title: 'Kết nối đa dạng',
    desc: 'Tích hợp mượt mà với hàng loạt nhà cung cấp tên miền, dịch vụ email marketing và hệ thống CRM.',
    tint: 'border-teal-400/25 bg-teal-500/10 text-teal-400',
    path: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    title: 'Trợ lý AI',
    desc: 'Tạo nội dung văn bản và đề xuất thiết kế tự động chỉ với vài gợi ý ngắn gọn giúp bạn tăng tốc tối đa.',
    tint: 'border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-400',
    path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
]

const Features = () => {
  return (
    <section id="features" className="lp-section">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center">
          <h2 className="lp-title">Tính năng nổi bật</h2>
          <p className="lp-sub">
            Những công cụ mạnh mẽ giúp bạn xây dựng trang web nhanh chóng và hiệu quả.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.title} className="lp-card group relative p-8">
              <div className={`mb-6 inline-flex items-center justify-center rounded-xl border p-3 transition-transform duration-300 group-hover:scale-110 ${item.tint}`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                </svg>
              </div>

              <h3 className="mb-3 text-lg font-bold text-[var(--bd-text)] transition-colors group-hover:text-[var(--bd-accent)]">
                {item.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--bd-dim)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

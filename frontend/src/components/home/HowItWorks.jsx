const STEPS = [
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

const HowItWorks = () => {
  return (
    <section className="lp-section">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-20 max-w-2xl space-y-4 text-center">
          <h2 className="lp-title">Hoạt động như thế nào?</h2>
          <p className="lp-sub">
            Chỉ với 4 bước đơn giản để sở hữu một trang web hoàn hảo phục vụ cho mục tiêu của bạn.
          </p>
        </div>

        <div className="relative">
          {/* Đường nối giữa các bước (chỉ hiện trên desktop) */}
          <div className="absolute left-[12%] right-[12%] top-12 z-0 hidden h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent lg:block" />

          <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="group space-y-6 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] text-2xl font-bold text-[var(--bd-muted)] transition-all duration-300 group-hover:border-violet-400/50 group-hover:text-[var(--bd-accent)] group-hover:shadow-[0_0_28px_-6px_rgba(139,92,246,.8)]">
                  <span className="font-serif italic">{item.step}</span>
                </div>

                <h3 className="text-lg font-bold text-[var(--bd-text)] transition-colors group-hover:text-[var(--bd-accent)]">
                  {item.title}
                </h3>

                <p className="px-4 text-sm leading-relaxed text-[var(--bd-dim)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

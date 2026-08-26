const PRODUCTS = [
  { name: 'SaaS Dashboard', cat: 'Tech SaaS', image: '/mock-home/Prod1.PNG' },
  { name: 'Crypto Exchange', cat: 'Finance', image: '/mock-home/Prod2.PNG' },
  { name: 'Organic Shop', cat: 'E-commerce', image: '/mock-home/Prod3.PNG' },
  { name: 'Fitness Coach', cat: 'Health & Beauty', image: '/mock-home/Prod4.PNG' },
  { name: 'Course Platform', cat: 'Education', image: '/mock-home/Prod5.PNG' },
  { name: 'NFT Marketplace', cat: 'Art & Collectibles', image: '/mock-home/Prod6.PNG' },
]

const ActualProducts = () => {
  return (
    <section id="reviews" className="lp-section">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center">
          <h2 className="lp-title">Sản phẩm thực tế</h2>
          <p className="lp-sub">
            Khám phá những trang đích chuyên nghiệp được thiết kế và xuất bản trực tiếp bởi người
            dùng của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((prod) => (
            <div key={prod.name} className="lp-card group overflow-hidden">
              {/* Thanh giả lập cửa sổ trình duyệt */}
              <div className="flex items-center gap-1.5 border-b border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--bd-fill-hover)]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--bd-fill-hover)]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--bd-fill-hover)]" />
              </div>

              <div className="relative h-48 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Lớp phủ mờ dần về nền thẻ, dùng token nên đúng ở cả sáng lẫn tối */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bd-panel-solid)] via-transparent to-transparent" />
              </div>

              <div className="space-y-2 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]">
                  {prod.cat}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[var(--bd-text)] transition-colors group-hover:text-[var(--bd-accent)]">
                    {prod.name}
                  </h3>
                  <svg
                    className="h-4 w-4 transform text-[var(--bd-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--bd-accent)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ActualProducts

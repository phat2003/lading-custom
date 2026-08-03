export default function ActualProducts() {
  const products = [
    { name: 'SaaS Dashboard', cat: 'Tech SaaS', image: '/mock-home/Prod1.PNG' },
    { name: 'Crypto Exchange', cat: 'Finance', image: '/mock-home/Prod2.PNG' },
    { name: 'Organic Shop', cat: 'E-commerce', image: '/mock-home/Prod3.PNG' },
    { name: 'Fitness Coach', cat: 'Health & Beauty', image: '/mock-home/Prod4.PNG' },
    { name: 'Course Platform', cat: 'Education', image: '/mock-home/Prod5.PNG' },
    { name: 'NFT Marketplace', cat: 'Art & Collectibles', image: '/mock-home/Prod6.PNG' },
  ]

  return (
    <section id="reviews" className="relative py-20 border-t bg-slate-950 border-slate-900">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="max-w-2xl mx-auto mb-16 space-y-4 text-center">
          <h2 className="font-serif text-3xl font-normal text-white sm:text-4xl">
            Sản phẩm thực tế
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            Khám phá những trang đích chuyên nghiệp được thiết kế và xuất bản trực tiếp bởi người dùng của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((prod, index) => (
            <div
              key={index}
              className="overflow-hidden transition-all duration-300 border shadow-xl group border-slate-900 bg-slate-950/60 rounded-2xl hover:border-slate-800 hover:-translate-y-1"
            >
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-900 bg-slate-900/50">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              </div>

              <div className="relative h-48 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>

              <div className="p-5 space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {prod.cat}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white transition-colors group-hover:text-blue-400">
                    {prod.name}
                  </h3>
                  <svg className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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

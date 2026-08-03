export default function Library() {
  const products = [
    {
      name: 'Landing Page SaaS Pro',
      type: 'Product Demo',
      stat: '+126 leads',
      badge: 'Best seller',
      image: '/mock-home/Temp1.PNG',
    },
    {
      name: 'Campaign Thương mại điện tử',
      type: 'Marketing',
      stat: '3.1x conversion',
      badge: 'Hot',
      image: '/mock-home/Temp2.PNG',
    },
    {
      name: 'Portfolio Startup',
      type: 'Branding',
      stat: '42k views',
      badge: 'Popular',
      image: '/mock-home/Temp3.PNG',
    },
    {
      name: 'Newsletter Sign-up',
      type: 'Growth',
      stat: '81% open rate',
      badge: 'New',
      image: '/mock-home/Temp4.PNG',
    },
    {
      name: 'Event Launch Page',
      type: 'Event',
      stat: '850 attendees',
      badge: 'Trending',
      image: '/mock-home/Prod1.PNG',
    },
    {
      name: 'Product Hunt Style',
      type: 'Launch',
      stat: '12.4% click rate',
      badge: 'Featured',
      image: '/mock-home/Prod1.PNG',
    },
  ]

  return (
    <section className="px-6 py-16 text-white bg-slate-900 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 text-center text-sm font-bold tracking-[0.3em] text-blue-400 uppercase">
          Thư viện
        </div>
        <h3 className="mb-10 text-3xl font-semibold text-center text-white md:text-4xl">
          Các mẫu được tạo bởi Amazing Tech
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product, i) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-[0_0_35px_rgba(15,23,42,0.4)]"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {product.type}
                  </span>
                  <span className="text-xs font-semibold text-blue-300">{product.badge}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{product.stat}</span>
                  <span>#{i + 1}</span>
                </div>

                <h4 className="mt-4 text-lg font-semibold text-white">{product.name}</h4>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

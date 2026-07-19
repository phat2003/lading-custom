export default function ActualProducts() {
  const products = [
    { name: 'SaaS Dashboard', cat: 'Tech SaaS', gradient: 'from-slate-900 to-blue-950' },
    { name: 'Crypto Exchange', cat: 'Finance', gradient: 'from-slate-900 to-indigo-950' },
    { name: 'Organic Shop', cat: 'E-commerce', gradient: 'from-slate-900 to-emerald-950' },
    { name: 'Fitness Coach', cat: 'Health & Beauty', gradient: 'from-slate-900 to-rose-950' },
    { name: 'Course Platform', cat: 'Education', gradient: 'from-slate-900 to-amber-950' },
    { name: 'NFT Marketplace', cat: 'Art & Collectibles', gradient: 'from-slate-900 to-violet-950' },
  ]

  return (
    <section id="reviews" className="bg-slate-950 py-20 border-t border-slate-900 relative">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Sản phẩm thực tế
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Khám phá những trang đích chuyên nghiệp được thiết kế và xuất bản trực tiếp bởi người dùng của chúng tôi.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod, index) => (
            <div
              key={index}
              className="group border border-slate-900 bg-slate-950/60 rounded-2xl overflow-hidden hover:border-slate-800 hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              {/* Browser mockup header */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-900 bg-slate-900/50">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              </div>

              {/* Page Preview Cover */}
              <div className={`relative h-48 bg-gradient-to-br ${prod.gradient} flex flex-col justify-between p-6 overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:10px_10px] opacity-35" />
                
                {/* Abstract UI Elements Inside Mockup */}
                <div className="space-y-2 relative z-10 w-full">
                  <div className="h-2 w-16 bg-white/20 rounded" />
                  <div className="h-4 w-3/4 bg-white/30 rounded mt-4" />
                  <div className="h-2 w-1/2 bg-white/15 rounded" />
                </div>
                
                <div className="flex items-center justify-between mt-auto relative z-10">
                  <div className="h-5 w-16 bg-blue-600/30 border border-blue-500/20 rounded text-[9px] flex items-center justify-center text-blue-300">
                    Live Demo
                  </div>
                  <div className="h-3 w-10 bg-white/10 rounded" />
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5 space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {prod.cat}
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
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

export default function Library() {
  const templates = [
    "Bảng điều khiển SaaS",
    "Chiến dịch thương mại điện tử",
    "Portfolio công ty",
    "Trang Product Hunt",
    "Đăng ký nhận bản tin",
    "Đăng ký hội thảo trực tuyến",
  ]

  return (
    <section className="px-8 py-16 text-white bg-gray-800">
      <div className="text-center font-bold text-xl mb-4 text-blue-500">Thư viện</div>
      <h3 className="mb-8 text-3xl font-semibold text-center">Các trang được tạo bởi Amazing Tech</h3>
      <div className="grid gap-8 md:grid-cols-3">
        {templates.map((t, i) => (
          <div key={i} className="flex items-center justify-center h-40 bg-gray-700 rounded-lg">
            {t}
          </div>
        ))}
      </div>
    </section>
  )
}

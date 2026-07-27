export default function FeatureSection() {
  const features = [
    { title: "🖱️ Trình tạo kéo & thả", desc: "Chỉnh sửa trực quan với xem trước theo thời gian thực." },
    { title: "⚡ Hiệu năng tốc độ cao", desc: "Trang tối ưu Core Web Vitals, tải <1s." },
    { title: "🎨 500+ Template cao cấp", desc: "Template chuyên nghiệp, kiểm chứng tỷ lệ chuyển đổi." },
    { title: "🚀 Xuất bản một chạm", desc: "Tên miền tùy chỉnh, SSL tự động." },
    { title: "📊 Phân tích chuyển đổi", desc: "Theo dõi hành vi, A/B test, dashboard realtime." },
    { title: "🔒 Bảo mật doanh nghiệp", desc: "SOC 2 Type II, GDPR, phân quyền." },
  ]
  return (
    <section className="px-8 py-16 text-white bg-gray-900">
      <h3 className="mb-8 text-3xl font-semibold text-center">
        Bộ công cụ hoàn chỉnh để xây dựng landing page
      </h3>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className="p-6 bg-gray-800 border rounded-lg shadow-sm">
            <h4 className="mb-2 font-bold">{f.title}</h4>
            <p className="text-gray-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

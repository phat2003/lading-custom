export default function ProcessSection() {
  const steps = [
    { num: "01", title: "Chọn template", desc: "Duyệt qua hơn 500 template tối ưu chuyển đổi." },
    { num: "02", title: "Tùy chỉnh thiết kế", desc: "Chỉnh sửa màu sắc, font chữ, bố cục, nội dung." },
    { num: "03", title: "Kết nối tên miền", desc: "Tên miền tùy chỉnh hoặc tên miền phụ miễn phí." },
    { num: "04", title: "Xuất bản & phát triển", desc: "Theo dõi chuyển đổi, A/B testing tích hợp." },
  ]
  return (
    <section className="px-8 py-16 text-white bg-gray-800">
      <div className="text-center font-bold text-xl mb-4 text-blue-500">Quy trình</div>
      <h3 className="mb-8 text-3xl font-semibold text-center">Cách thức hoạt động</h3>
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="p-6 bg-gray-700 border rounded-lg">
            <p className="font-bold text-blue-400">{s.num}</p>
            <h4 className="mb-2 font-bold">{s.title}</h4>
            <p className="text-gray-300">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-400">
        ⏱️ Trung bình 12 phút từ đăng ký đến xuất bản đầu tiên
      </div>
    </section>
  )
}

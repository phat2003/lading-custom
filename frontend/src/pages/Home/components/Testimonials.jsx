export default function Testimonials() {
  const reviews = [
    { name: "Nguyễn Minh Tuấn", role: "Trưởng phòng Marketing, VNPay", text: "Tỷ lệ chuyển đổi tăng 40% sau khi chuyển sang nền tảng này." },
    { name: "Trần Thị Hương", role: "Founder, Startup Hub Việt Nam", text: "Tiết kiệm hàng tháng công việc kỹ thuật, cập nhật hàng tuần không cần code." },
    { name: "Lê Quang Hải", role: "Giám đốc Tiếp thị, Tiki", text: "Tăng gấp đôi lượng đăng ký dùng thử trong 60 ngày." },
  ]
  return (
    <section className="px-8 py-16 text-center text-white bg-gray-900">
      <div className="text-center font-bold text-xl mb-4 text-blue-500">Đánh giá</div>
      <h3 className="mb-8 text-3xl font-semibold">Những gì khách hàng nói</h3>
      <div className="grid gap-8 md:grid-cols-3">
        {reviews.map((r, i) => (
          <div key={i} className="p-6 bg-gray-800 border rounded-lg">
            <p className="mb-2 text-yellow-400">★★★★★</p>
            <p className="mb-4 text-gray-300">"{r.text}"</p>
            <p className="font-bold">{r.name}</p>
            <p className="text-sm text-gray-400">{r.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

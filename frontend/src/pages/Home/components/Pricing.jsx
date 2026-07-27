export default function Pricing({ onChoosePlan }) {
  const plans = [
    {
      name: "Miễn phí",
      price: "0₫ / mãi mãi",
      desc: "Lý tưởng để thử nghiệm ý tưởng và dự án cá nhân.",
      button: "Bắt đầu miễn phí",
      features: [
        "3 landing page",
        "Template cơ bản",
        "1.000 lượt truy cập/tháng",
        "Tên miền phụ của chúng tôi",
        "Hỗ trợ qua email",
      ],
    },
    {
      name: "Pro (Phổ biến nhất)",
      price: "699.000₫ / mỗi tháng",
      desc: "Dành cho đội nhóm đang phát triển cần nhiều tính năng hơn.",
      button: "Dùng thử miễn phí",
      features: [
        "Không giới hạn trang",
        "Tất cả 500+ template",
        "100.000 lượt truy cập/tháng",
        "Tên miền tùy chỉnh",
        "A/B testing",
        "Bảng phân tích",
        "Hỗ trợ ưu tiên",
      ],
    },
    {
      name: "Doanh nghiệp",
      price: "Liên hệ / tính theo năm",
      desc: "Dành cho doanh nghiệp lớn với yêu cầu bảo mật và tuân thủ nâng cao.",
      button: "Liên hệ sales",
      features: [
        "Không giới hạn mọi thứ",
        "Tùy chỉnh nhãn hiệu riêng",
        "SSO / SAML",
        "Đảm bảo SLA",
        "Quản lý tài khoản riêng",
        "Tích hợp tùy chỉnh",
        "Bảo mật nâng cao",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-16 text-white bg-gray-900">
      <h2 className="mb-4 text-3xl font-bold text-center">Bảng giá đơn giản, minh bạch</h2>
      <p className="mb-12 text-center text-gray-400">
        Bắt đầu miễn phí. Nâng cấp khi bạn sẵn sàng phát triển.
      </p>
      <div className="grid max-w-6xl grid-cols-1 gap-8 px-8 mx-auto md:grid-cols-3">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="p-8 transition transform bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
            <h3 className="mb-2 text-2xl font-semibold">{plan.name}</h3>
            <p className="mb-2 text-xl text-blue-400">{plan.price}</p>
            <p className="mb-4 text-gray-300">{plan.desc}</p>
            <ul className="mb-6 space-y-2 text-left">
              {plan.features.map((f, i) => (
                <li key={i} className="text-gray-300">✔ {f}</li>
              ))}
            </ul>
            <button
              onClick={onChoosePlan}
              className="w-full px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

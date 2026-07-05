export default function Comparison() {
  const features = [
    { name: "Landing page", free: "3", pro: "Không giới hạn", enterprise: "Không giới hạn" },
    { name: "Lượt truy cập/tháng", free: "1.000", pro: "100.000", enterprise: "Không giới hạn" },
    { name: "Tên miền tùy chỉnh", free: "–", pro: "✓", enterprise: "✓" },
    { name: "A/B testing", free: "–", pro: "✓", enterprise: "✓" },
    { name: "Bảng phân tích", free: "–", pro: "✓", enterprise: "✓" },
    { name: "Thành viên nhóm", free: "1", pro: "5", enterprise: "Không giới hạn" },
    { name: "Nhãn hiệu riêng", free: "–", pro: "✓", enterprise: "✓" },
    { name: "SSO / SAML", free: "–", pro: "–", enterprise: "✓" },
    { name: "Đảm bảo SLA", free: "–", pro: "–", enterprise: "✓" },
    { name: "Hỗ trợ ưu tiên", free: "–", pro: "–", enterprise: "✓" },
  ]

  return (
    <section className="px-8 py-16 text-white bg-gray-900">
      <h3 className="mb-8 text-3xl font-semibold text-center">So sánh tính năng</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-4">Tính năng</th>
              <th className="p-4 text-center">Miễn phí</th>
              <th className="p-4 text-center">Pro</th>
              <th className="p-4 text-center">Doanh nghiệp</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-4">{f.name}</td>
                <td className="p-4 text-center">{f.free}</td>
                <td className="p-4 text-center">{f.pro}</td>
                <td className="p-4 text-center">{f.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

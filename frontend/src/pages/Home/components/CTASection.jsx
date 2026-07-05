export default function CTASection() {
  return (
    <section className="px-8 py-20 bg-gray-900 text-white flex justify-center">
      <div className="w-full max-w-4xl bg-blue-700 bg-opacity-10 border-2 border-blue-900 rounded-lg p-12 text-center">
        <h3 className="mb-6 text-3xl font-bold">Bắt đầu xây dựng miễn phí ngay hôm nay</h3>
        <p className="max-w-2xl mx-auto mb-8 text-lg">
          Tham gia cùng hơn 12.400 nhà tiếp thị, nhà sáng lập và agency đang sử dụng Amazing Tech để phát triển doanh nghiệp nhanh hơn.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <button className="px-6 py-3 font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800">
            Bắt đầu miễn phí
          </button>
          <button className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-700">
            Xem tất cả template
          </button>
        </div>
        <p className="text-sm text-gray-200">
          Không cần thẻ tín dụng - Gói miễn phí mãi mãi - Hủy bất cứ lúc nào
        </p>
      </div>
    </section>
  )
}

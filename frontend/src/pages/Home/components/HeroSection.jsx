export default function HeroSection({ onGetStarted, onWatchDemo }) {
  return (
    <section className="py-20 text-center text-white bg-gray-900">
      <h2 className="mb-6 text-4xl font-bold">
        Xây dựng landing page chuyển đổi cao trong vài phút — không cần code
      </h2>
      <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-300">
        Thiết kế, tùy chỉnh và ra mắt landing page đẹp mắt mà không cần viết một dòng code nào.
        Chọn từ hơn 500+ template và ra mắt ngay hôm nay.
      </p>
      <div className="flex justify-center gap-4 mb-6">
        <button onClick={onGetStarted} className="px-6 py-3 text-white bg-blue-600 rounded-lg">
          Bắt đầu miễn phí
        </button>
        <button onClick={onWatchDemo} className="px-6 py-3 border border-gray-400 rounded-lg">
          Xem video
        </button>
      </div>
      <div className="flex justify-center gap-8 text-sm text-gray-400">
        <span>Hơn 500+ template có sẵn</span>
        <span>Không cần thẻ tín dụng</span>
      </div>
    </section>
  )
}

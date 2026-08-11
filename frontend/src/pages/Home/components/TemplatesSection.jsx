export default function TemplatesSection() {
  return (
    <section className="px-8 py-16 text-white bg-gray-900">
      <div className="text-center font-bold text-xl mb-4 text-blue-500">Template</div>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-semibold">Template Nổi Bật</h3>
        <a href="/templates" className="text-blue-400 hover:underline">Xem tất cả template</a>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
          Xem trước template • 1280×720
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center h-32 bg-gray-700 rounded-lg">
            Template 2 • 640×360
          </div>
          <div className="flex items-center justify-center h-32 bg-gray-700 rounded-lg">
            Template 3 • 640×360
          </div>
        </div>
      </div>
    </section>
  )
}

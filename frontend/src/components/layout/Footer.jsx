export default function Footer() {
  return (
    <footer className="px-8 py-12 text-gray-300 bg-gray-900">
      <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-4">
        <div>
          <h4 className="mb-4 font-bold text-white">Amazing Tech</h4>
          <p className="mb-4 text-sm">
            Cách nhanh nhất để xây dựng và ra mắt landing page chuyển đổi cao — không cần viết code.
          </p>
          <div className="flex gap-3">
            {/* icons mạng xã hội */}
            <a href="#" className="hover:text-white">FB</a>
            <a href="#" className="hover:text-white">TW</a>
            <a href="#" className="hover:text-white">LI</a>
          </div>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-white">Sản phẩm</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white">Tính năng</a></li>
            <li><a href="#templates" className="hover:text-white">Template</a></li>
            <li><a href="#pricing" className="hover:text-white">Bảng giá</a></li>
            <li><a href="#" className="hover:text-white">Lịch sử thay đổi</a></li>
            <li><a href="#" className="hover:text-white">Lộ trình phát triển</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-white">Công ty</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Tuyển dụng</a></li>
            <li><a href="#" className="hover:text-white">Báo chí</a></li>
            <li><a href="#" className="hover:text-white">Pháp lý</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-bold text-white">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Tài liệu</a></li>
            <li><a href="#" className="hover:text-white">Hướng dẫn sử dụng</a></li>
            <li><a href="#" className="hover:text-white">Trung tâm hỗ trợ</a></li>
            <li><a href="#" className="hover:text-white">Cộng đồng</a></li>
            <li><a href="#" className="hover:text-white">API</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 flex justify-between items-center text-sm text-gray-400 max-w-6xl mx-auto">
        <span>© 2026 Amazing Tech, Inc. Bảo lưu mọi quyền.</span>
        <span>Email: xinchao@amazingtech.vn</span>
      </div>
    </footer>
  )
}

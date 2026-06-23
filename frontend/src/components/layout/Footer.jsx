// Footer chung — FE Dev 1 cập nhật links/copyright.
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-sm text-gray-600 sm:flex-row">
        <p>&copy; {year} Landing Page Builder. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-900">
            Điều khoản
          </a>
          <a href="#" className="hover:text-gray-900">
            Bảo mật
          </a>
          <a href="#" className="hover:text-gray-900">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-6 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <span>LP Builder</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Xây dựng trang đích dễ dàng, không cần biết code. Nền tảng kéo thả trực quan giúp tối ưu tỷ lệ chuyển đổi.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
                  Tính năng
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('templates')} className="hover:text-white transition-colors cursor-pointer">
                  Templates
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  Bảng giá
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Công ty</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Bảo mật
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {year} Landing Page Builder. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#terms" className="hover:text-white">
              Terms of Service
            </a>
            <a href="#privacy" className="hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

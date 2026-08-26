import { Link } from 'react-router-dom'
import Logo from '../common/Logo'

// Cột link: id có giá trị -> cuộn trong trang; href -> link thường.
const COLUMNS = [
  {
    heading: 'Sản phẩm',
    links: [
      { label: 'Tính năng', id: 'features' },
      { label: 'Templates', id: 'templates' },
      { label: 'Bảng giá', id: 'pricing' },
    ],
  },
  {
    heading: 'Công ty',
    links: [
      { label: 'Về chúng tôi', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Blog', href: '#blog' },
    ],
  },
  {
    heading: 'Pháp lý',
    links: [
      { label: 'Điều khoản', href: '#terms' },
      { label: 'Bảo mật', href: '#privacy' },
      { label: 'Liên hệ', href: '#contact' },
    ],
  },
]

const Footer = () => {
  const year = new Date().getFullYear()

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const linkClass =
    'cursor-pointer transition-colors hover:text-[var(--bd-accent)]'

  return (
    <footer className="border-t border-[var(--bd-border)] px-6 py-12 text-[var(--bd-dim)]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Thương hiệu */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[var(--bd-text)]">
              <Logo />
              <span>LP Builder</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Xây dựng trang đích dễ dàng, không cần biết code. Nền tảng kéo thả trực quan giúp tối
              ưu tỷ lệ chuyển đổi.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--bd-text)]">
                {column.heading}
              </h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.id ? (
                      <button onClick={() => scrollToSection(link.id)} className={linkClass}>
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dòng cuối */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--bd-border)] pt-8 text-xs sm:flex-row">
          <p>&copy; {year} Landing Page Builder. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#terms" className={linkClass}>
              Terms of Service
            </a>
            <a href="#privacy" className={linkClass}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

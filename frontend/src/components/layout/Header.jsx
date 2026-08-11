import { Link } from 'react-router-dom'

export default function Header({ user, onLogout, onLogin, onRegister }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 text-white bg-gray-900">
      <Link
        to="/"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-xl font-bold hover:text-white"
      >
        Amazing Tech
      </Link>
      <nav className="flex gap-6 text-gray-300">
        <a href="#features" className="hover:text-white">Tính năng</a>
        <a href="#templates" className="hover:text-white">Template</a>
        <a href="#pricing" className="hover:text-white">Bảng giá</a>
        <a href="#reviews" className="hover:text-white">Đánh giá</a>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-300">{user.full_name || user.email}</span>
            <button
              onClick={onLogout}
              className="text-sm text-red-400 hover:underline"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="text-gray-300 hover:text-white"
            >
              Đăng nhập
            </button>
            <button
              onClick={onRegister}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Bắt đầu ngay
            </button>
          </>
        )}
      </div>
    </header>
  )
}

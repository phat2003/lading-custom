export default function Header({ user, onLogout, onLogin, onRegister }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-bold">Landing Page Builder</h1>
      <nav className="flex gap-6 text-gray-700">
        <a href="#features">Features</a>
        <a href="#templates">Templates</a>
        <a href="#pricing">Pricing</a>
        <a href="#reviews">Review</a>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-600">{user.full_name || user.email}</span>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="text-gray-600"
            >
              Login
            </button>
            <button
              onClick={onRegister}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-bold">Landing Page Builder</h1>
      <nav className="flex gap-6 text-gray-700">
        <a href="#features">Features</a>
        <a href="#templates">Templates</a>
        <a href="#pricing">Pricing</a>
        <a href="#reviews">Review</a>
      </nav>
      <div className="flex gap-4">
        <button className="text-gray-600">Login</button>
        <button className="px-4 py-2 text-white bg-blue-600 rounded-lg">Get Started</button>
      </div>
    </header>
  )
}

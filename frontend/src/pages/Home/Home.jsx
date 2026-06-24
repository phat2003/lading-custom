import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import HeroSection from '../../components/layout/HeroSection'
import FeatureSection from '../../components/layout/FeatureSection'
import Testimonials from '../../components/layout/Testimonials'
import PricingPreview from '../../components/layout/PricingPreview'
import Footer from '../../components/layout/Footer'

// Trang chủ sau khi đăng nhập — bổ sung UI theo design
export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-xl font-bold">Landing Page Builder</h1>
        <nav className="flex gap-6 text-gray-700">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
          <a href="#reviews">Review</a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.full_name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 text-center bg-gray-50">
          <h2 className="mb-4 text-4xl font-bold">
            Build high-converting landing pages in minutes — no code required
          </h2>
          <p className="mb-6 text-lg text-gray-600">
            Landing Page Builder gives marketers, freelancers and agencies a simple drag-and-drop interface...
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button className="px-6 py-3 text-white bg-blue-600 rounded-lg">Get Started: It’s Free</button>
            <button className="px-6 py-3 border border-gray-400 rounded-lg">Watch Demo</button>
          </div>
          <div className="flex justify-center gap-8 text-gray-700">
            <span>86k+ Active users</span>
            <span>420k+ Created projects</span>
            <span>16k+ Projects created</span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-8 py-16">
          <h3 className="mb-8 text-3xl font-semibold text-center">
            Everything you need to design, iterate and ship
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Drag & Drop Editing</h4>
              <p>Build pages visually with no code.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Realtime Preview</h4>
              <p>See updates instantly across devices.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Responsive Design</h4>
              <p>Preview across desktop, tablet, and mobile.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Export Options</h4>
              <p>Download ready-to-deploy HTML/CSS/JS.</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="reviews" className="py-16 text-center bg-gray-50">
          <h3 className="mb-8 text-3xl font-semibold">Trusted by thousands</h3>
          <p className="mb-4 text-gray-600">Logos or testimonials will go here.</p>
          <div className="flex justify-center gap-6">
            <div className="w-24 h-12 bg-gray-300 rounded" />
            <div className="w-24 h-12 bg-gray-300 rounded" />
            <div className="w-24 h-12 bg-gray-300 rounded" />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-8 py-16 text-center">
          <h3 className="mb-8 text-3xl font-semibold">Choose your plan</h3>
          <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Free Plan</h4>
              <p className="mb-4">Basic templates, PDF export, watermark</p>
              <p className="text-xl font-bold">$0</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h4 className="mb-2 font-bold">Pro Plan</h4>
              <p className="mb-4">Premium templates, HTML/CSS export, no watermark</p>
              <p className="text-xl font-bold">$9.99/mo</p>
              <button className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg">Upgrade to Pro</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-sm text-center text-gray-600 bg-gray-100">
        <div className="flex justify-center gap-6 mb-2">
          <a href="/about">About</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </div>
        <p>© 2026 Landing Page Builder. All rights reserved.</p>
      </footer>
    </div>
  )
}

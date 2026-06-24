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
      <Header user={user} onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <Testimonials />
        <PricingPreview />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import FeatureSection from './components/FeatureSection'
import TemplatesSection from './components/TemplatesSection'
import ProcessSection from './components/ProcessSection'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import Comparison from './components/Comparison'
import Library from './components/Library'
import CTASection from './components/CTASection'
import Footer from '../../components/layout/Footer'
import LoginModal from '../../components/common/LoginModal'
import RegisterModal from '../../components/common/RegisterModal'
import { useState } from 'react'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen text-white bg-gray-900">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
      />

      {/* Main content */}
      <main className="flex-grow">
        <HeroSection
          onGetStarted={() => setShowRegister(true)}
          onWatchDemo={() => alert('Show demo video')}
        />
        <StatsSection />
        <FeatureSection />
        <TemplatesSection />
        <ProcessSection />
        <Testimonials />
        <Pricing onChoosePlan={() => navigate('/pricing')} />
        <Comparison />
        <Library />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Popups */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  )
}

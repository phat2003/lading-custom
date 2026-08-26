import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Templates from '../components/home/Templates'
import HowItWorks from '../components/home/HowItWorks'
import Pricing from '../components/home/Pricing'
import ActualProducts from '../components/home/ActualProducts'
import Footer from '../components/layout/Footer'
import { useTheme } from '../context/ThemeContext'

// Trang chủ công khai. data-mode ở đây quyết định toàn bộ màu của trang
// (biến --bd-* trong index.css) — dùng chung hệ màu với khu Admin và Builder,
// nên đổi giao diện ở trang nào thì trang kia cũng đổi theo.
const Home = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const targetId = window.location.hash.slice(1)
    if (!targetId) return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <div
      data-mode={theme}
      className="app-theme relative min-h-screen bg-[var(--bd-app)] font-sans text-[var(--bd-text)] antialiased selection:bg-violet-500 selection:text-white"
    >
      {/* Quầng sáng nền cho đỡ phẳng — giống canvas của builder và nền khu admin */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] animate-float-orb rounded-full bg-[var(--bd-orb-a)] blur-[130px]" />
        <div
          className="absolute -bottom-40 right-0 h-[460px] w-[460px] animate-float-orb rounded-full bg-[var(--bd-orb-b)] blur-[130px]"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <div className="relative">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Templates />
          <HowItWorks />
          <Pricing />
          <ActualProducts />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Home

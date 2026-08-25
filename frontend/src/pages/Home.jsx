import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Templates from '../components/home/Templates'
import HowItWorks from '../components/home/HowItWorks'
import Pricing from '../components/home/Pricing'
import ActualProducts from '../components/home/ActualProducts'
import Footer from '../components/layout/Footer'

export default function Home() {
  useEffect(() => {
    const targetId = window.location.hash.slice(1)
    if (!targetId) return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
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
  )
}

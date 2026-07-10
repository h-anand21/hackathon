import { useEffect } from 'react'
import Lenis from 'lenis'
import { motion, useScroll, useTransform } from 'framer-motion'
import './index.css'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AIFlow from './components/AIFlow'
import Features from './components/Features'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 2000], [0, 300])

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Global Fixed Sky Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-blue-50/50">
        <div 
          style={{ 
            backgroundImage: 'url("https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85")' 
          }}
          className="absolute inset-0 bg-cover bg-center"
        />
      </div>
      
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <main className="relative z-10">
        <Hero />
        <AIFlow />
        <Features />
        <FAQ />
        <CTA />
      </main>
      
      <Footer />
    </div>
  )
}

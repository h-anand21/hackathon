import { useEffect } from 'react'
import Lenis from 'lenis'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import FuturePlan from './pages/FuturePlan'
import ComingSoon from './pages/ComingSoon'
import About from './pages/About'

export default function App() {
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
    <Router>
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

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/future-plan" element={<FuturePlan />} />
          <Route path="/about" element={<About />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  )
}

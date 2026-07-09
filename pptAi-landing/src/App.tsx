import './index.css'
import BackgroundEffects from './components/BackgroundEffects'
import CursorGlow from './components/CursorGlow'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AIFlow from './components/AIFlow'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import DemoCarousel from './components/DemoCarousel'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh' }}>
      <BackgroundEffects />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <AIFlow />
        <HowItWorks />
        <Features />
        <DemoCarousel />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

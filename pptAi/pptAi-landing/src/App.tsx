import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CursorSpotlight from './components/CursorSpotlight'
import AIFlow from './components/AIFlow'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <CursorSpotlight />
      
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <main className="relative z-10">
        <Hero />
      </main>
      
      {/* 
        NOTE: Older dark-theme components are commented out because 
        they clash with the new light-theme Questly design. 
        Uncomment and update their styling if needed.
      */}
      <HowItWorks />
      <AIFlow />
      <Features />
      <FAQ />
      
      {/* <DemoCarousel /> */}
      {/* <Stats /> */}
      {/* <Testimonials /> */}
      {/* <CTA /> */}
      
      <Footer />
    </div>
  )
}

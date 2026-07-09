import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
// import AIFlow from './components/AIFlow'
// import HowItWorks from './components/HowItWorks'
// import Features from './components/Features'
// import DemoCarousel from './components/DemoCarousel'
// import Stats from './components/Stats'
// import Testimonials from './components/Testimonials'
// import CTA from './components/CTA'
// import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
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
      {/* <AIFlow /> */}
      {/* <HowItWorks /> */}
      {/* <Features /> */}
      {/* <DemoCarousel /> */}
      {/* <Stats /> */}
      {/* <Testimonials /> */}
      {/* <CTA /> */}
      {/* <Footer /> */}
    </div>
  )
}

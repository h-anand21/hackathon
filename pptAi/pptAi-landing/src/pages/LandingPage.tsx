import Hero from '../components/Hero'
import AIFlow from '../components/AIFlow'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'

export default function LandingPage() {
  return (
    <main className="relative z-10">
      <Hero />
      <AIFlow />
      <Features />
      <FAQ />
      <CTA />
    </main>
  )
}

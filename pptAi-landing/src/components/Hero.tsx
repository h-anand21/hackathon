import { motion } from 'framer-motion'
import { ArrowRight, Play, Zap, Shield, Users } from 'lucide-react'
import HeroPreview from './HeroPreview'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const badges = [
  { icon: Zap, text: '10x Faster' },
  { icon: Shield, text: 'Free to Start' },
  { icon: Users, text: '500+ Generated' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 glass glow-border rounded-full px-4 py-2 text-sm font-medium text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Powered by Gemini AI + DALL·E 3
            </span>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUp} className="flex flex-col gap-1">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-white">
              Create
            </h1>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight gradient-text">
              Professional
            </h1>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-white">
              Presentations
            </h1>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-white/50">
              with AI
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-lg text-white/60 max-w-lg leading-relaxed">
            From idea to a complete, beautifully designed slide deck in seconds.
            Just type your topic — AI writes, designs, and illustrates everything automatically.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <motion.a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 no-underline"
            >
              Generate Free <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="#demo"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-secondary flex items-center gap-2 no-underline"
            >
              <Play size={16} className="text-indigo-400" /> Watch Demo
            </motion.a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-2">
            {badges.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.text} className="flex items-center gap-2 text-sm text-white/50">
                  <Icon size={14} className="text-indigo-400" />
                  {b.text}
                </div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Right — floating preview */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroPreview />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0f0f1a)' }}
      />
    </section>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, ImageIcon, FileText, Sparkles } from 'lucide-react'

const steps = [
  { icon: FileText, label: 'Analyzing topic...', color: '#6366f1' },
  { icon: Sparkles, label: 'Writing slide content...', color: '#8b5cf6' },
  { icon: ImageIcon, label: 'Generating images...', color: '#22d3ee' },
  { icon: CheckCircle, label: 'Presentation Ready!', color: '#10b981' },
]

const sampleSlides = [
  {
    title: 'Introduction to AI',
    bullet: '• What is Artificial Intelligence?\n• History & Evolution\n• Key Concepts',
    tag: 'Slide 1',
    color: '#6366f1',
  },
  {
    title: 'Machine Learning',
    bullet: '• Supervised Learning\n• Neural Networks\n• Deep Learning Models',
    tag: 'Slide 2',
    color: '#22d3ee',
  },
  {
    title: 'Future of AI',
    bullet: '• Industry Applications\n• AGI Timeline\n• Ethical Considerations',
    tag: 'Slide 3',
    color: '#8b5cf6',
  },
]

export default function HeroPreview() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 1800)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setDone(true), 1200)
      return () => clearTimeout(t)
    }
  }, [step, done])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => { setStep(0); setDone(false) }, 5000)
      return () => clearTimeout(t)
    }
  }, [done])

  return (
    <motion.div
      animate={{ y: [-8, 8, -8], rotate: [-0.5, 0.5, -0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Floating thumbnail cards */}
      <motion.div
        animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -top-8 -left-8 glass rounded-2xl p-3 z-10 w-36"
      >
        <div className="w-full h-20 rounded-xl mb-2" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <div className="p-2 text-xs font-semibold text-white">Slide 1</div>
        </div>
        <div className="text-xs text-white/50">Title Slide</div>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5], x: [3, -3, 3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-8 -right-8 glass rounded-2xl p-3 z-10 w-36"
      >
        <div className="w-full h-20 rounded-xl mb-2" style={{ background: 'linear-gradient(135deg, #22d3ee, #6366f1)' }}>
          <div className="p-2 text-xs font-semibold text-white">Slide 5</div>
        </div>
        <div className="text-xs text-white/50">Conclusion</div>
      </motion.div>

      {/* Main editor card */}
      <div className="glass rounded-3xl p-5 relative overflow-hidden glow-border">
        {/* Editor header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <div className="flex-1 text-center text-xs text-white/40 font-medium">pptAI Editor</div>
        </div>

        {/* Prompt bar */}
        <div className="glass rounded-xl p-3 mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400 shrink-0" />
          <span className="text-sm text-white/70">Introduction to Artificial Intelligence</span>
          <span className="ml-auto text-xs text-indigo-400 font-medium">12 slides</span>
        </div>

        {/* Progress steps */}
        <div className="space-y-2 mb-4">
          {steps.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step && !done
            const isComplete = done || i < step
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: i <= step || done ? 1 : 0.3, x: 0 }}
                className="flex items-center gap-3 text-sm"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: isComplete ? s.color + '33' : 'rgba(255,255,255,0.04)' }}
                >
                  {isActive ? (
                    <Loader2 size={14} className="animate-spin" style={{ color: s.color }} />
                  ) : (
                    <Icon size={14} style={{ color: isComplete ? s.color : 'rgba(255,255,255,0.3)' }} />
                  )}
                </div>
                <span style={{ color: isComplete ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
                {isComplete && i < steps.length - 1 && (
                  <CheckCircle size={12} className="ml-auto text-green-400" />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}
            animate={{ width: done ? '100%' : `${(step / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Slide previews */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {sampleSlides.map((slide, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 glass rounded-xl p-3"
                >
                  <div
                    className="w-12 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `${slide.color}33`, border: `1px solid ${slide.color}44` }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{slide.title}</div>
                    <div className="text-xs text-white/40 whitespace-pre-line mt-0.5 leading-4">
                      {slide.bullet.split('\n')[0]}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="text-center text-xs text-emerald-400 font-medium mt-2 flex items-center justify-center gap-1">
                <CheckCircle size={12} /> Presentation generated in 18s
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

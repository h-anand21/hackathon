import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'

const stats = [
  { value: 500, suffix: '+', label: 'Presentations Generated', color: '#6366f1' },
  { value: 25, suffix: 'k+', label: 'Slides Created', color: '#22d3ee' },
  { value: 99, suffix: '%', label: 'Positive Feedback', color: '#10b981' },
  { value: 8, suffix: '', label: 'Presentation Styles', color: '#8b5cf6' },
  { value: 10, suffix: 'x', label: 'Faster than Manual', color: '#f59e0b' },
  { value: 3, suffix: '', label: 'AI Models Powering It', color: '#ec4899' },
]

function Counter({ value, suffix, color }: { value: number; suffix: string; color: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setCount(value); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-extrabold" style={{ color }}>
      {count}{suffix}
    </div>
  )
}

export default function Stats() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Trusted Worldwide</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Numbers That <span className="gradient-text">Speak</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className="glass rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ border: `1px solid ${stat.color}20` }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 100%, ${stat.color}08, transparent 70%)` }}
              />
              <Counter value={stat.value} suffix={stat.suffix} color={stat.color} />
              <p className="text-white/50 mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-white/30 text-sm"
        >
          Powered by <span className="text-indigo-400 font-semibold">Google Gemini AI</span> +{' '}
          <span className="text-cyan-400 font-semibold">DALL·E 3</span>
        </motion.div>
      </div>
    </section>
  )
}

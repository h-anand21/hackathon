import { motion } from 'framer-motion'
import { FileText, BrainCog, Image } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Describe Your Topic',
    desc: 'Type your topic, paste your notes, or upload a document. Our AI understands context, tone, and depth.',
    color: '#6366f1',
  },
  {
    number: '02',
    icon: BrainCog,
    title: 'Gemini AI Writes It',
    desc: 'Google Gemini AI generates structured slide content with titles, bullets, speaker notes and flow.',
    color: '#8b5cf6',
  },
  {
    number: '03',
    icon: Image,
    title: 'Images Auto-Generated',
    desc: 'DALL·E 3 creates custom, context-aware illustrations for every slide. No stock photos ever.',
    color: '#22d3ee',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Three Steps to a{' '}
            <span className="gradient-text">Perfect Presentation</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            No design skills. No writer's block. No wasted hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass rounded-3xl p-8 relative overflow-hidden group cursor-default"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Background number */}
                <div
                  className="absolute top-4 right-4 text-7xl font-extrabold leading-none select-none"
                  style={{ color: `${step.color}10` }}
                >
                  {step.number}
                </div>

                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${step.color}10, transparent 70%)` }}
                />

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}
                >
                  <Icon size={24} style={{ color: step.color }} />
                </div>

                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: step.color }}
                >
                  Step {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

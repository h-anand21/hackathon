import { motion } from 'framer-motion'
import { FileText, BrainCog, Image, Download, CheckCircle, ArrowDown } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    label: 'You Type a Prompt',
    desc: '"Create a 10-slide presentation on Machine Learning"',
    color: '#6366f1',
  },
  {
    icon: BrainCog,
    label: 'Gemini AI Thinks & Plans',
    desc: 'Structures your presentation with titles, bullets, and speaker notes',
    color: '#8b5cf6',
  },
  {
    icon: Image,
    label: 'DALL·E Generates Images',
    desc: 'Custom AI illustrations created for every single slide',
    color: '#22d3ee',
  },
  {
    icon: CheckCircle,
    label: 'Presentation Ready',
    desc: 'Complete, beautiful slide deck ready in under 30 seconds',
    color: '#10b981',
  },
  {
    icon: Download,
    label: 'Download PPTX / PDF',
    desc: 'Export and present anywhere — Google Slides, PowerPoint, PDF',
    color: '#f59e0b',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AIFlow() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            How AI Generates Your{' '}
            <span className="gradient-text">Presentation</span>
          </h2>
          <p className="text-white/50 text-lg">From a single prompt to a complete deck in seconds</p>
        </motion.div>

        {/* Flow steps */}
        <div className="flex flex-col items-center gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex flex-col items-center w-full">
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  className="w-full glass rounded-2xl p-5 flex items-start gap-4 glow-border hover:border-indigo-500/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: step.color }}
                      >
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{step.label}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.3 }}
                    className="flex flex-col items-center my-1"
                  >
                    <div
                      className="w-0.5 h-6"
                      style={{ background: `linear-gradient(to bottom, ${step.color}, ${steps[i + 1].color})` }}
                    />
                    <ArrowDown size={14} style={{ color: steps[i + 1].color }} />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

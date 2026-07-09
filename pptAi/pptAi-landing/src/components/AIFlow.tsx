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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AIFlow() {
  return (
    <section id="aiflow" className="py-24 sm:py-32 px-6 bg-white relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Generation Flow</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How AI Generates Your <span className="text-indigo-600">Presentation</span>
          </h2>
          <p className="text-gray-600 text-lg">From a single prompt to a complete deck in seconds</p>
        </motion.div>

        <div className="flex flex-col items-center gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex flex-col items-center w-full relative">
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover={{ scale: 1.03, y: -2, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
                  className="w-full bg-white rounded-2xl p-5 flex items-start gap-4 ring-1 ring-gray-200 shadow-sm transition-all relative overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 100% 50%, ${step.color}08, transparent 70%)` }}
                  />
                  
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 transition-colors duration-300"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: step.color }}
                      >
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{step.label}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>

                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center my-2 origin-top"
                  >
                    <div
                      className="w-[2px] h-8"
                      style={{ background: `linear-gradient(to bottom, ${step.color}, ${steps[i + 1].color})` }}
                    />
                    <ArrowDown size={14} style={{ color: steps[i + 1].color, marginTop: -2 }} />
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

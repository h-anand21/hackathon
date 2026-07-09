import { motion } from 'framer-motion'
import { FileText, BrainCog, Image } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Provide a Topic',
    desc: 'Just tell us what you want to present about. Give us a topic, a document, or just a rough idea.',
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
    title: 'DALL·E 3 Illustrates It',
    desc: 'We generate beautiful, context-aware images for your slides so you never need stock photos.',
    color: '#22d3ee',
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-6 bg-white relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Workflow</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            From an idea to a fully designed presentation in three simple steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-white ring-1 ring-gray-200 shadow-sm flex items-center justify-center mb-6 relative z-10 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at center, ${step.color}15, transparent 70%)` }}
                  />
                  <Icon size={32} style={{ color: step.color }} className="relative z-10" />
                </motion.div>

                <div className="text-gray-300 text-6xl font-black absolute -top-8 -left-4 opacity-30 select-none z-0">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-xs">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

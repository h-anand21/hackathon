import { motion } from 'framer-motion'
import {
  Sparkles, Image, Zap, Layout, RefreshCw, Palette,
  Mic, Download, Users, Pencil, Cloud, Shield
} from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'AI Generated Slides', desc: 'Gemini AI writes professional, structured content for every slide automatically.', color: '#6366f1' },
  { icon: Image, title: 'Custom AI Images', desc: 'DALL·E 3 generates context-aware illustrations — no stock photos ever.', color: '#22d3ee' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Full 10-slide presentation with images ready in under 30 seconds.', color: '#f59e0b' },
  { icon: Layout, title: 'Pro Templates', desc: '8+ premium presentation themes designed by experts.', color: '#8b5cf6' },
  { icon: RefreshCw, title: 'Regenerate Instantly', desc: 'Not happy with a slide? Regenerate individual slides with one click.', color: '#10b981' },
  { icon: Palette, title: 'Multiple Themes', desc: 'Choose from Minimal, Bold, Professional, Visual and more styles.', color: '#ec4899' },
  { icon: Mic, title: 'Speaker Notes', desc: 'AI writes detailed speaker notes for every slide automatically.', color: '#6366f1' },
  { icon: Download, title: 'Export PPTX', desc: 'Download as PowerPoint file, ready to present anywhere.', color: '#22d3ee' },
  { icon: Users, title: 'Team Collab', desc: 'Share presentations with your team and collaborate in real-time.', color: '#f59e0b' },
  { icon: Pencil, title: 'Realtime Editing', desc: 'Edit any slide, title, or bullet after generation seamlessly.', color: '#8b5cf6' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'All presentations saved to your account, accessible anywhere.', color: '#10b981' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and never shared. You own your content.', color: '#ec4899' },
]

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 px-6 bg-gray-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Toolkit</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
            Professional presentations powered entirely by AI. No design skills required.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
                }}
                className="bg-white rounded-2xl p-6 group cursor-default relative overflow-hidden ring-1 ring-gray-200 shadow-sm transition-all duration-300"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${feature.color}10, transparent 70%)` }}
                />
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={18} style={{ color: feature.color }} />
                </motion.div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

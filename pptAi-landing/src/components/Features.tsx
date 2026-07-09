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
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Professional presentations powered entirely by AI. No design skills required.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, y: -3 }}
                className="glass rounded-2xl p-6 group cursor-default relative overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}15, transparent 70%)` }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={18} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

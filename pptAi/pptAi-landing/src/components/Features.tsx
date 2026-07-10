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

const getIconAnimation = (title: string) => {
  switch (title) {
    case 'AI Generated Slides': return { rotate: [0, 15, -15, 0], scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Custom AI Images': return { y: [0, -4, 0], opacity: [1, 0.6, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Lightning Fast': return { x: [-2, 2, -2, 2, 0], rotate: [0, -10, 10, 0], transition: { repeat: Infinity, duration: 0.6 } }
    case 'Pro Templates': return { rotateY: [0, 180, 360], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
    case 'Regenerate Instantly': return { rotate: [0, 360], transition: { repeat: Infinity, duration: 1.2, ease: "linear" } }
    case 'Multiple Themes': return { rotate: [0, -15, 15, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Speaker Notes': return { scaleY: [1, 1.3, 0.8, 1], transition: { repeat: Infinity, duration: 1 } }
    case 'Export PPTX': return { y: [0, 6, 0], transition: { repeat: Infinity, duration: 1 } }
    case 'Team Collab': return { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Realtime Editing': return { rotate: [0, -25, 10, 0], transition: { repeat: Infinity, duration: 1.2 } }
    case 'Cloud Storage': return { y: [0, -4, 0], x: [0, 2, -2, 0], transition: { repeat: Infinity, duration: 2 } }
    case 'Secure & Private': return { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5 } }
    default: return { scale: 1.1 }
  }
}

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 px-6 relative overflow-hidden">
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
                initial="idle"
                whileInView="idle"
                whileHover="hover"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  idle: { opacity: 0, y: 40, scale: 0.95 },
                  hover: { 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
                  }
                }}
                onViewportEnter={(e) => {
                  // Manually trigger the entry animation since we hijacked initial/whileInView
                  e?.target.animate(
                    [{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
                    { duration: 600, delay: (i % 4) * 100, fill: 'forwards', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                  )
                }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 group cursor-default relative overflow-hidden ring-1 ring-white/50 shadow-sm transition-all duration-300"
              >
                {/* Hand-drawn animated red checkmark */}
                <svg className="absolute top-5 right-5 w-7 h-7 text-[#dc2626] opacity-0 group-hover:opacity-100 drop-shadow-sm pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <motion.path 
                    variants={{
                      idle: { pathLength: 0 },
                      hover: { pathLength: 1, transition: { duration: 0.4, ease: "easeOut" } }
                    }}
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4.5 12.5c3 2 4.5 4.5 4.5 4.5s5.5-9 11-12.5"
                  />
                </svg>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${feature.color}10, transparent 70%)` }}
                />
                <motion.div
                  variants={{
                    idle: { scale: 1, rotate: 0, x: 0, y: 0, rotateY: 0 },
                    hover: getIconAnimation(feature.title)
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
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

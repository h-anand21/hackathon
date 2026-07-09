import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  { name: 'Priya Sharma', role: 'B.Tech CSE, IIT Delhi', text: 'Made my entire final year project presentation in 2 minutes. The AI images are insane!', rating: 5, color: '#6366f1' },
  { name: 'Rahul Gupta', role: 'MBA Student, IIM Bangalore', text: 'Used pptAI for my business strategy deck. My professor thought I hired a designer.', rating: 5, color: '#22d3ee' },
  { name: 'Ananya Verma', role: 'Data Science Intern', text: 'Generated a technical ML presentation with proper diagrams and content. Literally 30 seconds.', rating: 5, color: '#8b5cf6' },
  { name: 'Arjun Singh', role: 'Startup Founder', text: 'Used it for our investor pitch deck. The visual quality is comparable to premium tools.', rating: 5, color: '#10b981' },
  { name: 'Meera Nair', role: 'College Professor', text: 'I make all my lecture slides with pptAI now. Saves me hours every week.', rating: 5, color: '#f59e0b' },
  { name: 'Dev Patel', role: 'Corporate Trainer', text: 'The speaker notes feature alone is worth it. AI writes notes that I can actually use.', rating: 5, color: '#ec4899' },
  { name: 'Sneha Joshi', role: 'HR Manager', text: 'Onboarding presentations, policy decks — pptAI handles everything instantly.', rating: 5, color: '#6366f1' },
  { name: 'Vikram Reddy', role: 'Engineering Manager', text: 'My team uses it for all technical presentations. The content quality is impressive.', rating: 5, color: '#22d3ee' },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div
      className="glass rounded-2xl p-6 w-72 shrink-0 mr-5"
      style={{ border: `1px solid ${t.color}20` }}
    >
      <div className="flex gap-0.5 mb-3">
        {Array(t.rating).fill(0).map((_, i) => (
          <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
        >
          {t.name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{t.name}</div>
          <div className="text-xs text-white/40">{t.role}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const doubled = [...testimonials, ...testimonials]

  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            What People Are <span className="gradient-text">Saying</span>
          </h2>
        </motion.div>
      </div>

      {/* Row 1 — left */}
      <div className="relative mb-5 overflow-hidden">
        <div
          className="flex marquee-track"
          style={{ width: `${doubled.length * (288 + 20)}px` }}
        >
          {doubled.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2 — right (reverse) */}
      <div className="relative overflow-hidden">
        <div
          className="flex marquee-track"
          style={{
            width: `${doubled.length * (288 + 20)}px`,
            animationDirection: 'reverse',
            animationDuration: '35s',
          }}
        >
          {[...doubled].reverse().map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

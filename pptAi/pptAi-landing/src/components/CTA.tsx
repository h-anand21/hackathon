import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

export default function CTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-16 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(34,211,238,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          {/* Glow blobs inside */}
          <div
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-indigo-300 mb-6"
            >
              <Sparkles size={14} /> Powered by Gemini AI + DALL·E 3
            </motion.div>

            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
              Stop Wasting Hours on{' '}
              <span className="gradient-text">PowerPoint.</span>
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Generate your entire presentation in seconds. Free forever.
              AI writes, designs, and illustrates — you just present.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(99,102,241,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4 no-underline"
              >
                Generate My Presentation <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href={`${APP_URL}/sign-in`}
                whileHover={{ scale: 1.03 }}
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4 no-underline"
              >
                Sign In Free
              </motion.a>
            </div>

            <p className="text-white/30 text-sm mt-6">
              No credit card required • Free plan available • Ready in 30 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Target, Users, Zap, Award } from 'lucide-react'

export default function About() {
  return (
    <main className="relative z-10 min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center mb-16"
      >
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Our Mission</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Redefining How the World Presents Ideas
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          At pptAI, we believe that great ideas shouldn't be held back by tedious formatting and slide design. We are a team of AI engineers and designers building the next generation of productivity tools.
        </p>
      </motion.div>

      {/* Stats/Highlight Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
      >
        {[
          { label: "Presentations Generated", value: "1M+" },
          { label: "Hours Saved", value: "500k+" },
          { label: "Happy Users", value: "50k+" },
          { label: "Uptime", value: "99.9%" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
            <h3 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h3>
            <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Values Section */}
      <div className="max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-slate-900 mb-4">Our Core Values</h2>
          <p className="text-slate-600">The principles that guide our product and team.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Speed is a Feature</h3>
              <p className="text-slate-600 leading-relaxed">
                We optimize for speed at every level—from generating your slides in seconds to ensuring the web app feels instantly responsive.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Laser Focus on Design</h3>
              <p className="text-slate-600 leading-relaxed">
                We believe AI shouldn't just create content, it should create beautiful content. Every layout generated adheres to top-tier design principles.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">User-Centric Building</h3>
              <p className="text-slate-600 leading-relaxed">
                We build in public and iterate constantly based on feedback from our community, ensuring we solve real workflow problems.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Highest Quality Standard</h3>
              <p className="text-slate-600 leading-relaxed">
                Good enough is never enough. We fine-tune our models and push our infrastructure to deliver the most accurate and high-quality presentations.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

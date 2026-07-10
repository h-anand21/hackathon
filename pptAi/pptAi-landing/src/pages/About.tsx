import { motion } from 'framer-motion'
import { Sparkles, BrainCircuit, Wand2, Blocks, ArrowRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

export default function About() {
  return (
    <main className="relative z-10 min-h-screen pt-32 pb-24 px-6 flex flex-col items-center overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full text-center mb-24 relative"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 font-bold text-xs uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-4 h-4" /> The Story of pptAI
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Brain</span> behind your Next Presentation
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          pptAI is a fresh startup with a single, massive goal: eliminating the hours spent staring at a blank slide. We combine cutting-edge language models with dynamic layout algorithms to turn text into beautiful decks instantly.
        </p>
      </motion.div>

      {/* The Problem vs Solution */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-32"
      >
        <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 sm:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-bold text-slate-400 mb-4 uppercase tracking-wider">The Old Way</h3>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug mb-8">
            Hours of searching for templates, fighting with formatting, and copying text.
          </p>
          <ul className="space-y-4 text-slate-500 font-medium">
            <li className="flex items-center gap-3">❌ Blank canvas syndrome</li>
            <li className="flex items-center gap-3">❌ Misaligned text boxes</li>
            <li className="flex items-center gap-3">❌ Generic stock images</li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-[2.5rem] p-10 sm:p-12 relative overflow-hidden group shadow-2xl shadow-blue-500/20 text-white">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-bold text-blue-100 mb-4 uppercase tracking-wider">The pptAI Way</h3>
          <p className="text-2xl sm:text-3xl font-bold leading-snug mb-8">
            Type a topic. Let AI generate the content, structure, and design in seconds.
          </p>
          <ul className="space-y-4 text-blue-50 font-medium">
            <li className="flex items-center gap-3">✅ Gemini-powered logical structures</li>
            <li className="flex items-center gap-3">✅ DALL-E 3 generated custom visuals</li>
            <li className="flex items-center gap-3">✅ Auto-formatting & Smart Layouts</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* App Architecture / How it works */}
      <div className="max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-black text-slate-900 mb-4">Under the Hood</h2>
          <p className="text-slate-600">A powerful stack designed exclusively for generation speed.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
              <BrainCircuit className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Cognitive Engine</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              We leverage large language models to understand your intent, break it down into logical chapters, and write compelling slide bullet points.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mb-6 border border-sky-100">
              <Blocks className="w-7 h-7 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic Layouts</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Our custom React engine maps the generated content to the perfect visual hierarchy, calculating spacing and font sizes dynamically.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
              <Wand2 className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Visual Synthesis</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              No more boring stock photos. The app contextually queries image generators to create distinct, on-brand graphics tailored perfectly for the slide.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

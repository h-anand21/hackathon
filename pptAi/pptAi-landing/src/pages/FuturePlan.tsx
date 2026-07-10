import { motion } from 'framer-motion'
import { Smartphone, Sparkles, Zap, ArrowRight, Code2 } from 'lucide-react'

export default function FuturePlan() {
  return (
    <main className="relative z-10 min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-center mb-16"
      >
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-3">Roadmap</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          What's next for pptAI?
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          We're constantly pushing the boundaries of what's possible with generative UI and presentations. Here is a sneak peek into our exciting future plans.
        </p>
      </motion.div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        {/* Mobile App Highlight */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center gap-10"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 font-bold text-[10px] tracking-widest uppercase mb-6">
              <Sparkles className="w-3 h-3" /> Coming in Q4
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              pptAI Mobile App
            </h2>
            <p className="text-blue-200/80 leading-relaxed mb-8 text-sm sm:text-base">
              Generate, edit, and present directly from your pocket. The upcoming mobile application will sync perfectly with your web dashboard, allowing you to generate last-minute pitch decks while on the go.
            </p>
            <ul className="flex flex-col gap-3 text-white text-sm font-medium mb-8">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/> iOS & Android Support</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/> Native presentation remote</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/> Offline viewing & caching</li>
            </ul>
            <button className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2">
              Join the Waitlist <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Phone Mockup Graphic */}
          <div className="w-64 h-96 shrink-0 relative z-10 perspective-[1000px] hidden sm:block">
            <motion.div 
              animate={{ rotateY: [-5, 5, -5], y: [-10, 10, -10] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-slate-800 rounded-[2.5rem] border-[6px] border-slate-700 shadow-2xl p-4 flex flex-col gap-4 relative overflow-hidden transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-700 rounded-b-xl z-20" />
              {/* Fake UI */}
              <div className="w-full h-24 bg-blue-500/20 rounded-2xl mt-4 border border-blue-500/30 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-400" />
              </div>
              <div className="w-3/4 h-4 bg-slate-600 rounded mt-2" />
              <div className="w-1/2 h-3 bg-slate-600 rounded" />
              
              <div className="flex-1 mt-4 flex flex-col gap-3">
                <div className="w-full h-12 bg-slate-700/50 rounded-xl" />
                <div className="w-full h-12 bg-slate-700/50 rounded-xl" />
                <div className="w-full h-12 bg-slate-700/50 rounded-xl" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Other Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-sky-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Live Collaboration</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Multi-player editing is on the horizon. Soon, you and your team will be able to edit generated slides simultaneously, leave comments, and co-author presentations in real-time.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
        >
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
            <Code2 className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Open Source Core</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            We believe in building in public. The core engine of pptAI is open source and available for the community to contribute to and learn from.
          </p>
          <a href="https://github.com/h-anand21/hackathon/tree/main/pptAi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-sm hover:underline">
            View on GitHub <ArrowRight className="w-3 h-3" />
          </a>
        </motion.div>

      </div>
    </main>
  )
}

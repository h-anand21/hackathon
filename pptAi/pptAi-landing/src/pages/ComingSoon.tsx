import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ComingSoon() {
  return (
    <main className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center px-6 pt-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Coming Soon</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We are currently working hard on this page. It will be available shortly!
        </p>
        
        <Link 
          to="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </main>
  )
}

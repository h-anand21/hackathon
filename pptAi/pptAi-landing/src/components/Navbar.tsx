import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import Logo from './Logo'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4 sm:py-5"
    >
      <a href="/" className="text-gray-900 flex items-center gap-2 group">
        <Logo className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
        <span className="font-semibold text-lg tracking-tight">pptAI</span>
      </a>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="flex items-center gap-1 text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">
          Toolkit <ChevronDown className="w-3.5 h-3.5" />
        </a>
        <a href="#how-it-works" className="text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">Workflow</a>
        <a href="#aiflow" className="text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">AI Generation</a>
      </div>

      <div className="flex items-center gap-4">
        <motion.a 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={APP_URL} 
          className="hidden sm:inline-flex bg-gray-900 text-white text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-gray-800 shadow-sm"
        >
          Get Started
        </motion.a>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-900/10 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-gray-200 px-5 py-3 shadow-xl z-50 flex flex-col"
          >
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-[15px] text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3 font-medium">Toolkit</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-[15px] text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3 font-medium">Workflow</a>
            <a href="#aiflow" onClick={() => setMobileOpen(false)} className="text-[15px] text-gray-700 hover:text-gray-900 py-3 font-medium border-b border-gray-200">AI Generation</a>
            <a href={APP_URL} className="text-[15px] text-gray-900 hover:text-black py-3 font-medium">Get Started</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

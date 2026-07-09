import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="animate-fade-down relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4 sm:py-5">
      <a href="/" className="text-gray-900 flex items-center gap-2">
        <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-semibold text-lg tracking-tight">pptAI</span>
      </a>

      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="flex items-center gap-1 text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">
          Toolkit <ChevronDown className="w-3.5 h-3.5" />
        </a>
        <a href="#" className="text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">Plans</a>
        <a href="#" className="text-[13px] text-gray-700 hover:text-gray-900 font-medium transition-colors">News</a>
      </div>

      <div className="flex items-center gap-4">
        <a href="#" className="hidden sm:inline-flex bg-gray-900 text-white text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-gray-800 transition-colors">
          Get Started
        </a>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-900/10 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200 px-5 py-3 animate-fade-up shadow-xl z-50 flex flex-col">
          <a href="#" className="text-[15px] text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3 font-medium">Toolkit</a>
          <a href="#" className="text-[15px] text-gray-700 hover:text-gray-900 border-b border-gray-200 py-3 font-medium">Plans</a>
          <a href="#" className="text-[15px] text-gray-700 hover:text-gray-900 py-3 font-medium border-b border-gray-200">News</a>
          <a href="#" className="text-[15px] text-gray-900 hover:text-black py-3 font-medium">Get Started</a>
        </div>
      )}
    </nav>
  )
}

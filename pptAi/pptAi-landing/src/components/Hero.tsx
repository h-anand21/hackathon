// @ts-nocheck
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import DashboardMockup from './DashboardMockup'
import DemoOverlay from './DemoOverlay'

const PLACEHOLDERS = [
  "A pitch deck for a new SaaS product...",
  "A marketing strategy for a coffee shop...",
  "An 8-slide presentation on AI...",
  "A quarterly business review for Q3..."
]

export default function Hero() {
  const { scrollY } = useScroll()
  const yContent = useTransform(scrollY, [0, 1000], [0, 150])
  const grassOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const [inputValue, setInputValue] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  useEffect(() => {
    const currentText = PLACEHOLDERS[placeholderIndex]
    
    let timer: NodeJS.Timeout
    if (!isDeleting && charIndex < currentText.length) {
      timer = setTimeout(() => setCharIndex(c => c + 1), 60)
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => setCharIndex(c => c - 1), 30)
    } else if (!isDeleting && charIndex === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }

    setPlaceholder(currentText.substring(0, charIndex))

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, placeholderIndex])

  const handleGenerate = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setIsDemoOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate()
    }
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden flex flex-col pt-16 sm:pt-0">
      
      <DemoOverlay 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
        prompt={inputValue} 
      />

      <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Hero Content with Parallax */}
      <motion.div 
        style={{ y: yContent }}
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center shrink-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/60 shadow-sm mb-6 sm:mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-800 tracking-wide uppercase">AI Presentation Generator</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-[40px] leading-[1.1] sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 max-w-4xl"
        >
          Create presentations.<br/>Effortlessly.
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl mt-8 sm:mt-12"
        >
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative flex items-center w-full h-14 bg-white/80 backdrop-blur-xl rounded-full border border-gray-200 shadow-sm overflow-hidden px-2 transition-all hover:shadow-[0_10px_40px_rgba(37,99,235,0.12)] hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20"
          >
            {inputValue === '' && (
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[15px] text-gray-400">
                {placeholder}
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-[1.5px] h-4 bg-blue-500 ml-0.5 inline-block"
                />
              </div>
            )}
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 text-gray-900 text-[15px] outline-none bg-transparent h-full relative z-10"
            />
            <div className="relative z-10 flex items-center justify-center">
              {/* Pulsing ring animation */}
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500 rounded-full"
              />
              <button 
                onClick={handleGenerate}
                className="relative flex-shrink-0 w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowUp className="w-4 h-4" />
                </motion.div>
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-6 text-[15px] sm:text-base text-gray-500 max-w-lg"
        >
          Ship slides that answer actual requirements<br className="hidden sm:block"/>
          — and look stunning with <span className="font-semibold text-gray-800">pptAI</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-4 mt-8"
        >
          <a 
            href={import.meta.env.VITE_APP_URL || 'http://localhost:3000'}
            className="px-6 py-2.5 rounded-full bg-[#0F172A] text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
          >
            Try It Free
          </a>
          <button className="px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-md text-gray-700 text-sm font-medium hover:bg-white hover:text-gray-900 transition-colors border border-gray-200/60 shadow-sm">
            Watch Demo
          </button>
        </motion.div>
      </motion.div>

      <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Dashboard Mockup - Floating Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 pb-16"
      >
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [-0.5, 0.5, -0.5] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        >
          <DashboardMockup />
        </motion.div>
      </motion.div>

      {/* Grass Overlay */}
      <motion.img 
        style={{ opacity: grassOpacity }}
        src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png" 
        alt="" 
        className="pointer-events-none absolute bottom-[-10px] left-0 z-10 w-full select-none object-cover object-top h-[150px] sm:h-[200px] lg:h-[260px] xl:h-[300px]"
      />
    </section>
  )
}

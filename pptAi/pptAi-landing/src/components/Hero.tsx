import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, ArrowUp } from 'lucide-react'
import DashboardMockup from './DashboardMockup'
import MagneticButton from './MagneticButton'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

export default function Hero() {
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 1000], [0, 300])
  const yContent = useTransform(scrollY, [0, 1000], [0, 150])

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white flex flex-col pt-16 sm:pt-0">
      
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ 
          y: yBg,
          backgroundImage: 'url("https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85")' 
        }}
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-110"
      />

      <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Hero Content with Parallax */}
      <motion.div 
        style={{ y: yContent }}
        className="text-center flex flex-col items-center px-4 relative z-20"
      >
        <h1 className="text-gray-900 font-normal leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">
          <motion.div 
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Create presentations.
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Effortlessly.
          </motion.div>
        </h1>

        <motion.form 
          action={APP_URL} 
          method="GET"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 sm:mt-6 w-full max-w-xl relative group"
        >
          <div className="flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md ring-1 ring-gray-200 pl-5 pr-1.5 py-1.5 shadow-sm transition-shadow group-hover:shadow-md group-hover:ring-gray-300">
            <input 
              name="prompt"
              type="text" 
              placeholder="What topic do you want to present?" 
              className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 outline-none py-2"
              required
            />
            <MagneticButton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
              <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </MagneticButton>
          </div>
        </motion.form>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md"
        >
          Ship slides that answer actual requirements <br className="hidden sm:block" />
          — and look stunning with <Sparkles className="inline w-4 h-4 -mt-1 text-gray-900" /> pptAI
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton href={APP_URL} className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-md">
            Try It Free
          </MagneticButton>
          <MagneticButton href="#" className="text-gray-700 text-sm font-medium px-6 py-2.5 rounded-full ring-1 ring-gray-300 bg-white/50 backdrop-blur-sm">
            Watch Demo
          </MagneticButton>
        </motion.div>
      </motion.div>

      <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

      {/* Dashboard Mockup - Floating Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-0 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 -mb-10 sm:-mb-20 lg:-mb-32"
      >
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [-0.5, 0.5, -0.5] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        >
          <DashboardMockup />
        </motion.div>
      </motion.div>

      {/* Grass Overlay */}
      <img 
        src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png" 
        alt="" 
        className="pointer-events-none absolute bottom-0 left-0 z-10 w-full select-none object-cover h-[20vh] sm:h-auto"
      />
    </section>
  )
}

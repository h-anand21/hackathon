import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, ArrowRight, X, LayoutTemplate, FileText, CheckCircle2 } from 'lucide-react'

interface DemoOverlayProps {
  isOpen: boolean
  onClose: () => void
  prompt: string
}

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

export default function DemoOverlay({ isOpen, onClose, prompt }: DemoOverlayProps) {
  const [step, setStep] = useState(0)

  // Step 0: AI Analysis (0-3s)
  // Step 1: Slide Structuring (3-6s)
  // Step 2: Visuals & Layout (6-9s)
  // Step 3: Complete (9s+)

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
      return
    }

    const timer1 = setTimeout(() => setStep(1), 3000)
    const timer2 = setTimeout(() => setStep(2), 6000)
    const timer3 = setTimeout(() => setStep(3), 9000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isOpen])

  // Don't render anything if not open
  if (!isOpen) return null

  const handleTryNow = () => {
    const targetUrl = new URL(APP_URL)
    if (prompt) {
      targetUrl.searchParams.set('prompt', prompt)
    }
    window.location.href = targetUrl.toString()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 sm:p-8"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-50 w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col h-[650px] max-h-[90vh] border border-slate-200/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 tracking-tight">pptAI Generator</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden">
            
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Steps Container */}
            <div className="relative w-full max-w-2xl z-10 flex flex-col items-center">
              
              <AnimatePresence mode="wait">
                {/* STEP 0: AI Analysis */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Analyzing Request</h3>
                    
                    {/* Realistic Analysis Terminal */}
                    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                      <div className="text-sm font-semibold text-slate-800 mb-4 pb-4 border-b border-slate-100">
                        Prompt: <span className="font-normal text-slate-600 italic">"{prompt || 'Pitch deck for AI startup'}"</span>
                      </div>
                      
                      <div className="space-y-4 font-mono text-xs">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> <span>Extracting key topics...</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="flex items-center gap-3 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> <span>Determining audience persona...</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }} className="flex items-center gap-3 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> <span>Calculating optimal slide count (10 slides)</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} className="flex items-center gap-3 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" /> <span>Generating narrative structure...</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: Slide Structuring */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                      <FileText className="w-8 h-8 text-sky-600" />
                      <motion.div 
                        className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Drafting Slide Content</h3>
                    
                    {/* Highly Realistic Sequential Slide Generation */}
                    <div className="w-full flex gap-4 overflow-hidden py-2 px-1 relative">
                      
                      {/* Slide 1: Introduction */}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="flex-1 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-200 h-40 p-4 flex flex-col relative overflow-hidden"
                      >
                        <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          Slide 1 <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 h-3 bg-sky-400 inline-block" />
                        </div>
                        
                        {/* Typing Title */}
                        <motion.div 
                          className="h-3 bg-slate-800 rounded-sm mb-4"
                          initial={{ width: 0 }}
                          animate={{ width: "70%" }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        />
                        
                        {/* Typing Bullets sequentially */}
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <motion.div initial={{ width: 0 }} animate={{ width: "90%" }} transition={{ delay: 0.7, duration: 0.3 }} className="h-2 bg-slate-200 rounded-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ delay: 1.1, duration: 0.3 }} className="h-2 bg-slate-200 rounded-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ delay: 1.5, duration: 0.3 }} className="h-2 bg-slate-200 rounded-sm" />
                          </div>
                        </div>
                        
                        {/* Done overlay for slide 1 */}
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ delay: 1.8 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                      </motion.div>

                      {/* Slide 2: The Problem */}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8, duration: 0.5, type: "spring" }}
                        className="flex-1 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-200 h-40 p-4 flex flex-col relative overflow-hidden opacity-50"
                      >
                        <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          Slide 2 <motion.div animate={{ opacity: [1, 0] }} transition={{ delay: 1.8, repeat: Infinity, duration: 0.8 }} className="w-1 h-3 bg-sky-400 inline-block" />
                        </div>
                        
                        <motion.div 
                          className="h-3 bg-slate-800 rounded-sm mb-4"
                          initial={{ width: 0 }}
                          animate={{ width: "50%" }}
                          transition={{ delay: 2.0, duration: 0.3 }}
                        />
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3 }} className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 2.4, duration: 0.3 }} className="h-2 bg-slate-200 rounded-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.7 }} className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ delay: 2.8, duration: 0.3 }} className="h-2 bg-slate-200 rounded-sm" />
                          </div>
                        </div>
                      </motion.div>
                      
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Visuals & Layouts */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                      <LayoutTemplate className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Designing Layouts</h3>
                    
                    {/* Realistic Layout Transformation */}
                    <div className="w-full max-w-md h-56 bg-white rounded-xl shadow-md border border-slate-200 p-2 relative overflow-hidden">
                       
                       {/* Pre-transformation Wireframe */}
                       <motion.div 
                         className="absolute inset-2 border-2 border-dashed border-slate-300 rounded-lg p-4 flex gap-4"
                         initial={{ opacity: 1 }}
                         animate={{ opacity: 0 }}
                         transition={{ delay: 1.5, duration: 0.3 }}
                       >
                         <div className="flex-1 flex flex-col gap-3">
                           <div className="w-3/4 h-6 bg-slate-200 rounded" />
                           <div className="w-full h-2 bg-slate-100 rounded mt-2" />
                           <div className="w-5/6 h-2 bg-slate-100 rounded" />
                         </div>
                         <div className="w-1/3 h-full bg-slate-100 rounded flex items-center justify-center text-slate-400">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         </div>
                       </motion.div>

                       {/* Post-transformation Beautiful Slide */}
                       <motion.div 
                         className="absolute inset-2 bg-slate-900 rounded-lg p-6 flex gap-6 overflow-hidden"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
                       >
                         {/* Glowing background accent */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 blur-2xl rounded-full" />
                         
                         <div className="flex-1 flex flex-col justify-center relative z-10">
                           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.8 }} className="w-12 h-1 bg-blue-500 mb-4" />
                           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.9 }} className="w-full h-6 bg-white rounded-sm mb-3" />
                           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.0 }} className="w-3/4 h-6 bg-white rounded-sm" />
                         </div>
                         
                         <motion.div 
                           initial={{ x: 20, opacity: 0 }} 
                           animate={{ x: 0, opacity: 1 }} 
                           transition={{ delay: 2.1 }}
                           className="w-[40%] h-full rounded-md overflow-hidden relative"
                         >
                           <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="" />
                         </motion.div>
                       </motion.div>
                       
                       {/* Scanner line effect */}
                       <motion.div 
                         className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"
                         initial={{ left: "0%", opacity: 0 }}
                         animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                         transition={{ delay: 1.2, duration: 0.8, ease: "linear" }}
                       />
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Complete & CTA */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                      className="w-24 h-24 bg-white text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10 border border-emerald-100"
                    >
                      <CheckCircle2 className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Your Deck is Ready!</h3>
                    <p className="text-slate-500 mb-10 max-w-md text-lg">
                      We've analyzed your prompt, structured the narrative, and designed a beautiful presentation.
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTryNow}
                      className="group relative px-10 py-5 bg-[#0F172A] text-white rounded-full font-bold text-lg shadow-2xl shadow-slate-900/20 overflow-hidden flex items-center gap-3 border border-slate-800"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">Sign In to Edit & Download</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
          
          {/* Progress Bar Bottom */}
          <div className="h-1.5 w-full bg-slate-100 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: step === 0 ? "25%" : step === 1 ? "50%" : step === 2 ? "75%" : "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

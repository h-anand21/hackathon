import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BrainCog, Image, Download, CheckCircle, ArrowDown, ChevronUp, ChevronDown, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

const steps = [
  {
    icon: FileText,
    label: 'You Type a Prompt',
    desc: '"Create a 10-slide presentation on Machine Learning"',
    color: '#6366f1',
  },
  {
    icon: BrainCog,
    label: 'Gemini AI Thinks & Plans',
    desc: 'Structures your presentation with titles, bullets, and speaker notes',
    color: '#8b5cf6',
  },
  {
    icon: Image,
    label: 'DALL·E Generates Images',
    desc: 'Custom AI illustrations created for every single slide',
    color: '#22d3ee',
  },
  {
    icon: CheckCircle,
    label: 'Presentation Ready',
    desc: 'Complete, beautiful slide deck ready in under 30 seconds',
    color: '#10b981',
  },
  {
    icon: Download,
    label: 'Download PPTX / PDF',
    desc: 'Export and present anywhere — Google Slides, PowerPoint, PDF',
    color: '#f59e0b',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

const PROMPTS = [
  "Create a 10-slide presentation on Machine Learning",
  "Design a business pitch deck for a SaaS startup",
  "Generate a marketing strategy presentation for Q3",
  "History of space exploration for B.Tech students"
]

const GeminiThinking = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= 4) return 0
        return s + 1
      })
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  const logs = [
    "Analyzing prompt context...",
    "Extracting key topics & structure...",
    "Drafting titles and bullet points...",
    "Generating speaker notes..."
  ]

  return (
    <div className="mt-3 bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0] font-mono text-[11px] shadow-inner">
      <div className="flex flex-col gap-2">
        {logs.map((log, index) => {
          const isActive = step === index
          const isDone = step > index
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isActive || isDone ? 1 : 0, x: isActive || isDone ? 0 : -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5 h-4"
            >
              {isActive ? (
                <Loader2 className="w-3 h-3 animate-spin text-purple-500 shrink-0" />
              ) : isDone ? (
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              ) : (
                <div className="w-3 h-3 shrink-0" />
              )}
              <span className={isActive ? "text-purple-600 font-medium" : isDone ? "text-slate-500" : "text-transparent"}>
                {log}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const DalleGenerating = () => {
  const [phase, setPhase] = useState(0) // 0: skeleton, 1: generating, 2: complete
  const [promptIdx, setPromptIdx] = useState(0)
  
  const imgData = [
    { prompt: "Cyberpunk city skyline at sunset", url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop" },
    { prompt: "Minimalist workspace isometric 3D", url: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?q=80&w=600&auto=format&fit=crop" },
    { prompt: "Abstract neural network glowing", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => {
        if (p === 2) {
          setPromptIdx(idx => (idx + 1) % imgData.length)
          return 0
        }
        return p + 1
      })
    }, 2000)
    return () => clearInterval(timer)
  }, [imgData.length])

  return (
    <div className="mt-3 bg-white rounded-xl p-3 border border-gray-200 flex flex-col gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20" />
      
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-600">DALL-E 3 Engine</span>
        <Sparkles className={`w-3.5 h-3.5 text-cyan-500 ${phase === 1 ? 'animate-spin' : ''}`} />
      </div>
      
      <div className="text-[11px] text-gray-600 italic px-2 py-1.5 font-medium bg-gray-50 rounded-md border border-gray-100 flex items-center gap-2">
        <span className="text-gray-400 font-mono text-[9px] not-italic">/imagine</span>
        <span className="truncate w-full">{imgData[promptIdx].prompt}</span>
      </div>
      
      <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')] bg-repeat flex items-center justify-center">
        
        {/* Skeleton Icon */}
        <AnimatePresence>
          {phase === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
               <Image className="w-8 h-8 text-gray-200" />
             </motion.div>
          )}
        </AnimatePresence>

        {/* Generating Phase: Real Image Wipe Reveal */}
        <motion.div 
          initial={{ height: '0%' }}
          animate={{ height: phase >= 1 ? '100%' : '0%' }}
          transition={{ duration: 1.5, ease: "linear" }}
          className="absolute top-0 left-0 right-0 overflow-hidden bg-gray-100 shadow-inner z-0"
        >
           {imgData.map((item, idx) => (
             <img 
               key={idx}
               src={item.url} 
               alt={item.prompt}
               className={`absolute top-0 left-0 w-full h-32 object-cover object-center transition-opacity duration-300 ${promptIdx === idx ? 'opacity-100' : 'opacity-0'}`} 
             />
           ))}
        </motion.div>

        {/* Scanner Laser */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-300 shadow-[0_0_15px_4px_rgba(34,211,238,0.8)] z-10"
            />
          )}
        </AnimatePresence>
        
        {/* Complete Checkmark */}
        <AnimatePresence>
          {phase === 2 && (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0, opacity: 0 }}
               className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-lg z-20 flex items-center justify-center"
             >
               <CheckCircle2 className="w-4 h-4 text-green-500" />
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const PresentationReady = () => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="w-full bg-emerald-100/50 rounded-full h-1.5 overflow-hidden">
         <motion.div 
           initial={{ width: '0%' }}
           whileInView={{ width: '100%' }}
           viewport={{ once: true }}
           transition={{ duration: 2, ease: 'easeOut' }}
           className="bg-emerald-500 h-full relative"
         >
           <motion.div 
             animate={{ x: ['-100%', '200%'] }}
             transition={{ repeat: Infinity, duration: 1.5 }}
             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
           />
         </motion.div>
      </div>
      <div className="flex justify-between w-full text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest">
         <span>Finalizing Deck</span>
         <span>100%</span>
      </div>
    </div>
  )
}

const DownloadExport = () => {
  const formats = ['PPTX', 'PDF', 'Google Slides']
  return (
    <div className="mt-3 flex gap-2">
       {formats.map((fmt, i) => (
         <motion.div 
           key={fmt}
           whileHover={{ y: -2 }}
           className="flex-1 bg-white border border-gray-100 rounded-md py-2 flex items-center justify-center text-[10px] font-semibold text-amber-700/70 shadow-sm cursor-default ring-1 ring-black/5"
         >
           <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 shadow-[0_0_5px_rgba(251,191,36,0.5)]"
           />
           {fmt}
         </motion.div>
       ))}
    </div>
  )
}

const TypewriterText = () => {
  const [promptIndex, setPromptIndex] = useState(0)
  const [targetIndex, setTargetIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Typing and Deleting logic
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (promptIndex !== targetIndex) {
      // We need to transition to a new prompt
      if (!isDeleting) {
        setIsDeleting(true)
      } else {
        if (charIndex > 0) {
          timer = setTimeout(() => setCharIndex(c => c - 1), 15) // fast delete
        } else {
          setIsDeleting(false)
          setPromptIndex(targetIndex)
        }
      }
    } else {
      // Type out the current prompt
      const currentText = PROMPTS[promptIndex]
      if (charIndex < currentText.length) {
        timer = setTimeout(() => setCharIndex(c => c + 1), 35)
      }
    }
    
    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, promptIndex, targetIndex])

  const handleNext = () => {
    if (promptIndex !== targetIndex || isDeleting) return
    setTargetIndex((prev) => (prev + 1) % PROMPTS.length)
  }

  const handlePrev = () => {
    if (promptIndex !== targetIndex || isDeleting) return
    setTargetIndex((prev) => (prev - 1 + PROMPTS.length) % PROMPTS.length)
  }

  const currentText = PROMPTS[promptIndex]
  const displayText = currentText.substring(0, charIndex)
  const isTyping = promptIndex !== targetIndex || charIndex < currentText.length

  return (
    <div className={`flex items-center gap-3 bg-white border shadow-sm rounded-lg p-3 mt-3 w-full relative transition-all duration-500 ${isTyping ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-gray-200'}`}>
      <div className="flex-1 min-h-[48px] flex items-center relative overflow-hidden pr-2">
        <span className="w-full text-gray-800 font-medium leading-relaxed italic">
          "{displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-[2px] h-[1.2em] bg-indigo-500 ml-0.5 inline-block align-middle"
          />"
        </span>
      </div>
      
      <div className="flex flex-col gap-0.5 shrink-0 bg-gray-50 rounded-md border border-gray-100 p-0.5 shadow-sm z-10 relative">
        <motion.button 
          whileTap={{ scale: 0.85, backgroundColor: '#eef2ff' }}
          onClick={handlePrev}
          title="Previous prompt"
          className="hover:bg-white p-1 rounded-sm transition-all text-indigo-400 hover:text-indigo-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)_inset] hover:shadow-sm"
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.85, backgroundColor: '#eef2ff' }}
          onClick={handleNext}
          title="Next prompt"
          className="hover:bg-white p-1 rounded-sm transition-all text-indigo-400 hover:text-indigo-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)_inset] hover:shadow-sm"
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  )
}

export default function AIFlow() {
  return (
    <section id="aiflow" className="py-24 sm:py-32 px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Generation Flow</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How AI Generates Your <span className="text-indigo-600">Presentation</span>
          </h2>
          <p className="text-gray-600 text-lg">From a single prompt to a complete deck in seconds</p>
        </motion.div>

        <div className="flex flex-col items-center gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex flex-col items-center w-full relative">
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  whileHover={{ scale: 1.03, y: -2, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
                  className="w-full bg-white/70 backdrop-blur-xl rounded-2xl p-5 flex items-start gap-4 ring-1 ring-white/50 shadow-sm transition-all relative overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 100% 50%, ${step.color}08, transparent 70%)` }}
                  />
                  
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative z-10 transition-colors duration-300"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: step.color }}
                      >
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{step.label}</h3>
                    {i === 0 ? (
                      <TypewriterText />
                    ) : i === 1 ? (
                      <>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                        <GeminiThinking />
                      </>
                    ) : i === 2 ? (
                      <>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                        <DalleGenerating />
                      </>
                    ) : i === 3 ? (
                      <>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                        <PresentationReady />
                      </>
                    ) : i === 4 ? (
                      <>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                        <DownloadExport />
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    )}
                  </div>
                </motion.div>

                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center my-2 origin-top"
                  >
                    <div
                      className="w-[2px] h-8"
                      style={{ background: `linear-gradient(to bottom, ${step.color}, ${steps[i + 1].color})` }}
                    />
                    <ArrowDown size={14} style={{ color: steps[i + 1].color, marginTop: -2 }} />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

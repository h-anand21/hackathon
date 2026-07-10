import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BrainCog, Image, Download, CheckCircle, ArrowDown, ChevronUp, ChevronDown, Loader2, CheckCircle2, Sparkles, LayoutTemplate } from 'lucide-react'
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
  const [slideIdx, setSlideIdx] = useState(0)
  
  const PPT_SLIDES = [
    {
      title: "Introduction to AI",
      img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop",
      bullets: ["What is Artificial Intelligence?", "History and evolution", "Current industry trends"]
    },
    {
      title: "Machine Learning",
      img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&auto=format&fit=crop",
      bullets: ["Supervised vs Unsupervised", "Training data sets", "Model evaluation metrics"]
    },
    {
      title: "Deep Learning",
      img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
      bullets: ["Neural Networks explained", "Backpropagation", "Real-world applications"]
    },
    {
      title: "Future of Tech",
      img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop",
      bullets: ["Ethics in AI", "Quantum computing", "Singularity theories"]
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx(s => (s + 1) % PPT_SLIDES.length)
    }, 2800) // 2.8s per slide for readability
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mt-3 bg-[#f8fafc] rounded-xl p-2.5 border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-2.5 relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          {slideIdx === PPT_SLIDES.length - 1 ? 'Finalizing Deck...' : 'Assembling Slides'}
        </span>
        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded-full border border-indigo-100">
          {slideIdx + 1} / {PPT_SLIDES.length}
        </span>
      </div>

      <div className="flex gap-2 h-[115px]">
        {/* Sidebar - Scrolling Thumbnails */}
        <div className="w-7 flex flex-col overflow-hidden relative border-r border-slate-200 pr-1.5">
           <motion.div 
             animate={{ y: -(slideIdx * 26) }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
             className="flex flex-col gap-1.5 absolute top-0 left-0 w-full"
           >
             {PPT_SLIDES.map((_, i) => (
               <div 
                 key={i}
                 className={`w-full h-5 rounded-sm transition-all duration-300 flex-shrink-0 flex items-center justify-center text-[8px] font-bold ${
                   slideIdx === i ? 'bg-indigo-500 text-white shadow-md' : 
                   slideIdx > i ? 'bg-indigo-50 border border-indigo-100 text-indigo-400' : 
                   'bg-white border border-dashed border-slate-300 text-slate-300'
                 }`}
               >
                 {i + 1}
               </div>
             ))}
           </motion.div>
        </div>
        
        {/* Main Editor View */}
        <div className="flex-1 bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden relative">
           <AnimatePresence mode="wait">
              <motion.div
                 key={slideIdx}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, position: 'absolute' }}
                 transition={{ duration: 0.2 }}
                 className="absolute inset-0 p-3 flex flex-col gap-1.5"
              >
                 {/* Real Title */}
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1, duration: 0.3 }}
                   className="text-[13px] font-extrabold text-slate-800 border-b border-slate-100 pb-1"
                 >
                   {PPT_SLIDES[slideIdx].title}
                 </motion.div>
                 
                 <div className="flex gap-3 h-full items-start mt-1">
                   {/* Real Image */}
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                     animate={{ opacity: 1, scale: 1, rotate: 0 }}
                     transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                     className="w-[45%] aspect-video bg-slate-50 rounded-md overflow-hidden relative shadow-sm border border-slate-200"
                   >
                     <img src={PPT_SLIDES[slideIdx].img} alt="slide img" className="w-full h-full object-cover" />
                     {/* Scanning effect over image */}
                     <motion.div 
                        initial={{ top: '-100%' }}
                        animate={{ top: '200%' }}
                        transition={{ duration: 1.5, ease: "linear", delay: 0.4 }}
                        className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.9)]"
                     />
                   </motion.div>
                   
                   {/* Real Bullets */}
                   <div className="flex-1 flex flex-col gap-1.5 mt-0.5">
                      {PPT_SLIDES[slideIdx].bullets.map((bullet, idx) => (
                         <motion.div 
                           key={idx}
                           initial={{ opacity: 0, x: 10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.5 + (idx * 0.15), duration: 0.3 }}
                           className="flex items-start gap-1.5"
                         >
                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span className="text-[9.5px] font-medium text-slate-600 leading-tight">
                              {bullet}
                            </span>
                         </motion.div>
                      ))}
                   </div>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
      
      {/* Global Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-1 mt-0.5 overflow-hidden">
         <motion.div 
           className="bg-indigo-500 h-full"
           animate={{ width: `${((slideIdx + 1) / PPT_SLIDES.length) * 100}%` }}
           transition={{ duration: 0.3 }}
         />
      </div>
    </div>
  )
}

const DownloadExport = () => {
  const formats = [
    { name: 'PowerPoint', icon: 'PPTX' },
    { name: 'PDF Doc', icon: 'PDF' },
    { name: 'Google', icon: 'Slides' }
  ]

  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState(0) // 0: idle/hover, 1: clicking/downloading, 2: done

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (phase === 0) {
      timer = setTimeout(() => setPhase(1), 800) // Hover for 0.8s, then click
    } else if (phase === 1) {
      timer = setTimeout(() => setPhase(2), 2000) // Download takes 2s
    } else if (phase === 2) {
      timer = setTimeout(() => {
        setPhase(0)
        setActiveIdx(prev => (prev + 1) % formats.length)
      }, 1500) // Show done for 1.5s, then move to next
    }
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <div className="mt-3 flex gap-2">
      {formats.map((fmt, i) => {
        const isActive = activeIdx === i
        const isDownloading = isActive && phase === 1
        const isDone = isActive && phase === 2

        return (
          <div 
            key={fmt.name}
            className={`flex-1 relative rounded-lg border transition-all duration-300 flex flex-col items-center justify-center py-2.5 shadow-sm overflow-hidden ${
              isActive 
                ? 'border-indigo-400 bg-indigo-50/30 shadow-[0_4px_15px_rgba(99,102,241,0.1)] z-10' 
                : 'border-slate-200 bg-white z-0'
            }`}
          >
             {/* Icon/Name */}
             <span className={`text-[11px] font-bold mb-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
               {fmt.icon}
             </span>
             
             {/* Action Area */}
             <div className="h-5 flex items-center justify-center w-full px-2.5">
                {isDownloading ? (
                   <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                     <motion.div 
                       initial={{ width: '0%' }}
                       animate={{ width: '100%' }}
                       transition={{ duration: 2, ease: 'linear' }}
                       className="bg-indigo-500 h-full relative"
                     >
                       <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                       />
                     </motion.div>
                   </div>
                ) : isDone ? (
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider"
                   >
                     <CheckCircle2 className="w-3.5 h-3.5" />
                     <span>Saved</span>
                   </motion.div>
                ) : (
                   <Download className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-300'}`} />
                )}
             </div>

             {/* Fake Cursor Overlay */}
             <AnimatePresence>
               {isActive && (
                 <motion.div
                   initial={{ opacity: 0, x: 15, y: 15 }}
                   animate={{ 
                     opacity: 1, 
                     x: 0, 
                     y: 0,
                     scale: phase === 1 ? 0.85 : 1 // click press effect
                   }}
                   exit={{ opacity: 0, x: 10, y: 10 }}
                   transition={{ duration: 0.3 }}
                   className="absolute bottom-1 right-1 z-20 pointer-events-none"
                 >
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                     <path d="M5.5 3.21V20.8C5.5 21.45 6.27 21.78 6.74 21.34L11.4 16.92L14.86 24.32C15.08 24.78 15.63 24.96 16.09 24.73L18.66 23.53C19.12 23.32 19.31 22.76 19.08 22.29L15.68 14.92H20.91C21.57 14.92 21.89 14.11 21.41 13.67L6.68 0.54C6.22 0.13 5.5 0.46 5.5 1.11V3.21Z" fill="black" stroke="white" strokeWidth="1.5"/>
                   </svg>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )
      })}
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

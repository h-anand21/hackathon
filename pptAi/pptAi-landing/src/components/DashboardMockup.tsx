import { useEffect, useRef, useState } from 'react'
import { PanelLeft, ChevronLeft, ChevronRight, Monitor, RotateCw, Share, Plus, Copy, Grid, Compass, Layers, ListTodo, Sparkles, Type, LayoutTemplate, Zap, Image as ImageIcon, Presentation, ArrowUp, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

const PROMPT_TEXT = "Create an 8-slide presentation on Artificial Intelligence for B.Tech students..."
const LOADING_STEPS = [
  { icon: Type, text: 'Analyzing prompt context...' },
  { icon: LayoutTemplate, text: 'Designing slide layout...' },
  { icon: Zap, text: 'Writing engaging content...' },
  { icon: ImageIcon, text: 'Generating AI visuals...' },
  { icon: Presentation, text: 'Finalizing presentation deck...' }
]

export default function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(521)
  const DESIGN_WIDTH = 896

  const [phase, setPhase] = useState<'idle' | 'cursor_to_gen' | 'input' | 'cursor_to_input' | 'typing' | 'cursor_to_submit' | 'loading' | 'success'>('idle')
  const [cursor, setCursor] = useState({ x: 950, y: 600, scale: 1, opacity: 0 })
  const [typedText, setTypedText] = useState('')
  const [loadingStep, setLoadingStep] = useState(-1)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          const newScale = entry.contentRect.width / DESIGN_WIDTH
          setScale(newScale)
        }
        if (entry.target === innerRef.current) {
          setHeight(entry.contentRect.height)
        }
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    if (innerRef.current) observer.observe(innerRef.current)
    return () => observer.disconnect()
  }, [])

  // Sequence Logic
  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => {
        setPhase('cursor_to_gen')
        setCursor({ x: 820, y: 75, scale: 1, opacity: 1 })
      }, 1500)
      return () => clearTimeout(t)
    }

    if (phase === 'cursor_to_gen') {
      const t = setTimeout(() => {
        setCursor(p => ({ ...p, scale: 0.85 })) // click down
        setTimeout(() => {
          setCursor(p => ({ ...p, scale: 1 })) // click up
          setPhase('input')
        }, 150)
      }, 1200)
      return () => clearTimeout(t)
    }

    if (phase === 'input') {
      const t = setTimeout(() => {
        setPhase('cursor_to_input')
        setCursor({ x: 300, y: 220, scale: 1, opacity: 1 })
      }, 500)
      return () => clearTimeout(t)
    }

    if (phase === 'cursor_to_input') {
      const t = setTimeout(() => {
        setCursor(p => ({ ...p, scale: 0.85 })) // click down
        setTimeout(() => {
          setCursor(p => ({ ...p, scale: 1 })) // click up
          setPhase('typing')
        }, 150)
      }, 800)
      return () => clearTimeout(t)
    }

    if (phase === 'typing') {
      let i = 0
      const interval = setInterval(() => {
        setTypedText(PROMPT_TEXT.slice(0, i))
        i++
        if (i > PROMPT_TEXT.length) {
          clearInterval(interval)
          setTimeout(() => setPhase('cursor_to_submit'), 600)
        }
      }, 40)
      return () => clearInterval(interval)
    }

    if (phase === 'cursor_to_submit') {
      setCursor({ x: 800, y: 260, scale: 1, opacity: 1 })
      const t = setTimeout(() => {
        setCursor(p => ({ ...p, scale: 0.85 })) // click
        setTimeout(() => {
          setCursor(p => ({ ...p, scale: 1, opacity: 0 }))
          setPhase('loading')
          setLoadingStep(0)
        }, 150)
      }, 1000)
      return () => clearTimeout(t)
    }

    if (phase === 'loading') {
      const interval = setInterval(() => {
        setLoadingStep(s => {
          if (s >= LOADING_STEPS.length - 1) {
            clearInterval(interval)
            setTimeout(() => setPhase('success'), 1000)
            return s
          }
          return s + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
    if (phase === 'success') {
      const t = setTimeout(() => {
        setPhase('idle')
        setTypedText('')
        setCursor({ x: 950, y: 600, scale: 1, opacity: 0 })
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div ref={containerRef} className="w-full relative">
      <div 
        ref={innerRef}
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          width: DESIGN_WIDTH,
        }}
        className="rounded-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left flex flex-col absolute top-0 left-0"
      >
        {/* Animated Fake Cursor */}
        <motion.div
          animate={{ x: cursor.x, y: cursor.y, scale: cursor.scale, opacity: cursor.opacity }}
          transition={{ type: 'spring', damping: 25, stiffness: 150, opacity: { duration: 0.2 } }}
          className="absolute z-[100] w-8 h-8 pointer-events-none drop-shadow-2xl"
          style={{ marginLeft: -10, marginTop: -10 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.1558 29.5699C9.79979 29.9866 9.1121 29.8398 8.9566 29.3142L2.09139 6.09633C1.94273 5.59371 2.4578 5.12781 2.94635 5.32357L27.6534 15.2234C28.1991 15.442 28.2575 16.1917 27.75 16.4674L16.2959 22.6881C16.1118 22.788 15.9616 22.9351 15.8596 23.1168L10.1558 29.5699Z" fill="black" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        {/* Title bar */}
        <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-2 w-1/3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <div className="flex items-center gap-2 ml-4">
              <PanelLeft className="w-3.5 h-3.5 text-white/40" />
              <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
              <ChevronRight className="w-3.5 h-3.5 text-white/25" />
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1a1a1c] rounded-md px-6 py-1 text-[10px] text-white/60 flex items-center gap-2 w-full max-w-[240px] justify-center">
              <Monitor className="w-3 h-3" />
              pptai.vercel.app
            </div>
          </div>
          <div className="flex items-center gap-3 w-1/3 justify-end text-white/40">
            <RotateCw className="w-3.5 h-3.5" />
            <Share className="w-3.5 h-3.5" />
            <Plus className="w-3.5 h-3.5" />
            <Copy className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 min-h-[480px]">
          {/* Sidebar */}
          <div className="w-[22%] border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col z-10 relative">
            <div className="flex items-center justify-between mb-6">
              <Logo className="w-4 h-4 text-white/70" />
              <Grid className="w-3.5 h-3.5 text-white/30" />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded bg-[#e8553f] flex items-center justify-center text-[8px] font-bold text-white">M</div>
              <span className="text-[10px] text-white/80 font-medium">My Presentations</span>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-[10px] text-white/60">
                <Compass className="w-3.5 h-3.5" /> Templates
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/60">
                <Layers className="w-3.5 h-3.5" /> Slides
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/60">
                <ListTodo className="w-3.5 h-3.5" /> Outlines
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-[9px] text-white/40 font-semibold mb-3">RECENT PRESENTATIONS</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70" />
                  Machine Learning 101
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70" />
                  Q3 Marketing Plan
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-[#1a1a1c] p-6 relative overflow-hidden">
            {/* Base UI (Stats & Table) */}
            <AnimatePresence>
              {(phase === 'idle' || phase === 'cursor_to_gen') && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-6"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#e8553f] flex items-center justify-center text-white font-bold text-lg">M</div>
                      <div>
                        <h2 className="text-sm font-medium text-white">My Presentations</h2>
                        <p className="text-[10px] text-white/45">Manage and generate your AI presentations.</p>
                      </div>
                    </div>
                    <motion.button 
                      animate={phase === 'cursor_to_gen' && cursor.scale === 0.85 ? { scale: 0.95 } : { scale: 1 }}
                      className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-md text-[10px] font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Generate
                    </motion.button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 mb-6">
                    {[
                      { label: 'GENERATED', value: '62' },
                      { label: 'TEMPLATES', value: '12' },
                      { label: 'DRAFTS', value: '4' },
                      { label: 'VIEWS', value: '3,156' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 flex flex-col items-center justify-center">
                        <div className="text-xl font-medium text-white mb-1">{stat.value}</div>
                        <div className="text-[8px] tracking-wider text-white/35 uppercase">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Subject cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['AI Fundamentals', 'Business Strategy', 'Pitch Decks'].map((title, i) => (
                      <div key={i} className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                          <Layers className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="text-[11px] text-white/80">{title}</div>
                      </div>
                    ))}
                  </div>

                  {/* Drafting inbox */}
                  <div className="rounded-xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-4 bg-white/[0.02] p-3 text-[10px] font-medium text-white/40 border-b border-white/5">
                      <div className="col-span-2">Presentation Topic</div>
                      <div>Slides</div>
                      <div>Status</div>
                    </div>
                    {[
                      { t: 'History of AI', s: '10', st: 'Drafting', color: 'text-[#febc2e]/80' },
                      { t: 'Series A Pitch', s: '15', st: 'Ready', color: 'text-[#28c840]/70' },
                      { t: 'Team All-Hands', s: '8', st: 'Ready', color: 'text-[#28c840]/70' },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 p-3 text-[11px] text-white/70 border-b border-white/5 last:border-b-0">
                        <div className="col-span-2">{row.t}</div>
                        <div>{row.s}</div>
                        <div className={row.color}>{row.st}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input UI Phase */}
            <AnimatePresence>
              {(phase === 'input' || phase === 'cursor_to_input' || phase === 'typing' || phase === 'cursor_to_submit') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#1a1a1c]"
                >
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-xl text-center"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                      <Sparkles className="w-6 h-6 text-white/80" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">What would you like to present?</h2>
                    <p className="text-xs text-white/40 mb-8">Provide a topic, text, or just an idea and AI will generate the deck.</p>

                    <div className="relative group text-left">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur opacity-100 transition duration-1000" />
                      <div className="relative flex flex-col w-full min-h-[140px] bg-[#1e1e21] rounded-xl border border-white/10 shadow-inner overflow-hidden p-4">
                        <div className="flex-1 text-white/90 text-sm leading-relaxed outline-none bg-transparent resize-none">
                          {typedText}
                          {phase === 'typing' && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="w-[2px] h-4 bg-white/80 ml-0.5 inline-block align-middle"
                            />
                          )}
                          {typedText === '' && phase !== 'typing' && (
                            <span className="text-white/20">e.g. A pitch deck for a new SaaS product...</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition-colors">Outline</button>
                            <button className="px-3 py-1.5 rounded bg-white/5 text-[10px] text-white/60 hover:bg-white/10 transition-colors">Style: Modern</button>
                          </div>
                          <motion.button 
                            animate={phase === 'cursor_to_submit' && cursor.scale === 0.85 ? { scale: 0.95 } : { scale: 1 }}
                            className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Phase */}
            <AnimatePresence>
              {phase === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1c]"
                >
                  <div className="w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="relative">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-pulse" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">AI is crafting your deck...</h3>
                    </div>

                    <div className="space-y-4">
                      {LOADING_STEPS.map((step, idx) => {
                        const isCompleted = loadingStep > idx
                        const isActive = loadingStep === idx
                        const Icon = step.icon
                        
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: loadingStep >= idx ? 1 : 0.3,
                              x: loadingStep >= idx ? 0 : -10
                            }}
                            className={`flex items-center gap-4 transition-colors duration-500 ${isActive ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/20'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 ${
                              isCompleted ? 'bg-green-500/10 border-green-500/30' : 
                              isActive ? 'bg-white/10 border-white/30' : 
                              'bg-white/5 border-white/10'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              ) : (
                                <Icon className={`w-3 h-3 ${isActive ? 'text-white animate-pulse' : 'text-white/40'}`} />
                              )}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'animate-pulse' : ''}`}>
                              {step.text}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success / Final Presentation Preview */}
            <AnimatePresence>
              {phase === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#1a1a1c] p-8"
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    animate={{ y: [-5, 5, -5], rotateY: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                  >
                    {/* Presentation Header */}
                    <div className="h-8 border-b border-gray-100 flex items-center px-4 bg-gray-50/50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <div className="mx-auto text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        Generated by pptAI
                      </div>
                    </div>
                    
                    {/* Presentation Content */}
                    <div className="aspect-[16/9] w-full p-8 flex flex-col justify-center items-start text-left bg-gradient-to-br from-white to-blue-50">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <span className="text-blue-600 font-semibold tracking-wider text-[10px] uppercase mb-2 block">Artificial Intelligence</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">The Future of<br/>Machine Learning</h2>
                        <p className="text-gray-500 text-xs max-w-[250px]">An interactive guide for B.Tech students exploring neural networks and deep learning.</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <button
                    onClick={() => setPhase('idle')}
                    className="absolute bottom-6 right-6 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded text-[10px] transition-colors"
                  >
                    Replay
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
      {/* Spacer to prevent overlap since inner is absolute & scaled */}
      <div style={{ height: height * scale }} className="w-full transition-all duration-300" />
    </div>
  )
}

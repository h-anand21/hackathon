import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, BrainCircuit, Wand2, Blocks, ArrowRight, Lightbulb, PenTool, LayoutDashboard, Rocket } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function About() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <main className="relative z-10 min-h-screen pt-32 pb-24 flex flex-col items-center overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 -left-32 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full text-center mb-32 relative px-6 mt-12"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-md border border-blue-100 rounded-full text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> The Story of pptAI
        </motion.div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
          We are building the <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 relative">
            Next Generation
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-2 left-0 h-2 bg-blue-400/30 rounded-full"
            />
          </span> of Creation
        </h1>
        <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
          pptAI isn't just another wrapper. We combine deeply customized language models with a dynamic rendering engine to give you something truly magical.
        </p>
      </motion.div>

      {/* What Exactly is pptAI? */}
      <div className="max-w-6xl mx-auto w-full px-6 mb-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-6">What Exactly is pptAI?</h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            pptAI is a fully autonomous presentation generator. You provide a single sentence or a topic, and it acts as your personal researcher, scriptwriter, and graphic designer all at once. It's built to eliminate the blank canvas and give you a stunning starting point in under 10 seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Co-Pilot */}
          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group cursor-default relative overflow-hidden"
          >
            {/* Hover Animation Visual */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              
              <div className="w-20 h-12 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-blue-100 text-blue-600 text-[9px] font-bold py-1 px-2 rounded-t-lg rounded-bl-lg shadow-sm flex items-center gap-1">
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10 group-hover:text-blue-600 transition-colors">AI Co-Pilot</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Think of pptAI as your co-pilot. It doesn't just copy-paste text; it actually researches your topic and writes a compelling story.
            </p>
          </motion.div>

          {/* Auto-Designer */}
          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group cursor-default relative overflow-hidden"
          >
            {/* Hover Animation Visual */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                <Blocks className="w-6 h-6" />
              </div>

              <div className="w-20 h-12 flex flex-wrap gap-1 items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div animate={{ width: ["30%", "60%", "30%"] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="h-3 bg-sky-200 rounded-sm" />
                <motion.div animate={{ width: ["60%", "30%", "60%"] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="h-3 bg-sky-100 rounded-sm" />
                <motion.div animate={{ width: ["100%", "100%", "100%"] }} className="h-3 bg-sky-50 border border-sky-100 rounded-sm w-full" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10 group-hover:text-sky-600 transition-colors">Auto-Designer</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              No more dragging text boxes to make them align perfectly. The app mathematically calculates the best layout for your content.
            </p>
          </motion.div>

          {/* Instant Exporter */}
          <motion.div 
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group cursor-default relative overflow-hidden"
          >
            {/* Hover Animation Visual */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>

              <div className="w-20 h-12 flex flex-col items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-500 font-black text-sm">
                  ↓
                </motion.div>
                <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="h-full bg-emerald-500" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10 group-hover:text-emerald-600 transition-colors">Instant Exporter</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Once generated, your slides are immediately ready to be presented on the web, downloaded, or shared with your team.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Why We Are Different Section (Parallax) */}
      <div ref={targetRef} className="w-full py-32 px-6 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50" />
        
        <motion.div style={{ opacity }} className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-slate-900">Why pptAI is Different?</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Most AI presentation tools just dump generic text into pre-made templates. We completely reimagined the architecture from the ground up.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* The Competition */}
            <motion.div style={{ y: y1 }} className="space-y-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                <h3 className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-wider">Other AI Tools</h3>
                <p className="text-red-500 font-bold mb-6 text-sm">Rigid, repetitive, and boring.</p>
                <ul className="space-y-5 text-slate-600">
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold mt-1">✕</div>
                    <span className="leading-relaxed">Uses basic templates and forces text into predefined, rigid boxes.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold mt-1">✕</div>
                    <span className="leading-relaxed">Images are usually generic stock photos that don't match the context.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold mt-1">✕</div>
                    <span className="leading-relaxed">Lacks a real narrative structure. It just summarizes text randomly.</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Us */}
            <motion.div style={{ y: y2 }} className="space-y-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl shadow-blue-500/10"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2 relative z-10">
                  <Sparkles className="text-blue-500" /> pptAI
                </h3>
                <p className="text-blue-600 font-bold mb-6 text-sm relative z-10">Dynamic, context-aware, and stunning.</p>
                
                <ul className="space-y-5 text-slate-700 relative z-10">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                      <Blocks className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <strong className="block text-slate-900 mb-1">Dynamic Rendering Engine</strong>
                      <span className="text-sm leading-relaxed block">We don't use fixed templates. Our React-based engine calculates the best layout mathematically based on your exact text length and image dimensions.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 border border-sky-200">
                      <BrainCircuit className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <strong className="block text-slate-900 mb-1">Narrative Intelligence</strong>
                      <span className="text-sm leading-relaxed block">Gemini AI is prompted to think like an expert storyteller. It structures your presentation with a hook, body, and compelling conclusion.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                      <Wand2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <strong className="block text-slate-900 mb-1">Hyper-Specific DALL-E Art</strong>
                      <span className="text-sm leading-relaxed block">We analyze the slide's specific context to generate custom, on-brand DALL-E 3 images that perfectly illustrate your exact point.</span>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* How It Thinks (Timeline) */}
      <div className="w-full max-w-5xl mx-auto py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-6">How Our AI Thinks</h2>
          <p className="text-slate-600 text-lg">A peek into the split-second decisions made when you click generate.</p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-1 bg-blue-100 -translate-x-1/2 rounded-full" />
          
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-12 md:space-y-24"
          >
            {/* Step 1 */}
            <motion.div variants={fadeUp} className="relative flex flex-col md:flex-row items-center md:justify-between group cursor-default">
              <div className="hidden md:block w-5/12 text-right pr-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">1. Topic Analysis</h3>
                <p className="text-slate-600">The AI dissects your prompt to understand the audience, tone, and core message required.</p>
              </div>
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div className="md:hidden w-full pl-24 pt-2">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">1. Topic Analysis</h3>
                <p className="text-slate-600 text-sm">The AI dissects your prompt to understand the audience, tone, and core message required.</p>
              </div>
              
              {/* Animation on Hover */}
              <div className="hidden md:block w-5/12 pl-12">
                <div className="w-64 h-32 bg-white border border-slate-200 rounded-2xl relative overflow-hidden flex flex-col justify-center px-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0 shadow-xl shadow-blue-900/5">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Analyzing Input...</div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <motion.div className="h-full bg-blue-500" animate={{ width: ["0%", "100%", "0%"] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }} />
                  </div>
                  <div className="flex gap-2">
                    <motion.span animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold border border-blue-100">Target: VCs</motion.span>
                    <motion.span animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">Tone: Formal</motion.span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} className="relative flex flex-col md:flex-row items-center md:justify-between group cursor-default">
              
              {/* Animation on Hover */}
              <div className="hidden md:block w-5/12 pr-12">
                <div className="w-full h-32 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                   {[1,2,3,4].map(i => (
                     <motion.div 
                       key={i} 
                       animate={{ y: [10, -5, 10], opacity: [0.5, 1, 0.5] }} 
                       transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }} 
                       className="w-14 h-20 bg-white border border-slate-200 rounded-lg shadow-md shadow-slate-200/50 flex flex-col p-2 gap-1.5"
                     >
                       <div className="w-full h-1.5 bg-blue-100 rounded-sm" />
                       <div className="w-full h-1 bg-slate-100 rounded-sm" />
                       <div className="w-3/4 h-1 bg-slate-100 rounded-sm" />
                       <div className="w-full flex-1 bg-slate-50 mt-1 rounded-sm border border-slate-100 flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-slate-200/50" />
                       </div>
                     </motion.div>
                   ))}
                </div>
              </div>

              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300">
                <PenTool className="w-6 h-6 text-blue-600" />
              </div>
              <div className="md:w-5/12 w-full pl-24 md:pl-12 pt-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">2. Storyboarding</h3>
                <p className="text-slate-600 md:text-base text-sm">Gemini acts as a scriptwriter, distributing the narrative across 10-15 slides with perfect pacing and logical flow.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} className="relative flex flex-col md:flex-row items-center md:justify-between group cursor-default">
              <div className="hidden md:block w-5/12 text-right pr-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">3. Layout Engine</h3>
                <p className="text-slate-600">The React engine determines if a slide needs a full-bleed image, a 2-column comparison, or a bold quote layout based on the text density.</p>
              </div>
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="md:hidden w-full pl-24 pt-2">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">3. Layout Engine</h3>
                <p className="text-slate-600 text-sm">The React engine determines if a slide needs a full-bleed image, a 2-column comparison, or a bold quote layout based on the text density.</p>
              </div>
              
              {/* Animation on Hover */}
              <div className="hidden md:block w-5/12 pl-12">
                <div className="w-56 h-36 bg-slate-100 border border-slate-200 rounded-xl relative opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0 overflow-hidden flex items-center p-3 gap-3 shadow-xl shadow-slate-200/50">
                  {/* Left Column Image */}
                  <motion.div 
                    animate={{ flex: [0.3, 0.6, 0.3] }} 
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }} 
                    className="h-full bg-blue-200/50 rounded-lg border border-blue-300 border-dashed flex items-center justify-center" 
                  >
                    <div className="w-6 h-6 rounded bg-blue-300/50" />
                  </motion.div>
                  {/* Right Column Text */}
                  <motion.div 
                    animate={{ flex: [0.7, 0.4, 0.7] }} 
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }} 
                    className="h-full flex flex-col gap-2 justify-center"
                  >
                    <div className="w-full h-2 bg-slate-300 rounded-full" />
                    <div className="w-3/4 h-2 bg-slate-300 rounded-full" />
                    <div className="w-1/2 h-2 bg-slate-300 rounded-full" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div variants={fadeUp} className="relative flex flex-col md:flex-row items-center md:justify-between group cursor-default">
              
              {/* Animation on Hover */}
              <div className="hidden md:block w-5/12 pr-12">
                <div className="w-48 h-32 ml-auto bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl relative opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 flex items-center justify-center shadow-2xl shadow-blue-500/40 overflow-hidden">
                  <motion.div className="absolute inset-0 bg-white" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }} />
                  <motion.div 
                    animate={{ scale: [0.8, 1.1, 0.8], rotate: [0, 10, -10, 0] }} 
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center z-10 shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </motion.div>
                </div>
              </div>

              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 shadow-xl shadow-blue-500/30 rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-all duration-300">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="md:w-5/12 w-full pl-24 md:pl-12 pt-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">4. Final Assembly</h3>
                <p className="text-slate-600 md:text-base text-sm">DALL-E images are injected, typography is scaled mathematically, and the beautiful, ready-to-present deck is served to you in milliseconds.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </main>
  )
}

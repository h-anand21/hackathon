import { motion } from 'framer-motion'
import { Star, ArrowRight, LayoutGrid, Layers, FileText, Plus, PenLine, ImageIcon, LayoutTemplate, CheckCircle2 } from 'lucide-react'
import Logo from './Logo'

export default function CTA() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
      
      {/* Container with offset solid shadow effect */}
      <div className="relative w-full">
        {/* Offset Background (The Shadow - light theme) */}
        <div className="absolute inset-0 bg-indigo-100 rounded-3xl translate-y-3 sm:translate-y-4 -z-10" />
        
        {/* Main CTA Box (White) */}
        <div className="w-full rounded-3xl bg-white border-2 border-indigo-50 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 overflow-hidden relative shadow-xl">
          
          {/* Subtle Glow inside the box */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Side: Content */}
          <div className="flex-1 flex flex-col items-start gap-4 sm:gap-6 relative z-10 w-full lg:max-w-xl">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Ready to Create Your <br />
              <span className="text-[#282B4A]">First Presentation?</span>
            </h2>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-2">
              Free to try. No design skills required. Just stunning, AI-generated slides <span className="text-[#282B4A] font-semibold">in seconds.</span>
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#282B4A] hover:bg-[#1d1f36] text-white font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl flex items-center gap-2 text-base sm:text-lg transition-colors shadow-lg shadow-[#282B4A]/20"
            >
              Generate Your Deck Now <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Right Side: Mini Dark Dashboard Animation */}
          <div className="relative z-10 w-full lg:w-[450px] h-[280px] lg:h-[320px] perspective-[1000px]">
            
            {/* Dashboard Window */}
            <motion.div 
              animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-[#1e1e1e] border border-slate-700 rounded-2xl shadow-2xl flex overflow-hidden transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Sidebar */}
              <div className="w-[30%] h-full bg-[#111111] border-r border-slate-800 p-3 flex flex-col gap-4">
                {/* Logo */}
                <div className="flex items-center gap-1.5">
                   <Logo className="w-4 h-4 text-white" />
                   <span className="text-white font-bold text-[9px] tracking-tight hidden sm:block">pptAI</span>
                </div>
                
                {/* Nav items */}
                <div className="flex flex-col gap-1 mt-2">
                   <div className="flex items-center gap-2 text-white bg-slate-800 p-1.5 rounded">
                     <div className="w-3.5 h-3.5 bg-red-500 rounded flex items-center justify-center text-[7px] text-white font-bold">M</div>
                     <span className="text-[7px] font-medium">My Presentations</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400 hover:text-white p-1.5">
                     <LayoutGrid className="w-3 h-3" />
                     <span className="text-[7px] font-medium">Templates</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400 hover:text-white p-1.5">
                     <Layers className="w-3 h-3" />
                     <span className="text-[7px] font-medium">Slides</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400 hover:text-white p-1.5">
                     <FileText className="w-3 h-3" />
                     <span className="text-[7px] font-medium">Outlines</span>
                   </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 h-full flex flex-col bg-[#1a1a1a] relative">
                {/* Header */}
                <div className="w-full h-12 border-b border-slate-800 flex items-center justify-between px-4 relative z-20">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-red-500 rounded text-white flex items-center justify-center text-[10px] font-bold shadow-md">M</div>
                     <div className="flex flex-col justify-center">
                        <span className="text-white font-bold text-[9px]">My Presentations</span>
                        <span className="text-slate-400 text-[6px]">Manage and generate your AI presentations.</span>
                     </div>
                   </div>
                   
                   {/* Animated Generate Button */}
                   <motion.div 
                     animate={{ scale: [1, 0.9, 1, 1], backgroundColor: ["#ffffff", "#cbd5e1", "#ffffff", "#ffffff"] }}
                     transition={{ duration: 12, times: [0, 0.15, 0.17, 1], repeat: Infinity }}
                     className="text-slate-900 px-2 py-1 rounded flex items-center gap-1 text-[7px] font-bold shadow-md cursor-pointer"
                   >
                     <Plus className="w-2 h-2" /> Generate
                   </motion.div>
                </div>
                
                {/* Stats Row */}
                <div className="p-4 flex gap-2 relative z-10">
                   <div className="flex-1 h-12 bg-[#222] rounded-lg border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-white font-bold text-xs">62</span>
                      <span className="text-slate-500 text-[5px] font-bold tracking-widest uppercase">Generated</span>
                   </div>
                   <div className="flex-1 h-12 bg-[#222] rounded-lg border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-white font-bold text-xs">12</span>
                      <span className="text-slate-500 text-[5px] font-bold tracking-widest uppercase">Templates</span>
                   </div>
                   <div className="flex-1 h-12 bg-[#222] rounded-lg border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-white font-bold text-xs">4</span>
                      <span className="text-slate-500 text-[5px] font-bold tracking-widest uppercase">Drafts</span>
                   </div>
                </div>

                {/* Animated Prompt Modal overlaying the content */}
                <motion.div 
                  animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [10, 10, 0, 0, -10, -10], pointerEvents: ["none", "none", "auto", "auto", "none", "none"] }}
                  transition={{ duration: 12, times: [0, 0.16, 0.18, 0.42, 0.45, 1], repeat: Infinity }}
                  className="absolute inset-x-4 top-16 bg-[#2a2a2a] border border-indigo-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-lg p-3 z-30 flex flex-col gap-2"
                >
                  <div className="text-[7px] font-bold text-white">Create New Presentation</div>
                  <div className="w-full bg-[#111] border border-slate-700 rounded p-2 flex items-start h-10 shadow-inner relative">
                     <span className="text-[6px] text-indigo-300 font-mono">
                       Create a deck about Space Exploration...
                       <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, repeat: Infinity }} className="inline-block w-0.5 h-2 bg-indigo-400 ml-0.5 align-middle" />
                     </span>
                  </div>
                  <div className="w-full flex justify-end">
                     <motion.div 
                       animate={{ scale: [1, 1, 0.9, 1, 1], backgroundColor: ["#4f46e5", "#4f46e5", "#4338ca", "#4f46e5", "#4f46e5"] }}
                       transition={{ duration: 12, times: [0, 0.38, 0.4, 0.42, 1], repeat: Infinity }}
                       className="text-white text-[6px] px-2.5 py-1 rounded font-bold shadow-md"
                     >
                       Generate
                     </motion.div>
                  </div>
                </motion.div>

                {/* Table Area */}
                <div className="px-4 pb-4 flex-1 flex flex-col relative z-10">
                   <div className="w-full h-full bg-[#222] rounded-lg border border-slate-800 flex flex-col overflow-hidden shadow-inner">
                      {/* Table Header */}
                      <div className="w-full h-6 border-b border-slate-800 flex items-center px-3 gap-2">
                         <span className="text-slate-400 text-[6px] font-bold flex-1">Presentation Topic</span>
                         <span className="text-slate-400 text-[6px] font-bold w-8 text-center">Slides</span>
                         <span className="text-slate-400 text-[6px] font-bold w-[85px] text-left">Status</span>
                      </div>
                      
                      {/* NEW Animated Row (Drafting -> Ready) */}
                      <motion.div 
                        animate={{ height: [0, 0, 28, 28], opacity: [0, 0, 1, 1] }}
                        transition={{ duration: 12, times: [0, 0.45, 0.48, 1], repeat: Infinity }}
                        className="w-full flex items-center px-3 gap-2 bg-indigo-500/10 relative overflow-hidden border-b border-slate-800/50"
                      >
                         <span className="text-white text-[7px] font-medium flex-1 relative z-10">Space Exploration</span>
                         
                         {/* Drafting State 1: Writing Text */}
                         <motion.div 
                           animate={{ opacity: [0, 0, 1, 1, 0, 0, 0] }}
                           transition={{ duration: 12, times: [0, 0.44, 0.45, 0.54, 0.55, 1, 1], repeat: Infinity }}
                           className="absolute inset-y-0 right-3 flex items-center gap-2 z-10"
                         >
                            <span className="text-indigo-200 text-[7px] w-8 text-center">-</span>
                            <div className="flex items-center gap-1.5 w-[85px]">
                               <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-3 h-3 text-sky-400"><PenLine className="w-full h-full" /></motion.div>
                               <span className="text-[6.5px] text-sky-400 font-bold">Writing text...</span>
                            </div>
                         </motion.div>

                         {/* Drafting State 2: Generating Images */}
                         <motion.div 
                           animate={{ opacity: [0, 0, 1, 1, 0, 0, 0] }}
                           transition={{ duration: 12, times: [0, 0.54, 0.55, 0.64, 0.65, 1, 1], repeat: Infinity }}
                           className="absolute inset-y-0 right-3 flex items-center gap-2 z-10"
                         >
                            <span className="text-indigo-200 text-[7px] w-8 text-center">-</span>
                            <div className="flex items-center gap-1.5 w-[85px]">
                               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className="w-3 h-3 text-purple-400"><ImageIcon className="w-full h-full" /></motion.div>
                               <span className="text-[6.5px] text-purple-400 font-bold">Creating images...</span>
                            </div>
                         </motion.div>

                         {/* Drafting State 3: Building Slides */}
                         <motion.div 
                           animate={{ opacity: [0, 0, 1, 1, 0, 0, 0] }}
                           transition={{ duration: 12, times: [0, 0.64, 0.65, 0.74, 0.75, 1, 1], repeat: Infinity }}
                           className="absolute inset-y-0 right-3 flex items-center gap-2 z-10"
                         >
                            <span className="text-indigo-200 text-[7px] w-8 text-center">-</span>
                            <div className="flex items-center gap-1.5 w-[85px]">
                               <motion.div animate={{ y: [-1, 1, -1] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-3 h-3 text-orange-400"><LayoutTemplate className="w-full h-full" /></motion.div>
                               <span className="text-[6.5px] text-orange-400 font-bold">Building slides...</span>
                            </div>
                         </motion.div>

                         {/* Ready State */}
                         <motion.div 
                           animate={{ opacity: [0, 0, 1, 1] }}
                           transition={{ duration: 12, times: [0, 0.74, 0.75, 1], repeat: Infinity }}
                           className="absolute inset-y-0 right-3 flex items-center gap-2 z-10"
                         >
                            <span className="text-slate-400 text-[7px] w-8 text-center">12</span>
                            <div className="flex items-center gap-1.5 w-[85px]">
                               <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                               <span className="text-emerald-400 text-[7px] text-left font-bold">Ready</span>
                            </div>
                         </motion.div>

                         {/* Scanning Glow (Drafting only) */}
                         <motion.div 
                           animate={{ x: ["-100%", "200%"], opacity: [1, 1, 0, 0] }} 
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear", opacity: { duration: 12, times: [0, 0.74, 0.75, 1], repeat: Infinity } }} 
                           className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" 
                         />
                      </motion.div>

                      {/* Old Row 1 */}
                      <div className="w-full h-7 border-b border-slate-800/50 flex items-center px-3 gap-2">
                         <span className="text-slate-300 text-[7px] font-medium flex-1">History of AI</span>
                         <span className="text-slate-500 text-[7px] w-8 text-center">10</span>
                         <div className="flex items-center gap-1.5 w-[85px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                            <span className="text-emerald-500/70 text-[7px] text-left font-bold">Ready</span>
                         </div>
                      </div>

                      {/* Old Row 2 */}
                      <div className="w-full h-7 flex items-center px-3 gap-2">
                         <span className="text-slate-300 text-[7px] font-medium flex-1">Series A Pitch Deck</span>
                         <span className="text-slate-500 text-[7px] w-8 text-center">15</span>
                         <div className="flex items-center gap-1.5 w-[85px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                            <span className="text-emerald-500/70 text-[7px] text-left font-bold">Ready</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Glowing Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/20 blur-3xl -z-10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

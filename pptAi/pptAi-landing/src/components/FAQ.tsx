import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, FileText, Download, Layout, Pencil, Check, Image as ImageIcon } from 'lucide-react'

const faqs = [
  {
    q: "How does pptAI generate presentations?",
    a: "We use Google Gemini to structure the narrative, write speaker notes, and format bullet points. Then, we use DALL-E 3 to generate custom, context-aware illustrations for every single slide.",
    visual: 'generate'
  },
  {
    q: "Can I edit the presentation after it's generated?",
    a: "Yes! You can edit any text, replace images, or regenerate specific slides entirely using our built-in editor before exporting.",
    visual: 'edit'
  },
  {
    q: "What export formats are supported?",
    a: "Currently, you can export your presentations as fully editable PowerPoint (.pptx) files or as PDF documents.",
    visual: 'export'
  },
  {
    q: "Do I need design skills to use this?",
    a: "Not at all. pptAI automatically applies professional design principles, layout structures, and color theory to ensure your deck looks stunning.",
    visual: 'design'
  }
]

const FaqVisual = ({ type }: { type: string }) => {
  switch (type) {
    case 'generate':
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-between p-4 sm:p-8 relative overflow-hidden font-mono">
           {/* Background Lines */}
           <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
           
           {/* Step 1: User Prompt with Cursor */}
           <div className="flex flex-col gap-2 z-10 w-[140px] sm:w-[220px]">
              <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">1. User Input</div>
              <div className="bg-black/80 border border-slate-700 rounded-md p-2 sm:p-3 flex items-center shadow-lg h-10 sm:h-14">
                 <span className="text-emerald-400 text-[10px] sm:text-xs mr-2">{`>`}</span>
                 <span className="text-slate-300 text-[8px] sm:text-xs">
                   <motion.span animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 6, times: [0, 0.4, 0.5, 1], repeat: Infinity }}>
                     Create a deck about AI
                   </motion.span>
                   <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-1.5 sm:w-2 h-3 sm:h-4 bg-emerald-400 inline-block align-middle ml-1" />
                 </span>
              </div>
           </div>

           {/* Animated Data Stream */}
           <div className="flex-1 flex items-center justify-center relative z-0 px-2 sm:px-4">
               <motion.div animate={{ left: ['0%', '100%'] }} transition={{ duration: 6, times: [0.3, 0.5], repeat: Infinity }} className="absolute h-[3px] w-16 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)] z-10" />
               <div className="w-full h-[1px] bg-slate-700 border-dashed border-t border-slate-600" />
           </div>

           {/* Step 2: Gemini & DALL-E Process */}
           <div className="flex flex-col gap-2 sm:gap-4 z-10 w-[120px] sm:w-[180px] items-center">
              <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">2. Processing</div>
              <motion.div animate={{ scale: [1, 1.1, 1], borderColor: ['#3b82f6', '#8b5cf6', '#3b82f6'] }} transition={{ duration: 6, times: [0.4, 0.5, 0.6], repeat: Infinity }} className="bg-slate-800/90 border border-blue-500/50 rounded-lg p-2 sm:p-3 flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                 <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                 <div className="text-[8px] sm:text-xs text-blue-200">Gemini 3.5</div>
              </motion.div>
              
              <motion.div animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 6, times: [0, 0.6, 0.8, 1], repeat: Infinity }} className="flex items-center gap-2 mt-[-5px]">
                 <div className="w-[1.5px] h-4 sm:h-6 bg-slate-600" />
                 <div className="bg-purple-900/80 border border-purple-500/50 rounded px-2 py-1 flex items-center gap-1.5 shadow-md">
                    <ImageIcon className="w-3 h-3 text-purple-400" />
                    <span className="text-[7px] sm:text-[9px] text-purple-200">DALL-E 3</span>
                 </div>
              </motion.div>
           </div>

           {/* Animated Data Stream */}
           <div className="flex-1 flex items-center justify-center relative z-0 px-2 sm:px-4">
               <motion.div animate={{ left: ['0%', '100%'] }} transition={{ duration: 6, times: [0.6, 0.8], repeat: Infinity }} className="absolute h-[3px] w-16 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] z-10" />
               <div className="w-full h-[1px] bg-slate-700 border-dashed border-t border-slate-600" />
           </div>

           {/* Step 3: Final Slide */}
           <div className="flex flex-col gap-2 z-10 w-[80px] sm:w-[120px] items-end">
              <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">3. Result</div>
              <motion.div animate={{ opacity: [0, 0, 1, 1], scale: [0.8, 0.8, 1, 1] }} transition={{ duration: 6, times: [0, 0.7, 0.8, 1], repeat: Infinity }} className="w-20 h-14 sm:w-28 sm:h-20 bg-white rounded shadow-[0_0_20px_rgba(255,255,255,0.15)] p-1.5 sm:p-2 flex flex-col gap-1.5">
                 <div className="w-1/2 h-1.5 sm:h-2 bg-slate-800 rounded-sm" />
                 <div className="w-full h-1 sm:h-1.5 bg-slate-300 rounded-sm" />
                 <div className="w-full flex-1 bg-purple-100 border border-purple-200 mt-1" />
              </motion.div>
           </div>
        </div>
      )
    case 'edit':
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:10px_10px]" />
           {/* Editor UI Mockup */}
           <div className="w-[280px] sm:w-[440px] h-32 sm:h-48 bg-slate-100 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-700 relative z-10">
              {/* Topbar */}
              <div className="w-full h-6 sm:h-8 bg-white border-b border-slate-200 flex items-center px-3 gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-400" />
                 <div className="w-2 h-2 rounded-full bg-yellow-400" />
                 <div className="w-2 h-2 rounded-full bg-green-400" />
                 <div className="mx-auto w-24 h-2 bg-slate-200 rounded-full" />
                 <div className="w-10 h-4 bg-indigo-600 rounded text-white text-[6px] flex items-center justify-center font-bold">Export</div>
              </div>
              <div className="flex flex-1 h-full">
                 {/* Sidebar */}
                 <div className="w-16 sm:w-20 border-r border-slate-200 bg-white flex flex-col gap-2 p-2 items-center">
                    <div className="w-full h-12 bg-slate-50 border-2 border-indigo-500 rounded flex flex-col gap-1.5 p-1.5 shadow-sm">
                       <div className="w-full h-3 sm:h-4 bg-slate-300 rounded-[1px]" />
                       <div className="w-3/4 h-2 bg-slate-200 rounded-[1px]" />
                    </div>
                    <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded flex flex-col gap-1.5 p-1.5 opacity-50">
                       <div className="w-full h-3 sm:h-4 bg-slate-300 rounded-[1px]" />
                    </div>
                 </div>
                 {/* Canvas */}
                 <div className="flex-1 bg-slate-200 p-2 sm:p-4 flex items-center justify-center relative">
                    {/* The Slide */}
                    <div className="w-48 sm:w-72 h-20 sm:h-32 bg-white shadow-lg border border-slate-200 p-3 sm:p-4 flex gap-3 relative overflow-visible">
                       {/* Text Column - REAL TEXT */}
                       <div className="flex-1 flex flex-col gap-1 relative text-left z-10 pt-1">
                          <h3 className="text-slate-800 font-bold text-[10px] sm:text-xs leading-tight flex items-center">
                             <span>Pitch Deck&nbsp;</span>
                             <span className="relative inline-block h-[14px] sm:h-[16px]">
                                {/* The old text */}
                                <motion.span animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ duration: 8, times: [0, 0.2, 0.21, 0.95, 1], repeat: Infinity }} className="relative z-10">
                                   2024
                                </motion.span>
                                
                                {/* The blue selection highlight (expands right to left as cursor drags) */}
                                <motion.div animate={{ opacity: [0, 1, 1, 0, 0], left: ['100%', '0%', '0%', '0%', '0%'], width: ['0%', '100%', '100%', '0%', '0%'] }} transition={{ duration: 8, times: [0, 0.1, 0.2, 0.25, 1], repeat: Infinity }} className="absolute top-0 bottom-0 bg-blue-500/30 z-0 rounded-[1px]" />
                                
                                {/* The new text typing out */}
                                <motion.span animate={{ opacity: [0, 0, 1, 1, 0], width: ['0%', '0%', '0%', '100%', '100%'] }} transition={{ duration: 8, times: [0, 0.2, 0.21, 0.35, 1], repeat: Infinity }} className="absolute left-0 top-0 text-indigo-600 whitespace-nowrap overflow-hidden z-10 border-r-[1px] border-indigo-600 font-bold">
                                   for Startups
                                </motion.span>
                             </span>
                          </h3>
                          
                          <p className="text-[5px] sm:text-[7px] text-slate-500 leading-relaxed mt-1 w-full pr-2">
                             Use artificial intelligence to generate stunning presentations in seconds.
                             No design skills required, just pure AI power.
                          </p>
                       </div>
                       
                       {/* Image Column */}
                       <div className="w-20 sm:w-28 h-full bg-slate-100 rounded-[2px] border border-slate-300 relative overflow-visible flex-shrink-0 group">
                          {/* Picture 1 (Daytime Mountain) */}
                          <motion.div animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ duration: 8, times: [0, 0.5, 0.55, 0.95, 1], repeat: Infinity }} className="absolute inset-0 bg-sky-200 overflow-hidden rounded-[2px]">
                             <div className="absolute top-1 right-2 w-3 sm:w-4 h-3 sm:h-4 bg-yellow-400 rounded-full" />
                             <div className="absolute -bottom-2 -left-2 w-10 sm:w-12 h-10 sm:h-12 bg-emerald-400 rotate-45" />
                             <div className="absolute -bottom-4 right-0 w-14 sm:w-16 h-14 sm:h-16 bg-emerald-500 rotate-45" />
                          </motion.div>
                          
                          {/* Picture 2 (Night Cyberpunk City) */}
                          <motion.div animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 8, times: [0, 0.5, 0.55, 0.95, 1], repeat: Infinity }} className="absolute inset-0 bg-slate-900 overflow-hidden rounded-[2px]">
                             <div className="absolute top-2 left-2 w-2 sm:w-3 h-2 sm:h-3 bg-slate-100 rounded-full shadow-[0_0_8px_white]" />
                             <div className="absolute bottom-0 left-2 w-2 sm:w-3 h-6 sm:h-8 bg-indigo-950 border-t border-indigo-500" />
                             <div className="absolute bottom-0 left-5 sm:left-6 w-3 sm:w-4 h-10 sm:h-12 bg-purple-900 border-t border-purple-400" />
                             <div className="absolute bottom-0 left-10 sm:left-12 w-2 sm:w-3 h-5 sm:h-6 bg-blue-950 border-t border-blue-500" />
                             <div className="absolute bottom-0 left-14 sm:left-16 w-4 sm:w-5 h-8 sm:h-10 bg-indigo-900 border-t border-indigo-400" />
                             {/* Magic spark effect when swapped */}
                             <motion.div animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: 90 }} transition={{ duration: 8, times: [0.5, 0.55, 0.6], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center z-20">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300 drop-shadow-[0_0_10px_white]" />
                             </motion.div>
                          </motion.div>

                          {/* Image Selection Highlight */}
                          <motion.div animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 8, times: [0, 0.35, 0.4, 0.6, 0.65], repeat: Infinity }} className="absolute -inset-[3px] border-[2px] border-indigo-500 rounded z-20 pointer-events-none" />
                          
                          {/* AI Regenerate Toolbar popover */}
                          <motion.div animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.8, 0.8, 1, 1, 0.8], y: [10, 10, -5, -5, 10] }} transition={{ duration: 8, times: [0, 0.35, 0.4, 0.6, 0.65], repeat: Infinity }} className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white text-[7px] sm:text-[9px] px-2 py-1 sm:px-3 sm:py-1.5 rounded shadow-xl flex items-center gap-1 font-bold whitespace-nowrap">
                             <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> AI Replace Image
                          </motion.div>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Cursor Animation */}
              <motion.div animate={{ x: [100, -10, -35, -35, 80, 80, 80, 100], y: [80, -10, -10, -10, 30, 30, -20, 80], scale: [1, 1, 0.9, 0.9, 1, 0.9, 0.9, 1] }} transition={{ duration: 8, times: [0, 0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 top-1/2 left-1/2 mt-[-30px] ml-[-40px]">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] sm:w-8 sm:h-8">
                    <path d="M5.5 2L19.5 15.5H12.5L9.5 22.5L5.5 2Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                 </svg>
              </motion.div>
           </div>
        </div>
      )
    case 'export':
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:10px_10px]" />
           
           {/* UI Mockup */}
           <div className="w-[280px] sm:w-[440px] h-32 sm:h-48 bg-slate-100 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-700 relative z-10">
              {/* Topbar */}
              <div className="w-full h-8 sm:h-10 bg-white border-b border-slate-200 flex items-center px-3 sm:px-4 justify-between relative z-30">
                 <div className="flex gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                 </div>
                 
                 {/* Export Button */}
                 <motion.div animate={{ scale: [1, 1, 0.95, 1, 1] }} transition={{ duration: 8, times: [0, 0.18, 0.2, 0.22, 1], repeat: Infinity }} className="bg-indigo-600 text-white text-[8px] sm:text-[10px] px-3 py-1.5 rounded font-bold flex items-center gap-1.5 shadow-sm relative overflow-hidden cursor-pointer">
                    <Download className="w-3 h-3" /> Export
                    {/* Click Flash */}
                    <motion.div animate={{ opacity: [0, 0, 1, 0, 0] }} transition={{ duration: 8, times: [0, 0.18, 0.2, 0.25, 1], repeat: Infinity }} className="absolute inset-0 bg-black/20" />
                 </motion.div>
              </div>

              {/* Canvas Preview */}
              <div className="flex-1 bg-slate-200 flex items-center justify-center p-4 relative z-0">
                 <div className="w-48 sm:w-64 h-20 sm:h-28 bg-white shadow-md border border-slate-200 flex p-3 gap-3">
                    <div className="flex-1 flex flex-col gap-2">
                       <div className="w-3/4 h-3 bg-slate-800 rounded-[2px]" />
                       <div className="w-full h-1.5 bg-slate-300 rounded-[2px]" />
                       <div className="w-5/6 h-1.5 bg-slate-300 rounded-[2px]" />
                    </div>
                    <div className="w-16 sm:w-20 h-full bg-sky-200 rounded-[2px] overflow-hidden relative">
                       <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                       <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-emerald-400 rotate-45" />
                    </div>
                 </div>
              </div>

              {/* Export Dropdown Menu */}
              <motion.div animate={{ opacity: [0, 0, 1, 1, 0, 0], scale: [0.95, 0.95, 1, 1, 0.95, 0.95], y: [10, 10, 0, 0, 10, 10] }} transition={{ duration: 8, times: [0, 0.22, 0.25, 0.45, 0.48, 1], repeat: Infinity }} className="absolute top-9 sm:top-11 right-3 sm:right-4 w-36 sm:w-44 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-20 flex flex-col pointer-events-none origin-top-right">
                 {/* PPTX Option */}
                 <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 relative overflow-hidden">
                    {/* Hover effect triggered by cursor */}
                    <motion.div animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ duration: 8, times: [0, 0.28, 0.3, 0.45, 0.48, 1], repeat: Infinity }} className="absolute inset-0 bg-slate-100 z-0" />
                    <div className="bg-orange-100 p-1.5 rounded relative z-10"><FileText className="w-3 h-3 text-orange-500" /></div>
                    <div className="flex flex-col relative z-10"><span className="text-[8px] sm:text-[10px] font-bold text-slate-800">PowerPoint</span><span className="text-[6px] sm:text-[8px] text-slate-500">.pptx</span></div>
                    
                    {/* Click Ripple */}
                    <motion.div animate={{ scale: [0, 0, 0, 5, 5], opacity: [0, 0, 0.5, 0, 0] }} transition={{ duration: 8, times: [0, 0.33, 0.35, 0.45, 1], repeat: Infinity }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-300 rounded-full z-0" />
                 </div>
                 {/* PDF Option */}
                 <div className="px-3 py-2 flex items-center gap-2 relative z-10 bg-white">
                    <div className="bg-red-100 p-1.5 rounded"><FileText className="w-3 h-3 text-red-500" /></div>
                    <div className="flex flex-col"><span className="text-[8px] sm:text-[10px] font-bold text-slate-800">PDF Document</span><span className="text-[6px] sm:text-[8px] text-slate-500">.pdf</span></div>
                 </div>
              </motion.div>

              {/* Browser Download Toast */}
              <motion.div animate={{ y: [40, 40, 0, 0, 40, 40], opacity: [0, 0, 1, 1, 0, 0] }} transition={{ duration: 8, times: [0, 0.5, 0.55, 0.9, 0.95, 1], repeat: Infinity }} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 z-30 pointer-events-none">
                 <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                 </div>
                 <span className="text-[9px] sm:text-[11px] font-semibold whitespace-nowrap">pitch_deck.pptx downloaded</span>
              </motion.div>

              {/* Cursor Animation */}
              <motion.div animate={{ x: [0, 160, 160, 110, 110, -50, -50, 0], y: [40, -60, -60, -25, -25, 40, 40, 40], scale: [1, 1, 0.9, 1, 0.9, 1, 1, 1] }} transition={{ duration: 8, times: [0, 0.15, 0.2, 0.3, 0.35, 0.5, 0.9, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 top-1/2 left-1/2 mt-[-10px] ml-[-10px]">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] sm:w-8 sm:h-8">
                    <path d="M5.5 2L19.5 15.5H12.5L9.5 22.5L5.5 2Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                 </svg>
              </motion.div>
           </div>
        </div>
      )
    case 'design':
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:10px_10px]" />
           
           <div className="w-[280px] sm:w-[440px] h-32 sm:h-48 relative z-10 flex items-center justify-center">
              
              {/* Top Step Badge */}
              <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 z-40 bg-indigo-950 text-white rounded-full font-bold shadow-[0_5px_15px_rgba(79,70,229,0.4)] flex items-center justify-center border border-indigo-500 overflow-hidden w-48 sm:w-56 h-7 sm:h-8">
                 <motion.div animate={{ opacity: [1, 1, 0, 0, 0, 0, 0] }} transition={{ duration: 15, times: [0, 0.18, 0.2, 0.4, 0.6, 0.8, 1], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5"><Pencil className="w-3 h-3 text-yellow-400"/> <span className="text-[7px] sm:text-[9px]">STEP 1: TYPE TOPIC</span></motion.div>
                 
                 <motion.div animate={{ opacity: [0, 0, 1, 1, 0, 0, 0] }} transition={{ duration: 15, times: [0, 0.18, 0.2, 0.38, 0.4, 0.8, 1], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5"><FileText className="w-3 h-3 text-sky-400"/> <span className="text-[7px] sm:text-[9px]">STEP 2: AI WRITES TEXT</span></motion.div>
                 
                 <motion.div animate={{ opacity: [0, 0, 0, 1, 1, 0, 0] }} transition={{ duration: 15, times: [0, 0.38, 0.4, 0.58, 0.6, 0.8, 1], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5"><Layout className="w-3 h-3 text-orange-400"/> <span className="text-[7px] sm:text-[9px]">STEP 3: AI BUILDS LAYOUT</span></motion.div>
                 
                 <motion.div animate={{ opacity: [0, 0, 0, 0, 1, 1, 0] }} transition={{ duration: 15, times: [0, 0.58, 0.6, 0.78, 0.8, 0.98, 1], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5"><Pencil className="w-3 h-3 text-pink-400"/> <span className="text-[7px] sm:text-[9px]">STEP 4: AI APPLIES COLORS</span></motion.div>
                 
                 <motion.div animate={{ opacity: [0, 0, 0, 0, 0, 1, 1] }} transition={{ duration: 15, times: [0, 0.6, 0.78, 0.8, 0.98, 1, 1], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center gap-1.5"><ImageIcon className="w-3 h-3 text-emerald-400"/> <span className="text-[7px] sm:text-[9px]">STEP 5: AI CREATES IMAGES</span></motion.div>
              </div>

              {/* Step 1: Real Dashboard Input (0-3s) */}
              <motion.div animate={{ opacity: [1, 1, 0, 0, 0, 0, 0] }} transition={{ duration: 15, times: [0, 0.18, 0.2, 0.4, 0.6, 0.8, 1], repeat: Infinity }} className="absolute inset-0 bg-slate-50 shadow-xl rounded-lg border border-slate-300 flex flex-col overflow-hidden z-30">
                 <div className="w-full h-6 sm:h-8 bg-white border-b border-slate-200 flex items-center px-3">
                    <div className="flex gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-red-400" />
                       <div className="w-2 h-2 rounded-full bg-yellow-400" />
                       <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <span className="ml-3 font-bold text-[7px] sm:text-[9px] text-slate-800 tracking-widest">pptAI Dashboard</span>
                 </div>
                 <div className="flex-1 p-3 sm:p-5 flex flex-col gap-2">
                    <h4 className="font-bold text-[9px] sm:text-[11px] text-slate-800">What is your presentation about?</h4>
                    <div className="w-full h-16 sm:h-20 bg-white border-2 border-indigo-200 rounded-md p-2 sm:p-3 relative shadow-inner">
                       <div className="flex items-start">
                          <span className="text-[8px] sm:text-[11px] text-slate-700 font-medium leading-relaxed font-mono">
                             Create a deck about Space Exploration...
                             <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-2.5 sm:h-3 bg-black ml-1 align-middle" />
                          </span>
                       </div>
                       <motion.div animate={{ scale: [1, 1, 0.9, 1, 1] }} transition={{ duration: 15, times: [0, 0.13, 0.15, 0.17, 1], repeat: Infinity }} className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-indigo-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[7px] sm:text-[9px] font-bold flex items-center gap-1 shadow-md border border-indigo-500">
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Generate
                       </motion.div>
                    </div>
                 </div>
                 {/* Cursor clicking Generate */}
                 <motion.div animate={{ x: [100, 160, 160, 160, 250], y: [150, 45, 45, 45, 150] }} transition={{ duration: 15, times: [0, 0.1, 0.13, 0.17, 0.3], repeat: Infinity, ease: "easeInOut" }} className="absolute z-50 top-1/2 left-1/2 mt-[-10px] ml-[-20px]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] sm:w-8 sm:h-8">
                       <path d="M5.5 2L19.5 15.5H12.5L9.5 22.5L5.5 2Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                 </motion.div>
              </motion.div>

              {/* Step 2: AI Writes REAL Text on blank slide (3-6s) */}
              <motion.div animate={{ opacity: [0, 0, 1, 1, 0, 0, 0] }} transition={{ duration: 15, times: [0, 0.18, 0.2, 0.38, 0.4, 0.8, 1], repeat: Infinity }} className="absolute inset-0 bg-white p-4 sm:p-6 flex flex-col justify-center rounded-lg shadow-xl border border-slate-300 z-20">
                 <span className="text-slate-500 font-bold text-[7px] sm:text-[9px] tracking-widest uppercase mb-1">Chapter 1</span>
                 <h1 className="text-slate-900 font-black text-sm sm:text-[22px] leading-tight mb-2 sm:mb-3">Space Exploration</h1>
                 <p className="text-slate-600 text-[6px] sm:text-[9px] leading-relaxed w-[80%]">
                    Discovering the cosmos through generative AI design. No design skills required.
                 </p>
              </motion.div>

              {/* Step 3: AI Builds Layout (split screen) (6-9s) */}
              <motion.div animate={{ opacity: [0, 0, 0, 1, 1, 0, 0] }} transition={{ duration: 15, times: [0, 0.38, 0.4, 0.58, 0.6, 0.8, 1], repeat: Infinity }} className="absolute inset-0 bg-white flex rounded-lg shadow-xl border border-slate-300 overflow-hidden z-20">
                 <div className="w-1/2 h-full p-4 sm:p-6 flex flex-col justify-center">
                    <span className="text-slate-500 font-bold text-[7px] sm:text-[9px] tracking-widest uppercase mb-1">Chapter 1</span>
                    <h1 className="text-slate-900 font-black text-sm sm:text-[22px] leading-tight mb-2 sm:mb-3">Space Exploration</h1>
                    <p className="text-slate-600 text-[6px] sm:text-[9px] leading-relaxed">
                       Discovering the cosmos through generative AI design. No design skills required.
                    </p>
                 </div>
                 <div className="w-1/2 h-full border-l border-slate-200 bg-slate-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="w-full h-full border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                       <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 opacity-50" />
                    </div>
                 </div>
              </motion.div>

              {/* Step 4: AI Applies Colors (Dark Mode Sidebar) (9-12s) */}
              <motion.div animate={{ opacity: [0, 0, 0, 0, 1, 1, 0] }} transition={{ duration: 15, times: [0, 0.58, 0.6, 0.78, 0.8, 0.98, 1], repeat: Infinity }} className="absolute inset-0 bg-slate-50 flex rounded-lg shadow-xl border border-slate-700 overflow-hidden z-20">
                 <div className="w-1/2 h-full bg-slate-900 p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 rounded-bl-[100px] opacity-30 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500 rounded-tr-[100px] opacity-30 blur-xl" />
                    <span className="text-indigo-400 font-bold text-[7px] sm:text-[9px] tracking-widest uppercase mb-1 relative z-10">Chapter 1</span>
                    <h1 className="text-white font-black text-sm sm:text-[22px] leading-tight mb-2 sm:mb-3 relative z-10">Space Exploration</h1>
                    <p className="text-slate-400 text-[6px] sm:text-[9px] leading-relaxed relative z-10">
                       Discovering the cosmos through generative AI design. No design skills required.
                    </p>
                 </div>
                 <div className="w-1/2 h-full border-l border-slate-800 bg-slate-950 flex items-center justify-center p-3 sm:p-4">
                    <div className="w-full h-full border-2 border-dashed border-slate-700 rounded flex items-center justify-center">
                       <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                    </div>
                 </div>
              </motion.div>

              {/* Step 5: AI Creates Images (Full Slide) (12-15s) */}
              <motion.div animate={{ opacity: [0, 0, 0, 0, 0, 1, 1] }} transition={{ duration: 15, times: [0, 0.6, 0.78, 0.8, 0.98, 1, 1], repeat: Infinity }} className="absolute inset-0 bg-slate-50 flex rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-700 overflow-hidden z-10">
                 <div className="w-1/2 h-full bg-slate-900 p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 rounded-bl-[100px] opacity-30 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500 rounded-tr-[100px] opacity-30 blur-xl" />
                    <span className="text-indigo-400 font-bold text-[7px] sm:text-[9px] tracking-widest uppercase mb-1 relative z-10">Chapter 1</span>
                    <h1 className="text-white font-black text-sm sm:text-[22px] leading-tight mb-2 sm:mb-3 relative z-10">Space Exploration</h1>
                    <p className="text-slate-400 text-[6px] sm:text-[9px] leading-relaxed relative z-10">
                       Discovering the cosmos through generative AI design. No design skills required.
                    </p>
                 </div>
                 <div className="w-1/2 h-full relative overflow-hidden border-l border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black">
                       <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full opacity-80 shadow-[0_0_5px_white]" />
                       <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-white rounded-full opacity-60 shadow-[0_0_5px_white]" />
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-700 shadow-[0_0_40px_rgba(52,211,153,0.3)] flex items-center justify-center">
                          <div className="absolute w-24 h-6 sm:w-36 sm:h-8 border-[3px] border-indigo-300/40 rounded-[100%] rotate-[20deg]" />
                       </div>
                    </div>
                 </div>
              </motion.div>

           </div>
        </div>
      )
    default:
      return null
  }
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 sm:py-32 px-6 relative">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Support</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about the product and billing.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl overflow-hidden ring-1 ring-white/50 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-medium text-gray-900">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="shrink-0 ml-4 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 flex flex-col gap-5">
                        <div className="text-gray-600 leading-relaxed text-sm sm:text-base pt-2">
                          {faq.a}
                        </div>
                        <div className="w-full h-40 sm:h-56 shrink-0 rounded-xl overflow-hidden shadow-inner border border-slate-200/50">
                           <FaqVisual type={faq.visual} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

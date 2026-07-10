import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, FileText, Download, Layout, Pencil, Image as ImageIcon } from 'lucide-react'

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
                       {/* Text Column */}
                       <div className="flex-1 flex flex-col gap-2 relative">
                          <motion.div animate={{ width: ['100%', '30%', '70%', '100%'] }} transition={{ duration: 8, times: [0, 0.2, 0.3, 1], repeat: Infinity, ease: "easeInOut" }} className="h-4 sm:h-5 bg-slate-800 rounded-[2px] relative flex items-center justify-end pr-[2px]">
                              {/* Blinking Caret (visible only during edit) */}
                              <motion.div animate={{ opacity: [0, 1, 0, 0, 0] }} transition={{ duration: 8, times: [0, 0.1, 0.2, 0.3, 1], repeat: Infinity }} className="w-[1.5px] h-[60%] bg-white" />
                          </motion.div>
                          <div className="w-full h-2 sm:h-2.5 bg-slate-300 rounded-[2px]" />
                          <div className="w-full h-2 sm:h-2.5 bg-slate-300 rounded-[2px]" />
                          <div className="w-2/3 h-2 sm:h-2.5 bg-slate-300 rounded-[2px]" />
                          
                          {/* Text selection highlight */}
                          <motion.div animate={{ opacity: [0, 1, 1, 0, 0] }} transition={{ duration: 8, times: [0, 0.1, 0.3, 0.35, 1], repeat: Infinity }} className="absolute -top-1 -left-1 w-[105%] h-6 sm:h-7 border border-blue-500 bg-blue-500/10 rounded-[2px] z-10 pointer-events-none" />
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
              <motion.div animate={{ x: [100, -30, -30, 80, 80, 80, 100], y: [80, 10, 10, 30, 30, -20, 80], scale: [1, 1, 0.9, 1, 0.9, 0.9, 1] }} transition={{ duration: 8, times: [0, 0.1, 0.3, 0.4, 0.45, 0.5, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 top-1/2 left-1/2 mt-[-30px] ml-[-40px]">
                 <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-sm border-[2px] border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] transform rotate-[-45deg]" />
              </motion.div>
           </div>
        </div>
      )
    case 'export':
      return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center relative gap-8 sm:gap-16">
           <motion.div animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 4, times: [0, 0.5, 1], repeat: Infinity }} className="absolute top-4 sm:top-6 w-20 h-28 sm:w-24 sm:h-32 bg-white border border-slate-300 rounded-lg shadow-xl flex items-center justify-center z-10">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
           </motion.div>
           
           <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, times: [0.3, 0.5, 0.7], repeat: Infinity }} className="w-28 h-32 sm:w-36 sm:h-40 bg-orange-50 border border-orange-200 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 z-20 mt-12 sm:mt-16 relative overflow-hidden">
              <div className="absolute top-0 w-full h-3 sm:h-4 bg-orange-500" />
              <Download className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
              <span className="text-[12px] sm:text-[14px] font-black text-orange-700 tracking-widest">PPTX</span>
           </motion.div>
           
           <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, times: [0.6, 0.8, 1], repeat: Infinity }} className="w-28 h-32 sm:w-36 sm:h-40 bg-red-50 border border-red-200 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 z-20 mt-12 sm:mt-16 relative overflow-hidden">
              <div className="absolute top-0 w-full h-3 sm:h-4 bg-red-500" />
              <Download className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
              <span className="text-[12px] sm:text-[14px] font-black text-red-700 tracking-widest">PDF</span>
           </motion.div>
        </div>
      )
    case 'design':
      return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center relative overflow-hidden">
           <div className="w-64 sm:w-96 h-36 sm:h-48 bg-white shadow-xl border border-slate-200 rounded-xl p-4 sm:p-5 relative flex flex-col overflow-hidden">
              {/* Messy State */}
              <motion.div animate={{ opacity: [1, 0, 0, 1] }} transition={{ duration: 4, times: [0, 0.4, 0.8, 1], repeat: Infinity }} className="absolute inset-0 p-4">
                 <div className="w-24 h-4 sm:h-5 bg-slate-800 rounded-[2px] rotate-12 ml-6 mt-2" />
                 <div className="w-32 h-8 sm:h-10 bg-slate-300 rounded-[2px] -rotate-6 ml-10 mt-6" />
                 <div className="w-20 h-8 sm:h-10 bg-slate-400 rounded-[2px] rotate-12 ml-2 mt-4" />
              </motion.div>
              {/* Auto-Align Magic effect */}
              <motion.div animate={{ scale: [0, 2.5, 0], opacity: [0, 1, 0], rotate: 180 }} transition={{ duration: 4, times: [0.3, 0.5, 0.7], repeat: Infinity }} className="absolute inset-0 flex items-center justify-center z-20">
                 <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
              </motion.div>
              {/* Clean State */}
              <motion.div animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 4, times: [0, 0.5, 0.9, 1], repeat: Infinity }} className="absolute inset-0 p-4 sm:p-5 bg-emerald-50">
                 <div className="w-3/4 h-5 sm:h-6 bg-emerald-800 rounded-[2px] mb-3" />
                 <div className="flex gap-3 h-16 sm:h-20">
                    <div className="flex-1 bg-emerald-200 rounded-[2px]" />
                    <div className="flex-1 bg-emerald-200 rounded-[2px]" />
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
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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

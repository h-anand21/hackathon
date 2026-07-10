import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Sparkles, Image, Zap, Layout, RefreshCw, Palette,
  Mic, Download, Users, Pencil, Cloud, Shield, ChevronDown, ChevronUp, ArrowDown, ShieldCheck, FileText
} from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'AI Generated Slides', desc: 'Gemini AI writes professional, structured content for every slide automatically.', color: '#6366f1' },
  { icon: Image, title: 'Custom AI Images', desc: 'DALL·E 3 generates context-aware illustrations — no stock photos ever.', color: '#22d3ee' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Full 10-slide presentation with images ready in under 30 seconds.', color: '#f59e0b' },
  { icon: Layout, title: 'Pro Templates', desc: '8+ premium presentation themes designed by experts.', color: '#8b5cf6' },
  { icon: RefreshCw, title: 'Regenerate Instantly', desc: 'Not happy with a slide? Regenerate individual slides with one click.', color: '#10b981' },
  { icon: Palette, title: 'Multiple Themes', desc: 'Choose from Minimal, Bold, Professional, Visual and more styles.', color: '#ec4899' },
  { icon: Mic, title: 'Speaker Notes', desc: 'AI writes detailed speaker notes for every slide automatically.', color: '#6366f1' },
  { icon: Download, title: 'Export PPTX', desc: 'Download as PowerPoint file, ready to present anywhere.', color: '#22d3ee' },
  { icon: Users, title: 'Team Collab', desc: 'Share presentations with your team and collaborate in real-time.', color: '#f59e0b' },
  { icon: Pencil, title: 'Realtime Editing', desc: 'Edit any slide, title, or bullet after generation seamlessly.', color: '#8b5cf6' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'All presentations saved to your account, accessible anywhere.', color: '#10b981' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and never shared. You own your content.', color: '#ec4899' },
]

const getIconAnimation = (title: string) => {
  switch (title) {
    case 'AI Generated Slides': return { rotate: [0, 15, -15, 0], scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Custom AI Images': return { y: [0, -4, 0], opacity: [1, 0.6, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Lightning Fast': return { x: [-2, 2, -2, 2, 0], rotate: [0, -10, 10, 0], transition: { repeat: Infinity, duration: 0.6 } }
    case 'Pro Templates': return { rotateY: [0, 180, 360], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
    case 'Regenerate Instantly': return { rotate: [0, 360], transition: { repeat: Infinity, duration: 1.2, ease: "linear" } }
    case 'Multiple Themes': return { rotate: [0, -15, 15, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Speaker Notes': return { scaleY: [1, 1.3, 0.8, 1], transition: { repeat: Infinity, duration: 1 } }
    case 'Export PPTX': return { y: [0, 6, 0], transition: { repeat: Infinity, duration: 1 } }
    case 'Team Collab': return { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 1.5 } }
    case 'Realtime Editing': return { rotate: [0, -25, 10, 0], transition: { repeat: Infinity, duration: 1.2 } }
    case 'Cloud Storage': return { y: [0, -4, 0], x: [0, 2, -2, 0], transition: { repeat: Infinity, duration: 2 } }
    case 'Secure & Private': return { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5 } }
    default: return { scale: 1.1 }
  }
}

const RealWebMockup = ({ children, activeTab = 'layout' }: { children: React.ReactNode, activeTab?: 'layout'|'image'|'themes'|'notes'|'none' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[260px] h-[90px] bg-white rounded-md border border-slate-200 shadow-md flex overflow-hidden relative">
        {/* Navbar / Topbar */}
        <div className="absolute top-0 w-full h-3 bg-slate-50 border-b border-slate-200 flex items-center px-1.5 gap-1 z-30">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        {/* Sidebar */}
        <div className="w-[35px] bg-white border-r border-slate-200 pt-4 p-1 flex flex-col gap-1 items-center z-20">
           <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${activeTab === 'layout' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><Layout className="w-3 h-3" /></div>
           <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${activeTab === 'image' ? 'bg-cyan-100 text-cyan-600' : 'text-slate-400'}`}><Image className="w-3 h-3" /></div>
           <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${activeTab === 'themes' ? 'bg-pink-100 text-pink-600' : 'text-slate-400'}`}><Palette className="w-3 h-3" /></div>
           <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${activeTab === 'notes' ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400'}`}><Mic className="w-3 h-3" /></div>
        </div>
        {/* Main Canvas */}
        <div className="flex-1 bg-slate-100 relative flex flex-col items-center justify-center overflow-hidden pt-3 z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

const ExpandedAnimation = ({ title, color }: { title: string, color: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, marginTop: 0 }} 
      animate={{ opacity: 1, height: 96, marginTop: 16 }} 
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      className="w-full rounded-lg flex items-center justify-center overflow-hidden relative"
      style={{ backgroundColor: `${color}10` }}
    >
      {(() => {
        switch (title) {
          case 'AI Generated Slides':
            return (
              <RealWebMockup activeTab="layout">
                {/* Step 1: Input Prompt */}
                <motion.div animate={{ opacity: [1, 1, 0], y: [0, 0, 10] }} transition={{ duration: 6, times: [0, 0.3, 0.4], repeat: Infinity }} className="absolute bottom-2 w-[90%] h-6 bg-white border border-slate-200 rounded shadow-sm px-2 flex items-center z-20">
                  <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="text-[6px] text-slate-600 whitespace-nowrap overflow-hidden">Create a deck about AI in Healthcare...</motion.div>
                </motion.div>
                
                {/* Step 2: Generating */}
                <motion.div animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 6, times: [0, 0.4, 0.45, 0.65, 0.7], repeat: Infinity }} className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-[1px] z-20 gap-1 pt-2">
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles className="w-4 h-4 text-indigo-500" /></motion.div>
                   <div className="text-[6px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200 shadow-sm">AI Generating...</div>
                </motion.div>

                {/* Step 3: Result Slide */}
                <motion.div animate={{ opacity: [0, 0, 0, 1, 1], scale: [0.9, 0.9, 0.9, 1, 1] }} transition={{ duration: 6, times: [0, 0.6, 0.7, 0.75, 1], repeat: Infinity }} className="w-32 h-16 bg-white shadow-md border border-slate-200 rounded flex flex-col p-2 gap-1.5 relative z-10">
                   <div className="w-1/2 h-2 bg-slate-800 rounded-sm" />
                   <div className="w-full h-1 bg-slate-300 rounded-sm" />
                   <div className="w-3/4 h-1 bg-slate-300 rounded-sm" />
                </motion.div>
              </RealWebMockup>
            )
          case 'Custom AI Images':
            return (
              <RealWebMockup activeTab="image">
                 {/* Empty Slide */}
                 <div className="w-32 h-16 bg-white shadow-sm border border-slate-200 rounded flex gap-1.5 p-1.5">
                    <div className="flex-1 flex flex-col gap-1.5 mt-1">
                      <div className="w-full h-1.5 bg-slate-800 rounded-sm" />
                      <div className="w-3/4 h-1 bg-slate-300 rounded-sm" />
                    </div>
                    {/* Image Area */}
                    <div className="w-14 h-full bg-slate-100 rounded-sm relative overflow-hidden flex items-center justify-center border border-dashed border-slate-300">
                      {/* Step 1: Prompt */}
                      <motion.div animate={{ opacity: [1, 1, 0] }} transition={{ duration: 5, times: [0, 0.3, 0.4], repeat: Infinity }} className="absolute text-[4px] text-center text-cyan-600 px-1 font-mono">/imagine city</motion.div>
                      {/* Step 2: Scan */}
                      <motion.div animate={{ opacity: [0, 1, 1, 0], top: ['-50%', '-50%', '150%', '150%'] }} transition={{ duration: 5, times: [0, 0.4, 0.7, 1], repeat: Infinity, ease: 'linear' }} className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.8)] z-10" />
                      {/* Step 3: Result */}
                      <motion.div animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 5, times: [0, 0.6, 0.7, 1], repeat: Infinity }} className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-500 z-0 flex items-center justify-center"><Image className="w-3 h-3 text-white/50" /></motion.div>
                    </div>
                 </div>
              </RealWebMockup>
            )
          case 'Lightning Fast':
            return (
              <RealWebMockup activeTab="none">
                 <div className="flex flex-col items-center gap-2">
                   {/* Step 1: Generating Spinner */}
                   <motion.div animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 4, times: [0, 0.5, 0.6, 1], repeat: Infinity }} className="flex flex-col items-center gap-1.5 absolute top-4">
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-amber-400 rounded-full border-t-transparent" />
                     <div className="text-[7px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shadow-sm border border-amber-200">Processing... 30s</div>
                   </motion.div>
                   {/* Step 2: 10 Slides Popup */}
                   <motion.div animate={{ opacity: [0, 0, 1, 1], y: [10, 10, 0, 0] }} transition={{ duration: 4, times: [0, 0.5, 0.6, 1], repeat: Infinity }} className="flex gap-[-5px] absolute top-4 ml-2">
                     {[0,1,2,3].map((i) => (
                       <div key={i} className="w-10 h-7 bg-white shadow-md border border-slate-200 rounded relative -ml-3" style={{ zIndex: i }}>
                          <div className="w-full h-1 bg-amber-400 absolute top-0 rounded-t" />
                       </div>
                     ))}
                     <div className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm border border-emerald-200 ml-1 z-10 flex items-center">10 Slides Ready!</div>
                   </motion.div>
                 </div>
              </RealWebMockup>
            )
          case 'Pro Templates':
            return (
              <RealWebMockup activeTab="layout">
                 {/* Template Selector */}
                 <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 4, times: [0, 0.2, 1], repeat: Infinity }} className="absolute top-2 right-2 bg-white rounded shadow-sm border border-slate-200 px-1 py-0.5 flex gap-1 z-20">
                   <span className="text-[5px] font-bold text-slate-500">Theme:</span>
                   <span className="text-[5px] font-bold text-purple-600">Modern Pitch</span>
                 </motion.div>
                 {/* Morphing Slide */}
                 <motion.div animate={{ backgroundColor: ['#ffffff', '#fdf4ff', '#f3e8ff'], borderRadius: ['4px', '8px', '12px'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="w-32 h-16 shadow-md border border-purple-200 p-2 flex flex-col justify-center items-center gap-1.5 relative z-10 mt-2">
                    <motion.div animate={{ width: ['40%', '60%', '80%'], height: ['4px', '6px', '8px'], backgroundColor: ['#1e293b', '#a21caf', '#7e22ce'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="rounded-sm" />
                    <motion.div animate={{ width: ['80%', '100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="h-1 bg-slate-300 rounded-sm" />
                 </motion.div>
              </RealWebMockup>
            )
          case 'Regenerate Instantly':
            return (
              <RealWebMockup activeTab="layout">
                 <div className="relative w-32 h-16 bg-white shadow-sm border border-slate-200 rounded p-1.5">
                   <div className="w-full h-10 bg-slate-50 border border-dashed border-slate-300 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Old State */}
                      <motion.div animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 4, times: [0, 0.3, 0.4, 1], repeat: Infinity }} className="absolute inset-0 flex flex-col gap-1 p-1 items-center justify-center">
                        <div className="w-3/4 h-2 bg-slate-300 rounded" />
                        <div className="w-1/2 h-2 bg-slate-200 rounded" />
                      </motion.div>
                      
                      {/* Regen Button Click */}
                      <motion.div animate={{ scale: [1, 1.2, 0.9, 1], opacity: [0, 1, 1, 0] }} transition={{ duration: 4, times: [0, 0.1, 0.3, 0.4], repeat: Infinity }} className="absolute bg-emerald-500 rounded-full p-1 shadow-md z-20">
                         <RefreshCw className="w-3 h-3 text-white" />
                      </motion.div>

                      {/* New State */}
                      <motion.div animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 4, times: [0, 0.4, 0.5, 1], repeat: Infinity }} className="absolute inset-0 bg-emerald-50 flex flex-col gap-1 p-1 items-start justify-center">
                        <div className="w-1/2 h-2 bg-emerald-400 rounded" />
                        <div className="w-3/4 h-2 bg-emerald-300 rounded" />
                        <div className="w-1/4 h-2 bg-emerald-200 rounded" />
                      </motion.div>
                   </div>
                 </div>
              </RealWebMockup>
            )
          case 'Multiple Themes':
            return (
              <RealWebMockup activeTab="themes">
                 {/* Slide Canvas */}
                 <motion.div animate={{ backgroundColor: ['#ffffff', '#eff6ff', '#ecfdf5', '#ffffff'] }} transition={{ duration: 6, repeat: Infinity }} className="w-32 h-16 shadow-md border border-slate-200 rounded p-2 flex flex-col gap-1.5 relative">
                   <motion.div animate={{ backgroundColor: ['#0f172a', '#1d4ed8', '#047857', '#0f172a'] }} transition={{ duration: 6, repeat: Infinity }} className="w-2/3 h-2 rounded-sm" />
                   <motion.div animate={{ backgroundColor: ['#64748b', '#60a5fa', '#34d399', '#64748b'] }} transition={{ duration: 6, repeat: Infinity }} className="w-full h-1 rounded-sm" />
                   {/* Color Palettes Floating */}
                   <motion.div animate={{ opacity: [1, 0, 0, 1] }} transition={{ duration: 6, times: [0, 0.3, 0.9, 1], repeat: Infinity }} className="absolute -right-2 top-2 w-4 h-4 bg-slate-800 rounded-full shadow border-2 border-white" />
                   <motion.div animate={{ opacity: [0, 1, 0, 0] }} transition={{ duration: 6, times: [0, 0.3, 0.6, 1], repeat: Infinity }} className="absolute -right-2 top-2 w-4 h-4 bg-blue-600 rounded-full shadow border-2 border-white" />
                   <motion.div animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 6, times: [0, 0.6, 0.9, 1], repeat: Infinity }} className="absolute -right-2 top-2 w-4 h-4 bg-emerald-600 rounded-full shadow border-2 border-white" />
                 </motion.div>
              </RealWebMockup>
            )
          case 'Speaker Notes':
            return (
              <RealWebMockup activeTab="notes">
                <div className="w-32 h-16 bg-white shadow-sm border border-slate-200 rounded flex flex-col overflow-hidden relative">
                   {/* Main Slide Area */}
                   <div className="flex-1 bg-slate-50 flex items-center justify-center border-b border-slate-200">
                      <div className="w-16 h-2 bg-slate-800/10 rounded" />
                   </div>
                   {/* Notes Drawer */}
                   <motion.div animate={{ height: ['4px', '24px', '24px', '4px'] }} transition={{ duration: 5, times: [0, 0.3, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }} className="w-full bg-yellow-50 overflow-hidden relative flex flex-col justify-end">
                      <div className="w-full h-full p-1 border-t border-yellow-200">
                        <motion.div animate={{ width: ['0%', '90%', '90%'] }} transition={{ duration: 5, times: [0.3, 0.5, 1], repeat: Infinity }} className="h-1 bg-yellow-400 rounded-sm mb-0.5" />
                        <motion.div animate={{ width: ['0%', '60%', '60%'] }} transition={{ duration: 5, times: [0.3, 0.6, 1], repeat: Infinity }} className="h-1 bg-yellow-400 rounded-sm" />
                      </div>
                   </motion.div>
                </div>
              </RealWebMockup>
            )
          case 'Export PPTX':
            return (
              <RealWebMockup activeTab="none">
                 <div className="w-32 h-16 bg-white shadow-sm border border-slate-200 rounded relative">
                   <div className="absolute top-1 right-1 px-1 py-0.5 bg-slate-100 rounded border border-slate-200 flex gap-0.5 items-center z-10">
                     <span className="text-[4px] font-bold text-slate-500">Export</span><ChevronDown className="w-2 h-2 text-slate-400" />
                   </div>
                   {/* Dropdown Open */}
                   <motion.div animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 0, 0] }} transition={{ duration: 4, times: [0, 0.2, 0.8, 1], repeat: Infinity }} className="absolute top-4 right-1 bg-white shadow-lg border border-slate-200 rounded w-20 flex flex-col z-20">
                      <div className="text-[5px] p-1 border-b border-slate-100 hover:bg-slate-50">PDF Document</div>
                      <div className="text-[5px] p-1 bg-orange-50 text-orange-700 font-bold flex items-center justify-between">PowerPoint <Download className="w-2 h-2" /></div>
                   </motion.div>
                   {/* Download Animation */}
                   <motion.div animate={{ y: [-10, 20], opacity: [0, 0, 1, 0], scale: [0.5, 1, 1, 0.5] }} transition={{ duration: 4, times: [0, 0.4, 0.6, 0.8], repeat: Infinity }} className="absolute left-10 top-0 z-30 w-8 h-10 bg-orange-500 border border-orange-600 rounded flex items-center justify-center shadow-lg">
                      <span className="text-[5px] text-white font-bold tracking-widest">PPTX</span>
                   </motion.div>
                 </div>
              </RealWebMockup>
            )
          case 'Team Collab':
            return (
              <RealWebMockup activeTab="none">
                 <div className="w-36 h-16 bg-white shadow-sm border border-slate-200 rounded p-1.5 relative overflow-hidden flex flex-col gap-1">
                   <div className="text-[6px] font-bold text-slate-400">Marketing Deck</div>
                   <div className="w-full h-1 bg-slate-200 rounded-sm" />
                   <div className="w-2/3 h-1 bg-slate-200 rounded-sm" />
                   
                   {/* Cursor 1 (Alex) - Types Text */}
                   <motion.div animate={{ x: [5, 45, 45, 5], y: [20, 5, 5, 20] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute z-10 flex items-start">
                      <div className="w-3 h-3 bg-blue-500 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm border-[1px] border-white shadow-sm transform rotate-[-45deg] mt-1" />
                      <div className="bg-blue-500 text-white text-[5px] font-bold px-1 py-0.5 rounded shadow ml-[-2px] mt-2">Alex</div>
                   </motion.div>

                   {/* Cursor 2 (Sarah) - Edits Image */}
                   <motion.div animate={{ x: [100, 70, 70, 100], y: [15, 5, 5, 15] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute z-10 flex items-start">
                      <div className="w-3 h-3 bg-emerald-500 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm border-[1px] border-white shadow-sm transform rotate-[-45deg] mt-1" />
                      <div className="bg-emerald-500 text-white text-[5px] font-bold px-1 py-0.5 rounded shadow ml-[-2px] mt-2">Sarah</div>
                   </motion.div>

                   {/* Elements changing in realtime */}
                   <motion.div animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5, times: [0, 0.4, 0.8, 1], repeat: Infinity }} className="absolute top-2 left-6 w-10 h-2 bg-blue-100 rounded-sm" />
                   <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, times: [0, 0.5, 1], repeat: Infinity }} className="absolute top-4 right-2 w-10 h-8 bg-emerald-100 border border-emerald-300 border-dashed rounded-sm" />
                 </div>
              </RealWebMockup>
            )
          case 'Realtime Editing':
            return (
              <RealWebMockup activeTab="layout">
                 <div className="w-32 h-16 bg-white shadow-sm border border-slate-200 rounded flex items-center justify-center relative group">
                    <div className="text-[10px] font-extrabold text-slate-800">
                      {/* Step 1: Select */}
                      <motion.span animate={{ backgroundColor: ['transparent', '#e9d5ff', 'transparent'] }} transition={{ duration: 4, times: [0, 0.2, 1], repeat: Infinity }}>Title</motion.span>
                      {/* Step 2: Edit */}
                      <motion.span animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 4, times: [0, 0.4, 0.5, 1], repeat: Infinity }} className="text-purple-600"> Goes Here</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0, 1, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-purple-500 font-normal">|</motion.span>
                    </div>
                 </div>
              </RealWebMockup>
            )
          case 'Cloud Storage':
            return (
              <RealWebMockup activeTab="none">
                 <div className="w-full h-full flex items-center justify-center relative">
                   <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-slate-200 z-20">
                     <motion.div animate={{ opacity: [1, 1, 0] }} transition={{ duration: 4, times: [0, 0.5, 1], repeat: Infinity }} className="flex items-center gap-1">
                        <RefreshCw className="w-2 h-2 text-slate-400 animate-spin" />
                        <span className="text-[5px] text-slate-500">Saving...</span>
                     </motion.div>
                     <motion.div animate={{ opacity: [0, 0, 1] }} transition={{ duration: 4, times: [0, 0.6, 1], repeat: Infinity }} className="flex items-center gap-1 absolute inset-0 bg-emerald-50 rounded-full px-1.5 py-0.5 justify-center">
                        <ShieldCheck className="w-2 h-2 text-emerald-600" />
                        <span className="text-[5px] text-emerald-600 font-bold">Saved</span>
                     </motion.div>
                   </div>
                   
                   <Cloud className="w-10 h-10 text-emerald-500 drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)] z-10" />
                   <motion.div animate={{ y: [10, -5], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute z-20 text-emerald-100"><ChevronUp className="w-4 h-4" /></motion.div>
                 </div>
              </RealWebMockup>
            )
          case 'Secure & Private':
            return (
              <RealWebMockup activeTab="none">
                 <div className="w-32 h-16 bg-white shadow-sm border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-slate-50 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')]" />
                   <div className="z-10 flex items-center gap-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow border border-pink-100">
                     <ShieldCheck className="w-6 h-6 text-pink-600 drop-shadow" />
                     <div className="flex flex-col">
                       <span className="text-[5px] font-black text-pink-600 uppercase tracking-widest">End-to-End</span>
                       <span className="text-[8px] font-bold text-slate-800">Encrypted</span>
                     </div>
                   </div>
                   <motion.div animate={{ left: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute top-0 w-4 h-full bg-pink-400/20 skew-x-[30deg] blur-sm z-20" />
                 </div>
              </RealWebMockup>
            )
          default:
            return null
        }
      })()}
    </motion.div>
  )
}

export default function Features() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <section id="features" className="py-24 sm:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Toolkit</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
            Professional presentations powered entirely by AI. No design skills required.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                layout
                key={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: { 
                    opacity: 1, y: 0, scale: 1,
                    transition: { duration: 0.6, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }
                  },
                  hover: { 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
                  }
                }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 group relative overflow-hidden ring-1 ring-white/50 shadow-sm transition-all duration-300"
              >
                {/* Interactive Expand Arrow */}
                <div 
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 hover:scale-110 transition-all z-20 shadow-sm"
                >
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${expandedIdx === i ? 'rotate-180' : ''}`} />
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${feature.color}10, transparent 70%)` }}
                />
                <motion.div
                  layout="position"
                  variants={{
                    hidden: { scale: 1, rotate: 0, x: 0, y: 0, rotateY: 0 },
                    visible: { scale: 1, rotate: 0, x: 0, y: 0, rotateY: 0 },
                    hover: getIconAnimation(feature.title)
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={18} style={{ color: feature.color }} />
                </motion.div>
                
                <motion.h3 layout="position" className="text-base font-semibold text-gray-900 mb-2">{feature.title}</motion.h3>
                <motion.p layout="position" className="text-sm text-gray-600 leading-relaxed">{feature.desc}</motion.p>

                <AnimatePresence>
                  {expandedIdx === i && (
                    <ExpandedAnimation title={feature.title} color={feature.color} />
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

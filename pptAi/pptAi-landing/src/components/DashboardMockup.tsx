import { useEffect, useRef, useState } from 'react'
import { PanelLeft, ChevronLeft, ChevronRight, Monitor, RotateCw, Share, Plus, Copy, Grid, Compass, Layers, ListTodo, Sparkles } from 'lucide-react'
import Logo from './Logo'

export default function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const DESIGN_WIDTH = 896

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newScale = entry.contentRect.width / DESIGN_WIDTH
        setScale(newScale)
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full relative">
      <div 
        ref={innerRef}
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          width: DESIGN_WIDTH,
        }}
        className="rounded-t-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left flex flex-col absolute top-0 left-0"
      >
        {/* Title bar */}
        <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
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
          <div className="w-[22%] border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col">
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

          {/* Main */}
          <div className="flex-1 bg-[#1a1a1c] p-6">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e8553f] flex items-center justify-center text-white font-bold text-lg">M</div>
                <div>
                  <h2 className="text-sm font-medium text-white">My Presentations</h2>
                  <p className="text-[10px] text-white/45">Manage and generate your AI presentations.</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-md text-[10px] font-medium hover:bg-gray-200 transition-colors">
                <Sparkles className="w-3 h-3" /> Generate
              </button>
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
          </div>
        </div>
      </div>
      {/* Spacer to prevent overlap since inner is absolute & scaled */}
      <div style={{ height: 521 * scale }} className="w-full" />
    </div>
  )
}

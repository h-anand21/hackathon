import { useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'
import { Plus, X, LayoutTemplate } from 'lucide-react'

type AddSlideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSlide: (data: {
    title: string
    content: string
    layoutType: string
    diagramType?: string | null
    diagramData?: string | null
  }) => void
  isPending?: boolean
}

const ARCHETYPES = [
  {
    id: 'hero',
    title: 'Executive Hero',
    description: 'Impactful title cover with large display typography and visual backdrop.',
    emoji: '🎯',
    tag: 'Cover',
    defaultTitle: 'Executive Vision & Strategy',
    defaultContent: 'Key initiatives and strategic roadmap for the upcoming quarter.',
    layoutType: 'hero',
    diagramType: null,
    diagramData: null,
  },
  {
    id: 'split-right',
    title: 'Split Visual & Bullets',
    description: 'Clean two-column layout with bullet points paired with AI visual.',
    emoji: '⬛▪',
    tag: 'Content',
    defaultTitle: 'Core Capabilities & Value Props',
    defaultContent: '• High-speed automated workflows\n• Enterprise-grade data protection\n• Seamless third-party integrations',
    layoutType: 'split-right',
    diagramType: null,
    diagramData: null,
  },
  {
    id: 'stat-card',
    title: 'Metric & Stat Cards',
    description: 'Three high-contrast metric cards for KPIs, performance, and data.',
    emoji: '📊',
    tag: 'Data',
    defaultTitle: 'Key Performance Milestones',
    defaultContent: '10x : Speed Increase\n99.9% : System Uptime\n$4.2M : ARR Growth',
    layoutType: 'stat-card',
    diagramType: 'stats',
    diagramData: JSON.stringify({
      stats: [
        { value: '10x', label: 'Speed Increase' },
        { value: '99.9%', label: 'System Uptime' },
        { value: '$4.2M', label: 'ARR Growth' },
      ],
    }),
  },
  {
    id: 'flow',
    title: 'Process & Roadmap Flow',
    description: 'Connected horizontal sequence showing how it works step-by-step.',
    emoji: '🔄',
    tag: 'Process',
    defaultTitle: 'Three-Stage Execution Pipeline',
    defaultContent: '1. Discovery\n2. Optimization\n3. Scaled Rollout',
    layoutType: 'diagram',
    diagramType: 'flow',
    diagramData: JSON.stringify({
      steps: ['1. Discovery & Analysis', '2. Autonomous Execution', '3. Global Deployment'],
    }),
  },
  {
    id: 'comparison',
    title: 'Comparison (A vs B)',
    description: 'Side-by-side card comparison for solutions, alternatives, or benchmarks.',
    emoji: '⚖️',
    tag: 'Analysis',
    defaultTitle: 'Legacy Approach vs Modern Engine',
    defaultContent: 'Traditional manual workflow vs automated AI pipeline',
    layoutType: 'diagram',
    diagramType: 'comparison',
    diagramData: JSON.stringify({
      left: { label: 'Legacy Manual', points: ['High latency (days)', 'High cost', 'Prone to human error'] },
      right: { label: 'PPT.ai Autonomous', points: ['Instant generation (<10s)', '100% vector editable', 'Deterministic layouts'] },
    }),
  },
  {
    id: 'text-only',
    title: 'Quote & Editorial Statement',
    description: 'Oversized callout statement for key takeaways or customer quotes.',
    emoji: '📝',
    tag: 'Quote',
    defaultTitle: '“The best presentations are the ones created autonomously with zero manual effort.”',
    defaultContent: '— Autonomous Agent Systems Review, 2026',
    layoutType: 'text-only',
    diagramType: null,
    diagramData: null,
  },
]

export function AddSlideDialog({
  open,
  onOpenChange,
  onAddSlide,
  isPending,
}: AddSlideDialogProps) {
  const [selectedId, setSelectedId] = useState('split-right')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  const handleCreate = () => {
    const archetype = ARCHETYPES.find((a) => a.id === selectedId) ?? ARCHETYPES[1]
    onAddSlide({
      title: archetype.defaultTitle,
      content: archetype.defaultContent,
      layoutType: archetype.layoutType,
      diagramType: archetype.diagramType,
      diagramData: archetype.diagramData,
    })
    onOpenChange(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#0B0F17] border border-white/10 text-white rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="size-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <LayoutTemplate className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Add Slide Archetype
            </h3>
            <p className="text-xs text-slate-400">
              Choose a structured visual layout archetype for your new slide.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              type="button"
              onClick={() => setSelectedId(arch.id)}
              className={`flex flex-col items-start p-3.5 rounded-2xl text-left transition-all border relative ${
                selectedId === arch.id
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50'
                  : 'border-white/5 bg-[#10131B] hover:bg-[#151924] hover:border-white/15'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-2xl">{arch.emoji}</span>
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {arch.tag}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white font-display mb-1">
                {arch.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                {arch.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-5 mt-3 border-t border-white/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={isPending}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs gap-1.5 px-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Plus className="size-3.5" />
            Insert Slide
          </Button>
        </div>
      </div>
    </div>
  )
}

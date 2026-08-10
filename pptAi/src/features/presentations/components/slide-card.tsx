import { useState } from 'react'
import { Copy, Trash2, ChevronUp, ChevronDown, ImageIcon, Loader2 } from 'lucide-react'

type SlideCardProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
    layoutType?: string | null
    diagramType?: string | null
    diagramData?: string | null
  }
  isActive?: boolean
  onClick?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  index?: number
}

const LAYOUT_TAGS: Record<string, { label: string; color: string }> = {
  hero: { label: 'HERO', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'split-right': { label: 'SPLIT', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'split-left': { label: 'SPLIT', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'stat-card': { label: 'STATS', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  diagram: { label: 'DIAGRAM', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'text-only': { label: 'TEXT', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

export function SlideCard({
  slide,
  isActive,
  onClick,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
}: SlideCardProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const slideNumber = index || slide.order + 1
  const tag = LAYOUT_TAGS[slide.layoutType ?? 'split-right'] ?? LAYOUT_TAGS['split-right']

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`w-full text-left rounded-[16px] p-3 transition-all duration-300 relative group overflow-hidden cursor-pointer ${
        isActive
          ? 'bg-[#0F131C] border border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
          : 'bg-[#0F131C]/60 hover:bg-[#0F131C] border border-white/5 hover:border-white/15 hover:shadow-[0_0_25px_rgba(0,0,0,0.4)]'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-transparent to-purple-500/5 pointer-events-none" />
      )}

      {/* Quick Action Floating Bar on Hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg">
        {onMoveUp && !isFirst && (
          <button
            type="button"
            title="Move Up"
            onClick={(e) => { e.stopPropagation(); onMoveUp() }}
            className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ChevronUp className="size-3.5" />
          </button>
        )}
        {onMoveDown && !isLast && (
          <button
            type="button"
            title="Move Down"
            onClick={(e) => { e.stopPropagation(); onMoveDown() }}
            className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ChevronDown className="size-3.5" />
          </button>
        )}
        {onDuplicate && (
          <button
            type="button"
            title="Duplicate Slide"
            onClick={(e) => { e.stopPropagation(); onDuplicate() }}
            className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20"
          >
            <Copy className="size-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            title="Delete Slide"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 relative z-10">
        <div className="relative shrink-0">
          <span
            className={`flex items-center justify-center size-[26px] rounded-lg text-xs font-mono font-bold backdrop-blur-md relative z-10 ${
              isActive
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {slideNumber}
          </span>
          {isActive && <div className="absolute inset-0 bg-cyan-500 blur-sm opacity-50 rounded-lg" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <h3 className={`text-xs font-semibold line-clamp-1 font-display ${isActive ? 'text-white' : 'text-slate-200'}`}>
              {slide.title || 'Untitled Slide'}
            </h3>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${tag.color}`}>
              {tag.label}
            </span>
          </div>

          <div className="aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5 relative group-hover:border-white/10 transition-colors">
            {slide.imageUrl ? (
              <>
                {imageStatus === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-4 text-cyan-400 animate-spin" />
                  </div>
                )}
                {imageStatus === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-1">
                    <ImageIcon className="size-4 text-slate-500" />
                    <span className="text-[9px] text-slate-500">Image</span>
                  </div>
                )}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageStatus('loaded')}
                  onError={() => setImageStatus('error')}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-2 text-center bg-gradient-to-br from-white/[0.02] to-transparent">
                <span className="text-[10px] text-slate-500 line-clamp-2 font-mono">
                  {slide.diagramType ? `📊 ${slide.diagramType}` : 'No visual'}
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1.5 font-sans">
            {slide.content}
          </p>
        </div>
      </div>
    </div>
  )
}


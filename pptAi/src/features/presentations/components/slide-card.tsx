import { useState } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'

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
  index?: number
}

export function SlideCard({ slide, isActive, onClick, index }: SlideCardProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const slideNumber = index || slide.order + 1

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[16px] p-3 transition-all duration-300 relative group overflow-hidden ${
        isActive
          ? 'bg-[#10131B] border border-[#FF8A2A] shadow-[0_0_20px_rgba(255,138,42,0.15)]'
          : 'bg-[#10131B]/50 hover:bg-[#10131B] border border-white/5 hover:border-white/10 hover:shadow-[0_0_25px_rgba(255,138,42,0.18)] hover:scale-[1.02]'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF8A2A]/5 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="relative shrink-0">
          <span
            className={`flex items-center justify-center size-[30px] rounded-full text-xs font-semibold backdrop-blur-md relative z-10 ${
              isActive
                ? 'bg-[#FF8A2A] text-white shadow-[0_0_15px_rgba(255,138,42,0.5)]'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {slideNumber}
          </span>
          {isActive && <div className="absolute inset-0 bg-[#FF8A2A] blur-md opacity-50 rounded-full" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-xs font-semibold line-clamp-1 mb-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>
            {slide.title}
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5 relative group-hover:border-white/10 transition-colors">
            {slide.imageUrl ? (
              <>
                {imageStatus === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="size-5 text-muted-foreground animate-spin" />
                  </div>
                )}
                {imageStatus === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 gap-1">
                    <ImageIcon className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Loading…
                    </span>
                  </div>
                )}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-opacity ${
                    imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageStatus('loaded')}
                  onError={() => setImageStatus('error')}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  No image
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
            {slide.content}
          </p>
        </div>
      </div>
    </button>
  )
}

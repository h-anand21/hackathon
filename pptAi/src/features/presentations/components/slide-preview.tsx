import { useState } from 'react'
import { DiagramRenderer } from './diagram-renderer'

type SlideData = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
  imageStyle?: string | null
  imagePrompt?: string | null
  layoutType?: string | null
  diagramType?: string | null
  diagramData?: string | null
}

type SlidePreviewProps = {
  slide: SlideData
  isFullscreen?: boolean
  theme?: string
}

const THEMES: Record<string, { bg: string; text: string; muted: string; accent: string; surface: string }> = {
  'dark-slate': { bg: '#0F172A', text: '#F8FAFC', muted: '#94A3B8', accent: '#3B82F6', surface: 'rgba(255,255,255,0.06)' },
  'light-paper': { bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', accent: '#2563EB', surface: 'rgba(0,0,0,0.04)' },
  'ocean': { bg: '#0C1445', text: '#E0F2FE', muted: '#7DD3FC', accent: '#38BDF8', surface: 'rgba(255,255,255,0.06)' },
  'forest': { bg: '#0D2818', text: '#ECFDF5', muted: '#86EFAC', accent: '#22C55E', surface: 'rgba(255,255,255,0.06)' },
  'sunset': { bg: '#1C0A00', text: '#FFF7ED', muted: '#FCA5A5', accent: '#F97316', surface: 'rgba(255,255,255,0.06)' },
  'purple-haze': { bg: '#1A0533', text: '#FAF5FF', muted: '#C084FC', accent: '#A855F7', surface: 'rgba(255,255,255,0.06)' },
}

function parseBullets(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith('•') ? l.slice(1).trim() : l))
}

export function SlidePreview({ slide, isFullscreen, theme = 'dark-slate' }: SlidePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const t = THEMES[theme] ?? THEMES['dark-slate']
  const layout = slide.layoutType ?? 'split-right'
  const bullets = parseBullets(slide.content)
  const scale = isFullscreen ? 1 : 1

  
  const outerClass = isFullscreen
    ? 'w-full h-full'
    : 'glass rounded-2xl overflow-hidden'

  const slideStyle: React.CSSProperties = {
    background: t.bg,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  }

  // Image crop helpers based on slide.imageStyle
  const fitClass = slide.imageStyle === 'contain' ? 'object-contain bg-black/40' : 'object-cover'
  const posStyle = slide.imageStyle === 'cover-top' ? 'top center' : slide.imageStyle === 'cover-bottom' ? 'bottom center' : 'center center'

  // ── HERO layout (title/cover) ─────────────────────────────────────────────
  if (layout === 'hero') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col items-center justify-center text-center overflow-hidden ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
          style={slideStyle}
        >
          {/* Background image full bleed */}
          {slide.imageUrl && (
            <>
              <img
                src={slide.imageUrl}
                alt=""
                className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-700 ${imageLoaded ? 'opacity-60' : 'opacity-0'}`}
                style={{ objectPosition: posStyle }}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)' }} />
            </>
          )}
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accent}80)` }} />
          {/* Glowing orb */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px]" style={{ background: `${t.accent}20` }} />

          <div className="relative z-10 px-12 max-w-3xl">
            <div className="w-12 h-1 mx-auto mb-6" style={{ background: t.accent }} />
            <h1
              className="font-black tracking-tight mb-6"
              style={{ color: t.text, fontSize: isFullscreen ? 'clamp(2.5rem,6vw,5rem)' : 'clamp(1.5rem,3vw,2.5rem)', lineHeight: 1.1 }}
            >
              {slide.title}
            </h1>
            {slide.content && (
              <p style={{ color: t.muted, fontSize: isFullscreen ? '1.25rem' : '0.9rem', lineHeight: 1.6 }}>
                {parseBullets(slide.content).join(' • ')}
              </p>
            )}
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── TEXT-ONLY layout ───────────────────────────────────────────────────────
  if (layout === 'text-only') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col justify-center px-16 overflow-hidden ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
          style={slideStyle}
        >
          <div className="w-1 self-stretch max-h-20 rounded-full absolute left-10" style={{ background: t.accent }} />
          <h2 className="font-black mb-6" style={{ color: t.text, fontSize: isFullscreen ? 'clamp(2rem,4vw,3.5rem)' : 'clamp(1.25rem,2.5vw,2rem)', lineHeight: 1.2 }}>
            {slide.title}
          </h2>
          <div className="space-y-3">
            {bullets.map((b, i) => (
              <p key={i} style={{ color: t.muted, fontSize: isFullscreen ? '1.2rem' : '0.9rem', lineHeight: 1.7 }}>
                {b}
              </p>
            ))}
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── STAT-CARD layout ───────────────────────────────────────────────────────
  if (layout === 'stat-card') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col overflow-hidden ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
          style={slideStyle}
        >
          {/* Header */}
          <div className="px-10 pt-10 pb-6">
            <div className="w-8 h-0.5 mb-3" style={{ background: t.accent }} />
            <h2 className="font-bold" style={{ color: t.text, fontSize: isFullscreen ? '2rem' : '1.2rem' }}>
              {slide.title}
            </h2>
          </div>
          {/* Stats row */}
          <div className="flex-1 flex items-center justify-center gap-6 px-10 pb-10">
            {/* If we have diagram data, render it */}
            {slide.diagramType === 'stats' && slide.diagramData ? (
              <DiagramRenderer diagramType="stats" diagramData={slide.diagramData} theme={theme} />
            ) : (
              // Fallback: bullets as big cards
              <div className="w-full grid grid-cols-3 gap-4">
                {bullets.slice(0, 3).map((b, i) => {
                  const parts = b.split(':')
                  const val = parts[0]?.trim() ?? b
                  const lbl = parts[1]?.trim() ?? ''
                  return (
                    <div key={i} className="rounded-2xl p-6 text-center" style={{ background: t.surface, border: `1px solid ${t.accent}20` }}>
                      <div className="text-4xl font-black mb-2" style={{ color: t.accent }}>{val}</div>
                      {lbl && <div className="text-sm" style={{ color: t.muted }}>{lbl}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── DIAGRAM layout ─────────────────────────────────────────────────────────
  if (layout === 'diagram') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col overflow-hidden ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
          style={slideStyle}
        >
          {/* Header */}
          <div className="px-10 pt-8 pb-4 flex-shrink-0">
            <div className="w-8 h-0.5 mb-3" style={{ background: t.accent }} />
            <h2 className="font-bold" style={{ color: t.text, fontSize: isFullscreen ? '1.8rem' : '1.1rem' }}>
              {slide.title}
            </h2>
          </div>
          {/* Diagram fills remaining space */}
          <div className="flex-1 min-h-0">
            <DiagramRenderer
              diagramType={slide.diagramType ?? 'flow'}
              diagramData={slide.diagramData}
              theme={theme}
            />
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── SPLIT layouts (split-right / split-left) — DEFAULT ────────────────────
  const imageOnRight = layout !== 'split-left'

  return (
    <div className={outerClass}>
      <div
        className={`relative flex overflow-hidden ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}
        style={{ ...slideStyle, flexDirection: imageOnRight ? 'row' : 'row-reverse' }}
      >
        {/* Text side */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 relative z-10 min-w-0">
          <div className="w-8 h-0.5 mb-4" style={{ background: t.accent }} />
          <h2
            className="font-bold mb-5 leading-tight"
            style={{ color: t.text, fontSize: isFullscreen ? 'clamp(1.5rem,3.5vw,3rem)' : 'clamp(1rem,2vw,1.5rem)' }}
          >
            {slide.title}
          </h2>
          <div className="space-y-2.5">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.accent }} />
                <p style={{ color: t.muted, fontSize: isFullscreen ? '1.1rem' : '0.82rem', lineHeight: 1.65 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image side */}
        <div className="flex-shrink-0 relative overflow-hidden" style={{ width: '45%' }}>
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ objectPosition: posStyle }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: `linear-gradient(135deg, ${t.surface}, ${t.accent}15)` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1" opacity={0.4}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ color: t.muted, fontSize: '0.65rem', opacity: 0.6 }}>No image</span>
            </div>
          )}
          {/* Gradient fade toward text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: imageOnRight
                ? `linear-gradient(to right, ${t.bg} 0%, transparent 20%)`
                : `linear-gradient(to left, ${t.bg} 0%, transparent 20%)`,
            }}
          />
        </div>
      </div>
      {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
    </div>
  )
}

function Notes({ notes }: { notes: string }) {
  return (
    <div className="p-4 border-t border-white/5 bg-black/20">
      <p className="text-xs text-slate-400">
        <span className="font-medium text-slate-300">Speaker notes: </span>
        {notes}
      </p>
    </div>
  )
}

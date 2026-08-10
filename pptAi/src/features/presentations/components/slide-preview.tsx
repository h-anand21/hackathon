import { useState } from 'react'
import { DiagramRenderer } from './diagram-renderer'
import { Quote, Sparkles } from 'lucide-react'

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

const THEMES: Record<
  string,
  {
    bg: string
    text: string
    muted: string
    accent: string
    surface: string
    border: string
    glow: string
    fontDisplay: string
    fontBody: string
  }
> = {
  'obsidian-neon': {
    bg: '#07090E',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#06B6D4',
    surface: 'rgba(15, 19, 28, 0.85)',
    border: 'rgba(6, 182, 212, 0.2)',
    glow: 'radial-gradient(circle at 10% 10%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'silicon-slate': {
    bg: '#0B1120',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#3B82F6',
    surface: 'rgba(22, 30, 49, 0.85)',
    border: 'rgba(59, 130, 246, 0.2)',
    glow: 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.15) 0%, transparent 65%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'nordic-minimal': {
    bg: '#F8FAFC',
    text: '#0F172A',
    muted: '#475569',
    accent: '#10B981',
    surface: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.1)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'tokyo-sunset': {
    bg: '#030305',
    text: '#FFF1F2',
    muted: '#FDA4AF',
    accent: '#F43F5E',
    surface: 'rgba(24, 18, 22, 0.85)',
    border: 'rgba(244, 63, 94, 0.22)',
    glow: 'radial-gradient(circle at 100% 100%, rgba(244, 63, 94, 0.16) 0%, transparent 60%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'emerald-matrix': {
    bg: '#03120E',
    text: '#ECFDF5',
    muted: '#A7F3D0',
    accent: '#10B981',
    surface: 'rgba(6, 30, 23, 0.85)',
    border: 'rgba(16, 185, 129, 0.22)',
    glow: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 65%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'aurora-indigo': {
    bg: '#0A0818',
    text: '#EEF2FF',
    muted: '#C7D2FE',
    accent: '#6366F1',
    surface: 'rgba(20, 16, 43, 0.85)',
    border: 'rgba(99, 102, 241, 0.25)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 60%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  // Legacy aliases
  'dark-slate': {
    bg: '#0B1120',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#3B82F6',
    surface: 'rgba(22, 30, 49, 0.85)',
    border: 'rgba(59, 130, 246, 0.2)',
    glow: 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.15) 0%, transparent 65%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
}

function parseBullets(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith('•') ? l.slice(1).trim() : l))
}

export function SlidePreview({ slide, isFullscreen, theme = 'obsidian-neon' }: SlidePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const t = THEMES[theme] ?? THEMES['obsidian-neon']
  const layout = slide.layoutType ?? 'split-right'
  const bullets = parseBullets(slide.content)

  const outerClass = isFullscreen
    ? 'w-full h-full'
    : 'glass rounded-2xl overflow-hidden'

  const slideStyle: React.CSSProperties = {
    background: t.bg,
    backgroundImage: t.glow,
    fontFamily: t.fontBody,
  }

  // Auto-fit font scaling
  const titleLen = slide.title?.length || 0
  const titleFontSize = isFullscreen
    ? titleLen > 60 ? '2.4rem' : titleLen > 35 ? '3.2rem' : '4.2rem'
    : titleLen > 60 ? '1.25rem' : titleLen > 35 ? '1.55rem' : '1.9rem'

  const fitClass =
    slide.imageStyle === 'contain' ? 'object-contain bg-black/40' : 'object-cover'
  const posStyle =
    slide.imageStyle === 'cover-top'
      ? 'top center'
      : slide.imageStyle === 'cover-bottom'
      ? 'bottom center'
      : 'center center'

  // ── HERO COVER ────────────────────────────────────────────────────────────
  if (layout === 'hero') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col items-center justify-center text-center overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'aspect-video'
          }`}
          style={slideStyle}
        >
          {slide.imageUrl && (
            <>
              <img
                src={slide.imageUrl}
                alt=""
                className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-700 ${
                  imageLoaded ? 'opacity-50' : 'opacity-0'
                }`}
                style={{ objectPosition: posStyle }}
                onLoad={() => setImageLoaded(true)}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)',
                }}
              />
            </>
          )}

          {/* Atmospheric Accent Orbs */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
            style={{ background: `${t.accent}25` }}
          />

          <div className="relative z-10 px-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <Sparkles className="size-3" style={{ color: t.accent }} />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: t.accent }}>
                Executive Overview
              </span>
            </div>

            <h1
              className="font-black tracking-tight mb-6 font-display"
              style={{
                color: t.text,
                fontSize: titleFontSize,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {slide.title}
            </h1>

            {slide.content && (
              <p
                className="max-w-2xl mx-auto leading-relaxed"
                style={{
                  color: t.muted,
                  fontSize: isFullscreen ? '1.2rem' : '0.95rem',
                }}
              >
                {bullets.join(' • ')}
              </p>
            )}
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── QUOTE / STATEMENT ─────────────────────────────────────────────────────
  if (layout === 'text-only') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col justify-center items-center text-center px-16 overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'aspect-video'
          }`}
          style={slideStyle}
        >
          <div
            className="size-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl backdrop-blur-md"
            style={{ background: `${t.accent}15`, border: `1px solid ${t.accent}30` }}
          >
            <Quote className="size-7" style={{ color: t.accent }} />
          </div>

          <h2
            className="font-extrabold max-w-3xl leading-snug tracking-tight font-display mb-6"
            style={{
              color: t.text,
              fontSize: isFullscreen ? 'clamp(1.8rem,3.5vw,3rem)' : 'clamp(1.15rem,2.2vw,1.75rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {slide.title}
          </h2>

          {slide.content && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-px" style={{ background: t.accent }} />
              <p
                className="font-mono text-xs uppercase tracking-wider font-semibold"
                style={{ color: t.accent }}
              >
                {slide.content}
              </p>
              <div className="w-8 h-px" style={{ background: t.accent }} />
            </div>
          )}
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── STAT-CARD / KPI GRID ──────────────────────────────────────────────────
  if (layout === 'stat-card') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'aspect-video'
          }`}
          style={slideStyle}
        >
          <div className="px-10 pt-8 pb-3">
            <div className="w-8 h-1 rounded-full mb-3" style={{ background: t.accent }} />
            <h2
              className="font-bold tracking-tight font-display"
              style={{
                color: t.text,
                fontSize: isFullscreen ? '2rem' : '1.25rem',
              }}
            >
              {slide.title}
            </h2>
          </div>

          <div className="flex-1 flex items-center justify-center px-10 pb-8">
            {slide.diagramType === 'stats' && slide.diagramData ? (
              <DiagramRenderer
                diagramType="stats"
                diagramData={slide.diagramData}
                theme={theme}
              />
            ) : (
              <div className="w-full grid grid-cols-3 gap-5 max-w-4xl">
                {bullets.slice(0, 3).map((b, i) => {
                  const parts = b.split(':')
                  const val = parts[0]?.trim() ?? b
                  const lbl = parts[1]?.trim() ?? `Metric 0${i + 1}`
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-6 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        boxShadow: `0 15px 35px ${t.glow}`,
                      }}
                    >
                      <div
                        className="text-4xl sm:text-5xl font-black mb-2 font-mono tracking-tight"
                        style={{ color: t.accent }}
                      >
                        {val}
                      </div>
                      <div
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: t.muted }}
                      >
                        {lbl}
                      </div>
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

  // ── DIAGRAM / PROCESS / COMPARISON / BENTO ────────────────────────────────
  if (layout === 'diagram' || layout === 'bento') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'aspect-video'
          }`}
          style={slideStyle}
        >
          <div className="px-10 pt-8 pb-2 flex-shrink-0">
            <div className="w-8 h-1 rounded-full mb-2" style={{ background: t.accent }} />
            <h2
              className="font-bold tracking-tight font-display"
              style={{
                color: t.text,
                fontSize: isFullscreen ? '1.85rem' : '1.2rem',
              }}
            >
              {slide.title}
            </h2>
          </div>

          <div className="flex-1 min-h-0">
            <DiagramRenderer
              diagramType={slide.diagramType || (layout === 'bento' ? 'bento' : 'flow')}
              diagramData={slide.diagramData}
              theme={theme}
            />
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── EDITORIAL SPLIT (DEFAULT: split-right / split-left) ────────────────────
  const imageOnRight = layout !== 'split-left'

  return (
    <div className={outerClass}>
      <div
        className={`relative flex overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'aspect-video'
        }`}
        style={{ ...slideStyle, flexDirection: imageOnRight ? 'row' : 'row-reverse' }}
      >
        {/* Text side */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8 relative z-10 min-w-0">
          <div className="w-8 h-1 rounded-full mb-3" style={{ background: t.accent }} />
          <h2
            className="font-bold mb-5 leading-tight tracking-tight font-display"
            style={{
              color: t.text,
              fontSize: titleFontSize,
            }}
          >
            {slide.title}
          </h2>

          <div className="space-y-2.5">
            {bullets.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl backdrop-blur-md transition-all duration-200"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                <span
                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{
                    background: `${t.accent}20`,
                    color: t.accent,
                    border: `1px solid ${t.accent}40`,
                  }}
                >
                  0{i + 1}
                </span>
                <p
                  className="font-sans leading-relaxed"
                  style={{
                    color: t.text,
                    fontSize: isFullscreen ? '1.05rem' : '0.85rem',
                  }}
                >
                  {b}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual side */}
        <div className="flex-shrink-0 relative overflow-hidden" style={{ width: '45%' }}>
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ objectPosition: posStyle }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: `linear-gradient(135deg, ${t.surface}, ${t.accent}12)` }}
            >
              <div
                className="size-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${t.accent}20`, color: t.accent }}
              >
                <Sparkles className="size-6" />
              </div>
              <span style={{ color: t.muted, fontSize: '0.75rem', fontWeight: 500 }}>
                Visual Component
              </span>
            </div>
          )}

          {/* Smooth gradient fade toward text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: imageOnRight
                ? `linear-gradient(to right, ${t.bg} 0%, transparent 15%)`
                : `linear-gradient(to left, ${t.bg} 0%, transparent 15%)`,
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
    <div className="p-4 border-t border-white/5 bg-black/30">
      <p className="text-xs text-slate-400 font-sans">
        <span className="font-mono font-semibold text-cyan-400">SPEAKER NOTES: </span>
        {notes}
      </p>
    </div>
  )
}

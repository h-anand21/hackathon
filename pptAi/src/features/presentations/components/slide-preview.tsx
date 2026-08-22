import { useState } from 'react'
import { DiagramRenderer } from './diagram-renderer'
import { Quote, Sparkles, Zap, TrendingUp, Shield, Rocket, CheckCircle2, ArrowUpRight } from 'lucide-react'

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
    secondaryAccent: string
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
    secondaryAccent: '#8B5CF6',
    surface: 'rgba(15, 19, 28, 0.85)',
    border: 'rgba(6, 182, 212, 0.25)',
    glow: 'radial-gradient(circle at 10% 10%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'silicon-slate': {
    bg: '#0B1120',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#3B82F6',
    secondaryAccent: '#F59E0B',
    surface: 'rgba(22, 30, 49, 0.85)',
    border: 'rgba(59, 130, 246, 0.25)',
    glow: 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.18) 0%, transparent 65%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'nordic-minimal': {
    bg: '#F8FAFC',
    text: '#0F172A',
    muted: '#475569',
    accent: '#10B981',
    secondaryAccent: '#0F172A',
    surface: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.1)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'tokyo-sunset': {
    bg: '#030305',
    text: '#FFF1F2',
    muted: '#FDA4AF',
    accent: '#F43F5E',
    secondaryAccent: '#F59E0B',
    surface: 'rgba(24, 18, 22, 0.85)',
    border: 'rgba(244, 63, 94, 0.25)',
    glow: 'radial-gradient(circle at 100% 100%, rgba(244, 63, 94, 0.18) 0%, transparent 60%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'emerald-matrix': {
    bg: '#03120E',
    text: '#ECFDF5',
    muted: '#A7F3D0',
    accent: '#10B981',
    secondaryAccent: '#6EE7B7',
    surface: 'rgba(6, 30, 23, 0.85)',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.18) 0%, transparent 65%)',
    fontDisplay: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'aurora-indigo': {
    bg: '#0A0818',
    text: '#EEF2FF',
    muted: '#C7D2FE',
    accent: '#6366F1',
    secondaryAccent: '#EC4899',
    surface: 'rgba(20, 16, 43, 0.85)',
    border: 'rgba(99, 102, 241, 0.28)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  'dark-slate': {
    bg: '#0B1120',
    text: '#F8FAFC',
    muted: '#94A3B8',
    accent: '#3B82F6',
    secondaryAccent: '#F59E0B',
    surface: 'rgba(22, 30, 49, 0.85)',
    border: 'rgba(59, 130, 246, 0.25)',
    glow: 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.18) 0%, transparent 65%)',
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
}

function parseBullets(content: string): { title: string; desc: string }[] {
  if (!content) return []
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      let clean = l.startsWith('•') ? l.slice(1).trim() : l
      clean = clean.startsWith('-') ? clean.slice(1).trim() : clean
      clean = clean.replace(/^\d+\.\s*/, '') // remove numbers

      // Check for Title: Description or **Title**: Description pattern
      if (clean.includes(':')) {
        const parts = clean.split(':')
        const t = parts[0].replace(/\*\*/g, '').trim()
        const d = parts.slice(1).join(':').replace(/\*\*/g, '').trim()
        return { title: t, desc: d }
      }

      // Check for **Title** Description pattern
      const boldMatch = clean.match(/^\*\*(.*?)\*\*(.*)/)
      if (boldMatch) {
        return {
          title: boldMatch[1].trim(),
          desc: boldMatch[2].replace(/^[\s\-:]+/, '').trim(),
        }
      }

      return { title: clean, desc: '' }
    })
}

export function SlidePreview({ slide, isFullscreen, theme = 'obsidian-neon' }: SlidePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const t = THEMES[theme] ?? THEMES['obsidian-neon']
  const layout = slide.layoutType ?? 'split-right'
  const items = parseBullets(slide.content)

  const outerClass = isFullscreen
    ? 'w-full h-full'
    : 'glass rounded-2xl overflow-hidden shadow-2xl'

  const slideStyle: React.CSSProperties = {
    background: t.bg,
    backgroundImage: t.glow,
    fontFamily: t.fontBody,
  }

  // Dynamic font scaling
  const titleLen = slide.title?.length || 0
  const titleFontSize = isFullscreen
    ? titleLen > 60 ? '2.3rem' : titleLen > 35 ? '3.1rem' : '4.2rem'
    : titleLen > 60 ? '1.2rem' : titleLen > 35 ? '1.5rem' : '1.85rem'

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
                  imageLoaded ? 'opacity-40' : 'opacity-0'
                }`}
                style={{ objectPosition: posStyle }}
                onLoad={() => setImageLoaded(true)}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.92) 100%)',
                }}
              />
            </>
          )}

          {/* Atmospheric Accent Orbs */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
            style={{ background: `${t.accent}30` }}
          />

          <div className="relative z-10 px-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-lg">
              <Sparkles className="size-3.5" style={{ color: t.accent }} />
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold" style={{ color: t.accent }}>
                Executive Deck
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

            {items.length > 0 && (
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
                {items.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md"
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                      style={{ background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}30` }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold" style={{ color: t.text }}>{item.title}</span>
                    {item.desc && (
                      <span className="text-xs ml-1 hidden sm:inline" style={{ color: t.muted }}>{item.desc}</span>
                    )}
                  </div>
                ))}
              </div>
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
            className="size-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md"
            style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}35` }}
          >
            <Quote className="size-8" style={{ color: t.accent }} />
          </div>

          <h2
            className="font-extrabold max-w-3xl leading-snug tracking-tight font-display mb-6"
            style={{
              color: t.text,
              fontSize: isFullscreen ? 'clamp(1.8rem,3.5vw,3rem)' : 'clamp(1.15rem,2.2vw,1.75rem)',
              letterSpacing: '-0.02em',
            }}
          >
            "{slide.title}"
          </h2>

          {slide.content && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-px" style={{ background: t.accent }} />
              <p
                className="font-mono text-xs uppercase tracking-wider font-bold"
                style={{ color: t.accent }}
              >
                {slide.content.replace(/^•\s*/, '')}
              </p>
              <div className="w-10 h-px" style={{ background: t.accent }} />
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
                fontSize: isFullscreen ? '2.1rem' : '1.35rem',
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
                {items.slice(0, 3).map((item, i) => {
                  const val = item.title
                  const lbl = item.desc || `Strategic KPI 0${i + 1}`
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-6 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
                      style={{
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        boxShadow: `0 15px 35px ${t.glow}`,
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <TrendingUp className="size-4" style={{ color: t.accent }} />
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider" style={{ color: t.accent }}>
                          METRIC 0{i + 1}
                        </span>
                      </div>
                      <div
                        className="text-4xl sm:text-5xl font-black mb-2 font-mono tracking-tight"
                        style={{ color: t.text }}
                      >
                        {val}
                      </div>
                      <div
                        className="text-xs font-medium leading-relaxed"
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

  // ── BENTO MATRIX / FULL 3-COLUMN CARD GRID ────────────────────────────────
  if (layout === 'bento') {
    return (
      <div className={outerClass}>
        <div
          className={`relative flex flex-col overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'aspect-video'
          }`}
          style={slideStyle}
        >
          <div className="px-10 pt-8 pb-3 flex-shrink-0">
            <div className="w-8 h-1 rounded-full mb-3" style={{ background: t.accent }} />
            <h2
              className="font-bold tracking-tight font-display"
              style={{
                color: t.text,
                fontSize: isFullscreen ? '2rem' : '1.3rem',
              }}
            >
              {slide.title}
            </h2>
          </div>

          <div className="flex-1 flex items-center px-10 pb-8 min-h-0">
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {items.slice(0, 3).map((item, i) => {
                const icons = [Zap, Shield, Rocket]
                const IconComponent = icons[i % icons.length]
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      boxShadow: `0 12px 30px ${t.glow}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="size-9 rounded-xl flex items-center justify-center shadow-md"
                        style={{ background: `${t.accent}20`, color: t.accent }}
                      >
                        <IconComponent className="size-4" />
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${t.accent}15`,
                          color: t.accent,
                          border: `1px solid ${t.accent}30`,
                        }}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    <div>
                      <h3
                        className="text-sm font-bold font-display mb-1.5"
                        style={{ color: t.text }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-xs leading-relaxed line-clamp-3 font-sans"
                        style={{ color: t.muted }}
                      >
                        {item.desc || item.title}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono" style={{ color: t.accent }}>
                      <span>FEATURE SPEC</span>
                      <ArrowUpRight className="size-3" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {slide.notes && !isFullscreen && <Notes notes={slide.notes} />}
      </div>
    )
  }

  // ── DIAGRAM / PROCESS / COMPARISON / FLOW / TIMELINE ──────────────────────
  if (
    layout === 'diagram' ||
    layout === 'comparison' ||
    layout === 'flow' ||
    layout === 'timeline' ||
    slide.diagramType === 'comparison' ||
    slide.diagramType === 'flow' ||
    slide.diagramType === 'timeline'
  ) {
    const activeDiagramType =
      slide.diagramType ||
      (layout === 'comparison' ? 'comparison' : layout === 'flow' ? 'flow' : layout === 'timeline' ? 'timeline' : 'flow')

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
              diagramType={activeDiagramType}
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
        {/* Left / Primary Text Panel */}
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
            {items.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl backdrop-blur-md"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                {/* Number badge */}
                <div
                  className="size-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold shadow-sm"
                  style={{
                    background: `${t.accent}18`,
                    color: t.accent,
                    border: `1px solid ${t.accent}35`,
                    fontSize: isFullscreen ? '0.85rem' : '0.65rem',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className="font-bold font-display leading-snug"
                    style={{
                      color: t.text,
                      fontSize: isFullscreen ? '0.95rem' : '0.75rem',
                    }}
                  >
                    {item.title}
                  </h4>
                  {item.desc && (
                    <p
                      className="leading-relaxed mt-0.5 font-sans"
                      style={{
                        color: t.muted,
                        fontSize: isFullscreen ? '0.8rem' : '0.62rem',
                      }}
                    >
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right / Visual Showcase Panel */}
        <div className="flex-shrink-0 relative overflow-hidden flex items-center justify-center p-6" style={{ width: '45%' }}>
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
            /* Executive Glass Infographic Showcase Widget when no image exists */
            <div
              className="w-full h-full rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden shadow-2xl"
              style={{
                background: `linear-gradient(145deg, ${t.surface}, rgba(6,182,212,0.08))`,
                border: `1px solid ${t.border}`,
              }}
            >
              {/* Top Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: t.accent }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: t.accent }} />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: t.accent }}>
                    CORE ARCHITECTURE
                  </span>
                </div>
                <Sparkles className="size-4" style={{ color: t.accent }} />
              </div>

              {/* Center Key Metric / Focus Callout */}
              <div className="py-3">
                <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                  PRIMARY FOCUS
                </div>
                <div className="text-xl font-black font-display tracking-tight text-white line-clamp-2">
                  {items[0]?.title || slide.title}
                </div>
                {items[0]?.desc && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {items[0].desc}
                  </p>
                )}
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 shrink-0" style={{ color: t.accent }} />
                  <span className="text-[11px] font-mono text-slate-300 truncate">High Velocity</span>
                </div>
                <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex items-center gap-2">
                  <Shield className="size-3.5 shrink-0" style={{ color: t.accent }} />
                  <span className="text-[11px] font-mono text-slate-300 truncate">Production Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Smooth gradient fade toward text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: imageOnRight
                ? `linear-gradient(to right, ${t.bg} 0%, transparent 10%)`
                : `linear-gradient(to left, ${t.bg} 0%, transparent 10%)`,
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

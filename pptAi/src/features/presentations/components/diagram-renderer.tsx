import { ArrowRight, Check, X, TrendingUp, Sparkles, Zap, Shield, Rocket } from 'lucide-react'

type FlowData = { steps: string[] | { title: string; desc?: string }[] }
type ComparisonData = {
  left: { label: string; tag?: string; points: string[] }
  right: { label: string; tag?: string; points: string[] }
}
type StatsData = {
  stats: { value: string; label: string; trend?: string; desc?: string }[]
}
type TimelineData = { events: { year: string; label: string; desc?: string }[] }
type BentoData = {
  items: { title: string; desc: string; tag?: string; icon?: string }[]
}

type DiagramRendererProps = {
  diagramType: string
  diagramData: string | null | undefined
  theme?: string
}

function safeParseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

const THEME_PALETTES: Record<
  string,
  {
    accent: string
    secondaryAccent: string
    textPrimary: string
    textMuted: string
    cardBg: string
    borderColor: string
    glow: string
  }
> = {
  'obsidian-neon': {
    accent: '#06B6D4',
    secondaryAccent: '#8B5CF6',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    cardBg: 'rgba(15, 19, 28, 0.85)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  'silicon-slate': {
    accent: '#3B82F6',
    secondaryAccent: '#F59E0B',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    cardBg: 'rgba(22, 30, 49, 0.85)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  'nordic-minimal': {
    accent: '#10B981',
    secondaryAccent: '#0F172A',
    textPrimary: '#0F172A',
    textMuted: '#64748B',
    cardBg: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.1)',
    glow: 'rgba(16, 185, 129, 0.1)',
  },
  'tokyo-sunset': {
    accent: '#F43F5E',
    secondaryAccent: '#F59E0B',
    textPrimary: '#FFF1F2',
    textMuted: '#FDA4AF',
    cardBg: 'rgba(24, 18, 22, 0.85)',
    borderColor: 'rgba(244, 63, 94, 0.25)',
    glow: 'rgba(244, 63, 94, 0.15)',
  },
  'emerald-matrix': {
    accent: '#10B981',
    secondaryAccent: '#6EE7B7',
    textPrimary: '#ECFDF5',
    textMuted: '#A7F3D0',
    cardBg: 'rgba(6, 30, 23, 0.85)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  'aurora-indigo': {
    accent: '#6366F1',
    secondaryAccent: '#EC4899',
    textPrimary: '#EEF2FF',
    textMuted: '#C7D2FE',
    cardBg: 'rgba(20, 16, 43, 0.85)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    glow: 'rgba(99, 102, 241, 0.15)',
  },
}

export function DiagramRenderer({
  diagramType,
  diagramData,
  theme = 'obsidian-neon',
}: DiagramRendererProps) {
  const palette = THEME_PALETTES[theme] ?? THEME_PALETTES['obsidian-neon']
  const { accent, secondaryAccent, textPrimary, textMuted, cardBg, borderColor, glow } = palette

  // ── PROCESS FLOW ──────────────────────────────────────────────────────────
  if (diagramType === 'flow') {
    const data = safeParseJSON<FlowData>(diagramData, { steps: [] })
    const steps = (data.steps ?? []).map((s) =>
      typeof s === 'string' ? { title: s, desc: '' } : s
    )

    return (
      <div className="w-full h-full flex items-center justify-center px-8 py-4">
        <div className="grid grid-flow-col auto-cols-fr items-center gap-3 w-full max-w-4xl">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex-1 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:scale-[1.03] backdrop-blur-md relative overflow-hidden"
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: `0 10px 30px ${glow}`,
                }}
              >
                {/* Step pill */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${accent}20`,
                      color: accent,
                      border: `1px solid ${accent}40`,
                    }}
                  >
                    STEP 0{i + 1}
                  </span>
                </div>
                <div>
                  <h4
                    className="text-xs font-bold font-display mb-1"
                    style={{ color: textPrimary }}
                  >
                    {step.title}
                  </h4>
                  {step.desc && (
                    <p
                      className="text-[11px] leading-relaxed line-clamp-2"
                      style={{ color: textMuted }}
                    >
                      {step.desc}
                    </p>
                  )}
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-shrink-0 text-slate-500 opacity-60">
                  <ArrowRight className="size-4" style={{ color: accent }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── COMPARISON (A vs B) ───────────────────────────────────────────────────
  if (diagramType === 'comparison') {
    const defaultLeft = {
      label: 'Legacy Approach',
      tag: 'Traditional',
      points: ['Manual formatting overhead', 'High latency generation', 'Fragmented tooling'],
    }
    const defaultRight = {
      label: 'PPT.ai Autonomous',
      tag: 'AI Studio',
      points: ['Sub-10s instant generation', 'Deterministic 4K vector output', 'Curated taste themes'],
    }

    const data = safeParseJSON<ComparisonData>(diagramData, {
      left: defaultLeft,
      right: defaultRight,
    })

    const leftSide = {
      label: data?.left?.label || defaultLeft.label,
      tag: data?.left?.tag || defaultLeft.tag,
      points: data?.left?.points?.length ? data.left.points : defaultLeft.points,
      isPrimary: false,
    }

    const rightSide = {
      label: data?.right?.label || defaultRight.label,
      tag: data?.right?.tag || defaultRight.tag,
      points: data?.right?.points?.length ? data.right.points : defaultRight.points,
      isPrimary: true,
    }

    return (
      <div className="w-full h-full flex items-stretch gap-6 px-10 py-6">
        {[leftSide, rightSide].map((side, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 relative overflow-hidden"
            style={{
              background: side.isPrimary ? `${accent}12` : cardBg,
              border: `1px solid ${side.isPrimary ? accent : borderColor}`,
              boxShadow: side.isPrimary ? `0 15px 40px ${glow}` : 'none',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: side.isPrimary ? accent : 'rgba(255,255,255,0.05)',
                    color: side.isPrimary ? '#000' : textMuted,
                  }}
                >
                  {side.tag || (side.isPrimary ? 'Recommended' : 'Baseline')}
                </span>
              </div>
              <h3
                className="text-base font-bold font-display mb-4"
                style={{ color: side.isPrimary ? textPrimary : textMuted }}
              >
                {side.label}
              </h3>
              <div className="space-y-3">
                {side.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div
                      className="size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: side.isPrimary ? `${accent}30` : 'rgba(255,255,255,0.08)',
                        color: side.isPrimary ? accent : textMuted,
                      }}
                    >
                      {side.isPrimary ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                    </div>
                    <span style={{ color: textPrimary }} className="leading-relaxed font-sans">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── STATS & METRICS GRID ─────────────────────────────────────────────────
  if (diagramType === 'stats') {
    const data = safeParseJSON<StatsData>(diagramData, { stats: [] })
    const stats = data.stats ?? []

    return (
      <div className="w-full h-full flex items-center justify-center px-10 py-6">
        <div className="grid grid-cols-3 gap-5 w-full max-w-4xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                boxShadow: `0 10px 30px ${glow}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                  {stat?.label || `Metric 0${i + 1}`}
                </span>
                {stat?.trend && (
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: `${accent}20`, color: accent }}
                  >
                    <TrendingUp className="size-2.5" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div
                className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2"
                style={{ color: accent, textShadow: `0 0 35px ${glow}` }}
              >
                {stat?.value}
              </div>
              {stat?.desc && (
                <p className="text-[11px] leading-relaxed line-clamp-2 mt-1" style={{ color: textMuted }}>
                  {stat.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── BENTO MATRIX ─────────────────────────────────────────────────────────
  if (diagramType === 'bento') {
    const data = safeParseJSON<BentoData>(diagramData, {
      items: [
        { title: 'Deterministic Engine', desc: 'Zero visual overlap with auto-computed typography bounds.', tag: 'Core' },
        { title: 'Sub-10s Generation', desc: 'Asynchronous streaming pipelines.', tag: 'Speed' },
        { title: 'Vector PPTX', desc: 'Native shape export with 4K clarity.', tag: 'Export' },
      ],
    })
    const items = data.items ?? []

    return (
      <div className="w-full h-full flex items-center justify-center px-10 py-6">
        <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
          {items.map((item, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${
                i === 0 ? 'col-span-2 bg-cyan-500/10' : ''
              }`}
              style={{
                background: i === 0 ? `${accent}10` : cardBg,
                border: `1px solid ${i === 0 ? accent : borderColor}`,
                boxShadow: i === 0 ? `0 15px 40px ${glow}` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="size-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${accent}20`, color: accent }}
                >
                  {i === 0 ? <Sparkles className="size-4" /> : i === 1 ? <Zap className="size-4" /> : <Shield className="size-4" />}
                </div>
                {item.tag && (
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold font-display mb-1.5" style={{ color: textPrimary }}>
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── TIMELINE ─────────────────────────────────────────────────────────────
  if (diagramType === 'timeline') {
    const data = safeParseJSON<TimelineData>(diagramData, { events: [] })
    const events = data.events ?? []

    return (
      <div className="w-full h-full flex flex-col justify-center px-10 py-6">
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Connecting line */}
          <div
            className="absolute top-4 left-4 right-4 h-0.5"
            style={{ background: `linear-gradient(90deg, ${accent}, ${secondaryAccent})` }}
          />
          <div className="flex justify-between relative z-10">
            {events.map((ev, i) => (
              <div key={i} className="flex flex-col items-center text-center px-2 flex-1">
                {/* Dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 mb-3 shadow-lg"
                  style={{
                    background: i === 0 ? accent : cardBg,
                    borderColor: accent,
                    color: i === 0 ? '#000' : accent,
                  }}
                >
                  {i + 1}
                </div>
                {/* Year Pill */}
                <div
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md mb-2"
                  style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                >
                  {ev?.year}
                </div>
                {/* Label */}
                <div className="text-xs font-bold font-display mb-1" style={{ color: textPrimary }}>
                  {ev?.label}
                </div>
                {ev?.desc && (
                  <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: textMuted }}>
                    {ev.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

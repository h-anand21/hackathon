type FlowData = { steps: string[] }
type ComparisonData = { left: { label: string; points: string[] }; right: { label: string; points: string[] } }
type StatsData = { stats: { value: string; label: string }[] }
type TimelineData = { events: { year: string; label: string }[] }

type DiagramRendererProps = {
  diagramType: string
  diagramData: string | null | undefined
  theme?: string
}

function safeParseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}

const THEME_PALETTES: Record<string, { accent: string; secondaryAccent: string; textPrimary: string; textMuted: string; cardBg: string; borderColor: string }> = {
  'obsidian-neon': {
    accent: '#06B6D4',
    secondaryAccent: '#8B5CF6',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    cardBg: 'rgba(15, 19, 28, 0.85)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  'silicon-slate': {
    accent: '#3B82F6',
    secondaryAccent: '#F59E0B',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    cardBg: 'rgba(22, 30, 49, 0.85)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  'nordic-minimal': {
    accent: '#10B981',
    secondaryAccent: '#0F172A',
    textPrimary: '#0F172A',
    textMuted: '#64748B',
    cardBg: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  'tokyo-sunset': {
    accent: '#F43F5E',
    secondaryAccent: '#F59E0B',
    textPrimary: '#FFF1F2',
    textMuted: '#FDA4AF',
    cardBg: 'rgba(24, 18, 22, 0.85)',
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  'emerald-matrix': {
    accent: '#10B981',
    secondaryAccent: '#6EE7B7',
    textPrimary: '#ECFDF5',
    textMuted: '#A7F3D0',
    cardBg: 'rgba(6, 30, 23, 0.85)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  'aurora-indigo': {
    accent: '#6366F1',
    secondaryAccent: '#EC4899',
    textPrimary: '#EEF2FF',
    textMuted: '#C7D2FE',
    cardBg: 'rgba(20, 16, 43, 0.85)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
}

export function DiagramRenderer({ diagramType, diagramData, theme = 'obsidian-neon' }: DiagramRendererProps) {
  const palette = THEME_PALETTES[theme] ?? THEME_PALETTES['obsidian-neon']
  const { accent, secondaryAccent, textPrimary, textMuted, cardBg, borderColor } = palette


  if (diagramType === 'flow') {
    const data = safeParseJSON<FlowData>(diagramData, { steps: [] })
    const steps = data.steps ?? []
    return (
      <div className="w-full h-full flex items-center justify-center px-8 py-6">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex flex-col items-center gap-2"
                style={{ minWidth: '120px', maxWidth: '150px' }}
              >
                {/* Circle number */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: accent }}
                >
                  {i + 1}
                </div>
                {/* Label card */}
                <div
                  className="w-full rounded-xl px-4 py-3 text-center text-sm font-medium"
                  style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textPrimary }}
                >
                  {step}
                </div>
              </div>
              {i < steps.length - 1 && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginBottom: '32px' }}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (diagramType === 'comparison') {
    const data = safeParseJSON<ComparisonData>(diagramData, {
      left: { label: 'Option A', points: [] },
      right: { label: 'Option B', points: [] },
    })
    return (
      <div className="w-full h-full flex items-stretch gap-6 px-8 py-6">
        {[
          data.left || { label: 'Option A', points: [] },
          data.right || { label: 'Option B', points: [] }
        ].map((side, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: idx === 0 ? `${accent}15` : cardBg, border: `1px solid ${idx === 0 ? accent + '40' : borderColor}` }}
          >
            <div className="text-base font-bold mb-1" style={{ color: idx === 0 ? accent : textMuted }}>{side.label}</div>
            {side.points?.map((pt, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: textPrimary }}>
                <span style={{ color: idx === 0 ? accent : textMuted, marginTop: '2px' }}>✓</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (diagramType === 'stats') {
    const data = safeParseJSON<StatsData>(diagramData, { stats: [] })
    const stats = data.stats ?? []
    return (
      <div className="w-full h-full flex items-center justify-center gap-8 px-8 py-6 flex-wrap">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2.5 rounded-2xl px-8 py-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 duration-300"
            style={{ background: cardBg, border: `1px solid ${borderColor}`, minWidth: '160px' }}
          >
            <div
              className="text-5xl font-black tracking-tight font-mono"
              style={{ color: accent, lineHeight: 1, textShadow: `0 0 30px ${accent}40` }}
            >
              {stat?.value}
            </div>
            <div className="text-xs uppercase tracking-wider text-center font-semibold" style={{ color: textMuted }}>
              {stat?.label}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (diagramType === 'timeline') {
    const data = safeParseJSON<TimelineData>(diagramData, { events: [] })
    const events = data.events ?? []
    return (
      <div className="w-full h-full flex flex-col justify-center px-8 py-6">
        {/* Line */}
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5" style={{ background: `${accent}40` }} />
          <div className="flex justify-between relative">
            {events.map((ev, i) => (
              <div key={i} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                {/* Dot */}
                <div
                  className="w-4 h-4 rounded-full border-2 relative z-10"
                  style={{ background: i === 0 ? accent : 'transparent', borderColor: accent }}
                />
                {/* Year */}
                <div className="text-xs font-bold" style={{ color: accent }}>{ev?.year}</div>
                {/* Label */}
                <div className="text-xs text-center px-2" style={{ color: textMuted, maxWidth: '100px' }}>{ev?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

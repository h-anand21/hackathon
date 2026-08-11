import pptxgen from 'pptxgenjs'

type Slide = {
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

type ExportOptions = {
  title: string
  slides: Slide[]
  theme?: string
}

const THEME_HEX: Record<
  string,
  {
    bg: string
    text: string
    muted: string
    accent: string
    cardBg: string
    cardBorder: string
  }
> = {
  'obsidian-neon': {
    bg: '07090E',
    text: 'F8FAFC',
    muted: '94A3B8',
    accent: '06B6D4',
    cardBg: '0F131C',
    cardBorder: '1E293B',
  },
  'silicon-slate': {
    bg: '0B1120',
    text: 'F8FAFC',
    muted: '94A3B8',
    accent: '3B82F6',
    cardBg: '161E31',
    cardBorder: '1E293B',
  },
  'nordic-minimal': {
    bg: 'F8FAFC',
    text: '0F172A',
    muted: '475569',
    accent: '10B981',
    cardBg: 'FFFFFF',
    cardBorder: 'E2E8F0',
  },
  'tokyo-sunset': {
    bg: '030305',
    text: 'FFF1F2',
    muted: 'FDA4AF',
    accent: 'F43F5E',
    cardBg: '181216',
    cardBorder: '2E1A22',
  },
  'emerald-matrix': {
    bg: '03120E',
    text: 'ECFDF5',
    muted: 'A7F3D0',
    accent: '10B981',
    cardBg: '061E17',
    cardBorder: '0E3D30',
  },
  'aurora-indigo': {
    bg: '0A0818',
    text: 'EEF2FF',
    muted: 'C7D2FE',
    accent: '6366F1',
    cardBg: '14102B',
    cardBorder: '271F52',
  },
}

export async function exportToPptx({ title, slides, theme = 'obsidian-neon' }: ExportOptions) {
  const pptx = new pptxgen()
  const th = THEME_HEX[theme] ?? THEME_HEX['obsidian-neon']

  pptx.author = 'PPT.ai Autonomous Presentation Studio'
  pptx.title = title
  pptx.subject = 'AI Generated Presentation'
  pptx.layout = 'LAYOUT_16x9'

  // Define Master Slide
  pptx.defineSlideMaster({
    title: 'STUDIO_MASTER',
    background: { color: th.bg },
    objects: [
      // Top accent bar
      { rect: { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: th.accent } } },
      // Footer text
      {
        text: {
          text: `${title} • Created with PPT.ai`,
          options: {
            x: 0.6,
            y: 7.1,
            w: 8.0,
            h: 0.3,
            fontSize: 9,
            color: th.muted,
            fontFace: 'Arial',
          },
        },
      },
    ],
  })

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]
    const slide = pptx.addSlide({ masterName: 'STUDIO_MASTER' })
    const layout = s.layoutType ?? 'split-right'

    // 1. HERO COVER
    if (layout === 'hero') {
      if (s.imageUrl) {
        try {
          slide.addImage({
            path: s.imageUrl,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            sizing: { type: 'cover', w: '100%', h: '100%' },
          })
          slide.addShape('rect' as pptxgen.ShapeType, {
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            fill: { color: th.bg, transparency: 60 },
          })
        } catch {
          // Fallback to master background
        }
      }

      slide.addText(s.title, {
        x: 0.8,
        y: 2.2,
        w: 11.7,
        h: 2.0,
        fontSize: 44,
        fontFace: 'Arial',
        color: th.text,
        bold: true,
        align: 'center',
        valign: 'middle',
      })

      if (s.content) {
        slide.addText(s.content.replace(/•/g, '').trim(), {
          x: 1.5,
          y: 4.4,
          w: 10.3,
          h: 1.5,
          fontSize: 18,
          fontFace: 'Arial',
          color: th.muted,
          align: 'center',
          valign: 'top',
        })
      }
    }
    // 2. STAT CARDS / KPIS
    else if (layout === 'stat-card' || s.diagramType === 'stats') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.8,
        w: 11.5,
        h: 1.0,
        fontSize: 32,
        fontFace: 'Arial',
        color: th.text,
        bold: true,
      })

      const bullets = s.content
        .split('\n')
        .map((l) => l.replace('•', '').trim())
        .filter(Boolean)

      const cards = bullets.slice(0, 3)
      const cardWidth = 3.6
      const gap = 0.4
      const startX = 0.8

      cards.forEach((bullet, cIdx) => {
        const parts = bullet.split(':')
        const val = parts[0]?.trim() ?? bullet
        const lbl = parts[1]?.trim() ?? `Metric 0${cIdx + 1}`
        const xPos = startX + cIdx * (cardWidth + gap)

        // Vector Card Shape
        slide.addShape('rect' as pptxgen.ShapeType, {
          x: xPos,
          y: 2.2,
          w: cardWidth,
          h: 3.8,
          fill: { color: th.cardBg },
          line: { color: th.accent, width: 1 },
        })

        // Metric Number
        slide.addText(val, {
          x: xPos + 0.2,
          y: 2.8,
          w: cardWidth - 0.4,
          h: 1.2,
          fontSize: 38,
          fontFace: 'Courier New',
          color: th.accent,
          bold: true,
          align: 'center',
        })

        // Label
        slide.addText(lbl, {
          x: xPos + 0.2,
          y: 4.2,
          w: cardWidth - 0.4,
          h: 1.0,
          fontSize: 14,
          fontFace: 'Arial',
          color: th.muted,
          align: 'center',
        })
      })
    }
    // 3. EDITORIAL SPLIT / GENERAL CONTENT
    else {
      const hasImage = Boolean(s.imageUrl)
      const textWidth = hasImage ? 6.5 : 11.5

      slide.addText(s.title, {
        x: 0.8,
        y: 0.8,
        w: textWidth,
        h: 1.2,
        fontSize: 34,
        fontFace: 'Arial',
        color: th.text,
        bold: true,
        valign: 'middle',
      })

      // Accent pill line
      slide.addShape('rect' as pptxgen.ShapeType, {
        x: 0.8,
        y: 2.1,
        w: 1.2,
        h: 0.05,
        fill: { color: th.accent },
      })

      const contentLines = s.content.split('\n').filter(Boolean)
      const formattedContent = contentLines.map((line) => ({
        text: line.startsWith('•') ? line.replace('•', '').trim() : line,
        options: {
          fontSize: 16,
          color: th.text,
          bullet: true,
          breakLine: true,
        },
      }))

      slide.addText(formattedContent, {
        x: 0.8,
        y: 2.5,
        w: textWidth,
        h: 4.2,
        fontFace: 'Arial',
        valign: 'top',
        paraSpaceAfter: 14,
        lineSpacing: 24,
      })

      if (hasImage && s.imageUrl) {
        try {
          slide.addImage({
            path: s.imageUrl,
            x: 7.8,
            y: 1.2,
            w: 4.8,
            h: 5.2,
            sizing: { type: 'cover', w: 4.8, h: 5.2 },
          })
          // Border around image
          slide.addShape('rect' as pptxgen.ShapeType, {
            x: 7.8,
            y: 1.2,
            w: 4.8,
            h: 5.2,
            fill: { color: 'FFFFFF', transparency: 100 },
            line: { color: th.cardBorder, width: 1.5 },
          })
        } catch {
          // If image fails, text covers width
        }
      }
    }

    if (s.notes) {
      slide.addNotes(s.notes)
    }
  }

  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`
  await pptx.writeFile({ fileName: filename })

  return filename
}

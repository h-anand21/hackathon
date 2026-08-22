/**
 * OfficeCLI-backed PPTX export engine.
 *
 * Uses the `officecli` binary (installed globally) to produce high-fidelity
 * native OOXML .pptx files. Each layout is built from real PowerPoint shapes
 * via a single `officecli batch` call per presentation.
 *
 * Architecture:
 *   1. Build a JSON array of officecli commands (one per shape/slide)
 *   2. `officecli create <tmp.pptx>`
 *   3. `officecli batch <tmp.pptx> --commands '<JSON>'`
 *   4. Read the file as a Buffer and return it
 *   5. Caller streams it as a download response
 */

import { execFileSync } from 'child_process'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// OfficeCLI batch command shape
type OfficeCLICommand = {
  command: string
  parent?: string
  path?: string
  type?: string
  props?: Record<string, string | number | boolean>
}

// ---------------------------------------------------------------------------
// Theme palette (hex, no #)
// ---------------------------------------------------------------------------

const THEMES: Record<string, { bg: string; text: string; muted: string; accent: string; card: string; border: string }> = {
  'obsidian-neon': { bg: '07090E', text: 'F8FAFC', muted: '94A3B8', accent: '06B6D4', card: '0F131C', border: '1E293B' },
  'silicon-slate': { bg: '0B1120', text: 'F8FAFC', muted: '94A3B8', accent: '3B82F6', card: '161E31', border: '1E293B' },
  'nordic-minimal': { bg: 'F8FAFC', text: '0F172A', muted: '475569', accent: '10B981', card: 'FFFFFF', border: 'E2E8F0' },
  'tokyo-sunset':   { bg: '030305', text: 'FFF1F2', muted: 'FDA4AF', accent: 'F43F5E', card: '181216', border: '2E1A22' },
  'emerald-matrix': { bg: '03120E', text: 'ECFDF5', muted: 'A7F3D0', accent: '10B981', card: '061E17', border: '0E3D30' },
  'aurora-indigo':  { bg: '0A0818', text: 'EEF2FF', muted: 'C7D2FE', accent: '6366F1', card: '14102B', border: '271F52' },
}

// Slide dimensions in cm (16:9 = 33.87 x 19.05 cm)
const W = 33.87
const H = 19.05

// ---------------------------------------------------------------------------
// Per-layout command builders
// ---------------------------------------------------------------------------

function buildHeroSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  // Full-bleed background image
  if (s.imageUrl) {
    cmds.push({
      command: 'add', parent, type: 'picture',
      props: { src: s.imageUrl, x: '0cm', y: '0cm', width: `${W}cm`, height: `${H}cm`, opacity: 0.35 },
    })
    // Dark overlay for readability
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'rect', x: '0cm', y: '0cm', width: `${W}cm`, height: `${H}cm`, fill: th.bg, line: 'none', opacity: 0.7 },
    })
  }

  // Top accent bar
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '0cm', y: '0cm', width: `${W}cm`, height: '0.18cm', fill: th.accent, line: 'none' },
  })

  // Title
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '2.5cm', y: '5.5cm', width: '28.87cm', height: '5cm',
      font: 'Inter', size: 44, bold: true, color: th.text, align: 'center', valign: 'middle', line: 'none', fill: 'none',
    },
  })

  // Subtitle / first bullet
  const firstLine = s.content.split('\n').find(l => l.trim()) ?? ''
  const subtitle = firstLine.replace(/^•\s*/, '').split(':').pop()?.trim() ?? firstLine
  if (subtitle) {
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: subtitle, x: '3cm', y: '11cm', width: '27.87cm', height: '2cm',
        font: 'Inter', size: 20, color: th.muted, align: 'center', valign: 'top', line: 'none', fill: 'none',
      },
    })
  }

  // Accent pill line under title
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '14.94cm', y: '10.8cm', width: '4cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })
}

function buildStatCardSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  // Section tag
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: 'KEY METRICS', x: '2.5cm', y: '1.2cm', width: '10cm', height: '0.8cm',
      font: 'Courier New', size: 9, bold: true, color: th.accent, line: 'none', fill: 'none',
    },
  })

  // Title
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '2.5cm', y: '2.0cm', width: '28.87cm', height: '2.5cm',
      font: 'Inter', size: 34, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })

  // Accent bar
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '2.5cm', y: '4.8cm', width: '3cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })

  // Parse bullets: "• $5.4M: Revenue" → value=$5.4M, label=Revenue
  const bullets = s.content.split('\n').map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean)
  const cards = bullets.slice(0, 3)
  const cardW = 9.0
  const gap = 0.8
  const startX = 2.5

  cards.forEach((bullet, i) => {
    const [rawVal, ...rest] = bullet.split(':')
    const val = rawVal?.trim() ?? bullet
    const lbl = rest.join(':').trim() || `Metric 0${i + 1}`
    const x = startX + i * (cardW + gap)

    // Card background
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'roundRect', x: `${x}cm`, y: '5.5cm', width: `${cardW}cm`, height: '10cm', fill: th.card, line: th.border, lineWidth: 0.8 },
    })

    // Accent top bar on card
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'rect', x: `${x}cm`, y: '5.5cm', width: `${cardW}cm`, height: '0.25cm', fill: th.accent, line: 'none' },
    })

    // Metric value (big number)
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: val, x: `${x + 0.5}cm`, y: '7.5cm', width: `${cardW - 1}cm`, height: '4cm',
        font: 'Courier New', size: 48, bold: true, color: th.accent, align: 'center', valign: 'middle', line: 'none', fill: 'none',
      },
    })

    // Label
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: lbl.toUpperCase(), x: `${x + 0.5}cm`, y: '12cm', width: `${cardW - 1}cm`, height: '2cm',
        font: 'Inter', size: 12, color: th.muted, align: 'center', valign: 'top', line: 'none', fill: 'none',
      },
    })
  })
}

function buildBentoSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '2.5cm', y: '1.2cm', width: '28.87cm', height: '2.5cm',
      font: 'Inter', size: 30, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '2.5cm', y: '3.9cm', width: '2.5cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })

  const bullets = s.content.split('\n').map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean)
  const items = bullets.slice(0, 3)
  const cardW = 9.6
  const gap = 0.8
  const startX = 2.5

  items.forEach((bullet, i) => {
    const [rawTitle, ...rest] = bullet.split(':')
    const cardTitle = rawTitle?.trim() ?? bullet
    const cardDesc = rest.join(':').trim()
    const x = startX + i * (cardW + gap)

    // Card
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'roundRect', x: `${x}cm`, y: '4.5cm', width: `${cardW}cm`, height: '12cm', fill: th.card, line: th.border, lineWidth: 0.8 },
    })

    // Icon badge (number)
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        shape: 'roundRect', x: `${x + 0.6}cm`, y: '5.3cm', width: '2cm', height: '2cm', fill: th.accent, line: 'none',
      },
    })
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `0${i + 1}`, x: `${x + 0.6}cm`, y: '5.3cm', width: '2cm', height: '2cm',
        font: 'Courier New', size: 16, bold: true, color: th.bg, align: 'center', valign: 'middle', line: 'none', fill: 'none',
      },
    })

    // Card title
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: cardTitle, x: `${x + 0.6}cm`, y: '8cm', width: `${cardW - 1.2}cm`, height: '2.5cm',
        font: 'Inter', size: 16, bold: true, color: th.text, valign: 'top', line: 'none', fill: 'none',
      },
    })

    // Card description
    if (cardDesc) {
      cmds.push({
        command: 'add', parent, type: 'shape',
        props: {
          text: cardDesc, x: `${x + 0.6}cm`, y: '10.8cm', width: `${cardW - 1.2}cm`, height: '4.5cm',
          font: 'Inter', size: 12, color: th.muted, valign: 'top', line: 'none', fill: 'none',
        },
      })
    }

    // SPEC tag at bottom
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: 'FEATURE SPEC', x: `${x + 0.6}cm`, y: '15.5cm', width: `${cardW - 1.2}cm`, height: '0.8cm',
        font: 'Courier New', size: 9, bold: true, color: th.accent, valign: 'middle', line: 'none', fill: 'none',
      },
    })
  })
}

function buildComparisonSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '2.5cm', y: '1.0cm', width: '28.87cm', height: '2.5cm',
      font: 'Inter', size: 30, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '2.5cm', y: '3.7cm', width: '2.5cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })

  // Parse diagramData if present
  let leftLabel = 'Legacy Approach'
  let rightLabel = 'Modern AI Platform'
  let leftPoints: string[] = ['Manual processing', 'High latency', 'Fragmented tooling']
  let rightPoints: string[] = ['Instant AI pipeline', 'Sub-second results', 'Unified platform']

  if (s.diagramData) {
    try {
      const parsed = JSON.parse(s.diagramData)
      leftLabel = parsed.left?.label || leftLabel
      rightLabel = parsed.right?.label || rightLabel
      leftPoints = parsed.left?.points?.length ? parsed.left.points : leftPoints
      rightPoints = parsed.right?.points?.length ? parsed.right.points : rightPoints
    } catch {
      // use defaults
    }
  }

  // ── LEFT card (legacy/baseline) ──
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'roundRect', x: '2.5cm', y: '4.2cm', width: '13.5cm', height: '13cm', fill: th.card, line: th.border, lineWidth: 0.8 },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: 'BASELINE', x: '3cm', y: '4.9cm', width: '5cm', height: '0.7cm',
      font: 'Courier New', size: 9, bold: true, color: th.muted, line: 'none', fill: 'none',
    },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: leftLabel, x: '3cm', y: '5.8cm', width: '12.5cm', height: '2cm',
      font: 'Inter', size: 18, bold: true, color: th.muted, valign: 'top', line: 'none', fill: 'none',
    },
  })
  leftPoints.slice(0, 4).forEach((pt, pi) => {
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `✗  ${pt}`, x: '3cm', y: `${8.2 + pi * 1.8}cm`, width: '12.5cm', height: '1.5cm',
        font: 'Inter', size: 12, color: th.muted, valign: 'top', line: 'none', fill: 'none',
      },
    })
  })

  // ── RIGHT card (recommended/AI) ──
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'roundRect', x: '17.87cm', y: '4.2cm', width: '13.5cm', height: '13cm', fill: `${th.accent}20`, line: th.accent, lineWidth: 1.2 },
  })
  // Accent top bar
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '17.87cm', y: '4.2cm', width: '13.5cm', height: '0.3cm', fill: th.accent, line: 'none' },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: 'RECOMMENDED', x: '18.5cm', y: '4.9cm', width: '6cm', height: '0.7cm',
      font: 'Courier New', size: 9, bold: true, color: th.accent, line: 'none', fill: 'none',
    },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: rightLabel, x: '18.5cm', y: '5.8cm', width: '12.5cm', height: '2cm',
      font: 'Inter', size: 18, bold: true, color: th.text, valign: 'top', line: 'none', fill: 'none',
    },
  })
  rightPoints.slice(0, 4).forEach((pt, pi) => {
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `✓  ${pt}`, x: '18.5cm', y: `${8.2 + pi * 1.8}cm`, width: '12.5cm', height: '1.5cm',
        font: 'Inter', size: 12, color: th.text, valign: 'top', line: 'none', fill: 'none',
      },
    })
  })
}

function buildFlowSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '2.5cm', y: '1.0cm', width: '28.87cm', height: '2.5cm',
      font: 'Inter', size: 30, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })

  let steps: Array<{ title: string; desc?: string }> = []
  if (s.diagramData) {
    try {
      const parsed = JSON.parse(s.diagramData)
      steps = parsed.steps ?? []
    } catch {
      // fallback to bullets
    }
  }
  if (!steps.length) {
    steps = s.content
      .split('\n')
      .map(l => l.replace(/^•\s*/, '').trim())
      .filter(Boolean)
      .map((b) => {
        const [t, ...rest] = b.split(':')
        return { title: t?.trim() ?? b, desc: rest.join(':').trim() || undefined }
      })
  }

  const visibleSteps = steps.slice(0, 4)
  const stepW = 6.5
  const stepH = 9.0
  const gap = 0.8
  const totalW = visibleSteps.length * stepW + (visibleSteps.length - 1) * gap
  const startX = (W - totalW) / 2

  visibleSteps.forEach((step, i) => {
    const x = startX + i * (stepW + gap)

    // Step box
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'roundRect', x: `${x}cm`, y: '5cm', width: `${stepW}cm`, height: `${stepH}cm`, fill: th.card, line: th.accent, lineWidth: 0.8 },
    })

    // Step number badge
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'ellipse', x: `${x + stepW / 2 - 1}cm`, y: '4cm', width: '2cm', height: '2cm', fill: th.accent, line: 'none' },
    })
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `${i + 1}`, x: `${x + stepW / 2 - 1}cm`, y: '4cm', width: '2cm', height: '2cm',
        font: 'Courier New', size: 16, bold: true, color: th.bg, align: 'center', valign: 'middle', line: 'none', fill: 'none',
      },
    })

    // Step title
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: step.title, x: `${x + 0.4}cm`, y: '6.8cm', width: `${stepW - 0.8}cm`, height: '2.5cm',
        font: 'Inter', size: 14, bold: true, color: th.text, align: 'center', valign: 'top', line: 'none', fill: 'none',
      },
    })

    // Step description
    if (step.desc) {
      cmds.push({
        command: 'add', parent, type: 'shape',
        props: {
          text: step.desc, x: `${x + 0.4}cm`, y: '9.8cm', width: `${stepW - 0.8}cm`, height: '4cm',
          font: 'Inter', size: 11, color: th.muted, align: 'center', valign: 'top', line: 'none', fill: 'none',
        },
      })
    }

    // Arrow connector (between steps)
    if (i < visibleSteps.length - 1) {
      cmds.push({
        command: 'add', parent, type: 'shape',
        props: {
          text: '→', x: `${x + stepW + 0.1}cm`, y: '8.5cm', width: `${gap + 0.6}cm`, height: '2cm',
          font: 'Arial', size: 24, bold: true, color: th.accent, align: 'center', valign: 'middle', line: 'none', fill: 'none',
        },
      })
    }
  })
}

function buildSplitSlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
  imageRight: boolean,
) {
  const parent = `/slide[${slideIndex}]`
  const textX = imageRight ? '2.5cm' : '18cm'
  const imgX  = imageRight ? '18cm'  : '2cm'
  const textW = '14cm'

  // Image
  if (s.imageUrl) {
    cmds.push({
      command: 'add', parent, type: 'picture',
      props: { src: s.imageUrl, x: imgX, y: '1.5cm', width: '13.5cm', height: '16cm' },
    })
    // Border on image
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: { shape: 'rect', x: imgX, y: '1.5cm', width: '13.5cm', height: '16cm', fill: 'none', line: th.border, lineWidth: 1 },
    })
  }

  // Accent accent bar
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: textX, y: '3.5cm', width: '2.5cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })

  // Title
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: textX, y: '1.2cm', width: textW, height: '3cm',
      font: 'Inter', size: 28, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })

  // Bullets
  const bullets = s.content.split('\n').map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean)
  bullets.slice(0, 5).forEach((bullet, i) => {
    const [rawTitle, ...rest] = bullet.split(':')
    const bTitle = rawTitle?.trim() ?? bullet
    const bDesc  = rest.join(':').trim()

    // Title bold
    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `▸  ${bTitle}`, x: textX, y: `${4.2 + i * 2.6}cm`, width: textW, height: '1.2cm',
        font: 'Inter', size: 13, bold: true, color: th.text, valign: 'top', line: 'none', fill: 'none',
      },
    })

    if (bDesc) {
      cmds.push({
        command: 'add', parent, type: 'shape',
        props: {
          text: bDesc, x: `${parseFloat(textX) + 0.5}cm`, y: `${5.4 + i * 2.6}cm`, width: textW, height: '1.1cm',
          font: 'Inter', size: 11, color: th.muted, valign: 'top', line: 'none', fill: 'none',
        },
      })
    }
  })
}

function buildTextOnlySlide(
  slideIndex: number,
  s: Slide,
  th: (typeof THEMES)[string],
  cmds: OfficeCLICommand[],
) {
  const parent = `/slide[${slideIndex}]`

  cmds.push({
    command: 'add', parent, type: 'shape',
    props: {
      text: s.title, x: '3cm', y: '1.5cm', width: '27.87cm', height: '3cm',
      font: 'Inter', size: 34, bold: true, color: th.text, valign: 'middle', line: 'none', fill: 'none',
    },
  })
  cmds.push({
    command: 'add', parent, type: 'shape',
    props: { shape: 'rect', x: '3cm', y: '4.7cm', width: '2.5cm', height: '0.12cm', fill: th.accent, line: 'none' },
  })

  const bullets = s.content.split('\n').map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean)
  bullets.slice(0, 6).forEach((bullet, i) => {
    const [rawTitle, ...rest] = bullet.split(':')
    const bTitle = rawTitle?.trim() ?? bullet
    const bDesc  = rest.join(':').trim()

    cmds.push({
      command: 'add', parent, type: 'shape',
      props: {
        text: `▸  ${bTitle}${bDesc ? `:  ${bDesc}` : ''}`,
        x: '3cm', y: `${5.5 + i * 2.1}cm`, width: '27.87cm', height: '1.8cm',
        font: 'Inter', size: 14, color: bDesc ? th.text : th.muted,
        bold: false, valign: 'top', line: 'none', fill: 'none',
      },
    })
  })
}

// ---------------------------------------------------------------------------
// Main OfficeCLI export function
// ---------------------------------------------------------------------------

function officecli(...args: string[]): void {
  execFileSync('officecli', args, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
}

export async function exportToPptx({ title, slides, theme = 'obsidian-neon' }: ExportOptions): Promise<Buffer> {
  const th = THEMES[theme] ?? THEMES['obsidian-neon']
  const sorted = [...slides].sort((a, b) => a.order - b.order)

  const tmpFile = join(tmpdir(), `pptai_${Date.now()}_${Math.random().toString(36).slice(2)}.pptx`)

  try {
    // 1. Create blank .pptx
    officecli('create', tmpFile)

    // 2. Build all commands
    const cmds: OfficeCLICommand[] = []

    sorted.forEach((s, i) => {
      const slideNum = i + 1
      const layout = s.layoutType ?? 'split-right'
      const diagType = s.diagramType ?? 'none'

      // Add slide with theme background
      cmds.push({
        command: 'add', parent: '/', type: 'slide',
        props: { background: `#${th.bg}`, name: s.title.slice(0, 30) },
      })

      // Top accent bar on every slide
      cmds.push({
        command: 'add', parent: `/slide[${slideNum}]`, type: 'shape',
        props: { shape: 'rect', x: '0cm', y: '0cm', width: `${W}cm`, height: '0.2cm', fill: th.accent, line: 'none' },
      })

      // Footer
      cmds.push({
        command: 'add', parent: `/slide[${slideNum}]`, type: 'shape',
        props: {
          text: `${title}  •  ${slideNum} / ${sorted.length}`,
          x: '2.5cm', y: '18.3cm', width: '28.87cm', height: '0.6cm',
          font: 'Inter', size: 9, color: th.muted, valign: 'middle', line: 'none', fill: 'none',
        },
      })

      // Route to layout builder
      if (layout === 'hero') {
        buildHeroSlide(slideNum, s, th, cmds)
      } else if (layout === 'stat-card' || diagType === 'stats') {
        buildStatCardSlide(slideNum, s, th, cmds)
      } else if (layout === 'bento') {
        buildBentoSlide(slideNum, s, th, cmds)
      } else if (diagType === 'comparison' || layout === 'comparison') {
        buildComparisonSlide(slideNum, s, th, cmds)
      } else if (diagType === 'flow' || layout === 'flow' || layout === 'diagram') {
        buildFlowSlide(slideNum, s, th, cmds)
      } else if (layout === 'split-left') {
        buildSplitSlide(slideNum, s, th, cmds, false)
      } else if (layout === 'text-only') {
        buildTextOnlySlide(slideNum, s, th, cmds)
      } else {
        // Default: split-right (editorial with image on right)
        buildSplitSlide(slideNum, s, th, cmds, true)
      }

      // Speaker notes
      if (s.notes) {
        cmds.push({
          command: 'add', parent: `/slide[${slideNum}]`, type: 'shape',
          props: { text: `// ${s.notes}`, x: '0cm', y: '0cm', width: '1cm', height: '1cm', fill: 'none', line: 'none', size: 1 },
        })
      }
    })

    // 3. Run all commands in one batch (resident mode — fast)
    officecli('batch', tmpFile, '--commands', JSON.stringify(cmds))

    // 4. Close / flush to disk
    officecli('close', tmpFile)

    // 5. Read and return as Buffer
    const buf = readFileSync(tmpFile)
    return buf
  } finally {
    if (existsSync(tmpFile)) {
      try { unlinkSync(tmpFile) } catch { /* ignore */ }
    }
  }
}

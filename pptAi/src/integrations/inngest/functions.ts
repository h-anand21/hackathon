import { Output, generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

import { prisma } from '#/db'
import { uploadImageFromUrl } from '#/lib/imagekit'

import { inngest } from './client'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ---------------------------------------------------------------------------
// Image Generation
// ---------------------------------------------------------------------------

function buildFallbackImageUrl(prompt: string): string {
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/g, ' ').trim().slice(0, 180)
  const seed = Math.floor(Math.random() * 100000)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ', modern 3D vector minimal presentation visual, 16:9 aspect ratio, 4k')}?width=1280&height=720&model=flux&nologo=true&seed=${seed}`
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  const firstBrace = cleaned.indexOf('{')
  if (firstBrace === -1) {
    throw new Error('No JSON object found in response')
  }

  let parseError: any = null
  for (let i = cleaned.length; i >= firstBrace + 2; i--) {
    try {
      const candidate = cleaned.slice(firstBrace, i).trim()
      if (candidate.endsWith('}')) {
        return JSON.parse(candidate)
      }
    } catch (e) {
      parseError = e
    }
  }
  throw parseError || new Error('Failed to parse clean JSON')
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const IMAGE_STYLE_MAP: Record<string, string> = {
  professional: 'clean flat vector illustration, muted blue and white palette, minimal',
  creative: 'vibrant 3D render, colorful gradients, modern digital art style',
  bold: 'high contrast photorealistic, dramatic lighting, cinematic',
  minimal: 'simple thin line art on white background, monochrome, elegant',
}

const slideSchema = z.object({
  title: z.string().describe('Slide title — short, punchy and executive'),
  content: z.string().describe('Structured content with 2-4 points. Use format: "• Strong Feature Name: Concise descriptive detail"'),
  notes: z.string().optional().describe('Speaker notes for the presenter'),
  layoutType: z
    .enum(['hero', 'bento', 'stat-card', 'diagram', 'split-right', 'split-left', 'text-only'])
    .describe(
      'Choose diverse layouts across the deck: "hero" for title & closing; "bento" for 3-part feature grids; "stat-card" for 3 big KPI numbers; "diagram" for flow/comparison; "split-right"/"split-left" for editorial slides.',
    ),
  diagramType: z
    .enum(['flow', 'comparison', 'stats', 'timeline', 'none'])
    .describe(
      'Only if layoutType is "diagram". Use "flow" for step processes; "comparison" for A vs B; "stats" for data/numbers; "timeline" for milestones; otherwise "none".',
    ),
  diagramData: z
    .string()
    .optional()
    .describe(
      'JSON string for diagram. For flow: {"steps":[{"title":"Phase 1","desc":"Ingestion"},{"title":"Phase 2","desc":"Processing"},{"title":"Phase 3","desc":"Output"}]}. For comparison: {"left":{"label":"Legacy Approach","points":["Manual entry","High latency"]},"right":{"label":"AI Platform","points":["Instant pipeline","Real-time sync"]}}. For stats: {"stats":[{"value":"99.9%","label":"Uptime SLA"},{"value":"3.8x","label":"Efficiency Gain"},{"value":"$12M","label":"Cost Saved"}]}. Leave empty if not diagram.',
    ),
  imagePrompt: z
    .string()
    .describe(
      'Specific image prompt if layout is split-right/split-left or hero. Include subject, atmosphere, and modern 3D or vector aesthetic.',
    ),
})

const slidesResponseSchema = z.object({
  slides: z.array(slideSchema),
})

export async function executePresentationGeneration(presentationId: string) {
  try {
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
    })
    if (!presentation) throw new Error('Presentation not found')

    await prisma.presentation.update({
      where: { id: presentationId },
      data: { status: 'GENERATING' },
    })

    const imageStyle = IMAGE_STYLE_MAP[presentation.style] ?? IMAGE_STYLE_MAP.professional

    const systemPrompt = `You are a world-class presentation designer at Apple/Linear. Create a visually compelling, diverse, and high-taste presentation deck.

Style: ${presentation.style}
Tone: ${presentation.tone}
Layout preference: ${presentation.layout}
Number of slides: ${presentation.slideCount}
Image style for this presentation: ${imageStyle}

CRITICAL RULES FOR HIGH-TASTE DESIGN:
1. Diversity of Layouts: NEVER repeat the same layout 3 times in a row. Mix "hero", "bento", "stat-card", "diagram", and "split-right".
2. Structured Bullet Content: Always use the format "• Headline Title: Concrete benefit and explanation". Avoid vague generic sentences.
3. Stat Slides: When discussing numbers, metrics, or ROI, ALWAYS use layoutType "stat-card" with 3 big numbers in content (e.g. "• $5.4M: Projected Q4 Revenue\\n• 99.9%: Target Availability\\n• 2.5x: Throughput Multiplier").
4. Process & Comparison: When explaining workflows or traditional vs modern, use layoutType "diagram" and fill diagramData with rich JSON.
5. Hero Slides: Slide 1 MUST be "hero" with a punchy title and 2-3 mission highlight pills. The final slide should be "hero" or "bento" for next steps/CTA.

You MUST respond with ONLY a valid JSON object. No markdown, no explanation.
Schema:
{
  "slides": [
    {
      "title": "string",
      "content": "string (use • Bold Title: Description)",
      "notes": "string (optional)",
      "layoutType": "hero|bento|stat-card|diagram|split-right|split-left|text-only",
      "diagramType": "flow|comparison|stats|timeline|none",
      "diagramData": "JSON string or empty",
      "imagePrompt": "specific image description"
    }
  ]
}`

    let resultText = ''
    try {
      const result = await generateText({
        model: google('gemini-2.0-flash'),
        system: systemPrompt,
        prompt: presentation.prompt,
      })
      resultText = result.text
    } catch (geminiErr) {
      console.warn('Gemini generation failed, falling back to OpenAI gpt-4o-mini...', geminiErr)
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: presentation.prompt,
      })
      resultText = result.text
    }

    const rawJson = cleanAndParseJSON(resultText)
    const { slides } = slidesResponseSchema.parse(rawJson)

    await prisma.slide.deleteMany({
      where: { presentationId },
    })

    const NO_IMAGE_LAYOUTS = new Set(['diagram', 'text-only', 'stat-card'])

    const data = await Promise.all(
      slides.map(async (s, i) => {
        const needsImage = !NO_IMAGE_LAYOUTS.has(s.layoutType) && s.imagePrompt?.trim()
        let imageUrl: string | null = null

        if (needsImage) {
          imageUrl = buildFallbackImageUrl(s.imagePrompt)
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)

            const response = await fetch('https://api.meshapi.ai/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.MESH_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'openai/gpt-image-1',
                prompt: `${s.imagePrompt}. Presentation slide visual, 16:9 aspect ratio, professional quality.`,
                n: 1,
                size: '1024x1024',
              }),
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId))

            if (response.ok) {
              const resJson = await response.json()
              const tempUrl = resJson.data?.[0]?.url
              if (tempUrl) {
                try {
                  const permanentUrl = await uploadImageFromUrl(
                    tempUrl,
                    `slide-${presentationId}-${i}`,
                  )
                  imageUrl = permanentUrl || tempUrl
                } catch {
                  imageUrl = tempUrl
                }
              }
            }
          } catch {
            // fallback URL already assigned
          }
        }

        return {
          presentationId,
          order: i,
          title: s.title,
          content: s.content,
          notes: s.notes ?? null,
          imagePrompt: s.imagePrompt ?? null,
          imageUrl,
          layoutType: s.layoutType,
          diagramType: s.diagramType !== 'none' ? s.diagramType : null,
          diagramData: s.diagramData ?? null,
        }
      })
    )

    await prisma.slide.createMany({ data })

    await prisma.presentation.update({
      where: { id: presentationId },
      data: { status: 'COMPLETED' },
    })

    return { success: true, slideCount: slides.length }
  } catch (err) {
    console.error('Failed to execute presentation generation:', err)
    await prisma.presentation.update({
      where: { id: presentationId },
      data: { status: 'FAILED' },
    }).catch(() => {})
    throw err
  }
}

export const generatePresentation = inngest.createFunction(
  {
    id: 'generate-presentation',
    retries: 2,
    triggers: [{ event: 'presentation/generate' }],
  },
  async ({ event }) => {
    const { presentationId } = event.data as { presentationId: string }
    return executePresentationGeneration(presentationId)
  },
)

export const helloWorld = inngest.createFunction(
  {
    id: 'hello-world',
    triggers: [{ event: 'test/hello.world' }],
  },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    return { message: `Hello ${event.data.email}!` }
  },
)

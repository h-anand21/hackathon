import { Output, generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

import { prisma } from '#/db'
import { uploadImageFromUrl } from '#/lib/imagekit'

import { inngest } from './client'

const mesh = createOpenAI({
  baseURL: 'https://api.meshapi.ai/v1',
  apiKey: process.env.MESH_API_KEY,
})

// ---------------------------------------------------------------------------
// Image Generation
// ---------------------------------------------------------------------------

function buildFallbackImageUrl(prompt: string): string {
  // Use Unsplash source with relevant keywords from the prompt
  const keywords = prompt
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .join(',')
  return `https://images.unsplash.com/random/1280x720?${keywords}&auto=format&fit=crop&q=80`
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
  title: z.string().describe('Slide title — short and punchy'),
  content: z.string().describe('Main content (bullet points or short paragraphs). Use • for bullets.'),
  notes: z.string().optional().describe('Speaker notes for the presenter'),
  layoutType: z
    .enum(['hero', 'split-right', 'split-left', 'text-only', 'stat-card', 'diagram'])
    .describe(
      'Layout for this slide. Use "hero" for title/cover slides. Use "split-right" or "split-left" for content slides alternating. Use "text-only" for quotes or key statements. Use "stat-card" for slides with 2-3 big numbers/stats. Use "diagram" for process steps, timelines, comparisons, or how-it-works slides.',
    ),
  diagramType: z
    .enum(['flow', 'comparison', 'stats', 'timeline', 'none'])
    .describe(
      'Only if layoutType is "diagram". Use "flow" for step-by-step processes. Use "comparison" for A vs B. Use "stats" for data/numbers. Use "timeline" for roadmaps. Otherwise "none".',
    ),
  diagramData: z
    .string()
    .optional()
    .describe(
      'JSON string of diagram data. For flow: {"steps":["Step 1","Step 2","Step 3"]}. For comparison: {"left":{"label":"Option A","points":["Fast","Cheap"]},"right":{"label":"Option B","points":["Slow","Expensive"]}}. For stats: {"stats":[{"value":"73%","label":"Users satisfied"},{"value":"3x","label":"Faster results"}]}. For timeline: {"events":[{"year":"2022","label":"Founded"},{"year":"2023","label":"Launch"}]}. Leave empty if diagramType is "none".',
    ),
  imagePrompt: z
    .string()
    .describe(
      'ONLY fill if layoutType is NOT "diagram", "text-only", or "stat-card". Describe a VERY SPECIFIC image: include the subject, setting, style, and color. Example: "A diverse team of 3 engineers collaborating over a laptop in a modern office, flat vector illustration, blue and white palette". No generic prompts.',
    ),
})

const slidesResponseSchema = z.object({
  slides: z.array(slideSchema),
})

export const generatePresentation = inngest.createFunction(
  {
    id: 'generate-presentation',
    retries: 2,
    triggers: [{ event: 'presentation/generate' }],
  },
  async ({ event, step }) => {
    const { presentationId } = event.data as { presentationId: string }

    const presentation = await step.run('fetch-presentation', async () => {
      const p = await prisma.presentation.findUnique({
        where: { id: presentationId },
      })
      if (!p) throw new Error('Presentation not found')
      return p
    })

    await step.run('mark-generating', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { status: 'GENERATING' },
      })
    })

    const imageStyle = IMAGE_STYLE_MAP[presentation.style] ?? IMAGE_STYLE_MAP.professional

    const { slides } = await step.run('generate-slides-content', async () => {
      const systemPrompt = `You are a world-class presentation designer. Create a compelling, visually intelligent presentation.

Style: ${presentation.style}
Tone: ${presentation.tone}
Layout preference: ${presentation.layout}
Number of slides: ${presentation.slideCount}
Image style for this presentation: ${imageStyle}

Rules:
- Slide 1: ALWAYS use layoutType "hero" (title/cover slide)
- Slide 2-last: Alternate between "split-right" and "split-left" for content slides
- Use "stat-card" when the slide is about data, metrics, or numbers
- Use "diagram" when the slide is about a process, steps, timeline, or comparison — in this case set diagramType and diagramData properly
- Use "text-only" for impactful quote slides or key statements
- Last slide: Use "hero" for conclusion/CTA
- For imagePrompt, be VERY specific. Match the slide topic exactly. Include: subject + setting + style + color palette. Never use generic prompts.
- For diagram slides, skip imagePrompt (leave it empty) — the diagram IS the visual

You MUST respond with ONLY a valid JSON object. No markdown, no explanation.
Schema:
{
  "slides": [
    {
      "title": "string",
      "content": "string (use • for bullets)",
      "notes": "string (optional)",
      "layoutType": "hero|split-right|split-left|text-only|stat-card|diagram",
      "diagramType": "flow|comparison|stats|timeline|none",
      "diagramData": "JSON string or empty",
      "imagePrompt": "very specific image description or empty"
    }
  ]
}`

      const result = await generateText({
        model: mesh.chat('google/gemini-3.5-flash'),
        system: systemPrompt,
        prompt: presentation.prompt,
      })

      const rawJson = cleanAndParseJSON(result.text)
      const parsed = slidesResponseSchema.parse(rawJson)
      return parsed
    })

    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({
        where: { presentationId },
      })
    })

    await step.run('create-slides', async () => {
      const NO_IMAGE_LAYOUTS = new Set(['diagram', 'text-only', 'stat-card'])

      const data = await Promise.all(
        slides.map(async (s, i) => {
          const needsImage = !NO_IMAGE_LAYOUTS.has(s.layoutType) && s.imagePrompt?.trim()
          let imageUrl: string | null = null

          if (needsImage) {
            // fallback URL — used if AI image generation fails
            imageUrl = buildFallbackImageUrl(s.imagePrompt)
            console.log(`[slide ${i}] Generating image for: "${s.imagePrompt.slice(0, 60)}..."`)
            console.log(`[slide ${i}] MESH_API_KEY set: ${!!process.env.MESH_API_KEY}`)

            try {
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
              })

              console.log(`[slide ${i}] MeshAPI response status: ${response.status}`)
              if (response.ok) {
                const resJson = await response.json()
                const tempUrl = resJson.data?.[0]?.url
                console.log(`[slide ${i}] tempUrl: ${tempUrl ? 'got URL' : 'MISSING'}`)
                if (tempUrl) {
                  // Try ImageKit upload, but fall back to direct URL if it fails
                  try {
                    const permanentUrl = await uploadImageFromUrl(
                      tempUrl,
                      `slide-${presentationId}-${i}`,
                    )
                    imageUrl = permanentUrl || tempUrl
                    console.log(`[slide ${i}] saved to: ${imageUrl}`)
                  } catch {
                    // ImageKit failed (quota?), use MeshAPI URL directly
                    imageUrl = tempUrl
                    console.log(`[slide ${i}] ImageKit failed, using MeshAPI URL directly`)
                  }
                }
              } else {
                const errText = await response.text()
                console.warn(`[slide ${i}] MeshAPI error ${response.status}: ${errText.slice(0, 200)}`)
              }
            } catch (err) {
              console.warn(`[slide ${i}] Failed to generate image:`, err)
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
    })

    await step.run('mark-completed', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { status: 'COMPLETED' },
      })
    })

    return { success: true, slideCount: slides.length }
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

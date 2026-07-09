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

function buildImageKitUrl(prompt: string, filename: string): string {
  const baseUrl = process.env.IMAGEKIT_BASE_URL!
  const sanitizedPrompt = prompt
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)

  return `${baseUrl}/ik-genimg-prompt-${encodeURIComponent(sanitizedPrompt)}/${filename}.jpg?tr=w-1280,h-720`
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const slideSchema = z.object({
  title: z.string().describe('Slide title'),
  content: z.string().describe('Main content / bullet points for the slide'),
  notes: z.string().optional().describe('Speaker notes'),
  imagePrompt: z
    .string()
    .describe(
      'A concise prompt to generate an illustration for this slide (professional, clean style, no text in image)',
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

    const { slides } = await step.run('generate-slides-content', async () => {
      const systemPrompt = `You are an expert presentation designer. Given a user's content/prompt, create a compelling presentation.

Style: ${presentation.style}
Tone: ${presentation.tone}
Layout preference: ${presentation.layout}
Number of slides requested: ${presentation.slideCount}

Guidelines:
- Create exactly ${presentation.slideCount} slides
- First slide should be a title slide
- Last slide should be a summary or call-to-action
- Keep content concise and impactful
- For imagePrompt, describe a professional illustration that complements the slide (no text in images)

You MUST respond with a JSON object matching this schema:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "Slide content / bullet points",
      "notes": "Speaker notes (optional)",
      "imagePrompt": "A concise prompt to generate an illustration for this slide"
    }
  ]
}
`

      const result = await generateText({
        model: mesh.chat('google/gemini-3.5-flash'),
        output: Output.json(),
        system: systemPrompt,
        prompt: presentation.prompt,
      })

      const parsed = slidesResponseSchema.parse(result.output)
      return parsed
    })

    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({
        where: { presentationId },
      })
    })

    await step.run('create-slides', async () => {
      const data = await Promise.all(
        slides.map(async (s, i) => {
          let imageUrl = buildImageKitUrl(s.imagePrompt, `slide-${presentationId}-${i}`)

          try {
            const response = await fetch('https://api.meshapi.ai/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.MESH_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'openai/dall-e-3',
                prompt: s.imagePrompt,
                n: 1,
                size: '1024x1024',
              }),
            })

            if (response.ok) {
              const resJson = await response.json()
              const tempUrl = resJson.data?.[0]?.url
              if (tempUrl) {
                const permanentUrl = await uploadImageFromUrl(
                  tempUrl,
                  `slide-${presentationId}-${i}`,
                )
                imageUrl = permanentUrl
              }
            } else {
              const errText = await response.text()
              console.warn(`MeshAPI DALL-E 3 returned status ${response.status}: ${errText}`)
            }
          } catch (err) {
            console.warn(`Failed to generate image for slide ${i} via MeshAPI:`, err)
          }

          return {
            presentationId,
            order: i,
            title: s.title,
            content: s.content,
            notes: s.notes ?? null,
            imagePrompt: s.imagePrompt,
            imageUrl,
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

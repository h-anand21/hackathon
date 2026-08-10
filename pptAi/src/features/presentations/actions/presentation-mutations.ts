import { createServerFn } from '@tanstack/react-start'

import { prisma } from '#/db'
import { inngest } from '#/integrations/inngest/client'
import { executePresentationGeneration } from '#/integrations/inngest/functions'

import { deriveTitle, requirePresentationUserId } from '../lib/server-helpers'
import {
  createPresentationInputSchema,
  presentationIdInputSchema,
  updatePresentationInputSchema,
  updateSlideInputSchema,
  createSlideInputSchema,
  duplicateSlideInputSchema,
  deleteSlideInputSchema,
  reorderSlideInputSchema,
  generateSlideImageInputSchema,
} from '../types/schemas'

export const createPresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createPresentationInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: deriveTitle(data.prompt),
        prompt: data.prompt,
        slideCount: data.slideCount,
        style: data.style,
        tone: data.tone,
        layout: data.layout,
        status: 'GENERATING',
      },
    })

    await inngest.send({
      name: 'presentation/generate',
      data: { presentationId: presentation.id },
    }).catch(() => {})

    // Background direct execution fallback so generation never gets stuck
    executePresentationGeneration(presentation.id).catch((err) =>
      console.error('[Fallback Generation Error]', err)
    )

    return presentation
  })

export const updatePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const { id, ...patch } = data
    const existing = await prisma.presentation.findFirst({
      where: { id, userId },
    })
    if (!existing) throw new Error('Not found')
    const updateData = patch
    return prisma.presentation.update({
      where: { id },
      data: updateData,
    })
  })

export const deletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    await prisma.presentation.delete({ where: { id: data.id } })
    return { ok: true as const }
  })

export const regeneratePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')

    await prisma.presentation.update({
      where: { id: data.id },
      data: { status: 'GENERATING' },
    })

    await inngest.send({
      name: 'presentation/generate',
      data: { presentationId: data.id },
    }).catch(() => {})

    executePresentationGeneration(data.id).catch((err) =>
      console.error('[Fallback Regeneration Error]', err)
    )

    return { ok: true as const }
  })

export const updateSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSlideInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    const { id, ...patch } = data
    return prisma.slide.update({ where: { id }, data: patch })
  })

export const createSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createSlideInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    const count = await prisma.slide.count({
      where: { presentationId: data.presentationId },
    })
    const order = data.order ?? count
    return prisma.slide.create({
      data: {
        presentationId: data.presentationId,
        title: data.title,
        content: data.content,
        layoutType: data.layoutType,
        diagramType: data.diagramType ?? null,
        diagramData: data.diagramData ?? null,
        order,
      },
    })
  })

export const duplicateSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => duplicateSlideInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    const original = await prisma.slide.findUnique({
      where: { id: data.slideId },
    })
    if (!original) throw new Error('Slide not found')

    return prisma.slide.create({
      data: {
        presentationId: original.presentationId,
        title: `${original.title} (Copy)`,
        content: original.content,
        notes: original.notes,
        imageUrl: original.imageUrl,
        imageStyle: original.imageStyle,
        imagePrompt: original.imagePrompt,
        layoutType: original.layoutType,
        diagramType: original.diagramType,
        diagramData: original.diagramData,
        order: original.order + 1,
      },
    })
  })

export const deleteSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deleteSlideInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    return prisma.slide.delete({
      where: { id: data.slideId },
    })
  })

export const reorderSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => reorderSlideInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    const slides = await prisma.slide.findMany({
      where: { presentationId: data.presentationId },
      orderBy: { order: 'asc' },
    })

    const index = slides.findIndex((s) => s.id === data.slideId)
    if (index === -1) throw new Error('Slide not found')

    const targetIndex = data.direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return { ok: true }

    const currentSlide = slides[index]
    const targetSlide = slides[targetIndex]

    await prisma.$transaction([
      prisma.slide.update({
        where: { id: currentSlide.id },
        data: { order: targetSlide.order },
      }),
      prisma.slide.update({
        where: { id: targetSlide.id },
        data: { order: currentSlide.order },
      }),
    ])

    return { ok: true }
  })

export const generateSlideImage = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => generateSlideImageInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    const slide = await prisma.slide.findUnique({
      where: { id: data.slideId },
    })
    if (!slide) throw new Error('Slide not found')

    let imageUrl: string | null = null

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const response = await fetch('https://api.meshapi.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MESH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-image-1',
          prompt: `${data.prompt}. Presentation slide visual, 16:9 aspect ratio, 4k high quality, modern design.`,
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
            const { uploadImageFromUrl } = await import('#/lib/imagekit')
            imageUrl = await uploadImageFromUrl(
              tempUrl,
              `slide-custom-${slide.id}`,
            )
          } catch {
            imageUrl = tempUrl
          }
        }
      }
    } catch {
      // Unsplash fallback
      const keywords = data.prompt
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 3)
        .join(',')
      imageUrl = `https://images.unsplash.com/random/1280x720?${keywords}&auto=format&fit=crop&q=80`
    }

    if (!imageUrl) {
      imageUrl = `https://images.unsplash.com/random/1280x720?tech,modern&auto=format&fit=crop&q=80`
    }

    return prisma.slide.update({
      where: { id: data.slideId },
      data: {
        imageUrl,
        imagePrompt: data.prompt,
        imageStyle: data.style ?? 'cover',
      },
    })
  })



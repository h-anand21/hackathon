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

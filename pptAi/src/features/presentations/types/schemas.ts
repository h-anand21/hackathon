import { z } from 'zod'

export const presentationStyleSchema = z.enum([
  'minimal',
  'professional',
  'creative',
  'bold',
])

export const presentationToneSchema = z.enum([
  'formal',
  'casual',
  'persuasive',
  'informative',
])

export const presentationLayoutSchema = z.enum([
  'text-heavy',
  'visual',
  'balanced',
  'bullet-points',
])

export const presentationIdInputSchema = z.object({ id: z.string().min(1) })

export const createPresentationInputSchema = z.object({
  prompt: z.string().min(1).max(50_000),
  slideCount: z.number().int().min(3).max(20),
  style: presentationStyleSchema,
  tone: presentationToneSchema,
  layout: presentationLayoutSchema,
})

export const updatePresentationInputSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(200).optional(),
    prompt: z.string().min(1).max(50_000).optional(),
    slideCount: z.number().int().min(3).max(20).optional(),
    style: presentationStyleSchema.optional(),
    tone: presentationToneSchema.optional(),
    layout: presentationLayoutSchema.optional(),
  })
  .refine(
    (data) => {
      const { id: _id, ...rest } = data
      return Object.keys(rest).length > 0
    },
    { message: 'At least one field is required to update' },
  )

export const updateSlideInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePrompt: z.string().nullable().optional(),
  imageStyle: z.string().nullable().optional(),
  layoutType: z.string().nullable().optional(),
  diagramType: z.string().nullable().optional(),
  diagramData: z.string().nullable().optional(),
})

export const createSlideInputSchema = z.object({
  presentationId: z.string().min(1),
  title: z.string().min(1).default('New Slide'),
  content: z.string().default('• Point 1\n• Point 2\n• Point 3'),
  layoutType: z.string().default('split-right'),
  diagramType: z.string().nullable().optional(),
  diagramData: z.string().nullable().optional(),
  order: z.number().int().optional(),
})

export const duplicateSlideInputSchema = z.object({
  slideId: z.string().min(1),
})

export const deleteSlideInputSchema = z.object({
  slideId: z.string().min(1),
})

export const reorderSlideInputSchema = z.object({
  presentationId: z.string().min(1),
  slideId: z.string().min(1),
  direction: z.enum(['up', 'down']),
})




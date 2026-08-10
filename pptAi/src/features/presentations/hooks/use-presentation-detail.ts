import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { SlideLayout, SlideStyle, SlideTone } from '../constants/presentation-options'
import { presentationQueryKeys } from './query-keys'
import { getPresentationWithSlides } from '../api/presentation-queries'
import {
  deletePresentation,
  regeneratePresentation,
  updatePresentation,
  updateSlide,
  createSlide,
  duplicateSlide,
  deleteSlide,
  reorderSlide,
} from '../actions/presentation-mutations'

type SettingsForm = {
  title: string
  prompt: string
  slideCount: number
  style: SlideStyle
  tone: SlideTone
  layout: SlideLayout
}

export function usePresentationDetail(
  presentationId: string,
  opts?: {
    onDeleted?: () => void
  },
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: presentationQueryKeys.detail(presentationId),
    queryFn: () => getPresentationWithSlides({ data: { id: presentationId } }),
    refetchInterval: (q) =>
      q.state.data?.status === 'GENERATING' ? 3000 : false,
  })
 
  const [form, setForm] = useState<SettingsForm>({
    title: '',
    prompt: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  useEffect(() => {
    if (!query.data) return
    setForm({
      title: query.data.title,
      prompt: query.data.prompt,
      slideCount: query.data.slideCount,
      style: query.data.style as any,
      tone: query.data.tone as any,
      layout: query.data.layout as any,
    })
  }, [query.data])

  const updateMut = useMutation({
    mutationFn: () =>
      updatePresentation({
        data: {
          id: presentationId,
          title: form.title,
          prompt: form.prompt,
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: () => {
      toast.success('Presentation saved')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not save')
    },
  })

  const updateSlideMut = useMutation({
    mutationFn: (vars: {
      id: string
      title?: string
      content?: string
      notes?: string
      imageUrl?: string | null
      imagePrompt?: string | null
      imageStyle?: string | null
      layoutType?: string | null
      diagramType?: string | null
      diagramData?: string | null
    }) => updateSlide({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not save slide')
    },
  })

  const createSlideMut = useMutation({
    mutationFn: (vars: {
      title: string
      content: string
      layoutType: string
      diagramType?: string | null
      diagramData?: string | null
      order?: number
    }) => createSlide({ data: { ...vars, presentationId } }),
    onSuccess: () => {
      toast.success('Slide inserted')
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not create slide')
    },
  })

  const duplicateSlideMut = useMutation({
    mutationFn: (slideId: string) => duplicateSlide({ data: { slideId } }),
    onSuccess: () => {
      toast.success('Slide duplicated')
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not duplicate slide')
    },
  })

  const deleteSlideMut = useMutation({
    mutationFn: (slideId: string) => deleteSlide({ data: { slideId } }),
    onSuccess: () => {
      toast.success('Slide deleted')
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not delete slide')
    },
  })

  const reorderSlideMut = useMutation({
    mutationFn: (vars: { slideId: string; direction: 'up' | 'down' }) =>
      reorderSlide({ data: { ...vars, presentationId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not reorder slide')
    },
  })

  const regenerateMut = useMutation({
    mutationFn: () => regeneratePresentation({ data: { id: presentationId } }),
    onSuccess: () => {
      toast.success('Regenerating slides…')
      queryClient.invalidateQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not regenerate')
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deletePresentation({ data: { id: presentationId } }),
    onSuccess: () => {
      toast.success('Presentation deleted')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      queryClient.removeQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
      opts?.onDeleted?.()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not delete')
    },
  })

  const slides = query.data?.slides ?? []
  const isGenerating = query.data?.status === 'GENERATING'

  const updatedLabel = useMemo(() => {
    if (!query.data?.updatedAt) return ''
    return new Date(query.data.updatedAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }, [query.data?.updatedAt])

  return {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    updateSlideMut,
    createSlideMut,
    duplicateSlideMut,
    deleteSlideMut,
    reorderSlideMut,
    regenerateMut,
    deleteMut,
  }
}



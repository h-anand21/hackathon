import { createFileRoute, Link } from '@tanstack/react-router'
import { prisma } from '#/db'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const getPublicPresentation = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const row = await prisma.presentation.findFirst({
      where: { id: data.id },
      include: { slides: { orderBy: { order: 'asc' } } },
    })
    if (!row) throw new Error('Presentation not found')
    return row
  })

export const Route = createFileRoute('/view/$presentationId')({
  component: PublicViewPage,
})

function PublicViewPage() {
  const { presentationId } = Route.useParams()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-presentation', presentationId],
    queryFn: () => getPublicPresentation({ data: { id: presentationId } }),
  })

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080E1A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading presentation…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080E1A]">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Presentation not found</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to home</Link>
        </div>
      </div>
    )
  }

  const slides = data.slides
  const activeSlide = slides.at(activeSlideIndex)

  return (
    <div className="min-h-screen flex flex-col bg-[#080E1A]">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">pptAI</span>
          <span className="text-white/20 mx-2">·</span>
          <span className="text-sm text-slate-400 truncate max-w-xs">{data.title}</span>
        </div>
        <Link
          to="/"
          className="text-xs text-slate-500 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg border border-white/8 hover:border-blue-500/30"
        >
          Create yours →
        </Link>
      </header>

      {/* Slide preview */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {activeSlide && (
          <div className="w-full max-w-4xl">
            <SlidePreview slide={activeSlide} theme="dark-slate" />
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
            disabled={activeSlideIndex === 0}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400 min-w-[60px] text-center">
            {activeSlideIndex + 1} <span className="text-slate-600">/</span> {slides.length}
          </span>
          <button
            onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={activeSlideIndex >= slides.length - 1}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlideIndex(i)}
              className={`rounded-full transition-all ${i === activeSlideIndex ? 'w-6 h-1.5 bg-blue-500' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { prisma } from '#/db'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import { ChevronLeft, ChevronRight, Sparkles, Play } from 'lucide-react'
import { Button } from '#/components/ui/button'

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
  const [showSlideshow, setShowSlideshow] = useState(false)

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-presentation', presentationId],
    queryFn: () => getPublicPresentation({ data: { id: presentationId } }),
  })

  const slides = data?.slides ?? []

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSlideshow) return
      if (e.key === 'ArrowRight' || e.key === 'j') {
        e.preventDefault()
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        e.preventDefault()
        setActiveSlideIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowSlideshow(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length, showSlideshow])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-mono">Loading presentation…</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E]">
        <div className="text-center">
          <p className="text-slate-300 mb-4 font-display font-bold">Presentation not found</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 text-xs font-mono">
            ← Back to PPT.ai home
          </Link>
        </div>
      </div>
    )
  }

  const activeSlide = slides.at(activeSlideIndex)

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#090C12]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="size-3.5 text-cyan-400" />
          </div>
          <span className="text-sm font-bold font-display text-white">PPT.ai</span>
          <span className="text-white/20 mx-1.5">/</span>
          <span className="text-xs font-medium text-slate-300 truncate max-w-sm">
            {data.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setShowSlideshow(true)}
            className="h-8 rounded-lg gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Play className="size-3.5 fill-black" />
            Present <span className="text-[10px] font-mono opacity-60">F</span>
          </Button>

          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/30"
          >
            Create with PPT.ai →
          </Link>
        </div>
      </header>

      {/* Main Slide Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 relative">
        {activeSlide && (
          <div className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-white/5">
            <SlidePreview slide={activeSlide} theme="obsidian-neon" />
          </div>
        )}

        {/* Dock Controls */}
        <div className="flex items-center gap-4 bg-[#0F131C]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
            disabled={activeSlideIndex === 0}
            className="size-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous (Left Arrow or K)"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-200 min-w-[70px] text-center">
            {activeSlideIndex + 1} <span className="text-slate-600">/</span> {slides.length}
          </span>

          <button
            type="button"
            onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={activeSlideIndex >= slides.length - 1}
            className="size-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next (Right Arrow or J)"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Mini Pill indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSlideIndex(i)}
              className={`rounded-full transition-all ${
                i === activeSlideIndex ? 'w-6 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </main>

      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          initialIndex={activeSlideIndex}
          theme="obsidian-neon"
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  )
}

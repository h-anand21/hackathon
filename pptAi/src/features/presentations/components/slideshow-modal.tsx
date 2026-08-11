import { Button } from '#/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Clock,
  StickyNote,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { SlidePreview } from './slide-preview'

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

type SlideshowModalProps = {
  slides: Slide[]
  initialIndex?: number
  theme?: string
  onClose: () => void
}

export function SlideshowModal({
  slides,
  initialIndex = 0,
  theme = 'obsidian-neon',
  onClose,
}: SlideshowModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  const currentSlide = slides[currentIndex]

  // Presentation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return
    const autoPlayInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(autoPlayInterval)
  }, [isPlaying, slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault()
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === ' ' || e.key === 'p') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setShowNotes((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, slides.length])

  // Mouse idle detection
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3500)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-[#050608] flex flex-col justify-center items-center overflow-hidden select-none">
      {/* 16:9 Presenter Stage */}
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center relative">
        {currentSlide && (
          <div className="w-full h-full">
            <SlidePreview slide={currentSlide} isFullscreen theme={theme} />
          </div>
        )}

        {/* Speaker Notes Overlay Drawer */}
        {showNotes && currentSlide?.notes && (
          <div className="absolute top-20 right-8 w-80 bg-[#0B0F17]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl z-40 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <StickyNote className="size-3.5" /> Speaker Notes (N)
              </span>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans max-h-60 overflow-y-auto">
              {currentSlide.notes}
            </p>
          </div>
        )}
      </div>

      {/* Floating Presenter HUD Toolbar */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/15 shadow-2xl">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-cyan-300">
            <Clock className="size-3.5 text-cyan-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Slide Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            title="Previous (Left Arrow / K)"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="text-xs font-mono font-bold text-slate-200 min-w-[70px] text-center">
            {currentIndex + 1} / {slides.length}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentIndex >= slides.length - 1}
            title="Next (Right Arrow / J)"
          >
            <ChevronRight className="size-4" />
          </Button>

          <div className="w-px h-5 bg-white/10" />

          {/* Autoplay Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsPlaying((prev) => !prev)}
            title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
          >
            {isPlaying ? <Pause className="size-4 text-cyan-400" /> : <Play className="size-4" />}
          </Button>

          {/* Notes Toggle */}
          {currentSlide?.notes && (
            <Button
              variant="ghost"
              size="icon"
              className={`size-8 rounded-lg ${
                showNotes
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setShowNotes((prev) => !prev)}
              title="Toggle Speaker Notes (N)"
            >
              <StickyNote className="size-4" />
            </Button>
          )}

          <div className="w-px h-5 bg-white/10" />

          {/* Exit Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg"
            onClick={onClose}
            title="Exit Presenter Mode (Escape)"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

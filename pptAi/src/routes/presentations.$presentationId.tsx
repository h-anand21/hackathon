import { getSession } from '@/lib/auth.functions'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
  usePresentationDetail,
  useFullscreen,
} from '#/features/presentations'
import { GenerationStatus } from '#/features/presentations/components/generation-status'
import { SlideCard } from '#/features/presentations/components/slide-card'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Play,
  RefreshCw,
  Save,
  Trash2,
  Share2,
  Settings2,
  Palette,
  StickyNote,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'

export const Route = createFileRoute('/presentations/$presentationId')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: session.user }
  },
  component: PresentationDetailPage,
})

const THEMES = [
  { id: 'dark-slate', label: 'Dark Slate', color: '#3B82F6', bg: '#0F172A' },
  { id: 'light-paper', label: 'Light Paper', color: '#2563EB', bg: '#F8FAFC' },
  { id: 'ocean', label: 'Ocean', color: '#38BDF8', bg: '#0C1445' },
  { id: 'forest', label: 'Forest', color: '#22C55E', bg: '#0D2818' },
  { id: 'sunset', label: 'Sunset', color: '#F97316', bg: '#1C0A00' },
  { id: 'purple-haze', label: 'Purple Haze', color: '#A855F7', bg: '#1A0533' },
]

type RightPanelTab = 'settings' | 'theme' | 'notes'

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [rightTab, setRightTab] = useState<RightPanelTab>('theme')
  const [activeTheme, setActiveTheme] = useState('dark-slate')

  const {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  const { isFullscreen, toggleFullscreen } = useFullscreen('slide-preview-container')

  const handleExportPptx = useCallback(async () => {
    const data = query.data
    if (!data || slides.length === 0) return
    setIsExporting(true)
    try {
      const filename = await exportToPptx({ title: data.title, slides })
      toast.success(`Exported as ${filename}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [query.data, slides])

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/view/${presentationId}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
  }, [presentationId])

  if (query.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="size-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground text-sm">Loading presentation…</p>
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          <p className="text-destructive">{query.error instanceof Error ? query.error.message : 'Something went wrong'}</p>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/">Back home</Link></Button>
        </div>
      </main>
    )
  }

  const data = query.data
  const activeSlide = slides.at(activeSlideIndex)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080E1A]">
      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-[#0B1121] flex-shrink-0">
        <Button asChild variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-400 hover:text-white">
          <Link to="/"><ArrowLeft className="size-4" />Home</Link>
        </Button>

        <div className="w-px h-4 bg-white/10" />

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">{data.title}</h1>
          <div className="flex items-center gap-2">
            <GenerationStatus status={data.status} />
            <span className="text-xs text-slate-500">· {updatedLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slides.length > 0 && (
            <>
              <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={handleShare}>
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline text-xs">Share</span>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={handleExportPptx} disabled={isExporting}>
                <Download className="size-3.5" />
                <span className="hidden sm:inline text-xs">{isExporting ? 'Exporting…' : 'Export'}</span>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={() => setShowSlideshow(true)}>
                <Play className="size-3.5" />
                <span className="hidden sm:inline text-xs">Present</span>
              </Button>
            </>
          )}
          <Button
            size="sm"
            className="rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs"
            disabled={regenerateMut.isPending || isGenerating}
            onClick={() => regenerateMut.mutate()}
          >
            <RefreshCw className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating…' : 'Regenerate'}
          </Button>
        </div>
      </header>

      {/* ── 3-COLUMN BODY ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Slide List */}
        <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0B1121] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Slides <span className="text-slate-600 font-normal">({slides.length})</span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
            {slides.map((slide, i) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                isActive={i === activeSlideIndex}
                onClick={() => setActiveSlideIndex(i)}
              />
            ))}
            {slides.length === 0 && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <p className="text-xs text-slate-500">No slides yet</p>
              </div>
            )}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <RefreshCw className="size-5 animate-spin text-blue-500" />
                <p className="text-xs text-slate-500">Generating…</p>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Main Preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080E1A]">
          {activeSlide ? (
            <>
              {/* Preview area */}
              <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                <div id="slide-preview-container" className="w-full max-w-4xl relative group">
                  <SlidePreview slide={activeSlide} isFullscreen={isFullscreen} theme={activeTheme} />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity size-8"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Nav controls */}
              <div className="flex items-center justify-center gap-4 py-3 px-6 border-t border-white/5 flex-shrink-0">
                <Button
                  variant="ghost" size="sm" className="rounded-lg gap-1 text-slate-400 hover:text-white"
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="size-4" /> Prev
                </Button>
                <span className="text-sm text-slate-400 min-w-[60px] text-center">
                  {activeSlideIndex + 1} <span className="text-slate-600">/</span> {slides.length}
                </span>
                <Button
                  variant="ghost" size="sm" className="rounded-lg gap-1 text-slate-400 hover:text-white"
                  disabled={activeSlideIndex >= slides.length - 1}
                  onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                {isGenerating ? (
                  <><RefreshCw className="size-10 animate-spin mx-auto mb-4 text-blue-500" /><p className="text-slate-400">Generating your presentation…<br /><span className="text-xs text-slate-500">This may take a minute</span></p></>
                ) : (
                  <><p className="text-slate-400 mb-4">No slides yet</p><Button className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-500" onClick={() => regenerateMut.mutate()} disabled={regenerateMut.isPending}><RefreshCw className="size-4" />Generate slides</Button></>
                )}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: Properties Panel */}
        <aside className="w-72 flex-shrink-0 flex flex-col border-l border-white/5 bg-[#0B1121] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5">
            {([
              { id: 'theme', icon: Palette, label: 'Theme' },
              { id: 'settings', icon: Settings2, label: 'Settings' },
              { id: 'notes', icon: StickyNote, label: 'Notes' },
            ] as { id: RightPanelTab; icon: typeof Palette; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${rightTab === id ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* THEME TAB */}
            {rightTab === 'theme' && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Presentation Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setActiveTheme(th.id)}
                      className={`flex flex-col items-start gap-2 rounded-xl p-3 text-left transition-all border ${activeTheme === th.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/3 hover:border-white/15'}`}
                    >
                      {/* Preview swatch */}
                      <div className="w-full h-10 rounded-lg overflow-hidden flex">
                        <div className="flex-1" style={{ background: th.bg }} />
                        <div className="w-4" style={{ background: th.color }} />
                      </div>
                      <span className={`text-xs font-medium ${activeTheme === th.id ? 'text-blue-400' : 'text-slate-400'}`}>{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {rightTab === 'settings' && (
              <div className="p-4 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Title</Label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    className="flex h-9 w-full rounded-lg border border-white/8 bg-white/5 px-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Prompt</Label>
                  <Textarea
                    value={form.prompt}
                    onChange={(e) => setForm((s) => ({ ...s, prompt: e.target.value }))}
                    className="min-h-[100px] text-sm bg-white/5 border-white/8 rounded-lg resize-y text-white focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Slides: {form.slideCount}</Label>
                  <Slider
                    value={[form.slideCount]}
                    onValueChange={([v]) => setForm((s) => ({ ...s, slideCount: v }))}
                    min={3} max={20} step={1} className="py-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Style</Label>
                  <Select value={form.style} onValueChange={(value) => setForm((s) => ({ ...s, style: value as typeof form.style }))}>
                    <SelectTrigger className="bg-white/5 border-white/8 rounded-lg text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{SLIDE_STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Tone</Label>
                  <Select value={form.tone} onValueChange={(value) => setForm((s) => ({ ...s, tone: value as typeof form.tone }))}>
                    <SelectTrigger className="bg-white/5 border-white/8 rounded-lg text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{TONE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Layout</Label>
                  <Select value={form.layout} onValueChange={(value) => setForm((s) => ({ ...s, layout: value as typeof form.layout }))}>
                    <SelectTrigger className="bg-white/5 border-white/8 rounded-lg text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{LAYOUT_OPTIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <Button
                    size="sm" className="rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-500 w-full"
                    disabled={updateMut.isPending || !form.title.trim() || !form.prompt.trim()}
                    onClick={() => updateMut.mutate()}
                  >
                    <Save className="size-3.5" />
                    {updateMut.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" size="sm" className="rounded-lg gap-1.5 w-full" disabled={deleteMut.isPending}>
                        <Trash2 className="size-3.5" />Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete presentation?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => deleteMut.mutate()}>
                          {deleteMut.isPending ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {rightTab === 'notes' && (
              <div className="p-4">
                {activeSlide?.notes ? (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                      Slide {activeSlideIndex + 1} — Speaker Notes
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">{activeSlide.notes}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center mt-8">No notes for this slide</p>
                )}
              </div>
            )}

          </div>
        </aside>
      </div>

      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          initialIndex={activeSlideIndex}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  )
}

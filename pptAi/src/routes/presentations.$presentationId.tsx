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
  Presentation,
  Undo2,
  Redo2,
  History,
  UserCircle,
  Layers,
  LayoutTemplate,
  Image as ImageIcon,
  Smile,
  BarChart2,
  PlayCircle,
  Sparkles,
  ZoomIn,
  Copy,
  MessageSquare,
  Wand2,
  CheckCircle2,
  Type,
  Bot
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'
import { Logo } from '#/components/Logo'

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
  const [activeLeftTab, setActiveLeftTab] = useState('slides')
  const [zoomLevel, setZoomLevel] = useState(1)

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
    <div className="flex flex-col h-screen overflow-hidden bg-[#090B10] text-white">
      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 h-[72px] border-b border-white/5 bg-[#0A0C12]/90 backdrop-blur-xl flex-shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group mr-2">
            <Logo className="w-6 h-6 text-white group-hover:scale-105 transition-transform" />
            <span className="text-lg font-bold text-white tracking-tight">
              PPT<span className="text-[#FF8A2A]">.ai</span>
            </span>
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-white truncate max-w-[300px]">AI Prompt: {data.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Saved · {updatedLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => toast.info('Undo coming soon')}><Undo2 className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => toast.info('Redo coming soon')}><Redo2 className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => toast.info('History coming soon')}><History className="size-4" /></Button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={() => setShowSlideshow(true)}>
            <Play className="size-4" />
            <span className="hidden sm:inline text-xs font-medium">Present</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={handleExportPptx} disabled={isExporting}>
            <Download className="size-4" />
            <span className="hidden sm:inline text-xs font-medium">{isExporting ? 'Exporting…' : 'Export'}</span>
          </Button>
          <Button
            size="sm"
            className="rounded-lg gap-1.5 bg-gradient-to-r from-[#4F7DFF] to-[#7C5CFF] hover:from-blue-500 hover:to-indigo-500 text-white text-xs border-0 shadow-[0_0_20px_rgba(79,125,255,0.3)] ml-2"
            disabled={regenerateMut.isPending || isGenerating}
            onClick={() => regenerateMut.mutate()}
          >
            <Sparkles className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating…' : 'Regenerate'}
          </Button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-2 border-[#0A0C12] shadow-sm overflow-hidden" onClick={() => toast.info('Profile coming soon')}>
            <UserCircle className="size-6 text-white/80" />
          </button>
        </div>
      </header>

      {/* ── 4-COLUMN BODY ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT 1: Toolbar */}
        <aside className="w-[72px] flex-shrink-0 flex flex-col items-center py-4 gap-2 border-r border-white/5 bg-[#0A0C11] overflow-y-auto scrollbar-hide z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          {[
            { id: 'slides', icon: Layers, label: 'Slides' },
            { id: 'content', icon: Type, label: 'Content' },
            { id: 'design', icon: Palette, label: 'Design' },
            { id: 'components', icon: LayoutTemplate, label: 'Elements' },
            { id: 'charts', icon: BarChart2, label: 'Charts' },
            { id: 'media', icon: ImageIcon, label: 'Media' },
            { id: 'ai', icon: Sparkles, label: 'AI Assistant', className: 'mt-auto text-[#FF8A2A]' },
          ].map((item) => (
            <button
              key={item.id}
              className={`group flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all duration-200 relative ${activeLeftTab === item.id ? 'bg-[#FF8A2A]/10 text-[#FF8A2A]' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${item.className || ''}`}
              onClick={() => {
                setActiveLeftTab(item.id)
                if (item.id === 'design') setRightTab('theme')
                else if (item.id !== 'slides' && item.id !== 'ai') toast.info(`${item.label} panel coming soon`)
              }}
            >
              {activeLeftTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF8A2A] rounded-r-full shadow-[0_0_10px_rgba(255,138,42,0.8)]" />}
              <item.icon className={`size-5 ${activeLeftTab === item.id ? 'drop-shadow-[0_0_8px_rgba(255,138,42,0.6)]' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* LEFT 2: Slide List */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0A0C11] overflow-hidden z-0">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Slides <span className="text-slate-600 font-normal">({slides.length})</span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            {slides.map((slide, i) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                isActive={i === activeSlideIndex}
                onClick={() => setActiveSlideIndex(i)}
                index={i + 1}
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
            
            <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#FF8A2A]/10 to-[#7C5CFF]/10 hover:from-[#FF8A2A]/20 hover:to-[#7C5CFF]/20 border border-[#FF8A2A]/20 transition-all duration-300 flex items-center justify-center gap-2 text-white text-sm font-medium group shadow-[0_0_15px_rgba(255,138,42,0.1)] hover:shadow-[0_0_25px_rgba(255,138,42,0.2)]" onClick={() => toast.info('Add Slide coming soon')}>
              <Sparkles className="size-4 text-[#FF8A2A] group-hover:scale-110 transition-transform" />
              Add Slide
            </button>
          </div>
        </aside>

        {/* CENTER: Main Preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#050608] relative">
          {activeSlide ? (
            <>
              {/* Preview area */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                
                {/* Floating Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-1 p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg z-20">
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#FF8A2A]/20 transition-colors" onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}><ZoomIn className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#FF8A2A]/20 transition-colors" onClick={toggleFullscreen}><Maximize className="size-4" /></Button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#FF8A2A]/20 transition-colors" onClick={() => toast.success('Slide duplicated!')}><Copy className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#FF8A2A]/20 transition-colors" onClick={() => toast.info('Comment panel coming soon')}><MessageSquare className="size-4" /></Button>
                </div>

                {/* Canvas Guides Background */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                <div id="slide-preview-container" className="w-full max-w-4xl relative z-10 rounded-[24px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-white/5 transition-transform duration-300" style={{ transform: `scale(${zoomLevel})` }}>
                  <SlidePreview slide={activeSlide} isFullscreen={isFullscreen} theme={activeTheme} />
                </div>
                
                {/* Copilot FAB */}
                <button
                  className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8A2A] to-pink-500 shadow-[0_10px_30px_rgba(255,138,42,0.4)] flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-30 group"
                  onClick={() => toast.info('AI Copilot coming soon')}
                >
                  <Bot className="size-6 group-hover:rotate-12 transition-transform duration-300" />
                </button>
              </div>

              {/* Nav controls */}
              <div className="h-14 flex items-center justify-between px-6 border-t border-white/5 bg-[#0A0C11]/80 backdrop-blur-md flex-shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost" size="sm" className="rounded-lg gap-2 text-slate-400 hover:text-[#FF8A2A] hover:bg-[#FF8A2A]/10 transition-colors"
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-xs font-medium text-slate-300 min-w-[80px] text-center tracking-wide">
                    Slide {activeSlideIndex + 1} of {slides.length}
                  </span>
                  <Button
                    variant="ghost" size="sm" className="rounded-lg gap-2 text-slate-400 hover:text-[#FF8A2A] hover:bg-[#FF8A2A]/10 transition-colors"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                  {['50%', '75%', '100%', '125%', 'Fit Screen'].map((zoom, idx) => {
                    const value = zoom === 'Fit Screen' ? 1 : parseInt(zoom) / 100
                    const isActive = zoomLevel === value
                    return (
                      <button key={idx} className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-colors ${isActive ? 'bg-[#FF8A2A] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} onClick={() => setZoomLevel(value)}>
                        {zoom}
                      </button>
                    )
                  })}
                </div>
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
        <aside className="w-[360px] flex-shrink-0 flex flex-col border-l border-white/5 bg-[#0A0C11] overflow-hidden z-10 relative shadow-[-4px_0_24px_rgba(0,0,0,0.2)]">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 p-2 bg-[#050608]/50">
            {([
              { id: 'theme', icon: Palette, label: 'Design' },
              { id: 'settings', icon: Settings2, label: 'Settings' },
              { id: 'notes', icon: StickyNote, label: 'Notes' },
            ] as { id: RightPanelTab; icon: typeof Palette; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${rightTab === id ? 'bg-[#10131B] text-[#FF8A2A] shadow-sm border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <Icon className={`size-3.5 ${rightTab === id ? 'drop-shadow-[0_0_8px_rgba(255,138,42,0.5)]' : ''}`} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* THEME TAB */}
            {rightTab === 'theme' && (
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-4">Color Themes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setActiveTheme(th.id)}
                        className={`flex flex-col items-start gap-2.5 rounded-xl p-3 text-left transition-all duration-300 border ${activeTheme === th.id ? 'border-[#FF8A2A] bg-[#FF8A2A]/5 shadow-[0_0_15px_rgba(255,138,42,0.1)]' : 'border-white/5 bg-[#10131B]/50 hover:bg-[#10131B] hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,138,42,0.05)]'}`}
                      >
                        {/* Preview swatch */}
                        <div className="w-full h-12 rounded-lg overflow-hidden flex shadow-inner">
                          <div className="flex-1" style={{ background: th.bg }} />
                          <div className="w-6" style={{ background: th.color }} />
                        </div>
                        <span className={`text-[11px] font-semibold tracking-wide ${activeTheme === th.id ? 'text-[#FF8A2A]' : 'text-slate-300'}`}>{th.label}</span>
                      </button>
                    ))}
                  </div>
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

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
import { AddSlideDialog } from '#/features/presentations/components/add-slide-dialog'
import { ShareDialog } from '#/features/presentations/components/share-dialog'
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
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { authClient } from '#/lib/auth-client'
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
  Bot,
  User,
  LogOut,
  Loader2
} from 'lucide-react'
import { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'
import { Logo } from '#/components/Logo'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

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
  { id: 'obsidian-neon', label: 'Obsidian Neon', color: '#06B6D4', secondaryColor: '#8B5CF6', bg: '#07090E', tag: 'Cyber Pro' },
  { id: 'silicon-slate', label: 'Silicon Slate', color: '#3B82F6', secondaryColor: '#F59E0B', bg: '#0B1120', tag: 'Enterprise' },
  { id: 'nordic-minimal', label: 'Nordic Minimal', color: '#10B981', secondaryColor: '#0F172A', bg: '#F8FAFC', tag: 'Editorial' },
  { id: 'tokyo-sunset', label: 'Tokyo Sunset', color: '#F43F5E', secondaryColor: '#F59E0B', bg: '#030305', tag: 'Creative' },
  { id: 'emerald-matrix', label: 'Emerald Matrix', color: '#10B981', secondaryColor: '#6EE7B7', bg: '#03120E', tag: 'Deep Tech' },
  { id: 'aurora-indigo', label: 'Aurora Indigo', color: '#6366F1', secondaryColor: '#EC4899', bg: '#0A0818', tag: 'AI Studio' },
]

type RightPanelTab = 'settings' | 'theme' | 'notes'

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()
  
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [rightTab, setRightTab] = useState<RightPanelTab>('theme')
  const [activeTheme, setActiveTheme] = useState('obsidian-neon')
  const [activeLeftTab, setActiveLeftTab] = useState('slides')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showAddSlideModal, setShowAddSlideModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  // Content editing state (synced to active slide)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDirty, setEditDirty] = useState(false)
  // Canvas inline editing
  const [canvasEditing, setCanvasEditing] = useState(false)
  const [canvasTitle, setCanvasTitle] = useState('')
  const [canvasContent, setCanvasContent] = useState('')
  const [canvasImagePrompt, setCanvasImagePrompt] = useState('')
  const [canvasImageStyle, setCanvasImageStyle] = useState('cover')
  // Chart builder state
  const [chartType, setChartType] = useState<'bar'|'pie'|'line'>('bar')
  const [chartRows, setChartRows] = useState([{label:'Q1',value:'40'},{label:'Q2',value:'65'},{label:'Q3',value:'50'},{label:'Q4',value:'80'}])

  // Media state
  const [uploadedImages, setUploadedImages] = useState<{name: string, url: string}[]>([])

  // Chat local state
  const [chatInput, setChatInput] = useState('')

  const {
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
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  // Keyboard Shortcuts for Pro Canvas Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (canvasEditing) return

      if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault()
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault()
        setActiveSlideIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowSlideshow(true)
      } else if (e.key === 'Escape') {
        setCanvasEditing(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length, canvasEditing])

  const presentationContext = useMemo(() => {
    return slides.map((s, i) => `Slide ${i + 1}:\nTitle: ${s.title}\nContent: ${s.content}`).join('\n\n')
  }, [slides])

  const { messages = [], sendMessage, status: chatStatus, error: chatError } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { context: presentationContext }
    })
  } as any) as any

  useEffect(() => {
    if (chatError) console.error("Chat UI Error:", chatError);
    console.log("Chat messages updated:", messages);
    console.log("Chat status:", chatStatus);
  }, [chatError, messages, chatStatus])

  const isChatLoading = chatStatus === 'submitted'

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return
    if (sendMessage) {
      console.log("Sending message:", chatInput.trim());
      sendMessage({ role: 'user', content: chatInput.trim() })
      setChatInput('')
    }
  }

  // Reset edit state when slide changes
  const prevSlideId = slides[activeSlideIndex]?.id
  const [lastSyncedSlideId, setLastSyncedSlideId] = useState('')
  if (prevSlideId && prevSlideId !== lastSyncedSlideId) {
    setLastSyncedSlideId(prevSlideId)
    setEditDirty(false)
    setCanvasEditing(false)
  }

  const { isFullscreen, toggleFullscreen } = useFullscreen('slide-preview-container')

  const handleExportPptx = useCallback(async () => {
    const data = query.data
    if (!data || slides.length === 0) return
    setIsExporting(true)
    try {
      const filename = await exportToPptx({ title: data.title, slides, theme: activeTheme })
      toast.success(`Exported as ${filename}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [query.data, slides, activeTheme])

  const handleShare = useCallback(() => {
    setShowShareModal(true)
  }, [])

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
      {/* ── TOP BAR (GLASS PILL) ─────────────────────────────────────────────────── */}
      <div className="w-full flex justify-center pt-4 pb-2 px-4 flex-shrink-0 relative z-50">
        <header className="w-full max-w-6xl glass rounded-2xl px-5 py-2.5 flex items-center justify-between bg-[#0A0C12]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Link to="/" className="flex items-center justify-center size-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 text-slate-300 hover:text-white" title="Back to Home">
              <ChevronLeft className="size-4" />
            </Link>
            
            <div className="hidden sm:flex items-center gap-2 group flex-shrink-0">
              <Logo className="w-6 h-6 text-white group-hover:scale-105 transition-transform" />
              <span className="text-lg font-bold text-white tracking-tight">
                PPT<span className="text-[#FF8A2A]">.ai</span>
              </span>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-white/10 flex-shrink-0" />
            
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-white truncate" title={data.title}>
                {data.title.replace(/^#?\s*AI Prompt:\s*/i, '')}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <CheckCircle2 className="size-3 text-emerald-500 flex-shrink-0" />
                <span className="truncate">Saved · {updatedLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={() => setShowSlideshow(true)}>
              <Play className="size-4" />
              <span className="hidden sm:inline text-xs font-medium">Present</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={handleExportPptx} disabled={isExporting}>
              <Download className="size-4" />
              <span className="hidden sm:inline text-xs font-medium">{isExporting ? 'Exporting…' : 'Export'}</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-slate-300 hover:text-white" onClick={handleShare}>
              <Share2 className="size-4" />
              <span className="hidden sm:inline text-xs font-medium">Share</span>
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
            {isSessionPending ? (
              <div className="size-8 rounded-full bg-white/10 animate-pulse" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-8 rounded-full hover:bg-transparent">
                    <Avatar className="size-8 border-2 border-white/10 shadow-sm hover:scale-105 transition-transform">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                      <AvatarFallback className="bg-[#FF8A2A]/20 text-[#FF8A2A] text-xs font-medium">
                        {session.user.name ? session.user.name.slice(0, 2).toUpperCase() : <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/10 bg-[#0A0C12]/95 backdrop-blur-xl text-slate-200">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none text-white">{session.user.name}</p>
                      <p className="text-xs leading-none text-slate-400 mt-1 truncate">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer">
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-0">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
          
        </header>
      </div>

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
              }}
            >
              {activeLeftTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF8A2A] rounded-r-full shadow-[0_0_10px_rgba(255,138,42,0.8)]" />}
              <item.icon className={`size-5 ${activeLeftTab === item.id ? 'drop-shadow-[0_0_8px_rgba(255,138,42,0.6)]' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* LEFT 2: Dynamic Panel */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0A0C11] overflow-hidden z-0">
          
          {activeLeftTab === 'slides' && (
            <>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Slides <span className="text-slate-600 font-normal">({slides.length})</span>
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
                {slides.map((slide, i) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive={i === activeSlideIndex}
                    onClick={() => setActiveSlideIndex(i)}
                    onDuplicate={() => duplicateSlideMut.mutate(slide.id)}
                    onDelete={() => {
                      if (slides.length <= 1) {
                        toast.error('A presentation must have at least one slide.')
                        return
                      }
                      deleteSlideMut.mutate(slide.id, {
                        onSuccess: () => {
                          if (activeSlideIndex >= slides.length - 1) {
                            setActiveSlideIndex(Math.max(0, slides.length - 2))
                          }
                        }
                      })
                    }}
                    onMoveUp={() => reorderSlideMut.mutate({ slideId: slide.id, direction: 'up' })}
                    onMoveDown={() => reorderSlideMut.mutate({ slideId: slide.id, direction: 'down' })}
                    isFirst={i === 0}
                    isLast={i === slides.length - 1}
                    index={i + 1}
                  />
                ))}
                {slides.length === 0 && !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                    <p className="text-xs text-slate-500 font-mono">No slides yet</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <RefreshCw className="size-5 animate-spin text-cyan-400" />
                    <p className="text-xs text-slate-400 font-mono">Generating slides…</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowAddSlideModal(true)}
                  className="w-full mt-4 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold font-display group shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                >
                  <Sparkles className="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  Add Slide Archetype
                </button>
              </div>
            </>
          )}

          {activeLeftTab === 'content' && activeSlide && (() => {
            // Sync edit state when slide changes
            const title = editDirty ? editTitle : activeSlide.title
            const content = editDirty ? editContent : activeSlide.content
            return (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
                  <div className="flex items-center">
                    <Type className="size-4 text-blue-400 mr-2" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Edit Content</span>
                  </div>
                  {editDirty && <span className="text-[9px] text-[#FF8A2A] font-medium">● Unsaved</span>}
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Slide Title</Label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => { setEditTitle(e.target.value); setEditDirty(true) }}
                      onFocus={() => { if (!editDirty) { setEditTitle(activeSlide.title); setEditContent(activeSlide.content) }}}
                      className="w-full bg-[#10131B] border border-blue-500/40 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Bullets (one per line)</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => { setEditContent(e.target.value); setEditDirty(true) }}
                      onFocus={() => { if (!editDirty) { setEditTitle(activeSlide.title); setEditContent(activeSlide.content) }}}
                      className="w-full h-44 bg-[#10131B] border border-blue-500/40 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none transition-colors"
                      placeholder="Enter bullet points..."
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-white/5 space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs border-0"
                    disabled={!editDirty || updateSlideMut.isPending}
                    onClick={() => {
                      if (!activeSlide) return
                      updateSlideMut.mutate(
                        { id: activeSlide.id, title: editTitle, content: editContent },
                        { onSuccess: () => { setEditDirty(false); toast.success('Slide saved!') } }
                      )
                    }}
                  >
                    {updateSlideMut.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                  {editDirty && (
                    <button className="w-full text-[11px] text-slate-500 hover:text-slate-300 transition-colors" onClick={() => setEditDirty(false)}>
                      Discard changes
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {activeLeftTab === 'ai' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
                <div className="flex items-center">
                  <Sparkles className="size-4 text-cyan-400 mr-2" />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-display">AI Copilot</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Active</span>
              </div>

              {/* Quick Prompt Action Chips */}
              <div className="px-3 py-2 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide">
                {[
                  { label: '⚡ Punchy', prompt: `Make slide ${activeSlideIndex + 1} ("${activeSlide?.title}") punchy, bold, and executive-level.` },
                  { label: '📊 KPIs', prompt: `Extract metrics and convert slide ${activeSlideIndex + 1} into 3 impactful KPI numbers.` },
                  { label: '🔄 3-Steps', prompt: `Structure slide ${activeSlideIndex + 1} into a 3-stage process flow.` },
                  { label: '🎨 Image', prompt: `Generate a bespoke visual prompt for slide ${activeSlideIndex + 1} ("${activeSlide?.title}").` },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sendMessage({ text: chip.prompt })
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-white/10 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3.5 flex flex-col scrollbar-thin scrollbar-thumb-white/10">
                <div className="bg-[#0F131C] border border-cyan-500/20 rounded-2xl p-3 text-xs text-slate-300 leading-relaxed shadow-lg">
                  <p className="font-bold text-cyan-400 font-display flex items-center gap-1.5 mb-1">
                    <Sparkles className="size-3.5" /> AI Presentation Copilot
                  </p>
                  <p className="text-[11px] text-slate-400">
                    I can rewrite slide content, extract data KPIs, format diagram flows, and suggest imagery tailored to your theme.
                  </p>
                </div>
                
                {messages.map((m: any) => {
                  const rawContent = m.content || m.parts?.map((p: any) => p.text).join('') || ''
                  const proposalMatch = rawContent.match(/```slide-proposal\s*([\s\S]*?)```/)
                  let proposedTitle = ''
                  let proposedContent = ''

                  if (proposalMatch && proposalMatch[1]) {
                    const block = proposalMatch[1]
                    const titleMatch = block.match(/Title:\s*(.*)/i)
                    const contentMatch = block.match(/Content:\s*([\s\S]*)/i)
                    if (titleMatch) proposedTitle = titleMatch[1].trim()
                    if (contentMatch) proposedContent = contentMatch[1].trim()
                  }

                  const cleanText = rawContent.replace(/```slide-proposal[\s\S]*?```/g, '').trim()

                  return (
                    <div key={m.id} className={`flex flex-col max-w-[95%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
                      <div className={`text-[9px] font-mono text-slate-500 mb-1 px-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.role === 'user' ? 'You' : 'PPT.ai Copilot'}
                      </div>
                      
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-cyan-500 text-black font-semibold rounded-br-sm shadow-md' : 'bg-[#0F131C] border border-white/10 text-slate-200 rounded-bl-sm shadow-md'}`}>
                        {cleanText && <p className="whitespace-pre-wrap">{cleanText}</p>}

                        {/* Interactive Slide Proposal Card */}
                        {proposedTitle && (
                          <div className="mt-3 p-3 rounded-xl bg-black/50 border border-cyan-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                                Proposed Slide Update
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white font-display">
                              {proposedTitle}
                            </h4>
                            {proposedContent && (
                              <p className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans">
                                {proposedContent}
                              </p>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              disabled={updateSlideMut.isPending || !activeSlide}
                              onClick={() => {
                                if (!activeSlide) return
                                updateSlideMut.mutate({
                                  id: activeSlide.id,
                                  title: proposedTitle,
                                  content: proposedContent,
                                }, {
                                  onSuccess: () => toast.success('Slide updated from AI proposal!')
                                })
                              }}
                              className="w-full h-7 mt-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] gap-1 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                            >
                              <Sparkles className="size-3" />
                              Apply to Current Slide
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {isChatLoading && (
                  <div className="flex gap-2 items-center self-start bg-[#0F131C] border border-white/10 p-3 rounded-2xl rounded-bl-sm text-xs text-slate-400">
                    <Loader2 className="size-3.5 animate-spin text-cyan-400" /> Copilot is drafting...
                  </div>
                )}
              </div>

              <form className="p-3 border-t border-white/5 bg-[#0A0C11]" onSubmit={handleChatSubmit}>
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Copilot (e.g. 'Make slide 1 punchier')..." 
                    className="w-full bg-[#10131B] border border-white/10 focus:border-cyan-400 rounded-xl px-3 pr-10 py-2.5 text-xs text-white focus:outline-none transition-colors" 
                  />
                  <Button type="submit" disabled={isChatLoading || !chatInput.trim()} size="icon" className="absolute right-1 top-1 size-7 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-black disabled:opacity-50 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <Wand2 className="size-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeLeftTab === 'design' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-4 border-b border-white/5">
                <Palette className="size-4 text-cyan-400 mr-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-display">Slide Archetype</span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Active Slide Layout</Label>
                    <span className="text-[9px] text-cyan-400 font-mono">1-Click Convert</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: 'hero',
                        label: 'Executive Hero',
                        emoji: '🎯',
                        tag: 'Cover',
                        apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'hero', diagramType: null }),
                        isActive: activeSlide?.layoutType === 'hero',
                      },
                      {
                        value: 'split-right',
                        label: 'Split Right',
                        emoji: '⬛▪',
                        tag: 'Visual',
                        apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'split-right', diagramType: null }),
                        isActive: activeSlide?.layoutType === 'split-right' || (!activeSlide?.layoutType && !activeSlide?.diagramType),
                      },
                      {
                        value: 'split-left',
                        label: 'Split Left',
                        emoji: '▪⬛',
                        tag: 'Visual',
                        apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'split-left', diagramType: null }),
                        isActive: activeSlide?.layoutType === 'split-left',
                      },
                      {
                        value: 'stat-card',
                        label: 'KPI Stat Cards',
                        emoji: '📊',
                        tag: 'Data',
                        apply: () =>
                          updateSlideMut.mutate({
                            id: activeSlide.id,
                            layoutType: 'stat-card',
                            diagramType: 'stats',
                            diagramData:
                              activeSlide.diagramData ||
                              JSON.stringify({
                                stats: [
                                  { value: '10x', label: 'Speed Multiplier' },
                                  { value: '99.9%', label: 'System SLA' },
                                  { value: '$4.2M', label: 'ARR Milestone' },
                                ],
                              }),
                          }),
                        isActive: activeSlide?.layoutType === 'stat-card' || activeSlide?.diagramType === 'stats',
                      },
                      {
                        value: 'flow',
                        label: 'Process Flow',
                        emoji: '🔄',
                        tag: 'Process',
                        apply: () =>
                          updateSlideMut.mutate({
                            id: activeSlide.id,
                            layoutType: 'diagram',
                            diagramType: 'flow',
                            diagramData:
                              activeSlide.diagramData ||
                              JSON.stringify({
                                steps: [
                                  '1. Strategic Discovery',
                                  '2. Autonomous Execution',
                                  '3. Global Rollout',
                                ],
                              }),
                          }),
                        isActive: activeSlide?.diagramType === 'flow',
                      },
                      {
                        value: 'comparison',
                        label: 'Comparison',
                        emoji: '⚖️',
                        tag: 'Analysis',
                        apply: () =>
                          updateSlideMut.mutate({
                            id: activeSlide.id,
                            layoutType: 'diagram',
                            diagramType: 'comparison',
                            diagramData:
                              activeSlide.diagramData ||
                              JSON.stringify({
                                left: { label: 'Legacy Manual', points: ['High latency', 'Manual formatting'] },
                                right: { label: 'PPT.ai Engine', points: ['Instant AI output', 'Deterministic vector'] },
                              }),
                          }),
                        isActive: activeSlide?.diagramType === 'comparison',
                      },
                      {
                        value: 'bento',
                        label: 'Bento Matrix',
                        emoji: '🍱',
                        tag: 'Grid',
                        apply: () =>
                          updateSlideMut.mutate({
                            id: activeSlide.id,
                            layoutType: 'bento',
                            diagramType: 'bento',
                            diagramData:
                              activeSlide.diagramData ||
                              JSON.stringify({
                                items: [
                                  { title: 'Deterministic Engine', desc: 'Zero visual overlap architecture.', tag: 'Core' },
                                  { title: '4K Vector Clarity', desc: 'Native shapes with infinite zoom.', tag: 'Vector' },
                                  { title: 'Sub-10s Generation', desc: 'Asynchronous streaming pipelines.', tag: 'Speed' },
                                ],
                              }),
                          }),
                        isActive: activeSlide?.layoutType === 'bento' || activeSlide?.diagramType === 'bento',
                      },
                      {
                        value: 'text-only',
                        label: 'Quote / Callout',
                        emoji: '📝',
                        tag: 'Quote',
                        apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'text-only', diagramType: null }),
                        isActive: activeSlide?.layoutType === 'text-only',
                      },
                    ].map((layout) => (
                      <button
                        key={layout.value}
                        type="button"
                        onClick={() => {
                          if (!activeSlide) return
                          layout.apply()
                          toast.success(`Layout changed to ${layout.label}`)
                        }}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative ${
                          layout.isActive
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50 text-white'
                            : 'border-white/5 bg-[#10131B] hover:bg-[#151924] hover:border-white/15 text-slate-300'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between mb-1.5">
                          <span className="text-lg">{layout.emoji}</span>
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                            {layout.tag}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold font-display line-clamp-1">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeLeftTab === 'components' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-4 border-b border-white/5">
                <LayoutTemplate className="size-4 text-emerald-400 mr-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Elements</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Text Boxes</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[{label:'Heading', style:'text-xl font-bold'}, {label:'Sub-heading', style:'text-base font-semibold'}, {label:'Body Text', style:'text-sm font-normal'}].map((t) => (
                      <button key={t.label} className="w-full text-left px-3 py-2 rounded-lg border border-white/5 bg-[#10131B] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all" onClick={() => toast.success(`Added ${t.label}`)}
                      >
                        <span className={t.style}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Shapes</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {name:'Rect', svg: <rect x="2" y="2" width="20" height="20" rx="1" fill="currentColor"/>},
                      {name:'Circle', svg: <circle cx="12" cy="12" r="10" fill="currentColor"/>},
                      {name:'Triangle', svg: <polygon points="12,2 22,22 2,22" fill="currentColor"/>},
                      {name:'Arrow', svg: <polygon points="2,10 16,10 16,6 22,12 16,18 16,14 2,14" fill="currentColor"/>},
                      {name:'Star', svg: <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" fill="currentColor"/>},
                      {name:'Diamond', svg: <polygon points="12,2 22,12 12,22 2,12" fill="currentColor"/>},
                      {name:'Line', svg: <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="3"/>},
                      {name:'Plus', svg: <><line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="3"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="3"/></>},
                    ].map((s) => (
                      <button key={s.name} title={s.name} className="aspect-square rounded-lg border border-white/5 bg-[#10131B] hover:bg-emerald-500/10 hover:border-emerald-500/30 flex flex-col items-center justify-center gap-1 text-emerald-400 hover:text-emerald-300 transition-all p-2" onClick={() => toast.success(`Added ${s.name}`)}>
                        <svg viewBox="0 0 24 24" className="w-5 h-5">{s.svg}</svg>
                        <span className="text-[8px] text-slate-400">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeLeftTab === 'charts' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-4 border-b border-white/5">
                <BarChart2 className="size-4 text-purple-400 mr-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chart Builder</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Chart Type</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['bar','pie','line'] as const).map((t) => (
                      <button key={t} className={`py-2 rounded-lg text-xs font-medium transition-all ${chartType === t ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-[#10131B] border border-white/5 text-slate-400 hover:text-white'}`} onClick={() => setChartType(t)}>
                        {t === 'bar' ? '📊 Bar' : t === 'pie' ? '🥧 Pie' : '📈 Line'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-400">Data Rows</Label>
                    <button className="text-[10px] text-purple-400 hover:text-purple-300" onClick={() => setChartRows(r => [...r, {label:'New', value:'0'}])}>+ Add Row</button>
                  </div>
                  <div className="space-y-1.5">
                    {chartRows.map((row, i) => (
                      <div key={i} className="flex gap-1.5">
                        <input
                          value={row.label}
                          onChange={(e) => setChartRows(r => r.map((x, j) => j===i ? {...x, label: e.target.value} : x))}
                          className="flex-1 bg-[#10131B] border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                          placeholder="Label"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => setChartRows(r => r.map((x, j) => j===i ? {...x, value: e.target.value} : x))}
                          className="w-16 bg-[#10131B] border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                          placeholder="Val"
                          type="number"
                        />
                        {chartRows.length > 2 && (
                          <button className="text-red-400 hover:text-red-300 px-1" onClick={() => setChartRows(r => r.filter((_, j) => j !== i))}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mini Preview */}
                <div className="bg-[#10131B] border border-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-slate-500 mb-2">Preview</div>
                  {chartType === 'bar' && (
                    <div className="flex items-end gap-1.5 h-16">
                      {chartRows.map((row, i) => {
                        const maxVal = Math.max(...chartRows.map(r => parseFloat(r.value) || 0), 1)
                        const h = ((parseFloat(row.value) || 0) / maxVal) * 100
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-sm bg-purple-500" style={{height: `${h}%`, minHeight: '4px'}} />
                            <span className="text-[7px] text-slate-500 truncate w-full text-center">{row.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {chartType === 'pie' && (
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                      <div className="space-y-1">{chartRows.map((r,i) => <div key={i} className="flex items-center gap-1"><div className="size-2 rounded-full bg-purple-400" /><span className="text-[9px] text-slate-400">{r.label}: {r.value}</span></div>)}</div>
                    </div>
                  )}
                  {chartType === 'line' && (
                    <svg viewBox="0 0 100 50" className="w-full h-12">
                      <polyline fill="none" stroke="#A855F7" strokeWidth="2"
                        points={chartRows.map((r, i) => {
                          const maxVal = Math.max(...chartRows.map(x => parseFloat(x.value) || 0), 1)
                          const x = (i / (chartRows.length - 1)) * 90 + 5
                          const y = 45 - ((parseFloat(r.value) || 0) / maxVal) * 40
                          return `${x},${y}`
                        }).join(' ')}
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-white/5">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  onClick={() => toast.success(`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart inserted into slide!`)}
                >
                  Insert Chart
                </Button>
              </div>
            </div>
          )}

          {activeLeftTab === 'media' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-4 border-b border-white/5">
                <ImageIcon className="size-4 text-cyan-400 mr-2" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Media</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Hidden real file input */}
                <input
                  id="media-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setUploadedImages(prev => [{ name: file.name, url: reader.result as string }, ...prev])
                      toast.success(`Image "${file.name}" uploaded to gallery`)
                    }
                    reader.readAsDataURL(file)
                    // Reset so same file can be re-selected
                    e.target.value = ''
                  }}
                />
                <button
                  className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-cyan-400 hover:text-cyan-300"
                  onClick={() => document.getElementById('media-file-input')?.click()}
                >
                  <ImageIcon className="size-8" />
                  <div className="text-center">
                    <p className="text-xs font-semibold">Click to Upload</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </button>

                {uploadedImages.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs text-slate-400">Your Images</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((img, i) => (
                        <button
                          key={i}
                          className="relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all group"
                          onClick={() => {
                            if (!activeSlide) return
                            updateSlideMut.mutate(
                              { id: activeSlide.id, imageUrl: img.url },
                              { onSuccess: () => toast.success('Image applied to slide!') }
                            )
                          }}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[9px] text-white font-semibold bg-white/20 px-2 py-0.5 rounded-full">Apply</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-xs text-slate-400">Unsplash Stock Photos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', tag: 'Tech' },
                      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', tag: 'Business' },
                      { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998', tag: 'Team' },
                      { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tag: 'Data' },
                    ].map((img, i) => (
                      <button
                        key={i}
                        className="relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-cyan-500/50 transition-all group"
                        onClick={() => {
                          if (!activeSlide) return
                          const highResUrl = `${img.url}?w=1280&h=720&fit=crop`
                          updateSlideMut.mutate(
                            { id: activeSlide.id, imageUrl: highResUrl },
                            { onSuccess: () => toast.success(`Stock photo applied to slide!`) }
                          )
                        }}
                      >
                        <img src={`${img.url}?w=200&h=150&fit=crop`} alt={img.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[9px] text-white font-semibold bg-white/20 px-2 py-0.5 rounded-full">Apply</span>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[8px] text-white/60 font-medium">{img.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
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

                <div
                  id="slide-preview-container"
                  className="w-full max-w-4xl relative z-10 rounded-[24px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)] border transition-transform duration-300 group/canvas cursor-text"
                  style={{ transform: `scale(${zoomLevel})`, borderColor: canvasEditing ? 'rgba(255,138,42,0.5)' : 'rgba(255,255,255,0.05)' }}
                  title="Click to edit slide inline"
                >
                  <SlidePreview slide={canvasEditing ? { ...activeSlide, title: canvasTitle, content: canvasContent } : activeSlide} isFullscreen={isFullscreen} theme={activeTheme} />

                  {/* Inline edit overlay */}
                  {!canvasEditing && (
                    <div
                      className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                      onClick={() => {
                        setCanvasTitle(activeSlide.title)
                        setCanvasContent(activeSlide.content)
                        setCanvasImagePrompt(activeSlide.imagePrompt || '')
                        setCanvasImageStyle(activeSlide.imageStyle || 'cover')
                        setCanvasEditing(true)
                      }}
                    >
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 text-white text-xs font-medium border border-white/20">
                        <Type className="size-3.5" />
                        Click to edit slide
                      </div>
                    </div>
                  )}
                </div>

                {/* Editor Overlay (Moved outside scaled container for proper 100% zoom behavior) */}
                {canvasEditing && (
                  <div className="absolute inset-8 z-50 flex flex-col bg-[#07090E]/98 backdrop-blur-2xl rounded-[24px] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                      <span className="text-sm font-bold font-display text-cyan-400 flex items-center gap-2">
                        <Type className="size-4" /> Editing Slide Content
                      </span>
                      <div className="flex gap-3">
                        <button
                          className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                          onClick={() => setCanvasEditing(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="text-xs px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-display transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          onClick={() => {
                            if (!activeSlide) return
                            updateSlideMut.mutate(
                              { id: activeSlide.id, title: canvasTitle, content: canvasContent, imagePrompt: canvasImagePrompt, imageStyle: canvasImageStyle },
                              { onSuccess: () => { setCanvasEditing(false); toast.success('Slide updated!') } }
                            )
                          }}
                        >
                          {updateSlideMut.isPending ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-6 p-6 overflow-auto">
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold font-mono block mb-2">Slide Title</label>
                        <input
                          autoFocus
                          value={canvasTitle}
                          onChange={(e) => setCanvasTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-4 py-3 text-xl font-bold font-display text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-h-[200px]">
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold font-mono block mb-2">Content (one bullet per line)</label>
                        <textarea
                          value={canvasContent}
                          onChange={(e) => setCanvasContent(e.target.value)}
                          className="w-full h-full bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none resize-none transition-colors leading-relaxed font-sans"
                        />
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block">Image Settings</label>
                          
                          {activeSlide.imageUrl && (
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                                <button className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${canvasImageStyle === 'cover' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setCanvasImageStyle('cover')}>Fill</button>
                                <button className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${canvasImageStyle === 'contain' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setCanvasImageStyle('contain')}>Fit (Contain)</button>
                                <button className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${canvasImageStyle === 'cover-top' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setCanvasImageStyle('cover-top')}>Show Top</button>
                                <button className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${canvasImageStyle === 'cover-bottom' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`} onClick={() => setCanvasImageStyle('cover-bottom')}>Show Bottom</button>
                              </div>

                              <button
                                className="text-[11px] text-red-400 hover:text-red-300 transition-colors font-semibold bg-red-400/10 px-3 py-1.5 rounded-lg"
                                onClick={() => {
                                  if (!activeSlide) return
                                  updateSlideMut.mutate(
                                    { id: activeSlide.id, imageUrl: null },
                                    { onSuccess: () => toast.success('Image removed from slide') }
                                  )
                                }}
                              >
                                Remove Image
                              </button>
                            </div>
                          )}
                        </div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">AI Image Prompt (for regenerating)</label>
                        <div className="flex items-center gap-2">
                          <textarea
                            value={canvasImagePrompt}
                            onChange={(e) => setCanvasImagePrompt(e.target.value)}
                            placeholder="Describe the image you want for this slide..."
                            className="flex-1 h-16 bg-black/20 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none resize-none transition-colors"
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={generateSlideImageMut.isPending || !canvasImagePrompt.trim() || !activeSlide}
                            onClick={() => {
                              if (!activeSlide || !canvasImagePrompt.trim()) return
                              generateSlideImageMut.mutate({
                                slideId: activeSlide.id,
                                prompt: canvasImagePrompt,
                                style: canvasImageStyle,
                              })
                            }}
                            className="h-16 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
                          >
                            {generateSlideImageMut.isPending ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4" />
                                <span>Generate AI Visual</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                

              </div>

              {/* Pro Studio Dock bar */}
              <div className="h-14 flex items-center justify-between px-6 border-t border-white/5 bg-[#0A0C11]/90 backdrop-blur-xl flex-shrink-0 relative z-20">
                {/* Slide Nav */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg gap-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                    title="Previous Slide (Left Arrow or K)"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">K</span>
                  </Button>
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-semibold text-slate-200 min-w-[100px] text-center tracking-tight">
                    {activeSlideIndex + 1} / {slides.length}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg gap-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                    title="Next Slide (Right Arrow or J)"
                  >
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">J</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                {/* Quick Actions Center */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddSlideModal(true)}
                    className="h-8 rounded-lg gap-1.5 border-white/10 bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 text-xs font-display"
                  >
                    <Sparkles className="size-3.5 text-cyan-400" />
                    Add Slide
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowSlideshow(true)}
                    className="h-8 rounded-lg gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                  >
                    <Play className="size-3.5 fill-black" />
                    Present <span className="text-[10px] font-mono opacity-60">F</span>
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                  {['50%', '75%', '100%', '125%', 'Fit'].map((zoom, idx) => {
                    const value = zoom === 'Fit' ? 1 : parseInt(zoom) / 100
                    const isActive = zoomLevel === value
                    return (
                      <button
                        key={idx}
                        className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-cyan-500 text-black font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setZoomLevel(value)}
                      >
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold font-mono">Taste Themes</h3>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">6 Curated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setActiveTheme(th.id)}
                        className={`group relative flex flex-col items-start gap-2 rounded-xl p-2.5 text-left transition-all duration-300 border ${
                          activeTheme === th.id
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                            : 'border-white/5 bg-[#0F131C] hover:bg-[#141A26] hover:border-white/15'
                        }`}
                      >
                        {/* Preview swatch */}
                        <div className="w-full h-10 rounded-lg overflow-hidden flex shadow-inner border border-white/10 relative">
                          <div className="flex-1" style={{ background: th.bg }} />
                          <div className="w-3.5" style={{ background: th.color }} />
                          <div className="w-3.5" style={{ background: th.secondaryColor }} />
                        </div>
                        <div className="w-full flex items-center justify-between">
                          <span className={`text-[11px] font-semibold tracking-tight font-display ${activeTheme === th.id ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {th.label}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">{th.tag}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SLIDE ARCHETYPES */}
                {activeSlide && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold font-mono">
                        Slide Layout Archetype
                      </h3>
                      <span className="text-[9px] text-cyan-400 font-mono">Slide {activeSlideIndex + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          value: 'hero',
                          label: 'Executive Hero',
                          emoji: '🎯',
                          tag: 'Cover',
                          apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'hero', diagramType: null }),
                          isActive: activeSlide?.layoutType === 'hero',
                        },
                        {
                          value: 'split-right',
                          label: 'Split Right',
                          emoji: '⬛▪',
                          tag: 'Visual',
                          apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'split-right', diagramType: null }),
                          isActive: activeSlide?.layoutType === 'split-right' || (!activeSlide?.layoutType && !activeSlide?.diagramType),
                        },
                        {
                          value: 'split-left',
                          label: 'Split Left',
                          emoji: '▪⬛',
                          tag: 'Visual',
                          apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'split-left', diagramType: null }),
                          isActive: activeSlide?.layoutType === 'split-left',
                        },
                        {
                          value: 'stat-card',
                          label: 'KPI Stat Cards',
                          emoji: '📊',
                          tag: 'Data',
                          apply: () =>
                            updateSlideMut.mutate({
                              id: activeSlide.id,
                              layoutType: 'stat-card',
                              diagramType: 'stats',
                              diagramData:
                                activeSlide.diagramData ||
                                JSON.stringify({
                                  stats: [
                                    { value: '10x', label: 'Speed Multiplier' },
                                    { value: '99.9%', label: 'System SLA' },
                                    { value: '$4.2M', label: 'ARR Milestone' },
                                  ],
                                }),
                            }),
                          isActive: activeSlide?.layoutType === 'stat-card' || activeSlide?.diagramType === 'stats',
                        },
                        {
                          value: 'flow',
                          label: 'Process Flow',
                          emoji: '🔄',
                          tag: 'Process',
                          apply: () =>
                            updateSlideMut.mutate({
                              id: activeSlide.id,
                              layoutType: 'diagram',
                              diagramType: 'flow',
                              diagramData:
                                activeSlide.diagramData ||
                                JSON.stringify({
                                  steps: [
                                    '1. Strategic Discovery',
                                    '2. Autonomous Execution',
                                    '3. Global Rollout',
                                  ],
                                }),
                            }),
                          isActive: activeSlide?.diagramType === 'flow',
                        },
                        {
                          value: 'comparison',
                          label: 'Comparison',
                          emoji: '⚖️',
                          tag: 'Analysis',
                          apply: () =>
                            updateSlideMut.mutate({
                              id: activeSlide.id,
                              layoutType: 'diagram',
                              diagramType: 'comparison',
                              diagramData:
                                activeSlide.diagramData ||
                                JSON.stringify({
                                  left: { label: 'Legacy Manual', points: ['High latency', 'Manual formatting'] },
                                  right: { label: 'PPT.ai Engine', points: ['Instant AI output', 'Deterministic vector'] },
                                }),
                            }),
                          isActive: activeSlide?.diagramType === 'comparison',
                        },
                        {
                          value: 'bento',
                          label: 'Bento Matrix',
                          emoji: '🍱',
                          tag: 'Grid',
                          apply: () =>
                            updateSlideMut.mutate({
                              id: activeSlide.id,
                              layoutType: 'bento',
                              diagramType: 'bento',
                              diagramData:
                                activeSlide.diagramData ||
                                JSON.stringify({
                                  items: [
                                    { title: 'Deterministic Engine', desc: 'Zero visual overlap architecture.', tag: 'Core' },
                                    { title: '4K Vector Clarity', desc: 'Native shapes with infinite zoom.', tag: 'Vector' },
                                    { title: 'Sub-10s Generation', desc: 'Asynchronous streaming pipelines.', tag: 'Speed' },
                                  ],
                                }),
                            }),
                          isActive: activeSlide?.layoutType === 'bento' || activeSlide?.diagramType === 'bento',
                        },
                        {
                          value: 'text-only',
                          label: 'Quote / Callout',
                          emoji: '📝',
                          tag: 'Quote',
                          apply: () => updateSlideMut.mutate({ id: activeSlide.id, layoutType: 'text-only', diagramType: null }),
                          isActive: activeSlide?.layoutType === 'text-only',
                        },
                      ].map((layout) => (
                        <button
                          key={layout.value}
                          type="button"
                          onClick={() => {
                            layout.apply()
                            toast.success(`Layout converted to ${layout.label}`)
                          }}
                          className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative ${
                            layout.isActive
                              ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50 text-white'
                              : 'border-white/5 bg-[#0F131C] hover:bg-[#151924] hover:border-white/15 text-slate-300'
                          }`}
                        >
                          <div className="w-full flex items-center justify-between mb-1.5">
                            <span className="text-base">{layout.emoji}</span>
                            <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                              {layout.tag}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold font-display line-clamp-1">{layout.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
          theme={activeTheme}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      <ShareDialog
        open={showShareModal}
        onOpenChange={setShowShareModal}
        presentationId={presentationId}
        title={data.title}
      />

      <AddSlideDialog
        open={showAddSlideModal}
        onOpenChange={setShowAddSlideModal}
        onAddSlide={(data) => {
          createSlideMut.mutate(data, {
            onSuccess: (newSlide: any) => {
              if (newSlide?.id) {
                // Select newly created slide
                const newIndex = slides.length
                setActiveSlideIndex(newIndex)
              }
            }
          })
        }}
        isPending={createSlideMut.isPending}
      />
    </div>
  )
}

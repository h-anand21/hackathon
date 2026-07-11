import { getSession } from '@/lib/auth.functions'
import {
  LAYOUT_OPTIONS,
  PRESENTATION_TEMPLATES,
  PresentationListSection,
  SLIDE_STYLES,
  TONE_OPTIONS,
  presentationQueryKeys,
} from '#/features/presentations'
import { createPresentation } from '#/features/presentations/actions/presentation-mutations'
import { listPresentations } from '#/features/presentations/api/presentation-queries'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { 
  Sparkles, 
  Wand2, 
  Menu, 
  Home, 
  FolderOpen, 
  LayoutTemplate, 
  MessageSquare, 
  Star, 
  Trash2, 
  Settings, 
  Paperclip, 
  ChevronLeft,
  ChevronRight,
  Presentation,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Logo } from '#/components/Logo'

type HomeFormState = {
  content: string
  slideCount: number
  style: (typeof SLIDE_STYLES)[number]['value']
  tone: (typeof TONE_OPTIONS)[number]['value']
  layout: (typeof LAYOUT_OPTIONS)[number]['value']
}

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    prompt: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { user: session.user }
  },
  component: HomePage,
})

function HomePage() {
  const _context = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const search = Route.useSearch()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('ppt_favorites') || '[]') } catch { return [] }
  })

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      if (typeof window !== 'undefined') localStorage.setItem('ppt_favorites', JSON.stringify(next))
      return next
    })
  }

  const [form, setForm] = useState<HomeFormState>({
    content: search.prompt || '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  const { data: presentations = [], isPending: listPending } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
  })

  const createMut = useMutation({
    mutationFn: () =>
      createPresentation({
        data: {
          prompt: form.content.trim(),
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Presentation created')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not create presentation')
    },
  })

  const handleGenerate = () => {
    if (!form.content.trim()) {
      toast.error('Please enter your content first')
      return
    }
    createMut.mutate()
  }

  return (
    <div className="flex h-screen w-full dashboard-bg overflow-hidden text-white relative">
      {/* Background Glows */}
      <div className="radial-glow-orange" />
      <div className="radial-glow-blue" />

      {/* Sidebar */}
      <aside 
        className={`relative z-20 flex flex-col transition-all duration-300 ease-in-out border-r border-white/5 bg-[#07090D]/80 backdrop-blur-xl ${isSidebarOpen ? 'w-[260px]' : 'w-[80px]'}`}
      >
        <div className="flex items-center h-16 px-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-2"
          >
            <Menu className="size-5 text-gray-400 hover:text-white" />
          </button>
          
          {isSidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <Logo className="w-6 h-6 text-white" />
              <span className="text-base font-bold tracking-tight">
                PPT<span className="text-[#FF8A2A]">.ai</span>
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          <SidebarItem icon={Home} label="Home" isOpen={isSidebarOpen} active={!showFavoritesOnly} onClick={() => {
            setShowFavoritesOnly(false)
            document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
          }} />
          <SidebarItem icon={FolderOpen} label="My Presentations" isOpen={isSidebarOpen} active={!showFavoritesOnly} onClick={() => {
            setShowFavoritesOnly(false)
            document.getElementById('recent-presentations')?.scrollIntoView({ behavior: 'smooth' })
          }} />
          <SidebarItem icon={LayoutTemplate} label="Templates" isOpen={isSidebarOpen} onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })} />
          <SidebarItem icon={MessageSquare} label="AI Prompt" isOpen={isSidebarOpen} onClick={() => document.querySelector('textarea')?.focus()} />
          <SidebarItem icon={Star} label="Favorites" isOpen={isSidebarOpen} active={showFavoritesOnly} onClick={() => {
            setShowFavoritesOnly(true)
            document.getElementById('recent-presentations')?.scrollIntoView({ behavior: 'smooth' })
          }} />
          
          <div className="my-4 border-t border-white/5" />
          
          <SidebarItem icon={Trash2} label="Trash" isOpen={isSidebarOpen} onClick={() => toast.info('Trash coming soon!')} />
          <SidebarItem icon={Settings} label="Settings" isOpen={isSidebarOpen} onClick={() => toast.info('Settings coming soon!')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main id="main-scroll" className="flex-1 relative z-10 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
          
          {/* Hero Header */}
          <div className="text-center mb-10 w-full animate-fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Create beautiful presentations<br />with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A2A] to-[#FF6A00]">AI.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Describe your idea and we'll transform it into a professional PowerPoint.
            </p>
          </div>

          {/* ChatGPT-style Input Box */}
          <div className="w-full max-w-3xl mb-16 animate-fade-up">
            <div className="dashboard-input-bg rounded-2xl p-4 input-focus-glow relative shadow-lg">
              <Textarea
                placeholder="Describe your presentation..."
                value={form.content}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    content: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                className="h-[120px] min-h-[120px] bg-transparent border-none resize-none focus-visible:ring-0 text-white placeholder:text-gray-600 text-lg p-2 mb-12 shadow-none"
              />
              
              {/* Bottom Actions Row in Input */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = () => toast.success('Image attached successfully!');
                      input.click();
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Paperclip className="size-4" /> Attach
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!form.content.trim()) {
                        toast.error('Enter some text first to improve it!');
                        return;
                      }
                      setForm(s => ({ ...s, content: s.content + '\n\nMake it highly professional, engaging, and visually structured.' }));
                      toast.success('Prompt improved by AI!');
                    }}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Sparkles className="size-4" /> Improve
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 px-2 border border-white/5">
                     <Select
                       value={form.slideCount.toString()}
                       onValueChange={(value) => setForm((s) => ({ ...s, slideCount: parseInt(value) }))}
                     >
                       <SelectTrigger className="h-7 border-none bg-transparent hover:bg-white/5 text-xs text-gray-400 focus:ring-0 shadow-none px-2 py-0 min-w-0">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass">
                         {[...Array(18)].map((_, i) => (
                           <SelectItem key={i + 3} value={(i + 3).toString()}>
                             {i + 3} Slides
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     
                     <div className="w-px h-3 bg-white/10 mx-1" />
                     
                     <Select
                       value={form.style}
                       onValueChange={(value) => setForm((s) => ({ ...s, style: value as HomeFormState['style'] }))}
                     >
                       <SelectTrigger className="h-7 border-none bg-transparent hover:bg-white/5 text-xs text-gray-400 focus:ring-0 shadow-none px-2 py-0 min-w-0 capitalize">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="glass">
                         {SLIDE_STYLES.map((s) => (
                           <SelectItem key={s.value} value={s.value}>
                             {s.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={createMut.isPending || !form.content.trim()}
                    className="generate-btn-glow rounded-xl px-5 py-2 h-auto text-sm font-semibold flex items-center gap-2"
                  >
                    {createMut.isPending ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <>
                        Generate <ChevronRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Template Suggestions below input */}
            <div id="templates" className="flex flex-wrap justify-center gap-2 mt-6 opacity-60 hover:opacity-100 transition-opacity">
              {PRESENTATION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setForm({
                      content: template.content,
                      slideCount: template.slides,
                      style: template.style,
                      tone: template.tone,
                      layout: template.layout,
                    })
                  }}
                  className="px-4 py-1.5 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-[#FF8A2A]/50 hover:bg-[#FF8A2A]/10 transition-all"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Presentations List (Moved Below) */}
          <div id="recent-presentations" className="w-full">
            <PresentationListSection
              presentations={presentations}
              isPending={listPending}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              showFavoritesOnly={showFavoritesOnly}
            />
          </div>

        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon: Icon, label, isOpen, active, onClick }: { icon: any, label: string, isOpen: boolean, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <Icon className="size-5 shrink-0" />
      {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </button>
  )
}

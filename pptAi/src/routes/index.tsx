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
  RefreshCw,
  Rocket, 
  Users, 
  TrendingUp, 
  ClipboardList, 
  Lightbulb, 
  GraduationCap,
  Mail,
  Phone,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'
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
  
  type ActiveView = 'home' | 'presentations' | 'templates' | 'favorites' | 'trash' | 'settings'
  const [activeView, setActiveView] = useState<ActiveView>('home')
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

  type TrashedItem = { id: string; trashedAt: number }
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('ppt_trash') || '[]') } catch { return [] }
  })

  useEffect(() => {
    // Auto-cleanup items older than 30 days
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const now = Date.now()
    const validItems = trashedItems.filter(item => now - item.trashedAt < THIRTY_DAYS)
    if (validItems.length !== trashedItems.length) {
      setTrashedItems(validItems)
      localStorage.setItem('ppt_trash', JSON.stringify(validItems))
    }
  }, [trashedItems])

  const handleTrash = (id: string) => {
    setTrashedItems(prev => {
      const next = [...prev, { id, trashedAt: Date.now() }]
      if (typeof window !== 'undefined') localStorage.setItem('ppt_trash', JSON.stringify(next))
      return next
    })
  }

  const handleRestore = (id: string) => {
    setTrashedItems(prev => {
      const next = prev.filter(item => item.id !== id)
      if (typeof window !== 'undefined') localStorage.setItem('ppt_trash', JSON.stringify(next))
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
          <SidebarItem icon={Home} label="Home" isOpen={isSidebarOpen} active={activeView === 'home'} onClick={() => {
            setActiveView('home')
          }} />
          <SidebarItem icon={FolderOpen} label="My Presentations" isOpen={isSidebarOpen} active={activeView === 'presentations'} onClick={() => {
            setActiveView('presentations')
          }} />
          <SidebarItem icon={LayoutTemplate} label="Templates" isOpen={isSidebarOpen} active={activeView === 'templates'} onClick={() => {
            setActiveView('templates')
          }} />
          <SidebarItem icon={MessageSquare} label="AI Prompt" isOpen={isSidebarOpen} onClick={() => {
            setActiveView('home')
            setTimeout(() => document.querySelector('textarea')?.focus(), 100)
          }} />
          <SidebarItem icon={Star} label="Favorites" isOpen={isSidebarOpen} active={activeView === 'favorites'} onClick={() => {
            setActiveView('favorites')
          }} />
          
          <div className="my-4 border-t border-white/5" />
          
          <SidebarItem icon={Trash2} label="Trash" isOpen={isSidebarOpen} active={activeView === 'trash'} onClick={() => {
            setActiveView('trash')
          }} />
          <SidebarItem icon={Settings} label="Settings" isOpen={isSidebarOpen} active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main id="main-scroll" className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide scroll-smooth flex flex-col items-center">
          
          <div className="w-full max-w-5xl flex flex-col items-center pt-8 md:pt-16">
            
            {activeView === 'home' && (
              <>
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
          </div>
        </>
      )}
            
            {/* Featured Templates Section */}
            {(activeView === 'home' || activeView === 'templates') && (
            <div id="templates" className={`w-full max-w-5xl mb-8 ${activeView === 'templates' ? 'mt-0' : 'mt-16'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 bg-[#FF8A2A] rounded-full" />
                <h2 className="text-xl font-bold text-white tracking-tight">Featured Templates</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESENTATION_TEMPLATES.map((template) => {
                  const getIcon = () => {
                    switch(template.id) {
                      case 'product-tour': return <Rocket className="size-5 text-blue-500" />
                      case 'meeting-summary': return <Users className="size-5 text-green-500" />
                      case 'sales-pitch': return <TrendingUp className="size-5 text-orange-500" />
                      case 'project-update': return <ClipboardList className="size-5 text-purple-500" />
                      case 'startup-pitch': return <Lightbulb className="size-5 text-yellow-500" />
                      case 'training-guide': return <GraduationCap className="size-5 text-teal-500" />
                      default: return <LayoutTemplate className="size-5 text-gray-400" />
                    }
                  }
                  const getDesc = () => {
                    switch(template.id) {
                      case 'product-tour': return 'Showcase your new product features and benefits.'
                      case 'meeting-summary': return 'Summarize key decisions and action items.'
                      case 'sales-pitch': return 'Persuade clients with a compelling sales deck.'
                      case 'project-update': return 'Keep stakeholders informed on project progress.'
                      case 'startup-pitch': return 'Pitch your next big idea to investors.'
                      case 'training-guide': return 'Educate your team with clear instructional slides.'
                      default: return 'Start with a pre-made structure.'
                    }
                  }
                  
                  return (
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
                        setActiveView('home')
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100)
                        toast.success(`Loaded ${template.label} template`)
                      }}
                      className="group flex flex-col text-left p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="p-2.5 bg-black/40 rounded-xl mb-4 w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {getIcon()}
                      </div>
                      <h3 className="font-semibold text-white mb-1.5">{template.label}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{getDesc()}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            )}

          {/* Recent Presentations List */}
          {(activeView === 'home' || activeView === 'presentations' || activeView === 'favorites' || activeView === 'trash') && (
          <div id="recent-presentations" className="w-full max-w-5xl">
            <PresentationListSection
              presentations={presentations}
              isPending={listPending}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              showFavoritesOnly={activeView === 'favorites'}
              trashedIds={trashedItems.map(t => t.id)}
              showTrashOnly={activeView === 'trash'}
              onTrash={handleTrash}
              onRestore={handleRestore}
            />
          </div>
          )}

          {/* Settings Section */}
          {activeView === 'settings' && (
            <div id="settings" className="w-full max-w-4xl text-left">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-5 bg-blue-500 rounded-full" />
                <h2 className="text-xl font-bold text-white tracking-tight">Settings & Support</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* FAQs */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg text-white mb-2">Frequently Asked Questions</h3>
                  {[
                    { q: "How does pptAI generate presentations?", a: "We use Google Gemini to structure the narrative and format bullet points. DALL-E 3 generates custom, context-aware illustrations for every slide." },
                    { q: "Can I edit the presentation after it's generated?", a: "Yes! You can edit any text, replace images, or regenerate specific slides entirely using our built-in editor before exporting." },
                    { q: "What export formats are supported?", a: "Currently, you can export your presentations as fully editable PowerPoint (.pptx) files or as PDF documents." },
                    { q: "Do I need design skills to use this?", a: "Not at all. pptAI automatically applies professional design principles, layout structures, and color theory." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h4 className="font-medium text-white text-sm mb-2">{faq.q}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-6">
                  {/* Contact */}
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-4">Contact Us</h3>
                    <div className="flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/20 rounded-lg">
                          <Mail className="size-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Email Support</p>
                          <a href="mailto:work.himu2006@gmail.com" className="text-sm text-blue-400 hover:underline">work.himu2006@gmail.com</a>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-green-500/20 rounded-lg">
                          <Phone className="size-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Call Us</p>
                          <p className="text-sm text-gray-400">+91 (123) 456-7890</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Account */}
                  <div className="mt-4 pt-6 border-t border-white/10">
                    <h3 className="font-semibold text-lg text-white mb-4">Account</h3>
                    <button 
                      onClick={() => {
                        toast.success('Logging out...')
                        setTimeout(() => window.location.href = '/login', 1000)
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors w-fit font-medium text-sm"
                    >
                      <LogOut className="size-4" />
                      Log out
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

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

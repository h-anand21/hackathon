import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Link } from '@tanstack/react-router'
import { Database, Network, Briefcase, Bot, Star, MoreVertical, Trash2, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import type { Presentation } from '../types/presentation.types'

type PresentationCardProps = {
  presentation: Presentation
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  isTrashed?: boolean
  onTrash?: (id: string) => void
  onRestore?: (id: string) => void
}

const THEMES = [
  { icon: Database, gradient: 'from-blue-500/20 to-transparent', iconColor: 'text-blue-500', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]' },
  { icon: Network, gradient: 'from-green-500/20 to-transparent', iconColor: 'text-green-500', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.3)]' },
  { icon: Briefcase, gradient: 'from-orange-500/20 to-transparent', iconColor: 'text-orange-500', glow: 'shadow-[0_0_25px_rgba(255,138,42,0.3)]' },
  { icon: Bot, gradient: 'from-purple-500/20 to-transparent', iconColor: 'text-purple-500', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]' },
]

export function PresentationCard({ presentation: p, isFavorite, onToggleFavorite, isTrashed, onTrash, onRestore }: PresentationCardProps) {

  const updated = new Date(p.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  // Pick theme deterministically
  const themeIndex = (p.title.length + p.id.charCodeAt(p.id.length - 1)) % THEMES.length
  const theme = THEMES[themeIndex]
  const Icon = theme.icon

  return (
    <Link
      to="/presentations/$presentationId"
      params={{ presentationId: p.id }}
      className="block h-full outline-none card-hover-effect group"
    >
      <Card className="h-full premium-glass py-0 overflow-hidden relative border border-white/5 transition-all">
        {/* Top Gradient Banner */}
        <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${theme.gradient} opacity-50 pointer-events-none`} />
        
        <div className="flex flex-col gap-4 p-5 relative z-10">
          
          <div className="flex items-start justify-between">
            {/* Glowing Icon Box */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[#07090D] border border-white/10 ${theme.glow}`}>
              <Icon className={`size-6 ${theme.iconColor}`} />
            </div>
            
            <div className="flex items-center gap-2">
              {!isTrashed && (
                <button 
                  className={`transition-colors ${isFavorite ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-500 hover:text-white'}`} 
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleFavorite(p.id)
                    toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites')
                  }}
                >
                  <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              {isTrashed ? (
                <button className="text-gray-500 hover:text-green-400 transition-colors" onClick={(e) => {
                  e.preventDefault()
                  onRestore?.(p.id)
                  toast.success('Presentation restored')
                }}>
                  <RefreshCcw className="size-4" />
                </button>
              ) : (
                <button className="text-gray-500 hover:text-red-400 transition-colors" onClick={(e) => {
                  e.preventDefault()
                  onTrash?.(p.id)
                  toast.success('Moved to trash (30 days)')
                }}>
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          <CardHeader className="p-0 gap-1.5 flex-1 min-w-0 mt-2">
            <CardTitle className="text-lg font-semibold text-white leading-tight line-clamp-2">{p.title || 'Untitled Presentation'}</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>{p.slideCount} slides</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="capitalize">{p.style}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="capitalize">{p.tone}</span>
            </CardDescription>
            <p className="text-[11px] text-gray-500 pt-3 border-t border-white/5 mt-2">
              Updated {updated}
            </p>
          </CardHeader>
        </div>
      </Card>
    </Link>
  )
}

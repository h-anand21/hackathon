import type { Presentation } from '../types/presentation.types'

import { PresentationCard } from './presentation-card'

type PresentationListSectionProps = {
  presentations: Presentation[]
  isPending: boolean
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  showFavoritesOnly?: boolean
  trashedIds?: string[]
  showTrashOnly?: boolean
  onTrash?: (id: string) => void
  onRestore?: (id: string) => void
}

export function PresentationListSection({
  presentations,
  isPending,
  favoriteIds,
  onToggleFavorite,
  showFavoritesOnly,
  trashedIds = [],
  showTrashOnly,
  onTrash,
  onRestore
}: PresentationListSectionProps) {
  const filtered = presentations.filter(p => {
    const isTrashed = trashedIds.includes(p.id)
    if (showTrashOnly) return isTrashed
    if (isTrashed) return false
    if (showFavoritesOnly) return favoriteIds.includes(p.id)
    return true
  })
  
  const title = showTrashOnly ? "Trash" : "Recent Presentations"
  
  return (
    <section className="mb-12 w-full max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-5 bg-[#FF8A2A] rounded-full" />
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {showFavoritesOnly ? "No favorite presentations found." : "No presentations yet. Create one with the form below."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <PresentationCard 
                presentation={p} 
                isFavorite={favoriteIds.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                isTrashed={trashedIds.includes(p.id)}
                onTrash={onTrash}
                onRestore={onRestore}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

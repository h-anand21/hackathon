import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'
import { Share2, Copy, Check, ExternalLink, Globe, Code, X } from 'lucide-react'

type ShareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  presentationId: string
  title: string
}

export function ShareDialog({
  open,
  onOpenChange,
  presentationId,
  title,
}: ShareDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  if (!open) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dootppt.netlify.app'
  const shareUrl = `${origin}/view/${presentationId}`
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    toast.success('Public presentation link copied!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    setCopiedEmbed(true)
    toast.success('Embed iframe code copied!')
    setTimeout(() => setCopiedEmbed(false), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg bg-[#0B0F17] border border-white/10 text-white rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="size-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Share2 className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Share Presentation
            </h3>
            <p className="text-xs text-slate-400">
              Anyone with this link can view and present your slides.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Public Link */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <Globe className="size-3 text-cyan-400" /> Public View Link
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopyLink}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs gap-1.5 px-3 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <Code className="size-3 text-purple-400" /> Embed in Website
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={embedCode}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none truncate"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyEmbed}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs gap-1.5 px-3"
              >
                {copiedEmbed ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedEmbed ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Open public viewer in new tab
            </a>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

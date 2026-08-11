import LoginForm from '@/components/auth/login-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Sparkles, Presentation } from 'lucide-react'
import { z } from 'zod'
import { Logo } from '#/components/Logo'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#07090E] relative overflow-hidden text-white">
      {/* Radial atmospheric glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#0B0F17]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group mb-1">
              <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform">
                <Logo className="size-6 text-cyan-400" />
              </div>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold font-display tracking-tight text-white">
                Welcome to <span className="text-cyan-400">PPT.ai</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1.5 font-sans">
                Sign in to create, edit, and present studio-grade decks
              </p>
            </div>
          </div>

          {/* Login form */}
          <LoginForm redirectTo={redirect} />
        </div>
      </div>
    </div>
  )
}


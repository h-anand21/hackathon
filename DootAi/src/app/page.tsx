import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Mail, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf8f3] flex flex-col justify-between p-4 sm:p-8 md:p-12 relative overflow-hidden">
      
      {/* Decorative Rising Sun Background Element */}
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 rounded-full bg-[#b83227] opacity-[0.03] blur-3xl pointer-events-none" />

      {/* Main Header / Navigation */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-4 border-b border-dashed border-[#e6dfd3]">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-[#b83227]" />
          <span className="font-handwriting text-2xl font-bold text-[#2b2725]">DootAI MailOS</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/onboarding"
            className="px-4 py-1.5 text-sm font-bold bg-white text-[#2b2725] sketch-border-sm sketch-shadow hover:scale-102 transition-all"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col md:flex-row items-center justify-between gap-12 py-12">
        
        {/* Left Copy Column */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <div className="washi-tape washi-tape-blue inline-block px-4 py-1 text-sm font-handwriting">
            A Superhuman Clone for the Cultured Mind 🌸
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-handwriting leading-tight text-[#2b2725] tracking-tight">
            Your Inbox, Reimagined as a Japanese Sketchbook.
          </h1>
          
          <p className="text-base sm:text-lg text-[#2b2725]/80 leading-relaxed font-sans">
            Experience lightning-fast email and calendar workflows integrated with a contextual AI assistant, all hosted inside a warm, hand-drawn watercolor aesthetic. 
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-[#b83227] text-white font-bold text-lg text-center sketch-border sketch-shadow-hover hover:scale-105 flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-6 py-4 border border-dashed border-[#2b2725]/40 hover:border-[#2b2725] text-center font-bold text-sm flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Preview Card / Graphic Column */}
        <div className="flex-1 flex justify-center items-center relative w-full max-w-md">
          {/* Sketchy Mockup Card */}
          <div className="w-full bg-[#fbf8f3] p-6 sketch-border sketch-shadow rotate-1 relative z-10">
            <div className="flex justify-between items-center mb-6 border-b border-[#e6dfd3] pb-3">
              <div className="flex space-x-1">
                <span className="w-3 h-3 rounded-full bg-[#b83227] opacity-60" />
                <span className="w-3 h-3 rounded-full bg-[#f5b041] opacity-60" />
                <span className="w-3 h-3 rounded-full bg-[#388e3c] opacity-60" />
              </div>
              <span className="font-handwriting text-xs text-[#2b2725]/40">dootai-sketch.md</span>
            </div>

            {/* Simulated Email Card */}
            <div className="space-y-4">
              <div className="p-3 bg-white sketch-border-sm flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs">Aarav Patel</span>
                    <span className="bg-[#b83227]/10 text-[#b83227] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">High</span>
                  </div>
                  <p className="font-handwriting font-bold text-sm text-[#2b2725]/90">Urgent: Partnership Proposal</p>
                  <p className="text-[10px] text-[#2b2725]/50 truncate w-64">Hey, I've sent over the contract docs. Let's schedule...</p>
                </div>
                <span className="text-[10px] text-[#2b2725]/40 font-mono">10:04 AM</span>
              </div>

              {/* Simulated Doot Mascot Chat Bubble */}
              <div className="p-3 bg-[#3c6382]/5 sketch-border-sm border-[#3c6382] space-y-2 relative">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#f5b041]" />
                  <span className="font-handwriting text-xs font-bold text-[#3c6382]">DootAI Assistant:</span>
                </div>
                <p className="text-xs text-[#2b2725]/80 italic">
                  "I found an opening in your calendar next Thursday at 2 PM. Should I draft a response to Aarav?"
                </p>
                <div className="flex space-x-2 pt-1">
                  <span className="px-2 py-0.5 bg-white sketch-border-sm text-[9px] font-bold">Draft Reply</span>
                  <span className="px-2 py-0.5 bg-white sketch-border-sm text-[9px] font-bold">Book 2 PM</span>
                </div>
              </div>
            </div>

            {/* Mt Fuji Background Illustration */}
            <div className="absolute bottom-[-20px] left-[-20px] opacity-20 pointer-events-none">
              <svg viewBox="0 0 200 120" className="w-32 h-20">
                <circle cx="60" cy="50" r="30" fill="#b83227" />
                <path d="M 10 110 L 90 20 L 190 110 Z" fill="none" stroke="#2b2725" strokeWidth="2" />
              </svg>
            </div>
          </div>
          
          {/* Hanko stamp in bottom corner */}
          <div className="absolute right-[-10px] bottom-[-20px] hanko-stamp rounded-full w-24 h-24 border-4 border-dashed border-[#b83227] flex flex-col items-center justify-center p-2 text-xs font-bold bg-[#b83227]/5 select-none rotate-[10deg] z-20">
            <span className="font-handwriting tracking-widest text-[#b83227] text-base leading-none">MailOS</span>
            <span className="text-[9px] text-[#b83227]/80 tracking-widest font-mono">DOOTAI</span>
          </div>
        </div>
      </main>

      {/* Feature section */}
      <section id="features" className="max-w-6xl mx-auto w-full py-16 border-t border-dashed border-[#e6dfd3]">
        <h2 className="text-2xl font-bold font-handwriting text-[#2b2725] text-center mb-10">
          Features designed for absolute focus (機能)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white sketch-border sketch-shadow">
            <Mail className="w-8 h-8 text-[#b83227] mb-4" />
            <h3 className="font-bold font-handwriting text-lg text-[#2b2725] mb-2">Smart Priority Inbox</h3>
            <p className="text-xs text-[#2b2725]/60 leading-relaxed">
              Auto-classify emails instantly. DootAI extracts critical action items, drafts suggestions, and flags urgent responses automatically.
            </p>
          </div>
          <div className="p-6 bg-white sketch-border sketch-shadow">
            <Calendar className="w-8 h-8 text-[#3c6382] mb-4" />
            <h3 className="font-bold font-handwriting text-lg text-[#2b2725] mb-2">Unified Calendar</h3>
            <p className="text-xs text-[#2b2725]/60 leading-relaxed">
              Plan your week directly alongside your email. Create events in natural language through Doot, our conversational AI helper.
            </p>
          </div>
          <div className="p-6 bg-white sketch-border sketch-shadow">
            <Sparkles className="w-8 h-8 text-[#f5b041] mb-4" />
            <h3 className="font-bold font-handwriting text-lg text-[#2b2725] mb-2">Superhuman Shortcuts</h3>
            <p className="text-xs text-[#2b2725]/60 leading-relaxed">
              Navigate your inbox in milliseconds. Keyboard shortcuts let you compose, search, archive, and command AI without touching your mouse.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-8 pb-4 border-t border-dashed border-[#e6dfd3] flex justify-between items-center text-xs text-[#2b2725]/50 font-mono">
        <span>© 2026 DootAI MailOS. All rights reserved.</span>
        <span>A hand-drawn AI experience.</span>
      </footer>

    </div>
  );
}

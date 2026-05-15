import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Zap,
  Activity,
  Users,
  BarChart3,
  Shield,
  Lock,
  MousePointer2,
  Send,
  Globe,
  Trophy,
  MessageSquare,
  Share2,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  PieChart as PieChartIcon,
  Timer,
  Layout,
  Trash2,
  Edit3,
  ExternalLink,
  MessageCircle,
  Hash,
  Clock,
  Rocket,
  ChevronUp,
  Moon,
  Unlock,
  Star
} from 'lucide-react';

// --- Feature Mini Animations ---
function VotingAnim() {
  return (
    <div className="relative h-16 flex flex-col justify-center px-4 overflow-hidden bg-amber-500/5">
      <div className="flex items-center gap-2 mb-2">
        <motion.div 
          animate={{ x: [0, 20, 0], scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <MousePointer2 size={12} className="text-amber-500" />
        </motion.div>
        <motion.span 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-[8px] font-black text-amber-600 uppercase tracking-tighter"
        >Click to Vote</motion.span>
      </div>
      <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-foreground/10 relative">
        <motion.div 
          animate={{ width: ["10%", "85%", "85%", "10%"] }} 
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.4, 0.8, 1] }}
          className="h-full bg-amber-500 relative shadow-[0_0_10px_rgba(245,158,11,0.3)]"
        >
          <motion.div 
            animate={{ opacity: [0, 1, 0], y: [0, -15, -25] }} 
            transition={{ repeat: Infinity, duration: 4, delay: 1.6 }}
            className="absolute right-0 top-0 text-[10px] font-black text-amber-600 whitespace-nowrap"
          >Vote Cast! ✓</motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function AnalyticsAnim() {
  return (
    <div className="relative h-16 flex flex-col justify-center px-4 bg-teal-500/5">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-1">
          <Activity size={10} className="text-teal-500 animate-pulse" />
          <span className="text-[8px] font-black text-teal-600 uppercase">Live Flux</span>
        </div>
        <motion.span 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="text-[10px] font-black text-foreground tabular-nums"
        >78%</motion.span>
      </div>
      <div className="flex gap-1 items-end h-6">
        {[40, 70, 50, 90, 60, 80].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: [`${h}%`, `${h + 20}%`, `${h}%`] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            className="flex-1 bg-teal-500/40 rounded-t-sm"
          />
        ))}
      </div>
    </div>
  );
}

function SpamAnim() {
  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden bg-rose-500/5">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          borderColor: ['#f43f5e', '#fb7185', '#f43f5e']
        }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 bg-rose-500/10 border-2 rounded-2xl flex items-center justify-center z-10 relative"
      >
        <Shield size={20} className="text-rose-500" />
      </motion.div>
      
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i}
          initial={{ x: [-50, 50, -50, 50][i], y: [-30, -30, 30, 30][i], opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          className="absolute w-2 h-2 bg-rose-500 rounded-full"
        />
      ))}
      
      <motion.div
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        className="absolute z-20 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg"
      >
        BLOCKED ✗
      </motion.div>
    </div>
  );
}

function AuthAnim() {
  return (
    <div className="h-16 flex items-center justify-center bg-violet-500/5 px-4 overflow-hidden relative">
      {/* Step 1: Locked State */}
      <motion.div
        animate={{ 
          opacity: [1, 1, 0, 0, 1],
          x: [0, 0, -20, -20, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.4, 0.9, 1] }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500 flex items-center justify-center">
          <Lock size={14} className="text-rose-500" />
        </div>
        <span className="text-[9px] font-black text-rose-600 uppercase">Login Required</span>
      </motion.div>

      {/* Step 2: Simulated Click */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: [0, 1, 0, 0],
          y: [20, 0, 0, 20],
          scale: [1, 1, 0.9, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0.3, 0.35, 0.45, 0.5] }}
        className="absolute z-20 flex flex-col items-center gap-1"
      >
        <div className="px-3 py-1 bg-violet-600 text-white text-[8px] font-black rounded-md shadow-lg">SIGN IN</div>
        <MousePointer2 size={12} className="text-foreground fill-foreground" />
      </motion.div>

      {/* Step 3: Unlocked State */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: [0, 0, 1, 1, 0],
          x: [20, 20, 0, 0, 20]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 1] }}
        className="absolute inset-0 flex items-center justify-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
          <Unlock size={14} className="text-green-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-green-600 uppercase">Authorized ✓</span>
          <span className="text-[7px] font-bold text-muted-foreground">Welcome Back!</span>
        </div>
      </motion.div>
    </div>
  );
}

function ShareAnim() {
  return (
    <div className="h-16 flex flex-col justify-center px-4 bg-blue-500/5">
      <div className="relative group bg-muted border border-foreground/10 rounded-xl p-2 flex items-center gap-2 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 5, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-1 text-[8px] font-mono text-muted-foreground truncate"
        >
          pollsphere.app/t/v1-6k...
        </motion.div>
        <motion.div 
          animate={{ 
            backgroundColor: ['#3b82f6', '#22c55e', '#22c55e', '#3b82f6'],
            scale: [1, 1.05, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.7, 1] }}
          className="px-2 py-1 rounded text-[8px] font-black text-white"
        >
          <motion.span animate={{ opacity: [1, 0, 0, 1] }} transition={{ duration: 3, repeat: Infinity }}>COPY</motion.span>
          <motion.span className="absolute right-3" animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>DONE</motion.span>
        </motion.div>
      </div>
      <div className="flex gap-4 mt-2 justify-center">
        {[Send, Share2, Globe].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [5, -5, 5],
              opacity: [0.2, 1, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            <Icon size={10} className="text-blue-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WinnerAnim() {
  return (
    <div className="relative h-16 flex flex-col justify-end px-4 bg-orange-500/5 overflow-hidden">
      <motion.div 
        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg z-10"
      >
        WINNER! 🏆
      </motion.div>
      <div className="flex gap-2 items-end h-8">
        {[30, 95, 45].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: [`${h}%`, `${h + (i === 1 ? 5 : 0)}%`, `${h}%`] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`flex-1 rounded-t-md relative ${i === 1 ? 'bg-orange-500' : 'bg-orange-500/20'}`}
          >
            {i === 1 && (
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="absolute inset-0 bg-white/20"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ExpiryAnim() {
  return (
    <div className="h-16 flex items-center justify-center gap-3 bg-green-500/5">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
          <motion.circle 
            cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray="113"
            animate={{ strokeDashoffset: [0, 113] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="text-green-500" 
          />
        </svg>
        <div className="absolute text-[8px] font-black tabular-nums">0:04</div>
      </div>
      <div className="flex flex-col">
        <motion.span 
          animate={{ opacity: [1, 0.5, 1], color: ['#22c55e', '#ef4444', '#22c55e'] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="text-[9px] font-black uppercase tracking-tighter"
        >
          <motion.span animate={{ opacity: [1, 0, 0, 1] }} transition={{ duration: 5, repeat: Infinity }}>Active Now</motion.span>
          <motion.span className="absolute" animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity }}>Expiring...</motion.span>
        </motion.span>
        <div className="flex gap-1 mt-1">
          {[1,2,3].map(i => <motion.div key={i} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-1 h-1 rounded-full bg-current opacity-40" />)}
        </div>
      </div>
    </div>
  );
}

function ThemeAnim() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setDark(p => !p), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-16 flex items-center justify-center bg-indigo-500/5">
      <motion.div
        animate={{ 
          backgroundColor: dark ? '#0f172a' : '#ffffff',
          borderColor: dark ? '#334155' : '#e2e8f0'
        }}
        className="w-32 h-10 border-2 rounded-xl flex items-center justify-between px-3 shadow-inner relative overflow-hidden"
      >
        <div className="flex flex-col gap-1">
          <motion.div animate={{ backgroundColor: dark ? '#ffffff' : '#0f172a' }} className="w-6 h-1 rounded-full" />
          <motion.div animate={{ backgroundColor: dark ? '#ffffff' : '#0f172a', opacity: 0.4 }} className="w-4 h-1 rounded-full" />
        </div>
        <motion.div
          animate={{ 
            x: dark ? 0 : 20,
            rotate: dark ? 0 : 180,
            backgroundColor: dark ? '#6366f1' : '#f59e0b'
          }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]"
        >
          {dark ? '🌙' : '☀️'}
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- Roadmap Mini Animations ---
function AiSentimentAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center bg-purple-500/5 px-4 overflow-hidden relative">
      <motion.div 
        animate={{ 
          y: [30, 0, 0, -30],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.4, 0.5] }}
        className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl shadow-md border border-foreground/5 mb-2"
      >
        <span className="text-lg">😡</span>
        <span className="text-[11px] font-bold italic text-muted-foreground">"Too slow!"</span>
      </motion.div>
      <motion.div 
        animate={{ 
          y: [30, 0, 0, -30],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6, 0.9, 1] }}
        className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl shadow-md border border-foreground/5"
      >
        <span className="text-lg">😊</span>
        <span className="text-[11px] font-bold italic text-muted-foreground">"Love it!"</span>
      </motion.div>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
          <Zap size={24} className="text-purple-500 fill-purple-500/20" />
        </motion.div>
        <span className="text-[9px] font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">AI SCAN</span>
      </div>
    </div>
  );
}

function CollabAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center bg-emerald-500/5 px-4 relative">
      <div className="flex items-center gap-8 relative z-10">
        <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="flex flex-col items-center">
           <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-black border-4 border-background shadow-xl">A</div>
           <span className="text-[8px] font-black mt-1 uppercase text-emerald-600">Admin</span>
        </motion.div>
        
        <div className="relative">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="p-3 bg-background border-2 border-emerald-500/20 rounded-2xl shadow-lg">
             <MessageSquare size={20} className="text-emerald-500" />
          </motion.div>
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
        </div>

        <motion.div animate={{ x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="flex flex-col items-center">
           <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg font-black border-4 border-background shadow-xl">E</div>
           <span className="text-[8px] font-black mt-1 uppercase text-teal-600">Editor</span>
        </motion.div>
      </div>
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1, 0.95] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-4 text-[10px] font-black text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
      >
        LIVE COLLABORATION ACTIVE
      </motion.div>
    </div>
  );
}

function ExportAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center bg-blue-500/5 px-4 overflow-hidden">
      <div className="flex gap-2 items-end h-12 mb-4">
        {[30, 70, 45, 90, 60].map((h, i) => (
          <motion.div 
            key={i} 
            animate={{ height: [`${h}%`, `${h - 20}%`, `${h}%`] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            className="w-2 bg-blue-400/40 rounded-t-sm" 
          />
        ))}
      </div>
      <motion.div 
        animate={{ y: [10, 0], opacity: [0, 1] }}
        transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-xl border-2 border-white/20"
      >
        <ChevronDown size={16} strokeWidth={4} />
        <span className="text-[11px] font-black tracking-tight">EXPORT TO PDF/CSV</span>
      </motion.div>
    </div>
  );
}

function MobileAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center bg-rose-500/5 relative overflow-hidden group">
      {/* Rectangular Phone Frame */}
      <motion.div 
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-16 h-28 bg-[#0f172a] border-2 border-slate-800 rounded-xl p-1 relative shadow-2xl mt-4"
      >
        {/* Screen */}
        <div className="w-full h-full bg-background rounded-lg overflow-hidden relative">
          {/* Header */}
          <div className="h-3 w-full bg-rose-500/10 flex items-center px-1 mb-2">
             <div className="w-4 h-0.5 bg-rose-500/20 rounded-full" />
          </div>

          {/* Micro Poll Content */}
          <div className="px-1.5 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center px-0.5">
                <div className="w-6 h-1 bg-muted rounded-full" />
                <span className="text-[5px] font-black opacity-40">65%</span>
              </div>
              <motion.div 
                animate={{ width: ['20%', '65%', '20%'] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                className="h-1.5 bg-rose-500 rounded-sm"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center px-0.5">
                <div className="w-4 h-1 bg-muted rounded-full" />
                <span className="text-[5px] font-black opacity-40">35%</span>
              </div>
              <motion.div 
                animate={{ width: ['10%', '35%', '10%'] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                className="h-1.5 bg-muted rounded-sm"
              />
            </div>
          </div>

          {/* Finger Tap Animation */}
          <motion.div 
            animate={{ 
              scale: [0, 1.2, 0],
              x: [10, 0, 10],
              y: [10, 0, 10],
              opacity: [0, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 2, times: [0, 0.5, 1] }}
            className="absolute bottom-4 right-2 w-4 h-4 bg-white/20 border border-white/40 rounded-full z-20 backdrop-blur-sm pointer-events-none"
          />

          {/* Bottom Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-foreground/10 rounded-full" />
        </div>

        {/* Physical Side Detail */}
        <div className="absolute top-8 -right-[3px] w-1 h-3 bg-slate-700 rounded-r-sm" />
      </motion.div>
    </div>
  );
}

function ImagePollAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center gap-4 bg-amber-500/5 px-4 overflow-hidden">
      <div className="flex gap-4">
        {[ { e: '🍕', l: 'Pizza' }, { e: '🍔', l: 'Burger' } ].map((item, i) => (
          <motion.div 
            key={i}
            animate={{ 
              borderColor: i === 0 ? '#f59e0b' : 'rgba(0,0,0,0.1)',
              scale: i === 0 ? [1, 1.05, 1] : 1,
              y: i === 0 ? [0, -5, 0] : 0
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-20 h-20 bg-background border-4 rounded-2xl flex flex-col items-center justify-center shadow-xl relative overflow-hidden ${i === 0 ? 'border-amber-500' : 'border-foreground/10'}`}
          >
            <span className="text-3xl mb-1">{item.e}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.l}</span>
            {i === 0 && (
              <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-amber-500/10 flex items-center justify-center"
              >
                 <div className="absolute top-1 right-1"><Star size={12} className="text-amber-500 fill-amber-500" /></div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2 max-w-[120px] border border-foreground/5">
        <motion.div animate={{ width: ['30%', '85%', '30%'] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-amber-500" />
      </div>
    </div>
  );
}

function EmailAnim() {
  return (
    <div className="h-32 flex flex-col items-center justify-center bg-teal-500/5 px-4">
      <motion.div 
        animate={{ 
          y: [0, -8, 0],
          rotate: [-3, 3, -3],
          scale: [1, 1.05, 1]
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="w-20 h-14 bg-background border-4 border-teal-500 rounded-2xl flex items-center justify-center relative shadow-2xl"
      >
        <Send size={28} className="text-teal-500 fill-teal-500/5" />
        <motion.div 
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full border-4 border-background flex items-center justify-center text-[10px] font-black text-white"
        >
          1
        </motion.div>
      </motion.div>
      <motion.div 
        animate={{ opacity: [0, 1, 0], y: [10, 0, -10] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        className="mt-4 text-[11px] font-black text-teal-700 bg-teal-100 px-3 py-1 rounded-full border border-teal-500/20 shadow-sm"
      >
        POLL RESULTS READY!
      </motion.div>
    </div>
  );
}

// --- Data ---
const features = [
  { icon: Zap, title: 'Real-time Voting', desc: 'Votes appear instantly via Socket.io. No refresh needed.', color: 'text-amber-500', bg: 'bg-amber-500/10', anim: <VotingAnim /> },
  { icon: BarChart3, title: 'Animated Analytics', desc: 'Pie charts and progress bars animate as votes come in.', color: 'text-teal-500', bg: 'bg-teal-500/10', anim: <AnalyticsAnim /> },
  { icon: Shield, title: 'Anti-Spam Protection', desc: 'Redis-powered rate limiting: 10 votes/min per IP.', color: 'text-rose-500', bg: 'bg-rose-500/10', anim: <SpamAnim /> },
  { icon: Users, title: 'Auth-Protected Polls', desc: 'Restrict voting to signed-in users with Clerk auth.', color: 'text-violet-500', bg: 'bg-violet-500/10', anim: <AuthAnim /> },
  { icon: Share2, title: 'Instant Share Links', desc: 'One click to copy and share your poll with anyone.', color: 'text-blue-500', bg: 'bg-blue-500/10', anim: <ShareAnim /> },
  { icon: Trophy, title: 'Winner Detection', desc: 'Most voted option is automatically highlighted.', color: 'text-orange-500', bg: 'bg-orange-500/10', anim: <WinnerAnim /> },
  { icon: Clock, title: 'Poll Expiry System', desc: 'Set expiry time and polls auto-close when done.', color: 'text-green-500', bg: 'bg-green-500/10', anim: <ExpiryAnim /> },
  { icon: Moon, title: 'Dark / Light Mode', desc: 'Full theme support that respects your preference.', color: 'text-indigo-500', bg: 'bg-indigo-500/10', anim: <ThemeAnim /> },
];

const faqs = [
  { q: 'Is PollSphere free to use?', a: 'Yes! PollSphere is completely free. Create unlimited polls, share them, and view analytics at no cost.' },
  { q: 'How many questions can I add per poll?', a: 'You can add as many questions as you need. Each question supports multiple options.' },
  { q: 'How does real-time voting work?', a: 'We use Socket.io WebSockets. When someone votes, all connected viewers see the update instantly — no page refresh needed.' },
  { q: 'Can I restrict who votes?', a: 'Yes! You can set a poll to "Authenticated Only" mode, which requires voters to sign in with their Google account.' },
  { q: 'What happens when a poll expires?', a: 'After expiry, the poll closes automatically and redirects voters to the final results page.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use Clerk for authentication, Redis for rate limiting, and MongoDB Atlas for encrypted data storage.' },
  { q: 'Can I use PollSphere for large events?', a: 'Yes! Our Redis adapter enables horizontal scaling, so PollSphere can handle thousands of concurrent voters.' },
];

const roadmap = [
  { label: 'AI Sentiment Analysis', desc: 'Auto-analyze voter comments for deep mood insights.', status: 'soon', anim: <AiSentimentAnim />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Image-Based Polls', desc: 'Add visual context to your polls with image options.', status: 'soon', anim: <ImagePollAnim />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Team Workspaces', desc: 'Collaborate with your team in shared folders.', status: 'planned', anim: <CollabAnim />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Analytics Export', desc: 'Export high-quality CSV/PDF reports in one click.', status: 'planned', anim: <ExportAnim />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Email Notifications', desc: 'Get instant alerts when your polls conclude.', status: 'planned', anim: <EmailAnim />, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { label: 'Mobile App', desc: 'Vote and track on the go with our native app.', status: 'future', anim: <MobileAnim />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

// --- Constants ---
// --- CTA Micro Animation ---
function CtaMicroJourney() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-[480px] h-64 mx-auto bg-background border-2 border-foreground rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden relative group">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full h-full flex flex-col justify-center p-8 text-left"
          >
            <div className="text-xs font-black text-primary uppercase mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Step 1: Create Poll
            </div>
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded-xl border-2 border-foreground/10 flex items-center px-4 text-xs font-bold shadow-inner italic">
                "What should we name the new baby?"
              </div>
              <div className="flex gap-2">
                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex-1 h-8 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center px-3 text-[10px] font-black">Option A: Leo</motion.div>
                <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="flex-1 h-8 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-center px-3 text-[10px] font-black">Option B: Max</motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="w-full h-full flex flex-col justify-center items-center p-8 bg-slate-900 overflow-hidden relative"
          >
            <div className="absolute top-4 left-6 text-[10px] font-black text-emerald-400 uppercase tracking-widest z-20">Step 2: Launching</div>
            
            {/* Rocket Smoke Particles */}
            <motion.div 
              animate={{ opacity: [0, 0.5, 0], scale: [1, 2], y: [20, 40] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute bottom-10 w-20 h-20 bg-white/20 blur-xl rounded-full"
            />

            <motion.div 
              animate={{ y: [-5, 5, -5], rotate: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="relative z-10"
            >
              <div className="text-6xl">🚀</div>
            </motion.div>
            
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }}
              className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              GOING LIVE...
            </motion.div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="w-full h-full flex items-center p-8 gap-6"
          >
            <div className="flex-1">
              <div className="text-xs font-black text-violet-500 uppercase mb-4">Step 3: Results</div>
              <div className="space-y-3">
                {[80, 45, 65].map((w, i) => (
                  <div key={i} className="h-4 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ type: "spring", delay: 0.5 + (i * 0.2) }}
                      className={`h-full ${['bg-emerald-500', 'bg-blue-500', 'bg-violet-500'][i]}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-8 border-violet-500/20 border-t-violet-500 flex items-center justify-center"
            >
              <div className="text-[10px] font-black">742 Votes</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2].map((i) => (
          <motion.div 
            key={i} 
            animate={{ width: step === i ? 24 : 8 }}
            className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'bg-primary' : 'bg-foreground/10'}`} 
          />
        ))}
      </div>
    </div>
  );
}

// --- HERO LIVE SHOWCASE (5s Cycle) ---
function HeroLiveShowcase() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev + 1) % 8);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background border-2 border-foreground rounded-[2.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)] p-8 h-[450px] relative overflow-hidden group">
      <AnimatePresence mode="wait">
        {/* Scene 0: Active High-Speed Voting - Live Battle Mode */}
        {scene === 0 && (
          <motion.div key="v0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded uppercase animate-pulse">Live Battle</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">High Traffic Poll #482</span>
            </div>
            <h3 className="text-2xl font-black mb-6 leading-tight">What's your favorite<br />frontend framework?</h3>
            <div className="space-y-4">
              {[ 
                { l: 'React', p: 45, c: 'bg-teal-400' }, 
                { l: 'Next.js', p: 32, c: 'bg-amber-400' },
                { l: 'Vue.js', p: 15, c: 'bg-violet-400' },
                { l: 'Svelte', p: 8, c: 'bg-rose-400' }
              ].map((o, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between text-[11px] font-black mb-1">
                    <span>{o.l}</span>
                    <motion.span 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        color: [null, '#14b8a6', null]
                      }} 
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        delay: i * 0.3 
                      }}
                    >
                      {o.p}%
                    </motion.span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden border border-foreground/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ 
                        width: [`${o.p}%`, `${o.p + 2}%`, `${o.p - 1}%`, `${o.p}%`] 
                      }} 
                      transition={{ 
                        initial: { duration: 0.8 },
                        width: { 
                          repeat: Infinity, 
                          duration: 3, 
                          ease: "easeInOut",
                          delay: 0.8
                        }
                      }}
                      className={`h-full ${o.c} relative`} 
                    >
                      {/* Internal Sheen/Glow */}
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }} 
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }} 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                      />
                    </motion.div>
                  </div>
                  {i === 0 && (
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }} 
                      transition={{ repeat: Infinity, duration: 1 }} 
                      className="absolute -right-4 top-0 text-xs"
                    >🔥</motion.div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto flex justify-around">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <motion.div 
                  key={i} 
                  animate={{ 
                    y: [0, -250], 
                    x: [0, (i % 2 === 0 ? 30 : -30)],
                    opacity: [0, 1, 0], 
                    scale: [0.5, 1.2, 0.5] 
                  }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }} 
                  className="text-primary font-black text-[10px]"
                >+1</motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scene 1: How to Create a Poll - Interactive Flow */}
        {scene === 1 && (
          <motion.div key="v1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
             <div className="w-full max-w-[340px] bg-muted/20 border-2 border-foreground/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                {/* Simulated Cursor */}
                <motion.div 
                  animate={{ 
                    x: [100, 150, 120, 250], 
                    y: [100, 40, 150, 240],
                    scale: [1, 0.9, 1] 
                  }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute z-30 pointer-events-none"
                >
                  <MousePointer2 size={24} className="text-primary fill-primary" />
                </motion.div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* Step 1: Input Question */}
                <div className="mb-4">
                   <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Question</div>
                   <div className="h-10 bg-background border-2 border-foreground/10 rounded-xl flex items-center px-3 text-xs font-bold text-foreground/60 italic overflow-hidden">
                      <motion.span
                        animate={{ 
                          textContent: ["", "What's the best drink?", "What's the best drink?"] 
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        What's the best drink?
                      </motion.span>
                      <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-4 bg-primary ml-1" />
                   </div>
                </div>

                {/* Step 2: Options */}
                <div className="space-y-2 mb-6">
                   <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Options</div>
                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="h-8 bg-background border border-foreground/5 rounded-lg flex items-center px-3 text-[10px] font-bold">☕ Coffee</motion.div>
                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="h-8 bg-background border border-foreground/5 rounded-lg flex items-center px-3 text-[10px] font-bold">🍵 Green Tea</motion.div>
                </div>

                {/* Step 3: Create Button */}
                <motion.div 
                  animate={{ 
                    backgroundColor: [null, '#14b8a6', null],
                    scale: [1, 0.95, 1] 
                  }}
                  transition={{ delay: 3, duration: 0.5, repeat: Infinity, repeatDelay: 3.5 }}
                  className="w-full h-10 bg-foreground text-background rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                >
                  Create Live Poll <Send size={12} />
                </motion.div>

                {/* Step 4: Success Overlay */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1, 1, 0.8]
                  }}
                  transition={{ delay: 3.2, duration: 1.5, repeat: Infinity, repeatDelay: 2.5 }}
                  className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 text-white">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-500">Poll Created!</div>
                </motion.div>
             </div>
             <div className="mt-6 text-xs font-black text-muted-foreground uppercase tracking-[0.2em] italic">Go from Idea to Live in 30s</div>
          </motion.div>
        )}

        {/* Scene 2: Advanced Analytics Dashboard - Redesigned */}
        {scene === 2 && (
          <motion.div key="v2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="h-full flex flex-col relative">
             {/* Background Data Grid Overlay */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             
             <div className="flex items-center gap-2 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart3 size={16} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Advanced Insights</span>
                <span className="text-[8px] font-bold text-muted-foreground">Analyzing 1,240 responses</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-5 gap-6 relative z-10">
              {/* Left: Big Circular Stat */}
              <div className="col-span-2 bg-muted/20 rounded-[2rem] border-2 border-foreground/5 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Rotating Segments */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-[6px] border-primary/10 border-t-primary border-r-emerald-500/40" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border-[4px] border-violet-500/10 border-b-violet-500/40" />
                  
                  <div className="text-center">
                    <div className="text-[8px] font-black uppercase text-muted-foreground mb-[-2px]">Winner</div>
                    <div className="text-xl font-black italic text-primary">React</div>
                    <div className="text-[9px] font-black text-foreground/60 leading-none">58%</div>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Bars */}
              <div className="col-span-3 space-y-3 flex flex-col justify-center">
                {[ 
                  { l: 'React', p: 70, c: 'bg-primary' }, 
                  { l: 'Next.js', p: 45, c: 'bg-emerald-500' }, 
                  { l: 'Vue.js', p: 25, c: 'bg-violet-500' } 
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/30 p-2.5 rounded-xl border border-foreground/5 flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${stat.c}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] font-black mb-1">
                        <span>{stat.l}</span>
                        <span className="text-muted-foreground">{stat.p}%</span>
                      </div>
                      <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stat.p}%` }} className={`h-full ${stat.c}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted/10 p-2 rounded-lg border border-foreground/5">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Metrics</div>
              <span>·</span>
              <div className="flex items-center gap-1.5"><Users size={10} /> Global Data</div>
            </div>
          </motion.div>
        )}

        {/* Scene 3: Poll Expiry Countdown */}
        {scene === 3 && (
          <motion.div key="v3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-rose-500 flex items-center justify-center mb-6 relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-1 border-t-4 border-rose-500 rounded-full opacity-50" />
              <Clock size={40} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black mb-2">Expiring Soon</h3>
            <div className="text-4xl font-black tabular-nums text-rose-500">00:03</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }} className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-black text-sm">POLL CLOSED 🔒</motion.div>
          </motion.div>
        )}

        {/* Scene 4: Live Voter Feed */}
        {scene === 4 && (
          <motion.div key="v4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-foreground">Live Voter Feed</span>
            </div>
            <div className="space-y-3">
              {['New York, US', 'London, UK', 'Tokyo, JP'].map((loc, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="p-3 bg-muted/40 rounded-xl border border-foreground/5 flex justify-between items-center">
                  <div className="flex flex-col"><span className="text-[10px] font-black">User #{842+i}</span><span className="text-[8px] font-bold text-muted-foreground">{loc}</span></div>
                  <div className="text-[9px] font-black text-primary">Voted ✓</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scene 5: Social Sharing Pulse */}
        {scene === 5 && (
          <motion.div key="v5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="h-full flex flex-col items-center justify-center text-center">
             <div className="relative w-full max-w-[300px] h-48">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 m-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center z-10 shadow-xl">
                  <Share2 size={32} className="text-white" />
                </motion.div>
                {/* Social Icons Flying Out */}
                {[MessageSquare, Hash, Globe, MessageCircle].map((Icon, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      x: [(i === 0 || i === 3 ? -100 : 100)], 
                      y: [(i < 2 ? -60 : 60)],
                      opacity: [0, 1, 1],
                      scale: [0.5, 1, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                    className="absolute inset-0 m-auto w-12 h-12 bg-background border-2 border-foreground/10 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <Icon size={24} className="text-primary" />
                  </motion.div>
                ))}
             </div>
             <h3 className="text-xl font-black mt-4">One-Click Sharing</h3>
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Connect with Slack, Discord & more</p>
          </motion.div>
        )}

        {/* Scene 6: Security Radar */}
        {scene === 6 && (
          <motion.div key="v6" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 rounded-full border-2 border-rose-500/20 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent" />
              <Shield size={64} className="text-rose-500" />
            </div>
            <div className="mt-6 bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl">BOTS DETECTED: 0</div>
          </motion.div>
        )}

        {/* Scene 7: Viral Poll - Real-time Voting Increase */}
        {scene === 7 && (
          <motion.div key="v7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center bg-slate-950 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="z-10 w-full max-w-[320px]">
              <div className="flex flex-col items-center mb-8">
                 <div className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase animate-pulse mb-3">Viral Activity</div>
                 <h3 className="text-xl font-black text-white text-center italic leading-tight">"Is PollSphere the fastest<br />polling platform?"</h3>
              </div>

              {/* Massive Counter */}
              <div className="flex flex-col items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-black text-primary/80 uppercase tracking-[0.3em] mb-1 text-center">Live Total Votes</span>
                <div className="text-5xl font-black italic text-white flex items-center">
                  <motion.span
                    animate={{ 
                      textContent: [12401, 12408, 12415, 12422, 12435, 12440] 
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="tabular-nums"
                  >
                    12401
                  </motion.span>
                </div>
              </div>

              {/* Increasing Bars */}
              <div className="space-y-4">
                {[ 
                  { l: 'YES, ABSOLUTELY!', p: 85, c: 'bg-primary' }, 
                  { l: 'YES!', p: 15, c: 'bg-white/20' } 
                ].map((o, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between text-[10px] font-black text-white/80 mb-1 uppercase italic">
                      <span>{o.l}</span>
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>{o.p}%</motion.span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: `${o.p-5}%` }} 
                        animate={{ width: `${o.p}%` }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className={`h-full ${o.c}`} 
                      />
                    </div>
                    {i === 0 && (
                      <div className="absolute -top-6 right-0 flex gap-1">
                        {[1,2,3,4].map(p => (
                          <motion.span
                            key={p}
                            animate={{ y: [0, -40], x: [0, (p%2==0?20:-20)], opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: p * 0.2 }}
                            className="text-primary font-black text-[10px]"
                          >+1</motion.span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Background Streamer Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [-20, 450], 
                  opacity: [0, 0.2, 0],
                  x: Math.random() * 400 - 200
                }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                className="absolute w-0.5 h-10 bg-primary/30"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-6 h-1 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: scene === i ? '100%' : '0%' }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- FAQ Micro Animations ---
function FaqMicroAnim({ index }: { index: number }) {
  const animations = [
    // 0: Free
    <div className="flex items-center justify-center gap-6 py-6 px-8 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/20 mb-4 overflow-hidden relative">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center">
        <div className="text-4xl font-black text-emerald-500">$0</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">Total Cost</div>
      </motion.div>
      <div className="h-12 w-px bg-foreground/10" />
      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="bg-amber-400 text-background px-3 py-1 rounded-full text-[10px] font-black shadow-lg">FREE FOREVER</motion.div>
    </div>,

    // 1: Questions
    <div className="flex flex-col items-center justify-center py-6 px-8 bg-blue-500/5 rounded-2xl border-2 border-blue-500/20 mb-4">
      <div className="flex gap-2 mb-3">
        {[1, 2, 3].map(i => (
          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ delay: i * 0.2, repeat: Infinity }} className="w-10 h-10 bg-background border-2 border-blue-500/30 rounded-xl flex items-center justify-center font-black text-blue-500 shadow-sm">Q{i}</motion.div>
        ))}
        <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center text-muted-foreground/50 font-black">...</div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">No Question Limits</div>
    </div>,

    // 2: Real-time
    <div className="flex items-center justify-center gap-6 py-6 px-8 bg-violet-500/5 rounded-2xl border-2 border-violet-500/20 mb-4 overflow-hidden">
      <div className="relative">
        <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -inset-4 border-2 border-violet-500 rounded-full" />
        <Zap size={32} className="text-violet-500 relative z-10" />
      </div>
      <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1 rounded-md">
        <div className="w-2 h-2 bg-white rounded-full" />
        <span className="text-[10px] font-black tracking-tighter">LIVE UPDATES</span>
      </motion.div>
    </div>,

    // 3: Auth
    <div className="flex items-center justify-center gap-6 py-6 px-8 bg-rose-500/5 rounded-2xl border-2 border-rose-500/20 mb-4">
      <div className="text-center">
        <Users size={28} className="text-muted-foreground mx-auto mb-1" />
        <div className="text-[8px] font-black opacity-40">PUBLIC</div>
      </div>
      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-rose-500">
        <ArrowRight size={20} strokeWidth={3} />
      </motion.div>
      <div className="text-center">
        <div className="relative inline-block">
          <Users size={28} className="text-emerald-500 mx-auto mb-1" />
          <Lock size={12} className="absolute -top-1 -right-1 text-emerald-600 bg-background rounded-full" />
        </div>
        <div className="text-[8px] font-black text-emerald-600">AUTH ONLY</div>
      </div>
    </div>,

    // 4: Expiry
    <div className="flex items-center justify-center gap-6 py-6 px-8 bg-amber-500/5 rounded-2xl border-2 border-amber-500/20 mb-4">
      <div className="text-center">
        <Clock size={32} className="text-amber-500 mx-auto mb-1" />
        <div className="text-[10px] font-black text-amber-600/60 uppercase">Auto-Close</div>
      </div>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="bg-muted px-4 py-2 rounded-xl border border-foreground/10">
        <div className="text-xs font-black font-mono">00:59:59</div>
      </motion.div>
    </div>,

    // 5: Security
    <div className="flex items-center justify-center gap-6 py-6 px-8 bg-teal-500/5 rounded-2xl border-2 border-teal-500/20 mb-4">
      <motion.div animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 4 }} className="text-teal-500">
        <Shield size={40} />
      </motion.div>
      <div>
        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs">
          <div className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px]">✓</div>
          SECURE
        </div>
        <div className="text-[9px] font-bold text-muted-foreground mt-1 tracking-tight">End-to-End Encrypted</div>
      </div>
    </div>,

    // 6: Scale
    <div className="flex flex-col items-center justify-center py-6 px-8 bg-indigo-500/5 rounded-2xl border-2 border-indigo-500/20 mb-4 overflow-hidden relative">
      <div className="flex items-end gap-1 mb-2">
        {[10, 15, 25, 40, 20, 30].map((h, i) => (
          <motion.div key={i} animate={{ height: [h, h+10, h] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }} className="w-3 bg-indigo-500 rounded-t-sm" />
        ))}
      </div>
      <motion.div animate={{ opacity: [0.6, 1, 0.6] }} className="text-lg font-black text-indigo-600">10,000+ VOTES</motion.div>
      <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">High Traffic Capacity</div>
    </div>
  ];

  return animations[index] || null;
}

// FAQ Item
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 border-foreground rounded-2xl overflow-hidden transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] ${open ? 'bg-muted/30' : 'bg-background'}`}>
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex justify-between items-center p-6 text-left font-black text-lg hover:bg-muted/50 transition-colors"
      >
        <span className="pr-4">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="shrink-0 text-primary"
        >
          <ChevronDown size={24} strokeWidth={3} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed border-t-2 border-foreground/10 pt-4">
              <FaqMicroAnim index={index} />
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Live Demo Section — interactive vote simulation
const DEMO_OPTIONS = [
  { label: 'React + Node.js', color: 'bg-teal-500', votes: 0 },
  { label: 'Next.js + Prisma', color: 'bg-amber-500', votes: 0 },
  { label: 'Vue + Django', color: 'bg-violet-500', votes: 0 },
  { label: 'Svelte + Go', color: 'bg-rose-500', votes: 0 },
];

function LiveDemoSection() {
  const [selected, setSelected] = useState(0);
  const [votes, setVotes] = useState([42, 28, 19, 11]);
  const [total, setTotal] = useState(100);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });

  // Auto-cycle votes — faster speed for more energy
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => {
      const next = Math.floor(Math.random() * 4);
      setSelected(next);
      setVotes(prev => {
        const updated = [...prev];
        updated[next] += 1;
        return updated;
      });
      setTotal(prev => prev + 1);
    }, 800);
    return () => clearInterval(t);
  }, [inView]);

  const maxVotes = Math.max(...votes);

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">See It In Action</span>
          <h2 className="text-5xl font-black tracking-tight mt-2">Watch Votes Happen Live</h2>
          <p className="text-muted-foreground font-medium mt-4 max-w-lg mx-auto">This is a real simulation — votes are being cast automatically right now.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* LEFT: Poll card with animated radio buttons */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-background border-2 border-foreground rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Live Poll</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-black text-green-500">
                <motion.span className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                LIVE
              </span>
            </div>
            <h3 className="text-xl font-black mb-1 mt-3">What's your favourite dev stack?</h3>
            <p className="text-xs text-muted-foreground font-bold mb-6">Auto-voting in progress...</p>

            {/* Options with animated radio */}
            <div className="space-y-3 flex-1">
              {DEMO_OPTIONS.map((opt, i) => (
                <motion.div key={opt.label}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${selected === i ? 'border-primary bg-primary/5' : 'border-foreground/20 bg-muted/20'}`}
                  animate={{ scale: selected === i ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                  {/* Animated Radio */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === i ? 'border-primary' : 'border-foreground/30'}`}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-primary"
                      animate={{ scale: selected === i ? 1 : 0, opacity: selected === i ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    />
                  </div>
                  <span className={`font-bold text-sm flex-1 ${selected === i ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</span>
                  {selected === i && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-black text-primary">✓</motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Live voter count */}
            <div className="mt-6 pt-4 border-t-2 border-foreground/10 flex items-center gap-2">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-sm font-black text-muted-foreground">
                <motion.span key={total} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-foreground">
                  {total}
                </motion.span> votes cast
              </span>
              <span className="ml-auto text-xs font-black text-muted-foreground">Updates every 1.8s</span>
            </div>
          </motion.div>

          {/* RIGHT: Live analytics bars */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-background border-2 border-foreground rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-primary" />
              <h3 className="font-black text-lg">Live Analytics</h3>
              <span className="ml-auto text-xs font-black text-muted-foreground bg-muted px-2 py-1 rounded-lg">Auto-updating</span>
            </div>

            {/* Animated bars */}
            <div className="space-y-5 flex-1">
              {DEMO_OPTIONS.map((opt, i) => {
                const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
                const isWinner = votes[i] === maxVotes;
                return (
                  <div key={opt.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        {isWinner && <Trophy size={14} className="text-amber-500" />}
                        <span className={`text-sm font-black ${isWinner ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</span>
                      </div>
                      <motion.span
                        key={pct}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-black tabular-nums"
                      >
                        {pct}%
                      </motion.span>
                    </div>
                    <div className="h-4 bg-muted rounded-full border border-foreground/10 overflow-hidden relative shadow-inner">
                      <motion.div
                        className={`h-full ${opt.color} rounded-full`}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">{votes[i]} votes</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-foreground/10 h-[150px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Background Track Pie */}
                  <Pie
                    data={[{ value: 100 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    stroke="none"
                    fill="currentColor"
                    className="text-muted/20"
                    isAnimationActive={false}
                  />
                  {/* Main Data Pie */}
                  <Pie
                    data={DEMO_OPTIONS.map((o, i) => ({ name: o.label, value: votes[i] }))}
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={65} 
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={true} 
                    animationDuration={1500}
                    animationBegin={0}
                    animationEasing="ease-in-out"
                  >
                    {DEMO_OPTIONS.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={['#14b8a6','#f59e0b','#8b5cf6','#f43f5e'][idx]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[10px] font-black uppercase text-muted-foreground">Live Feed</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// --- MICRO ANIMATION COMPONENTS ---

function StepCreateAnim() {
  return (
    <div className="w-full h-32 bg-muted/30 rounded-2xl border-2 border-foreground/5 overflow-hidden relative p-4 font-sans">
      <div className="flex gap-1 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
      
      <div className="space-y-2 relative z-10">
        {/* Question Typing Simulation */}
        <div className="h-7 bg-background border border-foreground/10 rounded-lg flex items-center px-2 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }} animate={{ width: "100%" }} 
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="flex items-center gap-1.5"
          >
            <div className="h-1.5 w-24 bg-primary/40 rounded-full" />
            <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 h-3 bg-primary" />
          </motion.div>
        </div>

        {/* Options Selection */}
        <div className="flex gap-2">
          {[0.2, 0.4].map((delay, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: delay }}
              className={`flex-1 h-5 rounded-md border flex items-center px-2 ${i === 0 ? 'bg-primary/10 border-primary/20' : 'bg-background border-foreground/5'}`}
            >
              <div className={`h-1 w-6 rounded-full ${i === 0 ? 'bg-primary/40' : 'bg-foreground/10'}`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Mouse & Click Interaction */}
      <motion.div 
        animate={{ 
          x: [120, 140, 120], 
          y: [60, 40, 60],
          scale: [1, 0.9, 1] 
        }} 
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-4 right-10 z-20 text-primary drop-shadow-lg"
      >
        <MousePointer2 size={16} fill="currentColor" />
        <motion.div 
          animate={{ scale: [0, 2, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.6] }}
          className="absolute inset-0 bg-primary rounded-full"
        />
      </motion.div>

      {/* Action Button */}
      <motion.div 
        animate={{ 
          scale: [1, 1.03, 1],
          boxShadow: ['0 0 0px rgba(20,184,166,0)', '0 0 10px rgba(20,184,166,0.2)', '0 0 0px rgba(20,184,166,0)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-3 left-4 right-4 h-7 rounded-lg bg-primary flex items-center justify-center text-[9px] font-black text-white uppercase tracking-tighter"
      >
        <Rocket size={10} className="mr-1.5" /> CREATE POLL
      </motion.div>
    </div>
  );
}

function StepShareAnim() {
  return (
    <div className="w-full h-32 bg-muted/30 rounded-2xl border-2 border-foreground/5 overflow-hidden relative p-4 flex flex-col justify-center gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Share Link</span>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex gap-0.5">
          {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary" />)}
        </motion.div>
      </div>

      {/* Link Bar with Copy Feedback */}
      <div className="relative z-10 bg-background border-2 border-foreground/10 rounded-xl p-2 flex items-center gap-3 shadow-md">
        <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center">
          <Globe size={12} className="text-primary" />
        </div>
        <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-150, 200] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="w-24 h-full bg-primary/20"
          />
        </div>
        <motion.div 
          animate={{ 
            backgroundColor: ['#14b8a6', '#22c55e', '#14b8a6'],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2 py-1 bg-primary rounded-md text-[7px] font-black text-white"
        >
          COPIED!
        </motion.div>
      </div>

      {/* Multi-Channel Sharing Simulation */}
      <div className="flex justify-center gap-5 mt-2">
        {[MessageSquare, Share2, Globe].map((Icon, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, y: 10 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              y: [10, 0, 0],
              opacity: [0, 1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            className="w-9 h-9 bg-background border-2 border-foreground/5 rounded-2xl flex items-center justify-center shadow-lg text-primary"
          >
            <Icon size={16} />
          </motion.div>
        ))}
        
        {/* Flying Delivery Paper Plane */}
        <motion.div 
          initial={{ x: -60, y: 0, rotate: -20, opacity: 0 }}
          animate={{ 
            x: [0, 200], 
            y: [0, -60], 
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeIn" }}
          className="absolute left-10 bottom-6 text-primary"
        >
          <Send size={20} fill="currentColor" />
        </motion.div>
      </div>
    </div>
  );
}

function StepAnalyzeAnim() {
  const [bars] = useState([30, 85, 25, 60]);
  
  return (
    <div className="w-full h-32 bg-muted/30 rounded-2xl border-2 border-foreground/5 overflow-hidden relative p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }} 
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          />
          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Live Audience</span>
        </div>
        <div className="flex -space-x-1.5">
          {[1,2,3,4].map(i => (
            <motion.div 
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-5 h-5 rounded-full border-2 border-background bg-primary flex items-center justify-center overflow-hidden shadow-sm"
            >
              <Users size={10} className="text-white" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bar Chart with Floating Voters */}
      <div className="flex-1 flex items-end gap-2.5 justify-center px-4 relative">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div 
              animate={{ 
                height: i === 1 ? ["85%", "95%", "85%"] : [`${h}%`],
                opacity: i === 1 ? 1 : 0.6
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-full rounded-t-lg relative ${i === 1 ? 'bg-primary shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-foreground/20'}`}
              style={{ height: `${h}%` }}
            >
              {i === 1 && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-md"
                  >
                    <Trophy size={14} fill="currentColor" />
                  </motion.div>
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-white/20 skew-x-12" />
                </>
              )}
            </motion.div>
          </div>
        ))}

        {/* Incoming Vote Particles */}
        {[0,1].map(i => (
          <motion.div 
            key={i}
            initial={{ y: 20, x: i === 0 ? -20 : 120, opacity: 0 }}
            animate={{ y: [-20, -100], x: i === 0 ? 30 : 60, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.8 }}
            className="absolute z-20"
          >
            <div className="w-4 h-4 bg-primary/20 rounded-full border border-primary/40 flex items-center justify-center">
              <Users size={8} className="text-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const HomePage: React.FC = () => {
  // Hero card — dynamic live votes
  const [heroVotes, setHeroVotes] = useState([45, 30, 25]);
  const heroTotal = heroVotes.reduce((a, b) => a + b, 0);

  useEffect(() => {
    const t = setInterval(() => {
      const next = Math.floor(Math.random() * 3);
      setHeroVotes(prev => {
        const updated = [...prev];
        updated[next] += 1;
        return updated;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center relative pt-24 pb-16 px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Live & Real-time</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Real-time Polls.<br />
              <span className="text-primary">Instant</span> Insights.
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-8 max-w-lg">
              Create powerful polls, share instantly, and watch live results with beautiful animated charts. Built for teams, events & communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-lg rounded-2xl border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                    Start for Free <ArrowRight size={20} />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/create-poll">
                  <button className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-lg rounded-2xl border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                    Create Poll <ArrowRight size={20} />
                  </button>
                </Link>
              </SignedIn>
              <a href="#features" className="flex items-center gap-2 px-8 py-4 bg-background font-black text-lg rounded-2xl border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                See Features <ChevronDown size={20} />
              </a>
            </div>
          </motion.div>

          {/* Right — Dynamic Hero Showcase Window */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <HeroLiveShowcase />
          </motion.div>
        </div>
      </section>


      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Everything You Need</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">Packed with Features</h2>
            <p className="text-muted-foreground font-medium mt-4 max-w-xl mx-auto">From real-time analytics to spam protection — PollSphere has it all.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group relative p-6 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden cursor-default flex flex-col min-h-[220px]"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-3 border-2 border-foreground/10 shrink-0`}>
                  <f.icon size={24} className={f.color} />
                </div>

                {/* Title */}
                <h3 className="font-black text-lg mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-[13px] font-medium leading-tight mb-4">{f.desc}</p>

                {/* Mini Animation Preview Window - Storytelling focus */}
                <div className={`mt-auto rounded-xl border border-foreground/10 bg-muted/20 overflow-hidden`}>
                  {f.anim}
                </div>

                {/* Bottom accent line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07 + 0.3 }}
                  style={{ originX: 0 }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${f.bg.replace('/10', '')} opacity-60`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/20 border-y-2 border-foreground/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-24">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Simple Process</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">How It Works</h2>
            <p className="text-muted-foreground font-medium mt-4 max-w-lg mx-auto">Get your poll live in less than 60 seconds with our streamlined workflow.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                icon: Rocket, 
                title: 'Create', 
                color: 'text-amber-500', 
                bg: 'bg-amber-500/10', 
                border: 'border-amber-500/30', 
                desc: 'Design your poll with unlimited questions and custom options.',
                anim: <StepCreateAnim />
              },
              { 
                step: '02', 
                icon: Share2, 
                title: 'Share', 
                color: 'text-teal-500', 
                bg: 'bg-teal-500/10', 
                border: 'border-teal-500/30', 
                desc: 'Copy the unique link and share via WhatsApp or social media.',
                anim: <StepShareAnim />
              },
              { 
                step: '03', 
                icon: BarChart3, 
                title: 'Analyze', 
                color: 'text-violet-500', 
                bg: 'bg-violet-500/10', 
                border: 'border-violet-500/30', 
                desc: 'Watch votes roll in live with real-time counts and charts.',
                anim: <StepAnalyzeAnim />
              },
            ].map((item, i) => (
              <motion.div key={item.step} className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}>

                {/* Step Icon & Number */}
                <div className="relative mb-8">
                  <div className={`relative w-20 h-20 ${item.bg} border-2 border-foreground rounded-[2rem] flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all`}>
                    <item.icon size={36} className={item.color} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-9 h-9 bg-primary text-primary-foreground rounded-xl border-2 border-foreground flex items-center justify-center font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                
                {/* Animation Window */}
                <div className="mb-6 w-full p-2 bg-background border-2 border-foreground rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
                  {item.anim}
                </div>

                <p className="text-muted-foreground font-medium leading-relaxed text-sm max-w-[240px]">{item.desc}</p>
                
                {/* Visual Arrow for desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 -right-8 z-0 text-foreground/20">
                    <ArrowRight size={32} strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO SHOWCASE */}
      <LiveDemoSection />

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-muted/20 border-y-2 border-foreground/10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Got Questions?</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">Frequently Asked</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <FaqItem q={faq.q} a={faq.a} index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">What's Coming</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">Future Roadmap</h2>
            <p className="text-muted-foreground font-medium mt-4">We're constantly building. Here's what's coming next.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmap.map((item, i) => {
              const badgeMap: Record<string, string> = { 
                soon: 'bg-green-100 text-green-700 border-green-300', 
                planned: 'bg-amber-100 text-amber-700 border-amber-300', 
                future: 'bg-blue-100 text-blue-700 border-blue-300' 
              };
              return (
                <motion.div 
                  key={item.label} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-6 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color} border border-current/20`}>
                       <Rocket size={18} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeMap[item.status]}`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-black text-lg mb-1">{item.label}</h3>
                  <p className="text-muted-foreground text-[12px] font-medium leading-tight mb-4">{item.desc}</p>

                  <div className="mt-auto bg-muted/20 border border-foreground/5 rounded-xl overflow-hidden h-32">
                     {item.anim}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER - SLIM & WIDE VERSION */}
      <section className="py-12 px-6 bg-muted/30 border-t-2 border-foreground/10 overflow-hidden relative">
        {/* Background Blobs for depth */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-background border-2 border-foreground rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] py-10 px-8 sm:px-16 text-center relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              
              {/* Left Side: Message */}
              <div className="text-left flex-1">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 leading-none">
                  Ready to Launch Your<br />
                  <motion.span 
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] text-transparent bg-clip-text"
                  >
                    First Poll?
                  </motion.span>
                </h2>
                <p className="text-muted-foreground font-medium text-lg mb-6 max-w-md">
                  Free forever. No credit card required. Just powerful polling for everyone.
                </p>
                
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black text-lg rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      Get Started Free <ArrowRight size={20} />
                    </motion.button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/create-poll" search={{ pollId: undefined }}>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black text-lg rounded-xl border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      Create a Poll Now <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                </SignedIn>
              </div>

              {/* Right Side: Micro Animation */}
              <div className="w-full md:w-auto shrink-0">
                <CtaMicroJourney />
                <div className="flex items-center justify-center gap-4 text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-2">
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> No Card</div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Instant</div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

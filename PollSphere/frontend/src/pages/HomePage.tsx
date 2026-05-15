import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Zap, Users, BarChart3, Shield, Share2, Trophy, Clock, Moon,
  ChevronDown, ChevronUp, ArrowRight, Rocket,
  Activity, Star, Globe, Send, MousePointer2, MessageSquare, Plus
} from 'lucide-react';

// --- Data ---
const features = [
  { icon: Zap, title: 'Real-time Voting', desc: 'Votes appear instantly via Socket.io. No refresh needed.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: BarChart3, title: 'Animated Analytics', desc: 'Pie charts and progress bars animate as votes come in.', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { icon: Shield, title: 'Anti-Spam Protection', desc: 'Redis-powered rate limiting: 10 votes/min per IP.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { icon: Users, title: 'Auth-Protected Polls', desc: 'Restrict voting to signed-in users with Clerk auth.', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: Share2, title: 'Instant Share Links', desc: 'One click to copy and share your poll with anyone.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Trophy, title: 'Winner Detection', desc: 'Most voted option is automatically highlighted.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Clock, title: 'Poll Expiry System', desc: 'Set expiry time and polls auto-close when done.', color: 'text-green-500', bg: 'bg-green-500/10' },
  { icon: Moon, title: 'Dark / Light Mode', desc: 'Full theme support that respects your preference.', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
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
  { label: 'File/Image options in polls', status: 'soon' },
  { label: 'Email notifications for results', status: 'soon' },
  { label: 'Embeddable polls for websites', status: 'planned' },
  { label: 'Team collaboration & workspaces', status: 'planned' },
  { label: 'Analytics export (CSV / PDF)', status: 'planned' },
  { label: 'Mobile App (React Native)', status: 'future' },
];

// --- Constants ---
const stats = [
  { label: 'Active Polls', value: 1250, suffix: '+', icon: Activity },
  { label: 'Total Votes', value: 85400, suffix: '+', icon: Users },
  { label: 'Happy Users', value: 500, suffix: '+', icon: Star },
  { label: 'Countries', value: 45, suffix: '', icon: Globe },
];

// Animated counter
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(start);
    }, 20);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// FAQ Item
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-foreground rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-6 text-left font-black text-lg hover:bg-muted/50 transition-colors">
        {q}
        {open ? <ChevronUp size={20} className="text-primary shrink-0" /> : <ChevronDown size={20} className="text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed border-t-2 border-foreground/10 pt-4">{a}</div>}
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

  // Auto-cycle votes
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
    }, 1800);
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
                    <div className="h-4 bg-muted rounded-full border border-foreground/10 overflow-hidden">
                      <motion.div
                        className={`h-full ${opt.color} rounded-full`}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground font-bold mt-1">{votes[i]} votes</div>
                  </div>
                );
              })}
            </div>

            {/* Pie chart mini */}
            <div className="mt-6 pt-4 border-t-2 border-foreground/10">
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DEMO_OPTIONS.map((o, i) => ({ name: o.label, value: votes[i] }))}
                      dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}
                      isAnimationActive={true} animationDuration={400}>
                      {DEMO_OPTIONS.map((_, idx) => <Cell key={idx} fill={['#14b8a6','#f59e0b','#8b5cf6','#f43f5e'][idx]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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
      {/* Mock Header */}
      <div className="flex gap-1 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
      
      <div className="space-y-2">
        {/* Question Typing */}
        <div className="h-6 bg-background border border-foreground/10 rounded-lg flex items-center px-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "100%" }} 
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="flex items-center gap-1.5"
          >
            <div className="h-2 w-20 bg-foreground/20 rounded" />
          </motion.div>
        </div>

        {/* Options */}
        <div className="flex gap-2">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 1] }}
            className="flex-1 h-5 bg-primary/10 border border-primary/20 rounded-md flex items-center px-2"
          >
            <div className="h-1 w-8 bg-primary/30 rounded" />
          </motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 1] }}
            className="flex-1 h-5 bg-background border border-foreground/10 rounded-md flex items-center px-2"
          >
            <div className="h-1 w-8 bg-foreground/10 rounded" />
          </motion.div>
        </div>
      </div>

      {/* Floating Mouse & Click */}
      <motion.div 
        animate={{ 
          x: [80, 100, 80], 
          y: [40, 20, 40],
          scale: [1, 0.9, 1] 
        }} 
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-4 right-8 z-20 text-primary drop-shadow-md"
      >
        <MousePointer2 size={18} fill="currentColor" />
        <motion.div 
          animate={{ scale: [0, 2, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6] }}
          className="absolute inset-0 bg-primary rounded-full"
        />
      </motion.div>

      {/* Pulsing button at end */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], backgroundColor: ['#14b8a6', '#0d9488', '#14b8a6'] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-3 left-4 right-4 h-6 rounded-lg flex items-center justify-center text-[8px] font-black text-white uppercase tracking-tighter"
      >
        CREATE POLL
      </motion.div>
    </div>
  );
}

function StepShareAnim() {
  return (
    <div className="w-full h-32 bg-muted/30 rounded-2xl border-2 border-foreground/5 overflow-hidden relative p-4 flex flex-col justify-center gap-4">
      {/* Link Bar */}
      <div className="relative z-10 bg-background border-2 border-foreground/10 rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
        <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center">
          <Globe size={10} className="text-primary" />
        </div>
        <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-100, 200] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-full bg-primary/20"
          />
        </div>
        <motion.div 
          whileTap={{ scale: 0.9 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2 py-1 bg-primary rounded-md text-[8px] font-black text-white"
        >
          COPY
        </motion.div>
      </div>

      {/* Flying planes & icons */}
      <div className="flex justify-center gap-6 relative">
        {[Share2, MessageSquare, Send].map((Icon, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [20, 0, 20], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            className="w-8 h-8 bg-background border border-foreground/10 rounded-full flex items-center justify-center shadow-sm"
          >
            <Icon size={14} className="text-primary" />
          </motion.div>
        ))}
        
        {/* The Paper Plane */}
        <motion.div 
          initial={{ x: -50, y: 0, rotate: 0, opacity: 0 }}
          animate={{ 
            x: [0, 150], 
            y: [0, -40, -20], 
            rotate: [0, -10, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 top-0 text-primary"
        >
          <Send size={18} fill="currentColor" />
        </motion.div>
      </div>
    </div>
  );
}

function StepAnalyzeAnim() {
  const [votes, setVotes] = useState([20, 35, 15, 30]);
  
  useEffect(() => {
    const t = setInterval(() => {
      setVotes(prev => prev.map(v => Math.max(10, Math.min(90, v + (Math.random() - 0.5) * 20))));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-32 bg-muted/30 rounded-2xl border-2 border-foreground/5 overflow-hidden relative p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-red-500" 
          />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Updates</span>
        </div>
        <div className="flex -space-x-1">
          {[1,2,3].map(i => (
            <motion.div 
              key={i}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="w-4 h-4 rounded-full border border-background bg-muted flex items-center justify-center overflow-hidden"
            >
              <Users size={8} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 justify-center px-4">
        {votes.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div 
              animate={{ height: `${v}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              className={`w-full rounded-t-md relative ${i === 1 ? 'bg-primary shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-foreground/20'}`}
              style={{ height: '20%' }}
            >
              {i === 1 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500"
                >
                  <Trophy size={10} fill="currentColor" />
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Floating Avatars flying in */}
      <motion.div 
        initial={{ x: 150, opacity: 0 }}
        animate={{ x: [-20, 80], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-1/2 left-0"
      >
        <div className="w-3 h-3 bg-primary rounded-full border border-background shadow-sm" />
      </motion.div>
    </div>
  );
}

export const HomePage: React.FC = () => {
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

          {/* Right — Mock Poll Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="bg-background border-2 border-foreground rounded-3xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)] p-8 relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs font-black uppercase tracking-widest text-muted-foreground">Live Poll</span>
              </div>
              <h3 className="text-xl font-black mb-6">What's your favourite dev stack?</h3>
              {[
                { label: 'React + Node.js', pct: 45, color: 'bg-teal-500' },
                { label: 'Next.js + Prisma', pct: 30, color: 'bg-amber-500' },
                { label: 'Vue + Django', pct: 25, color: 'bg-violet-500' },
              ].map((opt, i) => (
                <motion.div key={opt.label} className="mb-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }}>
                  <div className="flex justify-between text-sm font-black mb-1">
                    <span>{opt.label}</span><span>{opt.pct}%</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full border border-foreground/10 overflow-hidden">
                    <motion.div className={`h-full ${opt.color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${opt.pct}%` }} transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: 'easeOut' }} />
                  </div>
                </motion.div>
              ))}
              <div className="mt-6 flex items-center gap-2 text-xs font-black text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                247 live voters · Updates in real-time
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y-2 border-foreground/10 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-4xl font-black text-primary mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
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
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="group p-6 bg-background border-2 border-foreground rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 border-2 border-foreground/10`}>
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{f.desc}</p>
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
                <FaqItem q={faq.q} a={faq.a} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {roadmap.map((item, i) => {
              const badgeMap: Record<string, string> = { soon: 'bg-green-100 text-green-700 border-green-300', planned: 'bg-amber-100 text-amber-700 border-amber-300', future: 'bg-blue-100 text-blue-700 border-blue-300' };
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-5 bg-background border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <Globe size={20} className="text-primary shrink-0" />
                  <span className="font-black flex-1">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${badgeMap[item.status]}`}>{item.status}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6 bg-muted/30 border-t-2 border-foreground/10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-background border-2 border-foreground rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] p-16 text-center">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Start Today</span>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mt-3 mb-4">
              Ready to Launch Your<br /><span className="text-primary">First Poll?</span>
            </h2>
            <p className="text-muted-foreground font-medium text-xl mb-10">Free forever. No credit card. Just powerful polling.</p>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                  Get Started Free <ArrowRight size={24} />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/create-poll">
                <button className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                  Create a Poll Now <ArrowRight size={24} />
                </button>
              </Link>
            </SignedIn>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

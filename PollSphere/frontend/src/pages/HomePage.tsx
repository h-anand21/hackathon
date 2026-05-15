import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Zap, Users, BarChart3, Shield, Share2, Trophy, Clock, Moon,
  ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Rocket,
  Activity, Star, Globe
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

const pieData = [
  { name: 'Option A', value: 45 },
  { name: 'Option B', value: 30 },
  { name: 'Option C', value: 25 },
];
const PIE_COLORS = ['#14b8a6', '#f59e0b', '#6366f1'];

const stats = [
  { value: 500, suffix: '+', label: 'Polls Created' },
  { value: 10000, suffix: '+', label: 'Votes Cast' },
  { value: 99, suffix: '.9%', label: 'Uptime' },
  { value: 0, suffix: 'ms', label: 'Avg Latency' },
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
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Simple Process</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">How It Works</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: '01', icon: Rocket, title: 'Create', desc: 'Design your poll with unlimited questions and custom options. Set expiry, auth mode, and more.' },
              { step: '02', icon: Share2, title: 'Share', desc: 'Copy the unique link and share it via WhatsApp, email, or social media. Anyone can vote instantly.' },
              { step: '03', icon: BarChart3, title: 'Analyze', desc: 'Watch votes roll in live with animated pie charts, bar graphs, and real-time vote counts.' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative p-8 bg-background border-2 border-foreground rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] text-center">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-xl border-2 border-foreground flex items-center justify-center font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl border-2 border-foreground/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO SHOWCASE */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">See It In Action</span>
            <h2 className="text-5xl font-black tracking-tight mt-2">Beautiful Analytics Dashboard</h2>
            <p className="text-muted-foreground font-medium mt-4 max-w-lg mx-auto">Every poll comes with a live analytics dashboard powered by animated charts.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Animated Pie Chart Demo */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-background border-2 border-foreground rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] p-8">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={20} className="text-primary" />
                <h3 className="font-black text-xl">Live Vote Distribution</h3>
                <span className="ml-auto flex items-center gap-1 text-xs font-black text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE
                </span>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} animationBegin={400} animationDuration={1500}>
                      {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm font-bold">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    {d.name}: {d.value}%
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Feature list */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              {[
                { title: 'Animated Pie Charts', desc: 'Vote share visualized with smooth Recharts animations' },
                { title: 'Live Progress Bars', desc: 'Bars grow in real-time as votes are submitted' },
                { title: 'Winner Highlight', desc: 'Top option is automatically detected and highlighted with a Trophy icon' },
                { title: 'Response Timeline', desc: 'Bar graph showing when votes arrived over time' },
                { title: 'Publish Results', desc: 'Share a public read-only results page with one click' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-5 bg-background border-2 border-foreground rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CheckCircle2 size={22} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black">{item.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

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
      <section className="py-24 px-6 bg-foreground text-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 text-background">
            Ready to Launch Your First Poll?
          </h2>
          <p className="text-background/60 font-medium text-xl mb-10">Free forever. No credit card. Just powerful polling.</p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl border-2 border-background/30 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Get Started Free <ArrowRight size={24} />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/create-poll">
              <button className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl border-2 border-background/30 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Create a Poll Now <ArrowRight size={24} />
              </button>
            </Link>
          </SignedIn>
        </motion.div>
      </section>

    </div>
  );
};

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import rough from "roughjs";

// Helper components using RoughJS to render dynamic sketchy borders
function RoughCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const rc = rough.canvas(canvas);
      
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw hand-drawn sketch border rectangle
      rc.rectangle(4, 4, dimensions.width - 8, dimensions.height - 8, {
        roughness: 1.5,
        strokeWidth: 2,
        stroke: "#2b2725",
        bowing: 1.2,
        seed: 12345 // Fixed seed to prevent re-drawing flicker
      });
    }
  }, [dimensions]);

  return (
    <div ref={containerRef} className={`relative p-5 bg-[#fbf9f4] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

function RoughQuoteCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const rc = rough.canvas(canvas);
      
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sketchy double border for quote card
      rc.rectangle(4, 4, dimensions.width - 8, dimensions.height - 8, {
        roughness: 2.2,
        strokeWidth: 1.5,
        stroke: "#b83227", // Hanko red for outer sketchy border
        bowing: 2.0,
        seed: 98765
      });
      rc.rectangle(6, 6, dimensions.width - 12, dimensions.height - 12, {
        roughness: 1.2,
        strokeWidth: 1.0,
        stroke: "#2b2725",
        bowing: 1.0,
        seed: 54321
      });
    }
  }, [dimensions]);

  return (
    <div ref={containerRef} className={`relative p-5 bg-[#fef5f0] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

function RoughGoogleButton({ children, href }: { children: React.ReactNode; href: string }) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const canvas = canvasRef.current;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const rc = rough.canvas(canvas);
      
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw thick sketchy card border
      rc.rectangle(4, 4, dimensions.width - 8, dimensions.height - 8, {
        roughness: 1.8,
        strokeWidth: 2.5,
        stroke: "#2b2725",
        bowing: 1.4,
        seed: 77777
      });
    }
  }, [dimensions]);

  return (
    <Link
      ref={containerRef}
      href={href}
      className="relative flex items-center justify-center space-x-3 px-6 py-4 bg-[#fdf2eb] text-[#2b2725] font-handwriting font-extrabold text-[19px] text-center sketch-shadow-hover hover:scale-[1.02] transition-all cursor-pointer select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      <div className="relative z-10 flex items-center justify-center space-x-3 w-full h-full">
        {children}
      </div>
    </Link>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("home");

  // State for interactive sandbox in How it Works page
  const [sandboxPrompt, setSandboxPrompt] = useState<string>("Schedule a meeting with Aarav next Thursday at 9 AM");
  const [sandboxSteps, setSandboxSteps] = useState({
    calendar: false,
    invite: false,
    draft: false
  });
  const [sandboxRunning, setSandboxRunning] = useState(false);

  const triggerSandbox = () => {
    if (sandboxRunning) return;
    setSandboxRunning(true);
    setSandboxSteps({ calendar: false, invite: false, draft: false });

    setTimeout(() => {
      setSandboxSteps(prev => ({ ...prev, calendar: true }));
      setTimeout(() => {
        setSandboxSteps(prev => ({ ...prev, invite: true }));
        setTimeout(() => {
          setSandboxSteps(prev => ({ ...prev, draft: true }));
          setSandboxRunning(false);
        }, 1000);
      }, 1000);
    }, 800);
  };

  const tapeColors = [
    "bg-[#f5b041]/85", // Yellow
    "bg-[#3c6382]/85", // Blue
    "bg-[#388e3c]/85", // Green
    "bg-[#b83227]/75", // Red
  ];

  const features = [
    {
      id: "01",
      title: "Smart Inbox",
      desc: "Summarize unread emails instantly. Know what matters without reading every single message.",
      img: "/illustration_inbox.png",
      tapeColor: tapeColors[1],
      tapeAngle: "rotate-[-4deg]",
    },
    {
      id: "02",
      title: "Meeting Scheduler",
      desc: "Create, update and manage meetings using natural language. DootAI handles invites and rescheduling for you.",
      img: "/illustration_scheduler.png",
      tapeColor: tapeColors[0],
      tapeAngle: "rotate-[3deg]",
    },
    {
      id: "03",
      title: "AI Email Writer",
      desc: "Generate professional replies in seconds with the right tone and context.",
      img: "/illustration_writer.png",
      tapeColor: tapeColors[2],
      tapeAngle: "rotate-[-2deg]",
    },
    {
      id: "04",
      title: "Deep Search",
      desc: "Search years of conversations, attachments and contacts instantly. Find anything.",
      img: "/illustration_search.png",
      tapeColor: tapeColors[3],
      tapeAngle: "rotate-[2deg]",
    },
    {
      id: "05",
      title: "One Prompt Actions",
      desc: "Schedule meetings, send emails, update calendars, and more – all from one simple command.",
      img: "/illustration_actions.png",
      tapeColor: tapeColors[0],
      tapeAngle: "rotate-[-3deg]",
    },
    {
      id: "06",
      title: "Email To Task",
      desc: "Turn important emails into actionable tasks automatically. Never miss what needs to be done.",
      img: "/illustration_tasks.png",
      tapeColor: tapeColors[1],
      tapeAngle: "rotate-[4deg]",
    },
    {
      id: "07",
      title: "Daily Briefing",
      desc: "Every morning, get a personalized briefing of unread emails, upcoming meetings, tasks and priorities.",
      img: "/illustration_briefing.png",
      tapeColor: tapeColors[2],
      tapeAngle: "rotate-[-2deg]",
    },
    {
      id: "08",
      title: "Real-Time Updates",
      desc: "New email? New meeting? DootAI keeps everything updated in real-time across your day.",
      img: "/illustration_updates.png",
      tapeColor: tapeColors[3],
      tapeAngle: "rotate-[1deg]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#d1c8b7] flex justify-center p-0 md:p-6 select-text font-sans overflow-x-hidden relative">
      
      {/* Soft watercolor background blobs */}
      <div className="watercolor-blob w-80 h-80 top-[10%] left-[5%] bg-[#ffb7c5]/35"></div>
      <div className="watercolor-blob w-[360px] h-[360px] top-[40%] right-[10%] bg-[#f5b041]/15"></div>
      <div className="watercolor-blob w-80 h-80 bottom-[10%] left-[20%] bg-[#388e3c]/15"></div>

      {/* Decorative floating sakura petals */}
      <div className="sakura-petal w-4 h-4 top-[15%] left-[80%]" style={{ animationDelay: '0s' }}></div>
      <div className="sakura-petal w-3.5 h-3 top-[35%] left-[72%]" style={{ animationDelay: '3s' }}></div>
      <div className="sakura-petal w-3 h-3 top-[50%] left-[92%]" style={{ animationDelay: '1.5s' }}></div>
      <div className="sakura-petal w-4 h-3 top-[75%] left-[85%]" style={{ animationDelay: '6s' }}></div>
      <div className="sakura-petal w-3 h-4 top-[22%] left-[45%]" style={{ animationDelay: '4.5s' }}></div>
      <div className="sakura-petal w-4 h-3.5 top-[85%] left-[68%]" style={{ animationDelay: '2s' }}></div>

      {/* Main Notebook Cover Container */}
      <div className="w-full max-w-7xl bg-white sketch-border-thick sketch-shadow flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Spiral Binder Rings */}
        <div className="hidden md:flex w-14 spiral-binder flex-col justify-between py-10 items-center relative z-20">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="spiral-hole-pair my-1">
              <div className="spiral-hole mb-1"></div>
              <div className="spiral-hole"></div>
              <div className="spiral-ring-metal"></div>
            </div>
          ))}
        </div>

        {/* Right Side: Main Sketchbook Content Page */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-12 washi-paper relative z-10 min-h-screen">
          
          {/* Top Header / Navigation */}
          <header className="w-full flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-dashed border-[#e6dfd3] gap-4 relative z-10">
            
            {/* Logo: Hanko Stamp + Hand-drawn Text */}
            <div className="flex items-center space-x-3 select-none">
              <img 
                src="/hanko_logo.png" 
                alt="DootAI Stamp Logo" 
                className="w-11 h-11 object-contain mix-blend-multiply rotate-[-3deg]" 
              />
              <div className="flex flex-col text-left cursor-pointer" onClick={() => setActiveTab("home")}>
                <span className="font-handwriting text-3xl font-extrabold text-[#2b2725] leading-none">DootAI</span>
                <span className="text-[10px] text-[#2b2725]/60 font-mono tracking-wider">AI Executive Assistant</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[15px] font-handwriting font-bold text-[#2b2725]/90">
              <button 
                onClick={() => setActiveTab("home")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "home" ? "text-[#b83227]" : ""}`}
              >
                Home
                {activeTab === "home" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("features")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "features" ? "text-[#b83227]" : ""}`}
              >
                Features
                {activeTab === "features" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("how-it-works")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "how-it-works" ? "text-[#b83227]" : ""}`}
              >
                How it Works
                {activeTab === "how-it-works" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("pricing")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "pricing" ? "text-[#b83227]" : ""}`}
              >
                Pricing
                {activeTab === "pricing" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("about")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "about" ? "text-[#b83227]" : ""}`}
              >
                About
                {activeTab === "about" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("docs")} 
                className={`relative pb-1 hover:text-[#b83227] transition-all ${activeTab === "docs" ? "text-[#b83227]" : ""}`}
              >
                Docs
                {activeTab === "docs" && (
                  <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </nav>

            {/* Login button */}
            <div className="flex items-center">
              <Link
                href="/onboarding"
                className="px-5 py-1.5 text-base font-handwriting font-bold bg-[#fbf9f4] text-[#2b2725] sketch-border-sm sketch-shadow-hover hover:scale-102 transition-all flex items-center space-x-2"
              >
                <span>Login</span>
                <span className="text-xs">👤</span>
              </Link>
            </div>
          </header>

          {/* TAB 1: HOME PAGE */}
          {activeTab === "home" && (
            <div className="flex-1 flex flex-col justify-between">
              {/* Hero Section */}
              <main className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 py-10 relative z-10">
                
                {/* Left Column */}
                <div className="flex-1 space-y-6 text-left max-w-xl">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-handwriting leading-none text-[#2b2725] tracking-tight relative pb-1">
                    Hi, I'm <span className="text-[#b83227] relative">Doot!</span>
                    <svg className="absolute bottom-[-10px] left-[150px] sm:left-[200px] w-[120px] sm:w-[160px] h-[10px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M5,5 C35,2 65,8 95,4" stroke="#b83227" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.8" />
                    </svg>
                  </h1>
                  
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-handwriting text-[#2b2725]/90 leading-tight">
                    Your AI Executive Assistant for <span className="text-[#b83227]">Email</span> & <span className="text-[#388e3c]">Meetings</span>
                  </h2>

                  {/* Hand-drawn Quote Card styled dynamically using RoughJS */}
                  <RoughQuoteCard className="rotate-[-0.5deg] max-w-md">
                    <span className="text-4xl font-handwriting text-[#b83227] leading-none select-none font-bold">“</span>
                    <p className="text-[15px] font-handwriting text-[#2b2725]/85 italic leading-relaxed pt-1 font-bold">
                      Stop clicking through Gmail. Just tell me what you want.
                    </p>
                    <span className="text-4xl font-handwriting text-[#b83227] leading-none self-end absolute right-5 bottom-1 select-none font-bold">”</span>
                  </RoughQuoteCard>

                  {/* Google Connection Button */}
                  <div className="pt-4 flex flex-col space-y-3 relative max-w-xs">
                    <div className="relative inline-block">
                      <RoughGoogleButton href="/onboarding">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Connect with Google</span>
                      </RoughGoogleButton>

                      {/* Cropped hand-drawn arrow pointing to button */}
                      <img 
                        src="/connect_arrow.png" 
                        alt="arrow pointer" 
                        className="absolute right-[-48px] top-[18px] w-9 h-9 object-contain mix-blend-multiply hidden sm:block rotate-[-5deg]" 
                      />
                    </div>
                    
                    <span className="text-[11px] text-[#2b2725]/60 font-mono flex items-center justify-center space-x-1.5 pt-1">
                      <span>🔒 Secure. Private. You're in control.</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: Combined Hero Illustration Card */}
                <div className="flex-1 w-full max-w-lg relative min-h-[380px] flex items-center justify-center">
                  <img
                    src="/hero_illustration.png"
                    alt="DootAI Hero Illustration"
                    className="w-full h-auto object-contain mix-blend-multiply hover:scale-[1.01] transition-all duration-300 select-none"
                  />
                </div>
              </main>

              {/* Washi Tape Ribbon Section */}
              <div className="w-full flex justify-center my-6 relative z-10">
                <img
                  src="/less_busywork_banner.png"
                  alt="Less Busywork. More Meaningful Work."
                  className="w-full max-w-4xl h-auto object-contain mix-blend-multiply"
                />
              </div>

              {/* Feature Cards Grid (Home Summary) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2 mt-4 relative z-10">
                {features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="relative pt-4">
                    <div className={`washi-tape-accent ${feature.tapeColor} ${feature.tapeAngle}`} />
                    <RoughCard className="notebook-card pt-7">
                      <div className="w-full h-20 mb-3 flex items-center justify-center overflow-hidden">
                        <img src={feature.img} alt={feature.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                      </div>
                      <h3 className="font-handwriting font-extrabold text-[16px] text-[#2b2725] mb-2 leading-tight">{feature.title}</h3>
                      <p className="text-[11px] font-handwriting text-[#2b2725]/80 leading-relaxed">{feature.desc.slice(0, 70)}...</p>
                    </RoughCard>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES PAGE (Alternating list as in feature.png) */}
          {activeTab === "features" && (
            <div className="flex-grow py-8 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <h1 className="text-5xl font-handwriting font-extrabold text-[#2b2725] mb-3 relative inline-block">
                  Why DootAI?
                  <svg className="absolute bottom-[-10px] left-0 w-full h-[8px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,1 95,6" stroke="#b83227" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </h1>
                <p className="font-handwriting text-xl text-[#2b2725]/85 mt-4 font-bold">More than an email assistant. 🌸</p>
                <p className="text-sm font-handwriting text-[#2b2725]/70 max-w-md mx-auto mt-2 leading-relaxed">
                  DootAI understands your inbox, calendar, and tasks so you can focus on what truly matters.
                </p>
              </div>

              {/* Vertical list of features alternating left/right */}
              <div className="max-w-4xl mx-auto space-y-16 relative">
                {/* Bamboo side decorations */}
                <div className="absolute right-[-60px] top-[10%] w-[50px] h-[500px] pointer-events-none hidden xl:block select-none opacity-60">
                  <img src="/bamboo_decor.png" alt="bamboo" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="absolute left-[-60px] bottom-[10%] w-[50px] h-[500px] pointer-events-none hidden xl:block select-none opacity-60 transform scale-x-[-1]">
                  <img src="/bamboo_decor.png" alt="bamboo" className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                {features.map((feature, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
                  >
                    {/* Illustration Card side */}
                    <div className="w-full md:w-1/2 flex justify-center">
                      <div className="relative pt-4 w-full max-w-sm">
                        <div className={`washi-tape-accent ${feature.tapeColor} ${feature.tapeAngle}`} />
                        <RoughCard className="notebook-card flex items-center justify-center p-6 min-h-[180px]">
                          <img 
                            src={feature.img} 
                            alt={feature.title} 
                            className="max-h-32 object-contain mix-blend-multiply transform hover:scale-105 transition-all duration-300"
                          />
                        </RoughCard>
                      </div>
                    </div>

                    {/* Text content side */}
                    <div className="w-full md:w-1/2 space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 rounded-full border-2 border-dashed border-[#b83227]/50 text-[#b83227] font-mono text-sm font-bold flex items-center justify-center bg-[#fef5f0]">
                          {feature.id}
                        </span>
                        <h2 className="font-handwriting font-extrabold text-2xl text-[#2b2725] leading-none">
                          {feature.title}
                        </h2>
                      </div>
                      <p className="text-[15px] font-handwriting text-[#2b2725]/85 leading-relaxed font-semibold">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOW IT WORKS PAGE (Step layout + simulation sandbox) */}
          {activeTab === "how-it-works" && (
            <div className="flex-grow py-8 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <h1 className="text-5xl font-handwriting font-extrabold text-[#2b2725] mb-3 relative inline-block">
                  How DootAI Works
                  <svg className="absolute bottom-[-10px] left-0 w-full h-[8px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  </svg>
                </h1>
                <p className="font-handwriting text-lg text-[#2b2725]/75 mt-4 font-bold">
                  From Inbox Chaos <span className="text-[#b83227]">→</span> Organized Day
                </p>
              </div>

              {/* 4 Steps columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
                
                {/* Step 1 */}
                <RoughCard className="notebook-card pt-7 text-center flex flex-col justify-between min-h-[280px]">
                  <div>
                    <span className="inline-block w-8 h-8 rounded-full bg-[#fcf2eb] border border-[#2b2725] font-handwriting font-black text-sm mb-3">1</span>
                    <h3 className="font-handwriting font-extrabold text-lg text-[#2b2725] mb-2">Connect Google</h3>
                    <p className="text-[12px] font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                      Sign in securely with Google. Connect Gmail & Calendar with secure OAuth.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-green-700 font-bold bg-green-50 p-1.5 border border-dashed border-green-300">
                    <span>✓ OAuth Enabled</span>
                  </div>
                </RoughCard>

                {/* Step 2 */}
                <RoughCard className="notebook-card pt-7 text-center flex flex-col justify-between min-h-[280px]">
                  <div>
                    <span className="inline-block w-8 h-8 rounded-full bg-[#fcf2eb] border border-[#2b2725] font-handwriting font-black text-sm mb-3">2</span>
                    <h3 className="font-handwriting font-extrabold text-lg text-[#2b2725] mb-2">Sync & Parse</h3>
                    <p className="text-[12px] font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                      DootAI reads emails & meetings and index embeddings using vector databases.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-blue-700 font-bold bg-blue-50 p-1.5 border border-dashed border-blue-300">
                    <span>✓ Sync Complete</span>
                  </div>
                </RoughCard>

                {/* Step 3 */}
                <RoughCard className="notebook-card pt-7 text-center flex flex-col justify-between min-h-[280px]">
                  <div>
                    <span className="inline-block w-8 h-8 rounded-full bg-[#fcf2eb] border border-[#2b2725] font-handwriting font-black text-sm mb-3">3</span>
                    <h3 className="font-handwriting font-extrabold text-lg text-[#2b2725] mb-2">Talk Naturally</h3>
                    <p className="text-[12px] font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                      Just tell Doot what you want in simple chat commands without clicking around.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-yellow-700 font-bold bg-yellow-50 p-1.5 border border-dashed border-yellow-300">
                    <span>✓ Chat Active</span>
                  </div>
                </RoughCard>

                {/* Step 4 */}
                <RoughCard className="notebook-card pt-7 text-center flex flex-col justify-between min-h-[280px]">
                  <div>
                    <span className="inline-block w-8 h-8 rounded-full bg-[#fcf2eb] border border-[#2b2725] font-handwriting font-black text-sm mb-3">4</span>
                    <h3 className="font-handwriting font-extrabold text-lg text-[#2b2725] mb-2">AI Solves It</h3>
                    <p className="text-[12px] font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                      Doot drafts replies, creates calendar events, schedules invites, and files tasks.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-purple-700 font-bold bg-purple-50 p-1.5 border border-dashed border-purple-300">
                    <span>✓ AI Agent Sync</span>
                  </div>
                </RoughCard>

              </div>

              {/* Try DootAI Sandbox section */}
              <div className="max-w-3xl mx-auto my-12">
                <RoughCard className="notebook-card p-6 md:p-8 bg-[#fdfbf7]">
                  <h3 className="font-handwriting font-black text-2xl text-[#2b2725] mb-6 text-center">
                    Try DootAI Sandbox (इंटरैक्टिव)
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Sandbox Controls */}
                    <div className="w-full md:w-3/5 space-y-4 text-left">
                      <label className="block text-sm font-handwriting font-bold text-[#2b2725]/75">
                        Ask Doot to do something:
                      </label>
                      <input 
                        type="text" 
                        value={sandboxPrompt}
                        onChange={(e) => setSandboxPrompt(e.target.value)}
                        className="w-full px-4 py-2 text-sm font-handwriting border border-[#2b2725] rounded bg-white sketch-border-sm focus:outline-none"
                        placeholder="Type a command..."
                      />
                      
                      <button
                        onClick={triggerSandbox}
                        disabled={sandboxRunning}
                        className="px-6 py-2 bg-[#b83227] text-white font-handwriting font-bold rounded hover:bg-[#b83227]/90 hover:scale-102 transition-all disabled:opacity-50"
                      >
                        {sandboxRunning ? "Processing..." : "Try DootAI"}
                      </button>
                    </div>

                    {/* Simulation logs */}
                    <div className="w-full md:w-2/5 p-4 bg-[#fbf9f4] border border-[#2b2725]/30 rounded flex flex-col justify-center min-h-[160px]">
                      <div className="space-y-3 font-mono text-xs text-left">
                        <div className="flex items-center space-x-2">
                          <span className={sandboxSteps.calendar ? "text-green-600 font-bold" : "text-gray-400"}>
                            {sandboxSteps.calendar ? "✓" : "○"}
                          </span>
                          <span className={sandboxSteps.calendar ? "text-[#2b2725] font-bold" : "text-gray-400"}>
                            Calendar Event Created
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={sandboxSteps.invite ? "text-green-600 font-bold" : "text-gray-400"}>
                            {sandboxSteps.invite ? "✓" : "○"}
                          </span>
                          <span className={sandboxSteps.invite ? "text-[#2b2725] font-bold" : "text-gray-400"}>
                            Invite Sent to Aarav
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={sandboxSteps.draft ? "text-green-600 font-bold" : "text-gray-400"}>
                            {sandboxSteps.draft ? "✓" : "○"}
                          </span>
                          <span className={sandboxSteps.draft ? "text-[#2b2725] font-bold" : "text-gray-400"}>
                            Email Drafted: "Meeting setup..."
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </RoughCard>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING PAGE (Cards layout as in price.png) */}
          {activeTab === "pricing" && (
            <div className="flex-grow py-8 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <h1 className="text-5xl font-handwriting font-extrabold text-[#2b2725] mb-3 relative inline-block">
                  Choose Your Path
                  <svg className="absolute bottom-[-10px] left-0 w-full h-[8px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,1 95,6" stroke="#b83227" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  </svg>
                </h1>
                <p className="font-handwriting text-lg text-[#2b2725]/75 mt-4 font-bold">Simple plans for busy humans</p>
              </div>

              {/* 3 Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch px-2">
                
                {/* Starter card */}
                <div className="relative pt-4">
                  <RoughCard className="notebook-card flex flex-col justify-between h-full pt-8 p-6 text-center">
                    <div>
                      <span className="text-green-700 text-3xl">🌱</span>
                      <h2 className="font-handwriting font-black text-2xl text-[#2b2725] mt-2">Starter</h2>
                      <div className="my-4">
                        <span className="font-handwriting font-black text-4xl text-[#2b2725]">$0</span>
                        <span className="font-handwriting text-sm text-[#2b2725]/60 font-bold"> / month</span>
                      </div>
                      
                      <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-4" />

                      <ul className="space-y-3 font-handwriting text-sm text-[#2b2725]/85 text-left font-bold pl-4">
                        <li>✓ Connect 1 Gmail Account</li>
                        <li>✓ Connect 1 Google Calendar</li>
                        <li>✓ Smart Email Summaries</li>
                        <li>✓ Basic Search Functionality</li>
                      </ul>
                    </div>

                    <div className="mt-8">
                      <Link 
                        href="/onboarding"
                        className="block w-full py-2 bg-[#fbf9f4] border border-[#2b2725] text-green-700 font-handwriting font-black rounded hover:scale-102 hover:bg-green-50 hover:border-green-600 transition-all text-center"
                      >
                        Start Free 🌱
                      </Link>
                    </div>
                  </RoughCard>
                </div>

                {/* Pro card */}
                <div className="relative pt-4">
                  {/* Most popular washi tape */}
                  <div className="absolute top-[-8px] left-[30%] w-32 h-6 washi-tape bg-[#b83227] text-white/95 font-mono text-[9px] font-bold flex items-center justify-center rotate-[-3deg] z-20">
                    ★ MOST POPULAR ★
                  </div>
                  <RoughQuoteCard className="flex flex-col justify-between h-full pt-10 p-6 text-center">
                    <div>
                      <span className="text-[#b83227] text-3xl">🏮</span>
                      <h2 className="font-handwriting font-black text-2xl text-[#b83227] mt-2">Pro</h2>
                      <div className="my-4">
                        <span className="font-handwriting font-black text-4xl text-[#b83227]">$9</span>
                        <span className="font-handwriting text-sm text-[#2b2725]/60 font-bold"> / month</span>
                      </div>
                      
                      <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-4" />

                      <ul className="space-y-3 font-handwriting text-sm text-[#2b2725]/85 text-left font-bold pl-4">
                        <li>✓ Everything in Starter</li>
                        <li>✓ AI Executive Assistant Chat</li>
                        <li>✓ Natural Scheduling Agent</li>
                        <li>✓ Smart Email Draft Replies</li>
                        <li>✓ Priority Inbox Categorization</li>
                      </ul>
                    </div>

                    <div className="mt-8">
                      <Link 
                        href="/onboarding"
                        className="block w-full py-2 bg-[#b83227] border border-[#b83227] text-white font-handwriting font-black rounded hover:scale-102 hover:bg-[#b83227]/90 transition-all text-center"
                      >
                        Get Pro 🏮
                      </Link>
                    </div>
                  </RoughQuoteCard>
                </div>

                {/* Team card */}
                <div className="relative pt-4">
                  <RoughCard className="notebook-card flex flex-col justify-between h-full pt-8 p-6 text-center">
                    <div>
                      <span className="text-[#3c6382] text-3xl">⛩</span>
                      <h2 className="font-handwriting font-black text-2xl text-[#2b2725] mt-2">Team</h2>
                      <div className="my-4">
                        <span className="font-handwriting font-black text-4xl text-[#2b2725]">$29</span>
                        <span className="font-handwriting text-sm text-[#2b2725]/60 font-bold"> / month</span>
                      </div>
                      
                      <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-4" />

                      <ul className="space-y-3 font-handwriting text-sm text-[#2b2725]/85 text-left font-bold pl-4">
                        <li>✓ Everything in Pro</li>
                        <li>✓ Shared Team Workspace</li>
                        <li>✓ Team Calendars & Sync</li>
                        <li>✓ Dedicated Team AI Assistant</li>
                        <li>✓ Admin Panel & Controls</li>
                      </ul>
                    </div>

                    <div className="mt-8">
                      <Link 
                        href="/onboarding"
                        className="block w-full py-2 bg-[#fbf9f4] border border-[#2b2725] text-[#3c6382] font-handwriting font-black rounded hover:scale-102 hover:bg-blue-50 hover:border-[#3c6382] transition-all text-center"
                      >
                        Contact Us ⛩
                      </Link>
                    </div>
                  </RoughCard>
                </div>

              </div>

              {/* Bottom security footer */}
              <div className="w-full flex justify-center mt-12 relative z-10">
                <div className="p-3 px-6 bg-[#fdfbf7] border border-dashed border-[#e6dfd3] rounded-full text-xs font-handwriting font-bold text-[#2b2725]/70 flex flex-col sm:flex-row items-center gap-3">
                  <span>🔒 Secure. Private. You're in control.</span>
                  <span className="hidden sm:inline">|</span>
                  <span>🌸 Loved by creators, founders & busy humans</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT PAGE (Details as in about.png) */}
          {activeTab === "about" && (
            <div className="flex-grow py-8 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h1 className="text-5xl font-handwriting font-extrabold text-[#2b2725] mb-3 relative inline-block">
                  About DootAI
                  <svg className="absolute bottom-[-10px] left-0 w-full h-[8px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  </svg>
                </h1>
                <p className="font-handwriting text-lg text-[#2b2725]/75 mt-4 font-bold max-w-md mx-auto leading-normal">
                  Built for people who spend too much time inside their inbox.
                </p>
              </div>

              {/* Columns for Why we built it / What DootAI can do */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto my-10 text-left">
                
                {/* Why We Built It */}
                <RoughCard className="notebook-card p-6">
                  <h3 className="font-handwriting font-extrabold text-xl text-[#b83227] mb-4 flex items-center space-x-2">
                    <span>🌸</span> <span>Why We Built It</span>
                  </h3>
                  <p className="text-[13px] font-handwriting text-[#2b2725]/75 mb-4 leading-relaxed font-bold">
                    Most professionals spend hours every week on repetitive tasks:
                  </p>
                  <ul className="space-y-2 text-sm font-handwriting text-[#2b2725]/85 font-bold">
                    <li className="flex items-center space-x-2">
                      <span className="text-xs">✉</span> <span>Reading and parsing unread emails</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-xs">📅</span> <span>Scheduling & rescheduling meetings</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-xs">✍</span> <span>Writing repetitive draft replies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-xs">🔍</span> <span>Searching through old conversation logs</span>
                    </li>
                  </ul>
                  <p className="text-[13px] font-handwriting text-[#2b2725]/75 mt-4 leading-relaxed font-bold border-t border-dashed border-[#e6dfd3] pt-3">
                    We believed there should be a simpler way. So we built **DootAI** to automate the inbox chaos.
                  </p>
                </RoughCard>

                {/* What DootAI Can Do */}
                <RoughCard className="notebook-card p-6">
                  <h3 className="font-handwriting font-extrabold text-xl text-[#3c6382] mb-4 flex items-center space-x-2">
                    <span>⛩</span> <span>What DootAI Can Do</span>
                  </h3>
                  <ul className="space-y-3 text-[13px] font-handwriting text-[#2b2725]/85 font-bold">
                    <li className="flex items-start space-x-2">
                      <span className="text-xs mt-1">✓</span> 
                      <div>
                        <strong>Understand your inbox:</strong> AI reads, summarizes and prioritizes what matters.
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-xs mt-1">✓</span> 
                      <div>
                        <strong>Manage your calendar:</strong> Create meetings, send invites and reschedule with one prompt.
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-xs mt-1">✓</span> 
                      <div>
                        <strong>Draft smart replies:</strong> Get context-aware email drafts in seconds.
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-xs mt-1">✓</span> 
                      <div>
                        <strong>Search everything:</strong> Find any email or attachment from years of inbox history instantly.
                      </div>
                    </li>
                  </ul>
                </RoughCard>

              </div>

              {/* DootAI Philosophy */}
              <div className="max-w-4xl mx-auto my-8">
                <RoughQuoteCard className="p-6 text-center">
                  <h3 className="font-handwriting font-black text-xl text-[#b83227] mb-4">
                    The DootAI Philosophy 集中
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-2 border border-dashed border-[#b83227]/30 bg-white/50 rounded">
                      <div className="text-xl">🖱</div>
                      <div className="font-handwriting text-xs font-bold mt-1 text-[#2b2725]">Less clicking</div>
                    </div>
                    <div className="p-2 border border-dashed border-[#b83227]/30 bg-white/50 rounded">
                      <div className="text-xl">🔀</div>
                      <div className="font-handwriting text-xs font-bold mt-1 text-[#2b2725]">Less switching</div>
                    </div>
                    <div className="p-2 border border-dashed border-[#b83227]/30 bg-white/50 rounded">
                      <div className="text-xl">🧘</div>
                      <div className="font-handwriting text-xs font-bold mt-1 text-[#2b2725]">More focus</div>
                    </div>
                    <div className="p-2 border border-dashed border-[#b83227]/30 bg-white/50 rounded">
                      <div className="text-xl">💡</div>
                      <div className="font-handwriting text-xs font-bold mt-1 text-[#2b2725]">More creativity</div>
                    </div>
                    <div className="p-2 border border-dashed border-[#b83227]/30 bg-white/50 rounded col-span-2 md:col-span-1">
                      <div className="text-xl">🌸</div>
                      <div className="font-handwriting text-xs font-bold mt-1 text-[#2b2725]">More time</div>
                    </div>
                  </div>
                </RoughQuoteCard>
              </div>

              {/* Our Vision and Team quote */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8 text-left">
                <div>
                  <h3 className="font-handwriting font-extrabold text-lg text-[#2b2725] mb-2">Our Vision</h3>
                  <p className="text-sm font-handwriting text-[#2b2725]/75 leading-relaxed font-bold">
                    We believe email should work for people, not the other way around. 
                    DootAI is designed to become your personal AI Executive Assistant that helps you focus on meaningful work while automation handles the busywork.
                  </p>
                </div>
                
                <div className="relative pt-4">
                  <div className="absolute top-0 left-[35%] w-24 h-6 washi-tape bg-[#f5b041]/70 text-[#2b2725] font-mono text-[9px] font-bold flex items-center justify-center rotate-[-3deg] z-20">
                    ★ NOTE ★
                  </div>
                  <RoughCard className="notebook-card p-5 pt-8 rotate-[0.5deg]">
                    <p className="text-sm font-handwriting italic text-[#2b2725]/85 leading-relaxed font-bold">
                      "Your inbox is important. Your time is priceless. We're here to give you more of it back."
                    </p>
                    <span className="block text-xs font-handwriting font-bold text-[#b83227] text-right mt-2">
                      — The DootAI Team 🌸
                    </span>
                  </RoughCard>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: DOCS PAGE */}
          {activeTab === "docs" && (
            <div className="flex-grow py-8 relative z-10 text-left max-w-3xl mx-auto">
              <div className="mb-10 text-center">
                <h1 className="text-5xl font-handwriting font-extrabold text-[#2b2725] mb-3 relative inline-block">
                  Documentation
                  <svg className="absolute bottom-[-10px] left-0 w-full h-[8px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5,5 Q50,2 95,5" stroke="#b83227" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  </svg>
                </h1>
                <p className="font-handwriting text-lg text-[#2b2725]/75 mt-4 font-bold">
                  Getting Started with DootAI MailOS
                </p>
              </div>

              <div className="space-y-8">
                
                <RoughCard className="notebook-card p-6">
                  <h2 className="font-handwriting font-black text-xl text-[#b83227] mb-3">1. Quick Start Guide</h2>
                  <p className="text-sm font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                    Getting set up with DootAI takes less than 2 minutes:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mt-3 font-handwriting text-sm text-[#2b2725]/85 font-bold">
                    <li>Click the <strong>Connect with Google</strong> button on the home page.</li>
                    <li>Grant read/write access to your Gmail and Google Calendar.</li>
                    <li>DootAI will automatically trigger the initial inbox sync and priority parsing.</li>
                    <li>Open the chat view and type your first command!</li>
                  </ol>
                </RoughCard>

                <RoughCard className="notebook-card p-6">
                  <h2 className="font-handwriting font-black text-xl text-[#3c6382] mb-3">2. Chat Command Examples</h2>
                  <p className="text-sm font-handwriting text-[#2b2725]/80 leading-relaxed font-semibold">
                    You can instruct DootAI to manage your day using natural language. Try these prompts:
                  </p>
                  <ul className="space-y-3 mt-3 font-handwriting text-sm text-[#2b2725]/85 font-bold pl-2">
                    <li className="border-l-2 border-[#3c6382] pl-3">
                      <strong>"Summarize my unread emails from the last 2 hours"</strong>
                      <span className="block text-[11px] text-[#2b2725]/60 font-mono mt-0.5">→ Returns priorities and key points.</span>
                    </li>
                    <li className="border-l-2 border-[#3c6382] pl-3">
                      <strong>"Schedule a 30-min coffee meeting with Sora Tanaka tomorrow afternoon"</strong>
                      <span className="block text-[11px] text-[#2b2725]/60 font-mono mt-0.5">→ Checks calendars and sends calendar invites.</span>
                    </li>
                    <li className="border-l-2 border-[#3c6382] pl-3">
                      <strong>"Search emails about the Japanese design layout draft"</strong>
                      <span className="block text-[11px] text-[#2b2725]/60 font-mono mt-0.5">→ Uses pgvector semantic embedding search to locate matches.</span>
                    </li>
                    <li className="border-l-2 border-[#3c6382] pl-3">
                      <strong>"Draft a professional reply to the lunch meeting invite accepting it"</strong>
                      <span className="block text-[11px] text-[#2b2725]/60 font-mono mt-0.5">→ Auto-drafts using context and saves to your drafts.</span>
                    </li>
                  </ul>
                </RoughCard>

              </div>
            </div>
          )}

          {/* Footer Section */}
          <footer className="w-full pt-10 pb-4 mt-8 border-t border-dashed border-[#e6dfd3] flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
            
            {/* Left: Bonsai Watercolor + Tech Stack */}
            <div className="flex items-center space-x-3 select-none">
              <img
                src="/bonsai_footer.png"
                alt="Japanese Bonsai Graphic"
                className="w-16 h-16 object-contain mix-blend-multiply"
              />
              <div className="flex flex-col text-left font-mono text-[9px] text-[#2b2725]/50 leading-normal">
                <span>Built with Corsair MCP</span>
                <span>Gmail Integration</span>
                <span>Google Calendar</span>
                <span>AI Powered</span>
              </div>
            </div>

            {/* Center: Copyright */}
            <div className="font-handwriting text-sm text-[#2b2725]/60 text-center sm:text-left font-bold">
              © 2026 DootAI MailOS. All rights reserved. A hand-drawn AI experience.
            </div>

            {/* Right: Red Hanko Focus Stamp */}
            <div className="select-none pr-2">
              <img 
                src="/hanko_stamp_focus.png" 
                alt="Hanko Focus" 
                className="w-14 h-14 object-contain mix-blend-multiply rotate-[-10deg]" 
              />
            </div>

          </footer>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import {
  Sparkles,
  Send,
  Loader2,
  Search,
  ArrowRight,
  Lightbulb,
  Clock,
  CheckCircle,
  MessageSquare,
  Bot,
  Trash2,
  Zap,
  Globe,
  Plus,
  BookOpen
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

// Hanko red stamp logo
function HankoLogoSVG({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} rotate-[-3deg] shrink-0`} style={{ filter: "drop-shadow(1px 2px 2px rgba(184, 50, 39, 0.15))" }}>
      <rect x="8" y="8" width="84" height="84" rx="10" fill="none" stroke="#b83227" strokeWidth="7" strokeDasharray="95 5 90 8 98 4" />
      <text x="50" y="52" fill="#b83227" fontSize="42" fontWeight="black" textAnchor="middle" fontFamily="'Kalam', 'Caveat', sans-serif" dominantBaseline="middle">
        道
      </text>
    </svg>
  );
}

// Mt. Fuji SVG vector background
function VectorMtFuji() {
  return (
    <div className="absolute inset-0 opacity-15 pointer-events-none select-none z-0">
      <svg viewBox="0 0 200 100" className="w-full h-full object-cover">
        <circle cx="150" cy="35" r="15" fill="#e8a7a1" opacity="0.4" />
        <path 
          d="M 20 95 C 60 80, 75 45, 80 35 L 100 35 C 105 45, 120 80, 160 95 Z" 
          fill="#ebdcc8" 
          stroke="#2b2725" 
          strokeWidth="1" 
        />
        <path 
          d="M 77 47 C 80 43, 80 35, 80 35 L 100 35 C 100 35, 100 43, 103 47 C 98 52, 95 45, 93 49 C 90 45, 88 50, 77 47 Z" 
          fill="#ffffff" 
          stroke="#2b2725" 
          strokeWidth="0.8" 
        />
      </svg>
    </div>
  );
}

// Waving Doot mascot drawing in watercolor sketchbook style
function DootWaving({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="30" x2="60" y2="15" stroke="#2b2725" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="12" r="5" fill="#b83227" stroke="#2b2725" strokeWidth="2" />
        
        {/* Head */}
        <rect x="30" y="30" width="60" height="42" rx="18" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        <rect x="40" y="37" width="40" height="24" rx="8" fill="#2b2725" />
        
        {/* Happy eyes */}
        <path d="M 47 48 Q 51 44 55 48" stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 65 48 Q 69 44 73 48" stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Cheeks */}
        <circle cx="45" cy="54" r="2.5" fill="#e8a7a1" opacity="0.8" />
        <circle cx="75" cy="54" r="2.5" fill="#e8a7a1" opacity="0.8" />
        
        {/* Body */}
        <path d="M 42 72 L 78 72 L 72 100 L 48 100 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        
        {/* Logo */}
        <circle cx="60" cy="85" r="6" fill="#b83227" />
        
        {/* Arm waving */}
        <path d="M 78 75 Q 92 68 98 52" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="98" cy="51" r="3.5" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        
        {/* Relaxed arm */}
        <path d="M 42 75 Q 30 85 25 95" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Legs */}
        <rect x="47" y="100" width="8" height="10" rx="4" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        <rect x="65" y="100" width="8" height="10" rx="4" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
      </svg>
    </div>
  );
}

// Productivity radial gauge custom visual
function VectorRadialGauge({ percent = 78 }: { percent?: number }) {
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto select-none">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#ebdcc8"
          strokeWidth={strokeWidth}
          strokeDasharray="4 2"
        />
        {/* Progress Circle with sketch style */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#b83227"
          strokeWidth={strokeWidth}
          strokeDashoffset={strokeDashoffset}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      {/* Inner Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-handwriting text-[#2b2725]">
        <span className="text-2xl font-black leading-none">{percent}%</span>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Productive</span>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "recommendations" | "history">("chat");
  const [searchMode, setSearchMode] = useState<"standard" | "deep" | "analyze" | "create">("standard");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Konnichiwa! I am Doot, your sketchbook personal assistant. 🌸\n\nHow can I help you organize your email, calendar, or tasks today? Try asking me to **Summarize unread emails** or **Schedule a design review meeting**! 🍱",
      createdAt: new Date().toISOString()
    }
  ]);

  // Default Prompts (Bento box prompts)
  const defaultPrompts = [
    { text: "Summarize unread emails ✉️", query: "Summarize my unread emails from Aarav and Corsair" },
    { text: "Schedule a design review 📅", query: "Schedule Japanese Sketchbook Design Review with Aarav for Friday 9am" },
    { text: "Urgent items list ⛩️", query: "What are my urgent high priority tasks and emails?" },
    { text: "Draft reply to Aarav ✒️", query: "Draft an email reply to Aarav Patel saying I will join the review Friday" }
  ];

  // AI recommendations
  const recommendations = [
    { title: "Clean Inbox", desc: "Archive 14 social notifications to free space", action: "Archive notifications" },
    { title: "Calendar Block", desc: "Block out 'Quiet Day' hours for Mount Fuji meditation", action: "Block Friday PM" },
    { title: "Filter Setup", desc: "Route all reports to a workspace tag folder", action: "Create tag report" }
  ];

  // Monitor Auth State & Fetch Chat History
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch chat history
        fetch(`/api/chat?userId=${currentUser.uid}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
            // Read initial query if passed via url params and execute immediately
            const initialQuery = searchParams.get("query");
            if (initialQuery) {
              handleSend(initialQuery, currentUser);
              // Clean the query parameter from URL to prevent resending on page refresh
              const newUrl = window.location.pathname;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
          })
          .catch((err) => {
            console.error("Error loading chat history:", err);
            const initialQuery = searchParams.get("query");
            if (initialQuery) {
              handleSend(initialQuery, currentUser);
              const newUrl = window.location.pathname;
              window.history.replaceState({ path: newUrl }, '', newUrl);
            }
          });
      } else {
        router.push("/onboarding");
      }
    });

    return () => unsubscribe();
  }, [searchParams, router]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Send message
  const handleSend = async (textToSend: string, overrideUser?: FirebaseUser) => {
    const activeUser = overrideUser || user;
    if (!textToSend.trim() || !activeUser) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      // Append instructions based on search mode
      let promptMessage = textToSend;
      if (searchMode === "deep") {
        promptMessage = `[Deep Search Mode] ${textToSend}`;
      } else if (searchMode === "analyze") {
        promptMessage = `[Analyze Mode] ${textToSend}`;
      } else if (searchMode === "create") {
        promptMessage = `[Creation Mode] ${textToSend}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUser.uid,
          message: promptMessage
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "Failed to process chat response");
      }
    } catch (err: any) {
      console.error(err);
      // Fallback response simulation
      setTimeout(() => {
        const fallbackMsg: Message = {
          id: Math.random().toString(),
          role: "assistant",
          content: `I've prepared details for: "${textToSend}". \n\nI can schedule your Friday review at 9:00 AM or draft standard follow-up reply scrolls. Let me know what you want to execute next! 🍱`,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  // Clear Chat History
  const clearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Konnichiwa! History cleared. Let's start fresh. 🌸",
        createdAt: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-text">
      
      {/* 1. TOP HEADER */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none flex items-center gap-2">
            AI Assistant <span className="text-[#f5b041]">🌸</span>
          </h1>
          <p className="text-xs font-handwriting text-[#2b2725]/60 font-bold mt-1">Chat with Doot Sensei to coordinate your life.</p>
        </div>

        {/* Tab Selector on Mobile */}
        <div className="flex sm:hidden space-x-1.5 self-center select-none bg-white p-1 rounded-xl sketch-border-sm">
          <button onClick={() => setActiveTab("chat")} className={`px-3 py-1 font-handwriting font-black text-[11px] rounded-lg ${activeTab === "chat" ? "bg-[#fcdfd7] text-[#b83227]" : ""}`}>Chat</button>
          <button onClick={() => setActiveTab("recommendations")} className={`px-3 py-1 font-handwriting font-black text-[11px] rounded-lg ${activeTab === "recommendations" ? "bg-[#fcdfd7] text-[#b83227]" : ""}`}>Insights</button>
        </div>
      </div>

      {/* 2. BODY GRID */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto pr-1">
        
        {/* LEFT COMPONENT: MAIN INTERACTIVE CHAT WRAPPER (75% width) */}
        <div className={`flex-1 flex flex-col min-h-[500px] lg:min-h-0 bg-white sketch-border sketch-shadow rounded-xl p-5 ${activeTab !== "chat" ? "hidden lg:flex" : "flex"}`}>
          
           {/* Greeting post card */}
          {messages.length <= 1 && (
            <div className="bg-[#fdfbf7] border border-dashed border-[#e6dfd3] p-4 rounded-xl flex items-center gap-4 relative overflow-hidden select-none mb-4 shrink-0">
              <VectorMtFuji />
              <DootWaving className="w-20 h-20 shrink-0" />
              <div className="relative z-10 text-left">
                <h3 className="font-handwriting font-black text-sm text-[#2b2725]">Talk to Doot, Assistant Sensei ⛩️</h3>
                <p className="text-[11px] font-handwriting font-bold text-gray-600 mt-1 leading-relaxed">
                  Send prompts to write letters, schedule appointments on the weekly timetable, search emails, or extract task items. I use Gemini integration to format response logs.
                </p>
              </div>
              <div className="absolute right-3 top-3"><HankoLogoSVG className="w-5 h-5 opacity-40" /></div>
            </div>
          )}

          {/* Conversation history lists */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#faf7f2]/40 border border-[#e6dfd3] rounded-xl space-y-3 font-handwriting font-bold text-sm min-h-0 pr-1">
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div key={m.id} className={`flex ${isAssistant ? "justify-start" : "justify-end"} items-start space-x-2.5`}>
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-white border border-[#2b2725] flex items-center justify-center shrink-0 shadow-sm mt-0.5 select-none">
                      <Bot className="w-4 h-4 text-[#b83227]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm border-b-2 text-left relative ${
                    isAssistant 
                      ? "bg-white border-[#ebdcc8] text-[#2b2725]" 
                      : "bg-[#fcdfd7] border-[#b83227]/25 text-[#2b2725]"
                  }`}>
                    {/* Message body */}
                    <div className="whitespace-pre-wrap leading-relaxed text-xs">
                      {m.content}
                    </div>
                    {/* Timestamp log */}
                    <span className="block font-mono text-[8px] text-gray-400 mt-1 text-right">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {sending && (
              <div className="flex justify-start items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-[#2b2725] flex items-center justify-center shrink-0 shadow-sm select-none">
                  <Bot className="w-4 h-4 text-[#b83227]" />
                </div>
                <div className="bg-white border border-[#ebdcc8] rounded-2xl px-4 py-2.5 shadow-sm flex items-center space-x-2 text-xs font-handwriting text-[#2b2725]/60">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b83227]" />
                  <span>Doot is thinking... 🌸</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bento boxes for quick inputs */}
          {messages.length <= 1 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none shrink-0">
              {defaultPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="p-2 bg-white hover:bg-gray-50 border border-[#e6dfd3] hover:border-gray-300 text-left rounded-xl cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-16 shadow-sm group"
                >
                  <span className="text-[10px] font-handwriting font-extrabold text-[#2b2725]/85 group-hover:text-[#b83227] leading-tight line-clamp-2">
                    {p.text}
                  </span>
                  <span className="text-[8px] font-mono text-gray-400 font-bold flex items-center gap-0.5">
                    Try prompt <ArrowRight className="w-2.5 h-2.5 text-gray-300 group-hover:text-[#b83227]" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Text Area & Send panel */}
          <div className="mt-4 pt-3 border-t border-[#e6dfd3] shrink-0 select-none">
            {/* Search actions row selectors */}
            <div className="flex space-x-2 mb-2">
              {[
                { id: "standard", name: "Standard", desc: "Chat reply" },
                { id: "deep", name: "Deep Search ⛩️", desc: "Detailed context lookup" },
                { id: "analyze", name: "Analyze 📊", desc: "Insights parsing" },
                { id: "create", name: "Create ✒️", desc: "Template drafts" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSearchMode(m.id as any)}
                  className={`px-2.5 py-1 text-[9px] font-handwriting font-bold rounded-lg transition-all border cursor-pointer ${
                    searchMode === m.id
                      ? "bg-[#2b2725] text-white border-[#2b2725]"
                      : "bg-[#fdfbf7] border-[#e6dfd3] text-gray-600 hover:bg-gray-50"
                  }`}
                  title={m.desc}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask Doot to schedule review, summarize email scrolls, analyze metrics..."
                className="w-full pl-3 pr-24 py-3 bg-[#fdfbf7] sketch-border-sm focus:outline-none text-xs font-handwriting font-bold h-12.5 leading-relaxed placeholder-gray-400 shadow-inner resize-none"
              />
              <div className="absolute right-2.5 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="p-1.5 bg-white hover:bg-red-50 border border-gray-200 rounded-lg text-gray-400 hover:text-[#b83227] cursor-pointer shadow-sm transition-colors"
                  title="Clear chat session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={sending || !input.trim()}
                  onClick={() => handleSend(input)}
                  className="p-1.5 px-4 bg-[#b83227] hover:bg-[#a02b21] disabled:opacity-50 text-white rounded-lg flex items-center space-x-1 font-handwriting font-black text-xs cursor-pointer border-b-2 shadow"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECOMMENDATIONS & METRICS (25% width) */}
        <div className={`w-full lg:w-76 flex flex-col gap-6 shrink-0 text-left ${activeTab !== "recommendations" ? "hidden lg:flex" : "flex"}`}>
          
          {/* Productivity Gauge Index card */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-4 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none shrink-0 text-center">
            {/* Washi tape stamp */}
            <div className="absolute top-[-6px] left-[15%] w-12 h-4 bg-[#ebdcc8]/80 border-l border-r border-dashed border-white/50 rotate-[-2deg]" />
            
            <h3 className="font-handwriting font-black text-xs text-[#2b2725]/60 mb-2 pb-1 border-b border-dashed border-[#e6dfd3] text-left">
              Optimization Snapshot
            </h3>
            
            <VectorRadialGauge percent={78} />

            <div className="mt-3 space-y-1.5 text-center font-handwriting font-bold">
              <p className="text-xs text-[#2b2725]">🌸 Awesome work this week!</p>
              <p className="text-[10px] text-gray-500 leading-normal">
                You resolved **24 items**, drafted **8 reply scrolls** and saved **4.2 hours** using automated filters.
              </p>
            </div>
          </div>

          {/* Doot recommendations checklist */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-4 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 flex-1 flex flex-col">
            <h3 className="font-handwriting font-black text-xs text-[#2b2725]/60 mb-3 pb-1 border-b border-dashed border-[#e6dfd3] select-none">
              AI Recommendations
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {recommendations.map((r, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#ebdcc8] rounded-xl text-left space-y-1 hover:border-[#b83227]/40 hover:scale-[1.01] transition-all relative">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b83227] flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-current" /> {r.title}
                    </span>
                    <button
                      onClick={() => handleSend(r.action)}
                      className="text-[9px] font-handwriting font-black text-[#3c6382] hover:underline cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-xs font-handwriting font-black text-[#2b2725] leading-snug">
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Inkpot stamp bottom decorator */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#e6dfd3] text-center select-none">
              <span className="text-[9px] font-handwriting text-gray-400 font-bold">Doot AI Sensei v1.2.0 • ⛩️</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Send,
  Mail,
  Calendar,
  CheckCircle2,
  Search,
  Bell,
  ChevronDown,
  Pencil,
  CheckSquare,
  Users,
  Bot,
  Plus,
  Trash2,
  MessageSquare,
  Bookmark,
  FileText
} from "lucide-react";

// ----------------------------------------------------
// VECTOR DESIGN COMPONENTS & MASCOTS
// ----------------------------------------------------

function HankoLogoSVG({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} rotate-[-3deg] shrink-0`} style={{ filter: "drop-shadow(1px 2px 2px rgba(184, 50, 39, 0.15))" }}>
      <rect x="8" y="8" width="84" height="84" rx="10" fill="none" stroke="#b83227" strokeWidth="7" strokeDasharray="95 5 90 8 98 4" />
      <text x="50" y="52" fill="#b83227" fontSize="42" fontWeight="black" textAnchor="middle" fontFamily="'Kalam', 'Caveat', sans-serif" dominantBaseline="middle">
        道
      </text>
      <text x="50" y="80" fill="#b83227" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="2">
        AI
      </text>
    </svg>
  );
}

function DootWaving({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="30" x2="60" y2="15" stroke="#2b2725" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle
          cx="60"
          cy="12"
          r="5"
          fill="#b83227"
          stroke="#2b2725"
          strokeWidth="2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        
        {/* Head */}
        <rect x="30" y="30" width="60" height="42" rx="18" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        
        {/* Visor */}
        <rect x="40" y="37" width="40" height="24" rx="8" fill="#2b2725" />
        
        {/* Eyes (happy curves) */}
        <path d="M 47 48 Q 51 44 55 48" stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 65 48 Q 69 44 73 48" stroke="#388e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Cheeks */}
        <circle cx="45" cy="54" r="2.5" fill="#e8a7a1" opacity="0.8" />
        <circle cx="75" cy="54" r="2.5" fill="#e8a7a1" opacity="0.8" />
        
        {/* Body */}
        <path d="M 42 72 L 78 72 L 72 100 L 48 100 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        
        {/* Hanko logo on chest */}
        <circle cx="60" cy="85" r="7" fill="#b83227" />
        <text x="60" y="89" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">道</text>
        
        {/* Left Arm (Relaxed) */}
        <path d="M 42 75 Q 30 85 25 95" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Right Arm (Waving!) */}
        <motion.path
          d="M 78 75 Q 92 68 98 52"
          stroke="#2b2725"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ originX: "78px", originY: "75px" }}
          animate={{ rotate: [0, -15, 0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <circle cx="98" cy="51" r="3.5" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        
        {/* Legs */}
        <rect x="47" y="100" width="8" height="10" rx="4" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        <rect x="65" y="100" width="8" height="10" rx="4" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
      </svg>
    </div>
  );
}

function DootMascotHead({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <line x1="50" y1="22" x2="50" y2="8" stroke="#2b2725" strokeWidth="2.5" />
      <circle cx="50" cy="5" r="4.5" fill="#b83227" stroke="#2b2725" strokeWidth="1.8" />
      <rect x="18" y="22" width="64" height="46" rx="18" fill="#ffffff" stroke="#2b2725" strokeWidth="2.8" />
      <rect x="28" y="30" width="44" height="26" rx="6" fill="#2b2725" />
      <path d="M 37 42 Q 41 38 45 42" stroke="#388e3c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 55 42 Q 59 38 63 42" stroke="#388e3c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="49" r="2" fill="#e8a7a1" />
      <circle cx="67" cy="49" r="2" fill="#e8a7a1" />
    </svg>
  );
}

function VectorLandscape() {
  return (
    <div className="absolute inset-0 opacity-40 pointer-events-none z-0 select-none">
      <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
        {/* Red Sun */}
        <circle cx="280" cy="80" r="32" fill="#e8a7a1" opacity="0.35" />
        
        {/* Mt Fuji */}
        <path 
          d="M 60 210 C 140 180, 180 90, 200 65 L 220 65 C 240 90, 280 180, 360 210 Z" 
          fill="#ebdcc8" 
          stroke="#2b2725" 
          strokeWidth="1.8" 
        />
        {/* Snowy peak */}
        <path 
          d="M 194 92 C 202 85, 200 65, 200 65 L 220 65 C 220 65, 218 85, 226 92 C 218 99, 212 90, 208 97 C 202 91, 198 97, 194 92 Z" 
          fill="#ffffff" 
          stroke="#2b2725" 
          strokeWidth="1.2" 
        />
        
        {/* Pagoda Silhouette */}
        <g transform="translate(35, 100) scale(0.55)">
          <rect x="40" y="130" width="20" height="20" fill="#f1ebe0" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M35 130 L65 130 L60 110 L40 110 Z" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M30 110 Q50 100 70 110 L65 105 L35 105 Z" fill="#2b2725" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M38 105 L62 105 L58 85 L42 85 Z" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M32 85 Q50 75 68 85 L64 80 L36 80 Z" fill="#2b2725" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M41 80 L59 80 L56 60 L44 60 Z" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
          <path d="M35 60 Q50 50 65 60 L61 55 L39 55 Z" fill="#2b2725" stroke="#2b2725" strokeWidth="1.5" />
          <line x1="50" y1="55" x2="50" y2="25" stroke="#2b2725" strokeWidth="2" />
        </g>

        {/* Torii Gate Silhouette */}
        <g transform="translate(290, 140) scale(0.6)">
          <line x1="25" y1="75" x2="28" y2="25" stroke="#2b2725" strokeWidth="2.5" />
          <line x1="25" y1="75" x2="28" y2="25" stroke="#b83227" strokeWidth="1.2" />
          <line x1="55" y1="75" x2="52" y2="25" stroke="#2b2725" strokeWidth="2.5" />
          <line x1="55" y1="75" x2="52" y2="25" stroke="#b83227" strokeWidth="1.2" />
          <rect x="20" y="32" width="40" height="3" fill="#b83227" stroke="#2b2725" strokeWidth="1.2" rx="0.5" />
          <path d="M 12 18 Q 40 10 68 18 L 65 24 Q 40 16 15 24 Z" fill="#b83227" stroke="#2b2725" strokeWidth="1.2" />
          <path d="M 10 18 L 70 18 L 70 15 L 10 15 Z" fill="#2b2725" stroke="#2b2725" strokeWidth="1.2" />
        </g>
        
        {/* Flapping Birds */}
        <motion.path
          d="M 130 50 Q 134 46 138 50 Q 142 46 146 50"
          fill="none"
          stroke="#2b2725"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
        <motion.path
          d="M 160 58 Q 163 54 166 58 Q 169 54 172 58"
          fill="none"
          stroke="#2b2725"
          strokeWidth="0.8"
          strokeLinecap="round"
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
    </div>
  );
}

function VectorBamboo() {
  return (
    <div className="absolute right-2 bottom-2 opacity-20 pointer-events-none z-0">
      <svg viewBox="0 0 60 120" className="w-16 h-32">
        <path d="M 30 120 L 32 95 M 32 93 L 34 60 M 34 58 L 37 20 M 37 18 L 38 0" fill="none" stroke="#2b2725" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="32" cy="94" rx="2" ry="0.6" fill="#2b2725" />
        <ellipse cx="34" cy="59" rx="2" ry="0.6" fill="#2b2725" />
        <ellipse cx="37" cy="19" rx="2" ry="0.6" fill="#2b2725" />
        
        <path d="M 32 94 Q 18 80 10 88" fill="none" stroke="#2b2725" strokeWidth="1" />
        <path d="M 10 88 Q 6 78 12 75 C 14 81 22 84 32 94" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />
        
        <path d="M 34 59 Q 50 50 56 57" fill="none" stroke="#2b2725" strokeWidth="1" />
        <path d="M 56 57 Q 52 46 45 48 C 44 53 39 55 34 59" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

function VectorLantern() {
  return (
    <div className="absolute right-2 bottom-1 opacity-25 pointer-events-none z-0">
      <svg viewBox="0 0 60 80" className="w-12 h-16">
        <path d="M 15 35 Q 30 23 45 35 L 40 42 L 20 42 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
        <line x1="30" y1="28" x2="30" y2="22" stroke="#2b2725" strokeWidth="2" />
        <circle cx="30" cy="19" r="2.5" fill="#fcf2eb" stroke="#2b2725" strokeWidth="1.2" />

        <rect x="23" y="42" width="14" height="12" fill="#ffffff" stroke="#2b2725" strokeWidth="1.5" />
        <circle cx="30" cy="48" r="2.5" fill="#f5b041" />

        <rect x="20" y="54" width="20" height="4" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
        <path d="M 26 58 L 24 75 L 36 75 L 34 58 Z" fill="#dbd0be" stroke="#2b2725" strokeWidth="1.5" />
        <path d="M 10 75 Q 30 72 50 75 L 45 80 L 15 80 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ----------------------------------------------------

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type TaskItem = {
  id: number;
  text: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  // Chat and panel states
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Konnichiwa! 🌸 I am Doot, your personal mail assistant. Ask me anything about your emails, tasks, or calendar schedule. For example, you can say: 'What is on my schedule today?' or 'Draft an email to Aarav Patel.'",
      createdAt: new Date().toISOString()
    }
  ]);
  const [sending, setSending] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Stats matching mockup
  const [stats] = useState({
    unreadEmails: 12,
    meetingsToday: 3,
    tasksPending: 5,
    highPriority: 2
  });

  // Interactive Tasks list
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, text: "Review hackathon proposal", priority: "High", completed: false },
    { id: 2, text: "Send update to team", priority: "Medium", completed: false },
    { id: 3, text: "Prepare for client demo", priority: "High", completed: false }
  ]);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("High");

  // Notifications bell dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsList = [
    "You have 12 unread emails waiting in Inbox.",
    "Team Standup starts in 25 minutes.",
    "Aarav Patel sent a follow-up email.",
    "Integrations refreshed successfully.",
    "Doot compiled the daily travel agenda."
  ];

  // Ref for chat scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  useEffect(() => {
    if (showChatHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChatHistory, sending]);

  // Handle send message
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || !user) return;
    
    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowChatHistory(true);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          message: textToSend
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMessage: Message = {
          id: Math.random().toString(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get reply");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      // Beautiful mock response fallback
      setTimeout(() => {
        let reply = `Here is the information about "${textToSend}":\n\n`;
        if (textToSend.toLowerCase().includes("summarize") || textToSend.toLowerCase().includes("emails")) {
          reply += `🌸 **Email Summary Briefing**:\n- **Aarav Mehta** (9:15 AM): Follow-up on the hackathon proposal. He requested the latest slides.\n- **Corsair Team** (8:45 AM): General update on team sync schedule.\n- **Google Calendar** (7:30 AM): Notification of calendar event shifts.\n\nWould you like me to draft a response to Aarav?`;
        } else if (textToSend.toLowerCase().includes("schedule") || textToSend.toLowerCase().includes("meeting")) {
          reply += `📅 **Meeting Scheduler**:\nI can schedule that for you. What time would work best? I see you are free at 11:30 AM after your Team Standup, or in the afternoon after 2:30 PM.`;
        } else if (textToSend.toLowerCase().includes("briefing") || textToSend.toLowerCase().includes("agenda")) {
          reply += `📔 **Daily Agenda Outline**:\n1. **10:00 AM**: Team Standup (Google Meet)\n2. **11:30 AM**: Client Call (Zoom)\n3. **2:00 PM**: Product Demo presentation.\n\n*Suggestions*: Review slides at least 15 mins prior.`;
        } else {
          reply += `I have registered your request. I am working on organizing your binder details for "${textToSend}". Let me know if you want me to update your tasks or schedule! 🌸`;
        }
        
        const assistantMessage: Message = {
          id: Math.random().toString(),
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setSending(false);
      }, 1000);
    } finally {
      if (!sending) {
        // Safe wrap in case error timeout handles state
        setSending(false);
      }
    }
  };

  // Add Task handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: TaskItem = {
      id: Date.now(),
      text: newTaskText.trim(),
      priority: newTaskPriority,
      completed: false
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
    setAddingTask(false);
  };

  // Toggle Task completed
  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const actionCards = [
    { text: "Summarize unread emails", desc: "Summarize unread emails", icon: Mail, bg: "bg-[#fef5f0]/80" },
    { text: "Schedule a meeting", desc: "Schedule a meeting", icon: Calendar, bg: "bg-[#fcf7ec]/80" },
    { text: "Draft an email reply", desc: "Draft an email reply", icon: Pencil, bg: "bg-[#f5fbf7]/80" },
    { text: "Search old emails", desc: "Search old emails", icon: Search, bg: "bg-[#f2f7fc]/80" },
    { text: "Show today's agenda", desc: "Show today's agenda", icon: Calendar, bg: "bg-[#fcfaf4]/80" },
    { text: "Daily briefing", desc: "Daily briefing", icon: FileText, bg: "bg-[#fbf9f4]/80" }
  ];

  const suggestionChips = [
    "You have 12 unread emails. Shall I summarize them?",
    "Your meeting at 10:00 AM starts in 25 minutes.",
    "Riya Sharma is waiting for your response."
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 relative z-10 w-full">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-dashed border-[#e6dfd3] mb-6 gap-4">
        <div>
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none mb-1">
            Good morning, {user?.displayName?.split(" ")[0] || "Himanshu"}! 👋
          </h1>
          <p className="text-sm font-handwriting font-bold text-[#2b2725]/60">
            Let's make today productive.
          </p>
        </div>

        {/* Search, Notifications & Dropdown Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Global Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#2b2725]/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search emails, meetings, tasks..."
              onKeyDown={(e) => e.key === "Enter" && handleSend((e.target as HTMLInputElement).value)}
              className="pl-9 pr-12 py-2 bg-white sketch-border-sm text-xs font-handwriting font-bold w-64 focus:outline-none focus:ring-1 focus:ring-[#b83227]/40 shadow-sm"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[9px] font-mono text-[#2b2725]/40 font-bold bg-[#ebdcc8]/30 px-1.5 my-1.5 mr-1.5 rounded">
              ⌘ K
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white sketch-border-sm hover:bg-red-50 text-[#2b2725] transition-all relative cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-[-3px] right-[-3px] w-4.5 h-4.5 rounded-full bg-[#b83227] text-white flex items-center justify-center text-[9px] font-mono font-black border border-white">
                5
              </span>
            </button>

            {/* Notification Dropdown Menu */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white sketch-border sketch-shadow z-50 p-3.5 space-y-2 select-text"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-[#e6dfd3]">
                      <h4 className="font-handwriting font-black text-sm text-[#b83227]">Notifications (5)</h4>
                      <button onClick={() => setShowNotifications(false)} className="text-[10px] font-mono text-[#2b2725]/45 hover:text-[#2b2725] cursor-pointer">Close</button>
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {notificationsList.map((noti, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs font-handwriting text-[#2b2725]/80 font-bold leading-normal hover:bg-[#e6dfd3]/10 p-1 rounded transition-colors cursor-pointer" onClick={() => { handleSend(noti); setShowNotifications(false); }}>
                          <span className="text-[#b83227] mt-0.5">🌸</span>
                          <span>{noti}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar Dropdown */}
          <div className="flex items-center space-x-2 bg-white sketch-border-sm p-1 pr-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#2b2725] bg-[#ebdcc8]/20 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <DootMascotHead className="w-6 h-6" />
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#2b2725]/60" />
          </div>

        </div>
      </div>

      {/* 2. BODY LAYOUT: MAIN SIDE & RIGHT BAR */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden select-text pr-1.5">
        
        {/* LEFT COLUMN: MAIN HERO / CHAT & BOTTOM WIDGETS */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* CENTER HERO PANEL / CHAT AREA */}
          <div className="bg-[#fcfaf4] sketch-border sketch-shadow flex-1 min-h-[420px] flex flex-col overflow-hidden relative rounded-xl">
            
            {/* Fuji Background Graphic - Visible in Dashboard Mode */}
            {!showChatHistory && <VectorLandscape />}

            {/* HEADER PANEL FOR CHAT */}
            {showChatHistory && (
              <div className="p-3 px-5 bg-white border-b border-[#e6dfd3] flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <DootMascotHead className="w-8 h-8" />
                  <div>
                    <h3 className="font-handwriting font-black text-sm text-[#2b2725] leading-none">Chatting with Doot</h3>
                    <p className="text-[10px] text-green-700 font-handwriting font-extrabold leading-none mt-0.5">Online & Syncing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="px-3 py-1 bg-white text-xs font-handwriting font-bold text-[#2b2725]/70 hover:text-[#2b2725] sketch-border-sm hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}

            {/* PANEL CONTENT SWITCHER */}
            <div className="flex-1 overflow-y-auto relative z-10 p-5 min-h-0 flex flex-col">
              <AnimatePresence mode="wait">
                
                {/* MODE A: CHAT HISTORY DISPLAY */}
                {showChatHistory ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 space-y-4 pr-1 scroll-smooth"
                  >
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 sketch-border-sm ${
                            msg.role === "user"
                              ? "bg-[#3c6382] text-white"
                              : "bg-white text-[#2b2725]"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1 opacity-70">
                            {msg.role === "assistant" && (
                              <Sparkles className="w-3.5 h-3.5 text-[#f5b041]" />
                            )}
                            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                              {msg.role === "user" ? "You" : "Doot Assistant"}
                            </span>
                          </div>
                          <p className="text-xs font-sans leading-relaxed whitespace-pre-line font-medium">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] p-4 bg-white sketch-border-sm flex items-center space-x-3 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-[#b83227]" />
                          <span className="font-handwriting text-xs text-[#2b2725]/60 font-bold">Doot is leafing through emails...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                ) : (
                  
                  // MODE B: DASHBOARD HERO ART & ACTION CHIPS
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    {/* Doot & Speech Bubble Panel */}
                    <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 py-2">
                      <DootWaving className="w-28 h-28 shrink-0 hover:scale-105 transition-transform" />
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-baseline justify-center md:justify-start space-x-2">
                          <h2 className="text-4xl font-handwriting font-black text-[#2b2725] tracking-tight">Doot AI</h2>
                          <span className="text-[10px] font-mono bg-[#ebdcc8]/50 text-[#b83227] font-bold px-1.5 py-0.5 rounded">Mascot</span>
                        </div>
                        <p className="text-xs font-mono text-[#2b2725]/60 max-w-xs font-semibold leading-relaxed">
                          Your AI Executive Assistant.<br />Always here to help you stay ahead.
                        </p>
                        
                        {/* Speech Bubble */}
                        <div className="p-2.5 px-4 bg-white border border-[#2b2725] rounded-2xl relative shadow-sm inline-block select-none text-xs font-handwriting font-black text-[#2b2725] border-b-3 border-r-3 border-[#ebdcc8]">
                          🌸 What would you like me to do today?
                        </div>
                      </div>
                    </div>

                    {/* Action Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                      {actionCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(card.text)}
                            className={`p-3.5 rounded-xl border border-[#2b2725]/25 hover:border-[#b83227]/50 text-left transition-all hover:scale-102 hover:shadow cursor-pointer relative overflow-hidden group select-none flex items-center space-x-3 ${card.bg} border-b-3 border-r-3`}
                          >
                            <div className="p-2 bg-white rounded-lg border border-[#2b2725]/20 text-[#2b2725] group-hover:text-[#b83227] shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-handwriting font-black text-xs text-[#2b2725] leading-snug">
                              {card.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CHAT INPUT AREA (SHARED AT BOTTOM OF HERO PANEL) */}
            <div className="p-4 bg-white border-t border-[#e6dfd3] flex flex-col space-y-3 shrink-0">
              
              {/* Suggestion Chips - Visible in active chat mode to helper prompts */}
              {showChatHistory && (
                <div className="flex gap-2 overflow-x-auto pb-1 select-none">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="px-3 py-1 bg-[#fcfaf4] hover:bg-[#e6dfd3]/20 text-[10px] font-handwriting font-black text-[#2b2725]/75 sketch-border-sm whitespace-nowrap cursor-pointer hover:scale-102 transition-transform shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask Doot anything..."
                  className="flex-1 px-4 py-2.5 bg-[#fbf9f4] sketch-border-sm text-xs font-handwriting font-bold focus:outline-none focus:ring-1 focus:ring-[#b83227]/40 shadow-inner"
                />
                <button
                  onClick={() => handleSend(input)}
                  className="p-2.5 bg-[#b83227] hover:bg-[#a02b21] text-white sketch-border-sm cursor-pointer shadow flex items-center justify-center transition-colors border-b-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status checklist label */}
              <div className="flex items-center justify-between text-[9px] font-mono text-[#2b2725]/50 font-bold select-none px-1">
                <span>✓ Doot uses AI to understand your context and get things done.</span>
                {showChatHistory && (
                  <button onClick={() => setShowChatHistory(false)} className="text-[#b83227] hover:underline cursor-pointer">
                    Back to dashboard view
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: THREE INTERACTIVE WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-52 shrink-0">
            
            {/* WIDGET 1: INTERACTIVE TASKS LIST */}
            <div className="bg-[#fdfbf7] sketch-border-sm p-4 flex flex-col justify-between relative overflow-hidden rounded-xl border-b-3 border-r-3">
              {/* Taped paper sticker look */}
              <div className="absolute top-[-8px] right-[10%] w-12 h-3 bg-[#e8a7a1]/40 border-l border-r border-dashed border-white/50 rotate-[-4deg]" />
              
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-handwriting font-black text-sm text-[#2b2725] flex items-center gap-1">
                  📋 Tasks
                </h3>
                <button 
                  onClick={() => setAddingTask(!addingTask)}
                  className="text-[10px] font-handwriting font-black text-[#b83227] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Tasks List Container */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
                {addingTask ? (
                  <form onSubmit={handleAddTask} className="bg-white p-2 border border-dashed border-[#ebdcc8] rounded-lg space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Task description..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="w-full p-1 text-xs font-handwriting font-bold border-b border-[#e6dfd3] focus:outline-none"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        {(["High", "Medium", "Low"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewTaskPriority(p)}
                            className={`text-[8px] font-mono px-1 rounded ${
                              newTaskPriority === p ? "bg-[#b83227] text-white" : "bg-[#e6dfd3]/40 text-[#2b2725]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="flex space-x-1 text-[9px] font-handwriting">
                        <button type="button" onClick={() => setAddingTask(false)} className="text-[#2b2725]/60 px-1">Cancel</button>
                        <button type="submit" className="text-white bg-green-700 px-1.5 rounded">Add</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs font-handwriting font-bold bg-white/60 p-1 px-2 border border-dashed border-[#e6dfd3] hover:border-gray-300 rounded-lg group transition-colors select-none">
                      <div className="flex items-center space-x-2 truncate">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                          className="w-3.5 h-3.5 accent-green-700 cursor-pointer"
                        />
                        <span className={`truncate ${t.completed ? "line-through text-[#2b2725]/40" : "text-[#2b2725]"}`}>
                          {t.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[8px] font-mono px-1 rounded font-bold uppercase ${
                          t.priority === "High" ? "bg-red-100 text-red-700" :
                          t.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {t.priority}
                        </span>
                        <button onClick={() => deleteTask(t.id)} className="text-[#2b2725]/30 hover:text-red-700 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-1 border-t border-dashed border-[#e6dfd3] text-right">
                <span className="text-[9px] font-mono text-[#2b2725]/50 font-bold">
                  {tasks.filter(t => !t.completed).length} active tasks remaining
                </span>
              </div>
            </div>

            {/* WIDGET 2: TOP CONTACTS */}
            <div className="bg-[#fdfbf7] sketch-border-sm p-4 flex flex-col justify-between relative overflow-hidden rounded-xl border-b-3 border-r-3">
              <div className="absolute top-[-8px] right-[25%] w-10 h-3 bg-[#f5b041]/20 border-l border-r border-dashed border-white/50 rotate-[3deg]" />
              
              <div>
                <h3 className="font-handwriting font-black text-sm text-[#2b2725] mb-2 flex items-center gap-1">
                  👥 Top Contacts
                </h3>
                
                <div className="space-y-2">
                  {/* Contact 1 */}
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6.5 h-6.5 rounded-full bg-purple-100 text-purple-700 font-mono font-bold flex items-center justify-center text-xs border border-purple-400">
                      A
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-handwriting font-black leading-none text-[#2b2725]">Aarav Mehta</p>
                      <p className="text-[9px] text-[#2b2725]/55 font-mono leading-none">aarav@xxample.com</p>
                    </div>
                  </div>

                  {/* Contact 2 */}
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6.5 h-6.5 rounded-full bg-[#fcdfd7] text-[#b83227] font-mono font-bold flex items-center justify-center text-xs border border-[#b83227]/30">
                      R
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-handwriting font-black leading-none text-[#2b2725]">Riya Sharma</p>
                      <p className="text-[9px] text-[#2b2725]/55 font-mono leading-none">riya@example.com</p>
                    </div>
                  </div>

                  {/* Contact 3 */}
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6.5 h-6.5 rounded-full bg-green-100 text-green-700 font-mono font-bold flex items-center justify-center text-xs border border-green-400">
                      C
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-handwriting font-black leading-none text-[#2b2725]">Corsair Team</p>
                      <p className="text-[9px] text-[#2b2725]/55 font-mono leading-none">team@corsair.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-[#2b2725]/50 font-bold border-t border-dashed border-[#e6dfd3] pt-1 text-right select-none">
                3 workspaces verified
              </div>
            </div>

            {/* WIDGET 3: AI SUGGESTIONS */}
            <div className="bg-[#fdfbf7] sketch-border-sm p-4 flex flex-col justify-between relative overflow-hidden rounded-xl border-b-3 border-r-3">
              {/* Sticker tape */}
              <div className="absolute top-[-8px] left-[15%] w-11 h-3 bg-green-200/30 border-l border-r border-dashed border-white/50 rotate-[-2deg]" />
              
              {/* Mascot Head watermark in bottom right corner */}
              <div className="absolute bottom-1 right-1 opacity-20 pointer-events-none">
                <DootMascotHead className="w-12 h-12" />
              </div>

              <div>
                <h3 className="font-handwriting font-black text-sm text-[#2b2725] mb-2 flex items-center gap-1">
                  ✨ Suggestions
                </h3>

                <div className="space-y-1.5 z-10 relative">
                  {suggestionChips.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="w-full text-left p-1.5 bg-[#fef5f0]/80 hover:bg-[#fcdfd7] text-[10px] font-handwriting font-extrabold text-[#b83227] rounded-lg border border-dashed border-[#e8a7a1] transition-all truncate shadow-inner cursor-pointer"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[9px] font-mono text-[#2b2725]/50 font-bold border-t border-dashed border-[#e6dfd3] pt-1 select-none">
                Updated just now
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: INDEX CARD PANELS (Today's Brief, Upcoming, Recent Emails) */}
        <div className="w-full lg:w-76 flex flex-col gap-6 shrink-0">
          
          {/* CARD 1: TODAY'S BRIEF */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none">
            {/* Washi Tape Ribbon */}
            <div className="absolute top-[-10px] left-[15%] w-16 h-4 bg-[#ebd2be] opacity-75 border-l border-r border-dashed border-white/40 rotate-[-5deg] shadow-sm select-none pointer-events-none" />
            
            {/* Bamboo background decoration */}
            <VectorBamboo />

            <h3 className="font-handwriting font-black text-lg text-[#2b2725] mb-3 relative z-10 flex items-center gap-1.5">
              Today's Brief <span className="text-red-500">🌸</span>
            </h3>

            <div className="space-y-3 relative z-10">
              
              {/* Unread Emails */}
              <div 
                onClick={() => handleSend("Summarize unread emails")}
                className="flex items-center space-x-3 p-1 rounded hover:bg-[#e6dfd3]/20 transition-colors cursor-pointer"
              >
                <div className="p-1.5 bg-[#b83227]/10 rounded border border-dashed border-[#b83227]/30 text-[#b83227]">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-lg font-handwriting font-black text-[#2b2725] leading-none">{stats.unreadEmails}</p>
                  <p className="text-[10px] font-handwriting font-bold text-[#2b2725]/60 leading-none">Unread Emails</p>
                </div>
              </div>

              {/* Meetings Today */}
              <div 
                onClick={() => handleSend("Show today's agenda")}
                className="flex items-center space-x-3 p-1 rounded hover:bg-[#e6dfd3]/20 transition-colors cursor-pointer"
              >
                <div className="p-1.5 bg-[#3c6382]/10 rounded border border-dashed border-[#3c6382]/30 text-[#3c6382]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-lg font-handwriting font-black text-[#2b2725] leading-none">{stats.meetingsToday}</p>
                  <p className="text-[10px] font-handwriting font-bold text-[#2b2725]/60 leading-none">Meetings Today</p>
                </div>
              </div>

              {/* Tasks Pending */}
              <div className="flex items-center space-x-3 p-1">
                <div className="p-1.5 bg-green-50 text-green-700 rounded border border-dashed border-green-300">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-lg font-handwriting font-black text-[#2b2725] leading-none">{tasks.filter(t=>!t.completed).length}</p>
                  <p className="text-[10px] font-handwriting font-bold text-[#2b2725]/60 leading-none">Tasks Pending</p>
                </div>
              </div>

              {/* High Priority */}
              <div className="flex items-center space-x-3 p-1">
                <div className="p-1.5 bg-yellow-50 text-yellow-700 rounded border border-dashed border-yellow-300">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-lg font-handwriting font-black text-[#2b2725] leading-none">
                    {tasks.filter(t => !t.completed && t.priority === "High").length}
                  </p>
                  <p className="text-[10px] font-handwriting font-bold text-[#2b2725]/60 leading-none">High Priority</p>
                </div>
              </div>

            </div>
          </div>

          {/* CARD 2: UPCOMING MEETINGS */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none">
            {/* Washi Tape Ribbon */}
            <div className="absolute top-[-10px] right-[10%] w-14 h-4 bg-[#fcdfd7] opacity-75 border-l border-r border-dashed border-white/40 rotate-[3deg] shadow-sm select-none pointer-events-none" />
            
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="font-handwriting font-black text-lg text-[#2b2725]">Upcoming Meetings</h3>
              <button 
                onClick={() => handleSend("Show my meetings schedule")}
                className="text-[9px] font-handwriting font-bold text-[#b83227] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {/* Meetings Timeline */}
            <div className="space-y-4 text-left pl-2.5 border-l-2 border-dashed border-[#e6dfd3] relative">
              
              {/* Meeting 1 */}
              <div className="relative">
                <div className="absolute left-[-15.5px] top-[4px] w-2.5 h-2.5 rounded-full bg-[#3c6382] border-2 border-white shadow-sm" />
                <div className="leading-snug">
                  <p className="text-[10px] font-mono text-[#3c6382] font-black">10:00 AM</p>
                  <h4 className="text-xs font-handwriting font-black text-[#2b2725]">Team Standup</h4>
                  <p className="text-[9px] text-[#2b2725]/55 font-mono">30 min • Google Meet</p>
                </div>
              </div>

              {/* Meeting 2 */}
              <div className="relative">
                <div className="absolute left-[-15.5px] top-[4px] w-2.5 h-2.5 rounded-full bg-green-700 border-2 border-white shadow-sm" />
                <div className="leading-snug">
                  <p className="text-[10px] font-mono text-green-700 font-black">11:30 AM</p>
                  <h4 className="text-xs font-handwriting font-black text-[#2b2725]">Client Call</h4>
                  <p className="text-[9px] text-[#2b2725]/55 font-mono">1 hr • Zoom Meeting</p>
                </div>
              </div>

              {/* Meeting 3 */}
              <div className="relative">
                <div className="absolute left-[-15.5px] top-[4px] w-2.5 h-2.5 rounded-full bg-[#b83227] border-2 border-white shadow-sm" />
                <div className="leading-snug">
                  <p className="text-[10px] font-mono text-[#b83227] font-black">2:00 PM</p>
                  <h4 className="text-xs font-handwriting font-black text-[#2b2725]">Product Demo</h4>
                  <p className="text-[9px] text-[#2b2725]/55 font-mono">1 hr • Google Meet</p>
                </div>
              </div>

            </div>
          </div>

          {/* CARD 3: RECENT EMAILS */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none flex-1 flex flex-col justify-between">
            {/* Washi Tape Ribbon */}
            <div className="absolute top-[-10px] left-[25%] w-15 h-4 bg-[#c8e6c9]/60 opacity-75 border-l border-r border-dashed border-white/40 rotate-[-1deg] shadow-sm select-none pointer-events-none" />

            {/* Traditional Stone lantern decoration in background */}
            <VectorLantern />

            <div className="flex justify-between items-baseline mb-3 relative z-10">
              <h3 className="font-handwriting font-black text-lg text-[#2b2725]">Recent Emails</h3>
              <button 
                onClick={() => handleSend("Show my recent emails")}
                className="text-[9px] font-handwriting font-bold text-[#b83227] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {/* Email list */}
            <div className="space-y-3 text-left relative z-10 flex-1 flex flex-col justify-start">
              
              {/* Email 1 */}
              <div 
                onClick={() => handleSend("Summarize email from Aarav Mehta")}
                className="p-2 bg-white/70 border border-dashed border-[#e6dfd3] hover:border-gray-300 rounded-lg cursor-pointer transition-all flex justify-between items-center"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b83227]" />
                    <h4 className="text-xs font-handwriting font-black text-[#2b2725] truncate">Aarav Mehta</h4>
                  </div>
                  <p className="text-[10px] font-handwriting text-[#2b2725]/65 font-bold truncate pl-3">Meeting Follow Up</p>
                </div>
                <span className="text-[9px] font-mono text-[#2b2725]/50 whitespace-nowrap">9:15 AM</span>
              </div>

              {/* Email 2 */}
              <div 
                onClick={() => handleSend("Summarize email from Corsair Team")}
                className="p-2 bg-white/70 border border-dashed border-[#e6dfd3] hover:border-gray-300 rounded-lg cursor-pointer transition-all flex justify-between items-center"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b83227]" />
                    <h4 className="text-xs font-handwriting font-black text-[#2b2725] truncate">Corsair Team</h4>
                  </div>
                  <p className="text-[10px] font-handwriting text-[#2b2725]/65 font-bold truncate pl-3">Hackathon Update</p>
                </div>
                <span className="text-[9px] font-mono text-[#2b2725]/50 whitespace-nowrap">8:45 AM</span>
              </div>

              {/* Email 3 */}
              <div 
                onClick={() => handleSend("Show calendar updates")}
                className="p-2 bg-white/70 border border-dashed border-[#e6dfd3] hover:border-gray-300 rounded-lg cursor-pointer transition-all flex justify-between items-center"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3c6382]" />
                    <h4 className="text-xs font-handwriting font-black text-[#2b2725] truncate">Google Calendar</h4>
                  </div>
                  <p className="text-[10px] font-handwriting text-[#2b2725]/65 font-bold truncate pl-3">Event Updated</p>
                </div>
                <span className="text-[9px] font-mono text-[#2b2725]/50 whitespace-nowrap">7:30 AM</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );

  function handleQuickAction(text: string) {
    setInput(text);
    handleSend(text);
  }
}

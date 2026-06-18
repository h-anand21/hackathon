"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  // Dynamic state loaded from APIs
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Interactive Tasks list state
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

  const loadDashboardData = async (uid: string) => {
    try {
      // 1. Fetch tasks
      const tasksRes = await fetch(`/api/tasks?userId=${uid}`);
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        const mapped = tasksData.tasks.map((t: any) => ({
          id: t.id,
          text: t.title,
          priority: t.priority,
          completed: t.completed
        }));
        setTasks(mapped);
      } else {
        // Default fallback tasks
        setTasks([
          { id: 1, text: "Review hackathon proposal", priority: "High", completed: false },
          { id: 2, text: "Send update to team", priority: "Medium", completed: false },
          { id: 3, text: "Prepare for client demo", priority: "High", completed: false }
        ]);
      }

      // 2. Fetch contacts
      const contactsRes = await fetch("/api/contacts");
      const contactsData = await contactsRes.json();
      if (contactsData.success) {
        setContacts(contactsData.contacts);
      }

      // 3. Fetch recent emails
      const inboxRes = await fetch(`/api/inbox?userId=${uid}`);
      const inboxData = await inboxRes.json();
      if (inboxData.success) {
        setEmails(inboxData.emails);
      }

      // 4. Fetch meetings
      const calRes = await fetch(`/api/calendar?userId=${uid}`);
      const calData = await calRes.json();
      if (calData.success) {
        setMeetings(calData.events);
      }
    } catch (e) {
      console.error("Failed loading dashboard data:", e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadDashboardData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Stats matching mockup
  const stats = {
    unreadEmails: emails.length || 12,
    meetingsToday: meetings.filter(m => {
      const start = new Date(m.start);
      const today = new Date();
      return start.toDateString() === today.toDateString();
    }).length || meetings.length || 3,
    tasksPending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => !t.completed && t.priority === "High").length
  };

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
        
        // Reload dashboard tasks if user scheduled/added anything
        if (textToSend.toLowerCase().includes("schedule") || textToSend.toLowerCase().includes("task") || textToSend.toLowerCase().includes("meeting")) {
          setTimeout(() => loadDashboardData(user.uid), 800);
        }
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
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  // Add Task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user) return;
    
    const text = newTaskText.trim();
    const priority = newTaskPriority;
    setNewTaskText("");
    setAddingTask(false);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          title: text,
          priority
        })
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [
          {
            id: data.task.id,
            text: data.task.title,
            priority: data.task.priority,
            completed: data.task.completed
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Error adding task:", err);
      // Local state fallback
      const newTask: TaskItem = {
        id: Date.now(),
        text,
        priority,
        completed: false
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // Toggle Task completed
  const toggleTask = async (id: any) => {
    const t = tasks.find(item => item.id === id);
    if (!t) return;
    
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: id,
          completed: !t.completed
        })
      });
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Delete task
  const deleteTask = async (id: any) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks?taskId=${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
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

        {/* 2. BODY LAYOUT: FULL-SCREEN CHAT ASSISTANT PANEL */}
      <div className="flex-1 flex flex-col min-h-0 select-text pr-1.5 pb-2">
        
        {/* CENTER HERO PANEL / CHAT AREA (FULL SCREEN WIDTH) */}
        <div className="bg-[#fcfaf4] sketch-border sketch-shadow flex-1 min-h-0 flex flex-col overflow-hidden relative rounded-xl border-b-3 border-r-3">
          
          {/* Ghibli Watercolor Landscape Background - Always visible as a watermark overlay */}
          <VectorLandscape />

          {/* HEADER PANEL FOR CHAT */}
          <div className="p-3 px-5 bg-white/90 border-b border-[#e6dfd3] flex justify-between items-center z-10 shrink-0 select-none">
            <div className="flex items-center space-x-2.5">
              <DootMascotHead className="w-8 h-8" />
              <div>
                <h3 className="font-handwriting font-black text-sm text-[#2b2725] leading-none">Doot AI Sensei</h3>
                <p className="text-[10px] text-green-700 font-handwriting font-extrabold leading-none mt-0.5">Online & Synced with MailOS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMessages([
                  {
                    id: "welcome",
                    role: "assistant",
                    content: "Konnichiwa! 🌸 I am Doot, your personal mail assistant. Ask me anything about your emails, tasks, or calendar schedule. For example, you can say: 'What is on my schedule today?' or 'Draft an email to Aarav Patel.'",
                    createdAt: new Date().toISOString()
                  }
                ])}
                className="px-2.5 py-1 bg-white hover:bg-red-50 text-xs font-handwriting font-black text-red-700 hover:text-red-800 sketch-border-sm transition-all cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES STREAM CONTAINER */}
          <div className="flex-1 overflow-y-auto relative z-10 p-5 min-h-0 flex flex-col space-y-4 notebook-grid-small pr-1 scroll-smooth">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} items-start space-x-2.5`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-white border border-[#2b2725] flex items-center justify-center shrink-0 shadow-sm mt-0.5 select-none">
                      <Bot className="w-4.5 h-4.5 text-[#b83227]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl shadow-sm border-b-3 text-left relative ${
                      isAssistant
                        ? "bg-white border-[#ebdcc8] text-[#2b2725]"
                        : "bg-[#fcdfd7] border-[#b83227]/25 text-[#2b2725]"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1.5 opacity-60 select-none">
                      {isAssistant && <Sparkles className="w-3.5 h-3.5 text-[#f5b041]" />}
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                        {isAssistant ? "Doot AI" : "You"}
                      </span>
                    </div>
                    <p className="text-xs font-sans leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                    <span className="block font-mono text-[8px] text-gray-400 mt-2 text-right select-none">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-[#2b2725] flex items-center justify-center shrink-0 shadow-sm select-none">
                  <Bot className="w-4.5 h-4.5 text-[#b83227]" />
                </div>
                <div className="bg-white border border-[#ebdcc8] rounded-2xl px-4 py-3 shadow-sm flex items-center space-x-2 text-xs font-handwriting text-[#2b2725]/60">
                  <Loader2 className="w-4 h-4 animate-spin text-[#b83227]" />
                  <span>Doot is organizing your sketchbook agenda... 🌸</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK BENTO SUGGESTION CARDS PANEL */}
          <div className="p-4 bg-white/95 border-t border-[#e6dfd3] flex flex-col space-y-3 shrink-0 z-10 select-none">
            
            {/* Horizontal suggestion chips deck */}
            <div className="flex gap-2 overflow-x-auto pb-1 select-none">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1 bg-[#fcfaf4] hover:bg-[#e6dfd3]/20 text-[10px] font-handwriting font-black text-[#2b2725]/75 sketch-border-sm whitespace-nowrap cursor-pointer hover:scale-102 transition-transform shadow-sm"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Selector Mode tags */}
            <div className="flex space-x-2 select-none">
              <span className="text-[10px] font-handwriting font-black text-[#2b2725]/50 self-center">Task Mode:</span>
              {["Standard", "Deep Search", "Analyze", "Create"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSend(`Run ${mode.toLowerCase()} mode query: `)}
                  className="px-2.5 py-0.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-[9px] font-handwriting font-black cursor-pointer shadow-sm"
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Input form */}
            <div className="flex items-center space-x-3 select-none">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask Doot to schedule review, summarize email scrolls, forward drafts, add meetings..."
                className="flex-1 px-4 py-2.5 bg-[#fbf9f4] sketch-border-sm text-xs font-handwriting font-bold focus:outline-none focus:ring-1 focus:ring-[#b83227]/40 shadow-inner h-11 resize-none leading-relaxed"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={sending || !input.trim()}
                className="p-3 bg-[#b83227] hover:bg-[#a02b21] disabled:opacity-50 text-white sketch-border-sm cursor-pointer shadow flex items-center justify-center transition-all hover:scale-103 border-b-3"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Footer status notice */}
            <div className="flex items-center justify-between text-[9px] font-mono text-[#2b2725]/50 font-bold select-none px-1">
              <span>✓ Doot AI Co-Pilot executes calendar block scheduling and email sends dynamically.</span>
              <span>Village Library v1.2</span>
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

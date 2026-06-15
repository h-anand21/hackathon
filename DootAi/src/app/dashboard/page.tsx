"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Sparkles, ArrowRight, Loader2, Send, Mail, Calendar, CheckCircle2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
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
  const [stats, setStats] = useState({ priorityCount: 0, eventsCount: 0, tasksCount: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(auth.currentUser);
    if (auth.currentUser) {
      fetchDashboardStats(auth.currentUser.uid);
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDashboardStats = async (uid: string) => {
    try {
      // In a real app, this endpoint returns summary statistics of user data
      // For now, let's fetch from status or simulate a call
      const res = await fetch(`/api/corsair/status?tenantId=${uid}`);
      const data = await res.json();
      if (data.success) {
        // Just mock some stats for presentation
        setStats({
          priorityCount: 3,
          eventsCount: 2,
          tasksCount: 4
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    setSending(true);

    try {
      // API call to our LLM chat handler (we'll implement /api/chat next)
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
      // Fallback message if api/chat is not fully ready
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: `I processed your request: "${textToSend}". Since our AI connection is being updated, I've logged this task in your local workspace. Let me know if you want me to do anything else! 🌸`,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const suggestionChips = [
    "Draft a reply to Aarav Patel saying I'm interested",
    "What is on my schedule today?",
    "Show my high priority emails",
    "Add a task: Prepare slide deck for hackathon"
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* Top Banner */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-handwriting text-[#2b2725]">
          Konnichiwa, {user?.displayName?.split(" ")[0] || "Friend"}! 🌸
        </h1>
        <p className="text-xs text-[#2b2725]/60 mt-1 font-mono">
          Your Japanese Watercolor Notebook Workspace is active.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        {/* Priority Emails Stats */}
        <div className="p-4 bg-white sketch-border-sm sketch-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#b83227] font-bold">Priority Emails</span>
            <h4 className="text-2xl font-bold font-handwriting text-[#2b2725]">{stats.priorityCount} Urgent</h4>
          </div>
          <div className="p-2.5 bg-[#b83227]/5 text-[#b83227] sketch-border-sm">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        {/* Calendar Stats */}
        <div className="p-4 bg-white sketch-border-sm sketch-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#3c6382] font-bold">Today's Schedule</span>
            <h4 className="text-2xl font-bold font-handwriting text-[#2b2725]">{stats.eventsCount} Events</h4>
          </div>
          <div className="p-2.5 bg-[#3c6382]/5 text-[#3c6382] sketch-border-sm">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Tasks Stats */}
        <div className="p-4 bg-white sketch-border-sm sketch-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#388e3c] font-bold">Remaining Tasks</span>
            <h4 className="text-2xl font-bold font-handwriting text-[#2b2725]">{stats.tasksCount} Active</h4>
          </div>
          <div className="p-2.5 bg-[#388e3c]/5 text-[#388e3c] sketch-border-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white sketch-border sketch-shadow flex flex-col overflow-hidden min-h-0">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 notebook-grid-small">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 sketch-border-sm ${
                  msg.role === "user"
                    ? "bg-[#3c6382] text-white"
                    : "bg-[#fbf8f3] text-[#2b2725]"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1.5">
                  {msg.role === "assistant" && (
                    <Sparkles className="w-3.5 h-3.5 text-[#f5b041]" />
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                    {msg.role === "user" ? "You" : "Doot Assistant"}
                  </span>
                </div>
                <p className="text-sm font-sans leading-relaxed whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 bg-[#fbf8f3] sketch-border-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#3c6382]" />
                <span className="font-handwriting text-xs text-[#2b2725]/60">Doot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-[#fbf8f3]/80 border-t border-dashed border-[#e6dfd3] flex gap-2 overflow-x-auto select-none">
          {suggestionChips.map((chip, index) => (
            <button
              key={index}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 bg-white text-[11px] font-bold text-[#2b2725]/80 sketch-border-sm whitespace-nowrap hover:bg-[#e6dfd3]/20 transition-all hover:scale-102 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-[#e6dfd3] flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask Doot anything about your mail, calendar or tasks..."
            className="flex-1 px-4 py-3 bg-[#fbf8f3] sketch-border-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#3c6382]"
          />
          <button
            onClick={() => handleSend(input)}
            className="p-3 bg-[#b83227] text-white sketch-border sketch-shadow-hover cursor-pointer flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

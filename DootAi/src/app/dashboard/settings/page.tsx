"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import {
  Settings,
  Sparkles,
  Loader2,
  CheckCircle,
  HelpCircle,
  Keyboard,
  Globe,
  Bell,
  Eye,
  Sliders,
  Shield,
  RefreshCw,
  BookOpen
} from "lucide-react";

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

// Vector Mt. Fuji for profile background
function VectorMtFuji() {
  return (
    <div className="absolute inset-0 opacity-15 pointer-events-none select-none z-0">
      <svg viewBox="0 0 200 100" className="w-full h-full object-cover">
        <circle cx="150" cy="35" r="15" fill="#ebdcc8" opacity="0.4" />
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

// Vector Stone Lantern
function VectorStoneLantern() {
  return (
    <svg viewBox="0 0 60 80" className="w-12 h-16 opacity-25 absolute right-2 bottom-2 pointer-events-none z-0">
      <path d="M 15 35 Q 30 23 45 35 L 40 42 L 20 42 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
      <line x1="30" y1="28" x2="30" y2="22" stroke="#2b2725" strokeWidth="2" />
      <circle cx="30" cy="19" r="2.5" fill="#fcf2eb" stroke="#2b2725" strokeWidth="1.2" />

      <rect x="23" y="42" width="14" height="12" fill="#ffffff" stroke="#2b2725" strokeWidth="1.5" />
      <circle cx="30" cy="48" r="2.5" fill="#f5b041" />

      <rect x="20" y="54" width="20" height="4" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
      <path d="M 26 58 L 24 75 L 36 75 L 34 58 Z" fill="#dbd0be" stroke="#2b2725" strokeWidth="1.5" />
      <path d="M 10 75 Q 30 72 50 75 L 45 80 L 15 80 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="1.5" />
    </svg>
  );
}

// Doot Reading a Scroll (Cozy Help Mascot)
function DootReadingMascot() {
  return (
    <div className="w-24 h-24 shrink-0 hover:scale-105 transition-transform relative select-none mx-auto">
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="25" x2="60" y2="10" stroke="#2b2725" strokeWidth="2" />
        <circle cx="60" cy="8" r="3.5" fill="#b83227" stroke="#2b2725" strokeWidth="1.2" />
        
        {/* Head */}
        <rect x="35" y="25" width="50" height="34" rx="14" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        <rect x="42" y="30" width="36" height="18" rx="5" fill="#2b2725" />
        {/* Curved reading eyes */}
        <path d="M 47 40 Q 51 43 55 40" stroke="#388e3c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 63 40 Q 67 43 71 40" stroke="#388e3c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="45" cy="43" r="1.5" fill="#e8a7a1" />
        <circle cx="73" cy="43" r="1.5" fill="#e8a7a1" />

        {/* Body */}
        <path d="M 46 59 L 74 59 L 70 78 L 50 78 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />

        {/* Scroll details */}
        <rect x="25" y="70" width="70" height="18" rx="2" fill="#fff9ef" stroke="#2b2725" strokeWidth="2" />
        <line x1="32" y1="74" x2="88" y2="74" stroke="#e6dfd3" strokeWidth="1.5" />
        <line x1="32" y1="79" x2="88" y2="79" stroke="#e6dfd3" strokeWidth="1.5" />
        {/* Wooden rollers */}
        <rect x="21" y="68" width="4" height="22" rx="1" fill="#c0392b" stroke="#2b2725" strokeWidth="1" />
        <rect x="95" y="68" width="4" height="22" rx="1" fill="#c0392b" stroke="#2b2725" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Optimization Score Gauge SVG
function OptimizationScoreGauge({ score = 85 }: { score?: number }) {
  const radius = 32;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center mx-auto select-none">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e6dfd3"
          strokeWidth={strokeWidth}
          strokeDasharray="3 3"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#388e3c"
          strokeWidth={strokeWidth}
          strokeDashoffset={strokeDashoffset}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-handwriting text-[#2b2725]">
        <span className="text-xl font-black leading-none">{score}%</span>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Optimal</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  // States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "account">("general");

  // Form State Values
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("GMT+05:30");
  const [dateFormat, setDateFormat] = useState("MMM DD, YYYY");
  const [use24h, setUse24h] = useState(false);
  const [startOfWeek, setStartOfWeek] = useState("Monday");
  const [defaultView, setDefaultView] = useState("Dashboard");

  // Toggle Preferences
  const [prefSummarize, setPrefSummarize] = useState(true);
  const [prefDraft, setPrefDraft] = useState(true);
  const [prefMeetings, setPrefMeetings] = useState(true);
  const [prefMorningBrief, setPrefMorningBrief] = useState(true);
  const [prefTaskExtract, setPrefTaskExtract] = useState(false);

  // Optimization Score Calculation
  const calculateScore = () => {
    let base = 50;
    if (prefSummarize) base += 10;
    if (prefDraft) base += 10;
    if (prefMeetings) base += 10;
    if (prefMorningBrief) base += 10;
    if (prefTaskExtract) base += 10;
    return base;
  };

  // Load preferences from DB
  const loadPreferences = async (currentUser: FirebaseUser) => {
    try {
      const res = await fetch(`/api/user/preferences?userId=${currentUser.uid}`);
      const data = await res.json();
      if (data.success && data.preferences) {
        const p = data.preferences;
        if (p.language) setLanguage(p.language);
        if (p.timezone) setTimezone(p.timezone);
        if (p.dateFormat) setDateFormat(p.dateFormat);
        if (p.use24h !== undefined) setUse24h(p.use24h);
        if (p.startOfWeek) setStartOfWeek(p.startOfWeek);
        if (p.defaultView) setDefaultView(p.defaultView);
        if (p.summarizeEmails !== undefined) setPrefSummarize(p.summarizeEmails);
        if (p.draftReplies !== undefined) setPrefDraft(p.draftReplies);
        if (p.manageMeetings !== undefined) setPrefMeetings(p.manageMeetings);
        if (p.morningBriefing !== undefined) setPrefMorningBrief(p.morningBriefing);
        if (p.taskExtraction !== undefined) setPrefTaskExtract(p.taskExtraction);
      }
    } catch (e) {
      console.error("Failed to load user preferences:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadPreferences(currentUser);
      } else {
        router.push("/onboarding");
      }
    });
    return () => checkUser();
  }, [router]);

  // Handle Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          preferences: {
            language,
            timezone,
            dateFormat,
            use24h,
            startOfWeek,
            defaultView,
            summarizeEmails: prefSummarize,
            draftReplies: prefDraft,
            manageMeetings: prefMeetings,
            morningBriefing: prefMorningBrief,
            taskExtraction: prefTaskExtract
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Cozy preferences synchronized and saved! 🌸");
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to sync settings. Will save locally. ⛩️");
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const resetToCozyDefaults = () => {
    setLanguage("English (US)");
    setTimezone("GMT+05:30");
    setDateFormat("MMM DD, YYYY");
    setUse24h(false);
    setStartOfWeek("Monday");
    setDefaultView("Dashboard");
    setPrefSummarize(true);
    setPrefDraft(true);
    setPrefMeetings(true);
    setPrefMorningBrief(true);
    setPrefTaskExtract(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b83227]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-text">
      
      {/* 1. TOP HEADER */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none flex items-center gap-2">
            Settings <span className="text-[#2b2725]">⛩️</span>
          </h1>
          <p className="text-xs font-handwriting text-[#2b2725]/60 font-bold mt-1">Configure your Japanese Sketchbook MailOS suite.</p>
        </div>
      </div>

      {/* 2. BODY SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pr-1">
        
        {/* LEFT COLUMN: SETTINGS TABS & FORM (75% width) */}
        <div className="flex-1 flex flex-col gap-6 min-h-[500px] lg:min-h-0 shrink-0">
          
          {/* Preferences At A Glance Row (watercolor cards held with washi tapes) */}
          <div className="grid grid-cols-3 gap-4 select-none shrink-0">
            {[
              { label: "COZY LOCALE", value: language, bg: "bg-[#fcf2eb]" },
              { label: "TIMEZONE", value: timezone, bg: "bg-[#fdf9f4]" },
              { label: "DEFAULT TAB", value: defaultView, bg: "bg-[#fcdfd7]/40" }
            ].map((card, idx) => (
              <div key={idx} className={`${card.bg} p-3 sketch-border-sm relative overflow-hidden rounded-xl text-center shadow-sm`}>
                {/* Washi tape sticker */}
                <div className="absolute top-[-5px] left-[30%] w-14 h-4 bg-[#ebdcc8]/60 border-l border-r border-dashed border-white/50 rotate-[-1deg]" />
                <span className="block text-[8px] font-mono text-gray-400 font-bold tracking-wider uppercase mt-1">{card.label}</span>
                <span className="block text-xs font-handwriting font-black text-[#2b2725] mt-1 truncate">{card.value}</span>
              </div>
            ))}
          </div>

          {/* Main settings tabs and form */}
          <div className="flex-1 bg-white sketch-border sketch-shadow rounded-xl p-5 flex flex-col min-h-0">
            
            {/* Tabs selector row */}
            <div className="flex space-x-2 border-b border-[#e6dfd3] pb-2 mb-4 select-none shrink-0">
              {[
                { id: "general", name: "General Settings", icon: Sliders },
                { id: "ai", name: "AI Preferences", icon: Sparkles },
                { id: "account", name: "Account Stamps", icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 font-handwriting font-bold text-xs rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors ${
                      isSel ? "bg-[#fcdfd7] text-[#b83227] font-black" : "hover:bg-gray-50 text-[#2b2725]/70"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable form content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
              
              {activeTab === "general" && (
                <div className="space-y-4 font-handwriting font-bold text-xs text-[#2b2725]">
                  <h3 className="font-handwriting font-black text-sm text-[#2b2725]/60 pb-1 border-b border-dashed border-[#e6dfd3] select-none">
                    Locale & Viewing Options
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Language Pack</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2 bg-white sketch-border-sm focus:outline-none font-bold font-handwriting"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="Hinglish (Hindi/EN)">Hinglish (Hindi/EN)</option>
                        <option value="Japanese (日本語)">Japanese (日本語)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full p-2 bg-white sketch-border-sm focus:outline-none font-bold font-handwriting"
                      >
                        <option value="GMT+05:30">GMT+05:30 (Mumbai, India)</option>
                        <option value="GMT-07:00">GMT-07:00 (Pacific Time)</option>
                        <option value="GMT+09:00">GMT+09:00 (Tokyo, Japan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Date Format</label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full p-2 bg-white sketch-border-sm focus:outline-none font-bold font-handwriting"
                      >
                        <option value="MMM DD, YYYY">MMM DD, YYYY (Jun 18, 2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-18)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (18/06/2026)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Time Format</label>
                      <div className="flex items-center space-x-3 h-8.5 select-none">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            checked={!use24h}
                            onChange={() => setUse24h(false)}
                            className="accent-[#b83227]"
                          />
                          <span>12-hour (1:00 PM)</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            checked={use24h}
                            onChange={() => setUse24h(true)}
                            className="accent-[#b83227]"
                          />
                          <span>24-hour (13:00)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Start of Week</label>
                      <select
                        value={startOfWeek}
                        onChange={(e) => setStartOfWeek(e.target.value)}
                        className="w-full p-2 bg-white sketch-border-sm focus:outline-none font-bold font-handwriting"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 select-none font-bold">Default Landing View</label>
                      <select
                        value={defaultView}
                        onChange={(e) => setDefaultView(e.target.value)}
                        className="w-full p-2 bg-white sketch-border-sm focus:outline-none font-bold font-handwriting"
                      >
                        <option value="Dashboard">Dashboard Homepage</option>
                        <option value="Inbox">Inbox Split-pane</option>
                        <option value="AI Assistant">Doot AI Assistant</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-4 font-handwriting font-bold text-xs text-[#2b2725]">
                  <h3 className="font-handwriting font-black text-sm text-[#2b2725]/60 pb-1 border-b border-dashed border-[#e6dfd3] select-none">
                    Doot AI Co-Pilot Preferences
                  </h3>

                  <div className="space-y-3.5 select-none">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefSummarize}
                        onChange={(e) => setPrefSummarize(e.target.checked)}
                        className="mt-0.5 accent-[#b83227]"
                      />
                      <div>
                        <span className="block font-black text-xs text-[#2b2725]">Auto-summarize incoming email scrolls</span>
                        <span className="block text-[10px] text-gray-400 font-normal leading-normal">Creates a bulleted Ghibli brief panel instantly in the reading view.</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefDraft}
                        onChange={(e) => setPrefDraft(e.target.checked)}
                        className="mt-0.5 accent-[#b83227]"
                      />
                      <div>
                        <span className="block font-black text-xs text-[#2b2725]">Suggest draft replies using Gemini co-pilot</span>
                        <span className="block text-[10px] text-gray-400 font-normal leading-normal">Suggests context-aware mail drafts with preset tone selectors.</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefMeetings}
                        onChange={(e) => setPrefMeetings(e.target.checked)}
                        className="mt-0.5 accent-[#b83227]"
                      />
                      <div>
                        <span className="block font-black text-xs text-[#2b2725]">Automate meeting event suggestions</span>
                        <span className="block text-[10px] text-gray-400 font-normal leading-normal">Automatically parses messages with scheduling intents and creates calendar blocks.</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefMorningBrief}
                        onChange={(e) => setPrefMorningBrief(e.target.checked)}
                        className="mt-0.5 accent-[#b83227]"
                      />
                      <div>
                        <span className="block font-black text-xs text-[#2b2725]">Generate daily morning brief scrolls</span>
                        <span className="block text-[10px] text-gray-400 font-normal leading-normal">Shows a summary index card of meetings, top items, and tasks on dashboard load.</span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefTaskExtract}
                        onChange={(e) => setPrefTaskExtract(e.target.checked)}
                        className="mt-0.5 accent-[#b83227]"
                      />
                      <div>
                        <span className="block font-black text-xs text-[#2b2725]">Extract inbox tasks automatically</span>
                        <span className="block text-[10px] text-gray-400 font-normal leading-normal">Analyses incoming emails to extract tasks and adds them to your local task list.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-4 font-handwriting font-bold text-xs text-[#2b2725]">
                  <h3 className="font-handwriting font-black text-sm text-[#2b2725]/60 pb-1 border-b border-dashed border-[#e6dfd3] select-none">
                    Cozy Account profile
                  </h3>

                  <div className="p-4 bg-[#fdfbf7] border border-[#e6dfd3] rounded-xl flex items-center gap-4 relative overflow-hidden select-none">
                    <VectorMtFuji />
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-[#2b2725] z-10 relative" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#ebdcc8] border-2 border-[#2b2725] flex items-center justify-center font-mono text-xl font-bold text-[#b83227] z-10 relative shadow">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="z-10 text-left">
                      <h4 className="font-black text-sm text-[#2b2725]">{user?.displayName || "Cozy Sketchbook User"}</h4>
                      <p className="font-mono text-[10px] text-gray-500 mt-0.5">{user?.email}</p>
                      <span className="text-[8px] font-mono font-bold bg-[#b83227] text-white px-1.5 py-0.5 rounded mt-1.5 inline-block">
                        UID: {user?.uid.substring(0, 10)}...
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-left">
                    <p className="text-[10px] text-gray-500">
                      Your workspace is connected to a local Next.js client engine. Authentication states are synchronised with Firebase Auth services.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons footer */}
              <div className="pt-4 border-t border-[#e6dfd3] flex justify-between select-none shrink-0 mt-4">
                <button
                  type="button"
                  onClick={resetToCozyDefaults}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-handwriting font-black text-xs cursor-pointer sketch-border-sm transition-colors"
                >
                  Reset Cozy Defaults
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#b83227] hover:bg-[#a02b21] disabled:opacity-50 text-white rounded-xl font-handwriting font-black text-xs cursor-pointer border-b-2 shadow transition-all hover:scale-102 flex items-center space-x-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>Save settings</span>
                </button>
              </div>

            </form>

          </div>

        </div>

        {/* RIGHT COLUMN: RADIAL SNAPSHOT & HELP CENTER (25% width) */}
        <div className="w-full lg:w-76 flex flex-col gap-6 shrink-0 text-left">
          
          {/* Optimization score gauge */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-4 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none text-center shrink-0">
            {/* Washi tape stamp */}
            <div className="absolute top-[-6px] right-[15%] w-12 h-4 bg-[#ebdcc8]/80 border-l border-r border-dashed border-white/50 rotate-[3deg]" />
            
            <h3 className="font-handwriting font-black text-xs text-[#2b2725]/60 mb-2 pb-1 border-b border-dashed border-[#e6dfd3] text-left">
              Settings Optimization
            </h3>

            <OptimizationScoreGauge score={calculateScore()} />

            <div className="mt-3 space-y-1.5 font-handwriting font-bold">
              <p className="text-xs text-[#2b2725]">⛩️ System Optimization Score</p>
              <p className="text-[10px] text-gray-500 leading-normal">
                Enable more auto co-pilot switches to hit 100% automation. 🌸
              </p>
            </div>
          </div>

          {/* Help Center card */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-4 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 flex-1 flex flex-col justify-between">
            <VectorStoneLantern />
            
            <div className="space-y-3 relative z-10">
              <h3 className="font-handwriting font-black text-xs text-[#2b2725]/60 pb-1 border-b border-dashed border-[#e6dfd3]">
                Doot Library 📖
              </h3>

              <DootReadingMascot />

              <div className="space-y-1.5 text-center font-handwriting font-bold text-[10px] leading-snug">
                <p className="text-xs text-[#2b2725] font-black">Need support?</p>
                <p className="text-gray-500">Read our scroll library or check the keyboard bindings.</p>
              </div>

              <div className="space-y-1 pt-2 font-handwriting font-black text-[10px] text-[#3c6382] select-none">
                <a href="#help" className="block hover:underline hover:text-[#b83227]">📖 Scroll Library Documentation</a>
                <a href="#shortcuts" className="block hover:underline hover:text-[#b83227]">⌨️ Cozy Keyboard Shortcuts</a>
                <a href="#support" className="block hover:underline hover:text-[#b83227]">⛩️ Contact the Village Helpers</a>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-[#e6dfd3] text-center select-none shrink-0 z-10">
              <span className="text-[8px] font-mono text-gray-400 font-bold">MAILOS SKETCHBOOK v1.0.0</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

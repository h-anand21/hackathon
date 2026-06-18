"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Sparkles,
  CheckCircle,
  FileText,
  Calendar,
  ChevronRight,
  Send,
  Loader2,
  Trash2,
  PenTool,
  Clock,
  Archive,
  FolderOpen,
  Tag,
  MoreVertical,
  Reply,
  Forward,
  CornerUpLeft,
  Star,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Download,
  HardDrive
} from "lucide-react";

type Email = {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  to: string;
  snippet: string;
  body: string;
  receivedAt: string;
  priority: string;
  category: string;
  unread: boolean;
  starred: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentSize?: string;
};

// ----------------------------------------------------
// VECTOR DESIGN COMPONENTS & MASCOTS
// ----------------------------------------------------

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

function VectorLandscape() {
  return (
    <div className="absolute right-0 bottom-0 w-80 h-36 opacity-35 pointer-events-none z-0">
      <svg viewBox="0 0 300 150" className="w-full h-full object-contain">
        <circle cx="200" cy="50" r="22" fill="#e8a7a1" opacity="0.3" />
        <path 
          d="M 40 130 C 100 110, 140 60, 160 40 L 175 40 C 190 60, 220 110, 280 130 Z" 
          fill="#ebdcc8" 
          stroke="#2b2725" 
          strokeWidth="1.2" 
        />
        <path 
          d="M 155 58 C 160 52, 160 40, 160 40 L 175 40 C 175 40, 178 52, 185 58 Z" 
          fill="#ffffff" 
          stroke="#2b2725" 
          strokeWidth="1" 
        />
      </svg>
    </div>
  );
}

function DootReadingMascot() {
  return (
    <div className="w-28 h-28 shrink-0 hover:scale-105 transition-transform relative">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="35" x2="60" y2="20" stroke="#2b2725" strokeWidth="2.5" />
        <circle cx="60" cy="17" r="4.5" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
        
        {/* Head (tilted slightly forward) */}
        <rect x="30" y="33" width="60" height="42" rx="16" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        <rect x="40" y="40" width="40" height="24" rx="6" fill="#2b2725" />
        {/* Curved reading/happy eyes */}
        <path d="M 48 51 L 53 51" stroke="#388e3c" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 67 51 L 72 51" stroke="#388e3c" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="56" r="1.5" fill="#e8a7a1" />
        <circle cx="76" cy="56" r="1.5" fill="#e8a7a1" />

        {/* Body (Sitting) */}
        <path d="M 42 75 L 78 75 L 72 100 L 48 100 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        <circle cx="60" cy="87" r="5" fill="#b83227" />

        {/* Book */}
        <path d="M 40 92 C 50 82, 60 88, 60 88 C 60 88, 70 82, 80 92 L 78 102 C 68 92, 60 96, 60 96 C 60 96, 52 92, 42 102 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="2" />
        {/* Washi AI logo on book cover */}
        <circle cx="50" cy="93" r="2.5" fill="#b83227" />

        {/* Hands holding book */}
        <circle cx="39" cy="93" r="3" fill="#ffffff" stroke="#2b2725" strokeWidth="1.5" />
        <circle cx="81" cy="93" r="3" fill="#ffffff" stroke="#2b2725" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// DEFAULT MOCK DATA FOR INBOX
// ----------------------------------------------------

const defaultMocks: Email[] = [
  {
    id: "1",
    subject: "Meeting Follow Up",
    sender: "Aarav Mehta",
    senderEmail: "aarav@xyz.com",
    to: "himanshu@doot.ai",
    snippet: "Thanks for the great discussion yesterday. Here are...",
    body: `Hi Himanshu,

Thanks for the great discussion yesterday.

As promised, attaching the project brief and next steps we discussed.

Let me know if you have any questions!

Best,
Aarav`,
    receivedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    priority: "HIGH",
    category: "Primary",
    unread: true,
    starred: true,
    hasAttachment: true,
    attachmentName: "Project Brief.pdf",
    attachmentSize: "2.4 MB"
  },
  {
    id: "2",
    subject: "Hackathon Update",
    sender: "Corsair Team",
    senderEmail: "team@corsair.com",
    to: "himanshu@doot.ai",
    snippet: "Hi team! Just a quick update on the submission timeline...",
    body: `Hi team! 

Just a quick update on the submission timeline. We are moving the final deadline to June 20th.

Please push all remaining codes to production and make sure testing logs are green.

Let's sync up later today.

Regards,
Corsair Team`,
    receivedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    priority: "HIGH",
    category: "Primary",
    unread: true,
    starred: false
  },
  {
    id: "3",
    subject: "Event Updated",
    sender: "Google Calendar",
    senderEmail: "calendar-notification@google.com",
    to: "himanshu@doot.ai",
    snippet: "Product Demo has been rescheduled to May 18, 2:00 PM.",
    body: `Your Google Calendar event has been rescheduled:

Event: Product Demo
New Time: May 18, 2:00 PM - 3:00 PM

Regards,
Google Calendar`,
    receivedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    priority: "MEDIUM",
    category: "Primary",
    unread: false,
    starred: false
  },
  {
    id: "4",
    subject: "Design Feedback",
    sender: "Riya Sharma",
    senderEmail: "riya@example.com",
    to: "himanshu@doot.ai",
    snippet: "Please find my feedback on the latest design mockups....",
    body: `Hi Himanshu,

Please find my feedback on the latest onboarding design mockups. They look really cozy and fit the watercolor scrapbook aesthetic perfectly.

I have just a few comments on the text spacing of the buttons. Let's make sure it scrolls naturally.

Riya`,
    receivedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
    priority: "LOW",
    category: "Primary",
    unread: false,
    starred: false
  },
  {
    id: "5",
    subject: "Weekly Sync Notes",
    sender: "Team Doot",
    senderEmail: "team@doot.ai",
    to: "himanshu@doot.ai",
    snippet: "Sharing the notes from our weekly sync meeting.",
    body: `Here are the action items from our sync:
- Redesign onboarding left panel (Done)
- Redesign dashboard overview (In Progress)
- Set up contacts JSON storage.

Thanks,
Doot Team`,
    receivedAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(), // Yesterday
    priority: "LOW",
    category: "Primary",
    unread: false,
    starred: false
  },
  {
    id: "6",
    subject: "Your Notion Digest is here",
    sender: "Notion Team",
    senderEmail: "digest@notion.so",
    to: "himanshu@doot.ai",
    snippet: "See a summary of your recent activity.",
    body: `Here is what you missed in your Notion workspace this week.

- 3 new pages created in DootAI travel log.
- 5 comments left by Riya.

Stay updated!`,
    receivedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    priority: "LOW",
    category: "Important",
    unread: true,
    starred: false
  },
  {
    id: "7",
    subject: "New message in #general",
    sender: "Slack",
    senderEmail: "notification@slack.com",
    to: "himanshu@doot.ai",
    snippet: "Rahul: Can we push the deadline by a day?",
    body: `Rahul sent a message in #general:

"Can we push the deadline by a day? I'm waiting on Corsair callback redirects to pass local proxy checks."`,
    receivedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    priority: "LOW",
    category: "Important",
    unread: false,
    starred: false
  },
  {
    id: "8",
    subject: "You have 5 new connections",
    sender: "LinkedIn",
    senderEmail: "connections@linkedin.com",
    to: "himanshu@doot.ai",
    snippet: "See who's connected with you this week.",
    body: `Hi Himanshu,

You have 5 new connection requests from local travel startup developers.

Check them out on LinkedIn.`,
    receivedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    priority: "LOW",
    category: "Important",
    unread: false,
    starred: false
  }
];

export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  // States
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  
  // Tabs: All Mail, Primary, Starred, Important, Sent, Drafts
  const [activeTab, setActiveTab] = useState<"All Mail" | "Primary" | "Starred" | "Important" | "Sent" | "Drafts">("Primary");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch emails
  const fetchEmails = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inbox?userId=${uid}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.emails) {
        // Map database PriorityEmail to Email structure
        const mapped: Email[] = data.emails.map((e: any) => ({
          id: e.id,
          subject: e.subject,
          sender: e.sender.split(" <")[0],
          senderEmail: e.sender.includes("<") ? e.sender.split("<")[1].replace(">", "") : e.sender,
          to: user?.email || "himanshu@doot.ai",
          snippet: e.snippet || "",
          body: e.body || e.snippet || "No body content",
          receivedAt: e.receivedAt,
          priority: e.priority,
          category: e.category || "Primary",
          unread: e.unread ?? false,
          starred: e.starred ?? false
        }));

        // Avoid duplicates by filtering mocks that have identical subjects as database emails
        const filteredMock = defaultMocks.filter(
          (mock) => !mapped.some((item) => item.subject.toLowerCase().trim() === mock.subject.toLowerCase().trim())
        );

        const merged = [...mapped, ...filteredMock];
        setEmails(merged);

        // Find first email matching current active tab
        const first = merged.find(e => {
          if (activeTab === "All Mail") return true;
          if (activeTab === "Starred") return e.starred;
          if (activeTab === "Important") return e.category === "Important";
          if (activeTab === "Sent") return e.category === "Sent";
          if (activeTab === "Drafts") return e.category === "Drafts";
          return e.category !== "Sent" && e.category !== "Drafts";
        });
        setSelectedEmail(first || merged[0] || null);
      } else {
        // Fallback to mocks if no mails are in db
        setEmails(defaultMocks);
        setSelectedEmail(defaultMocks[0]);
      }
    } catch (e) {
      console.error(e);
      // Fallback on error
      setEmails(defaultMocks);
      setSelectedEmail(defaultMocks[0]);
    } finally {
      setLoading(false);
    }
  };

  // Sync trigger
  const handleManualSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/corsair/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmails(user.uid);
      }
    } catch (e) {
      console.error("Error manual sync:", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEmails(currentUser.uid);
      } else {
        // Offline / Not logged in dev fallback
        setEmails(defaultMocks);
        setSelectedEmail(defaultMocks[0]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter emails based on search & tab
  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.sender.toLowerCase().includes(search.toLowerCase()) ||
      email.snippet.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "All Mail") return matchesSearch;
    if (activeTab === "Starred") return email.starred && matchesSearch;
    if (activeTab === "Important") return email.category === "Important" && matchesSearch;
    if (activeTab === "Sent") return email.category === "Sent" && matchesSearch;
    if (activeTab === "Drafts") return email.category === "Drafts" && matchesSearch;
    
    // Primary tab (default) should show everything except Sent and Drafts
    return email.category !== "Sent" && email.category !== "Drafts" && matchesSearch;
  });

  // Toggle Starred
  const toggleStar = (id: string) => {
    setEmails(prev =>
      prev.map(e => (e.id === id ? { ...e, starred: !e.starred } : e))
    );
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  // Trigger quick Doot actions
  const triggerDootAction = (action: string) => {
    if (!selectedEmail) return;
    
    // Construct search query string
    let prompt = "";
    if (action === "summarize") {
      prompt = `Summarize email from ${selectedEmail.sender} with subject "${selectedEmail.subject}"`;
    } else if (action === "reply") {
      prompt = `Draft a reply to ${selectedEmail.sender} regarding "${selectedEmail.subject}"`;
    } else if (action === "action-items") {
      prompt = `Extract action items from ${selectedEmail.sender}'s email "${selectedEmail.subject}"`;
    } else if (action === "meeting") {
      prompt = `Schedule a meeting with ${selectedEmail.sender} for "${selectedEmail.subject}"`;
    }
    
    // Navigate to AI Assistant with query pre-filled
    router.push(`/dashboard/ai-assistant?query=${encodeURIComponent(prompt)}`);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-[#b83227] border-red-200";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-text">
      
      {/* Page Heading */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-baseline space-x-2.5">
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none">Inbox</h1>
          <span className="text-sm font-handwriting font-bold text-[#b83227] select-none">
            {emails.filter(e => e.unread).length} unread emails
          </span>
        </div>

        {/* Search & Sync bar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#2b2725]/45">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search in emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-10 py-1.5 bg-white sketch-border-sm text-xs font-handwriting font-bold w-52 focus:outline-none shadow-sm"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[8px] font-mono text-[#2b2725]/40 font-bold bg-[#ebdcc8]/30 px-1 my-1.5 mr-1 rounded select-none">
              ⌘ K
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="p-1.5 px-3 bg-white hover:bg-red-50 text-[#b83227] sketch-border-sm text-[10px] font-mono font-black uppercase flex items-center space-x-1 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#b83227]" />
            ) : (
              <span>Sync</span>
            )}
          </button>
        </div>
      </div>

      {/* 3-PANE SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pr-1">
        
        {/* PANE 1: EMAIL LIST (40% width) */}
        <div className="flex-1 lg:max-w-md flex flex-col min-h-[400px] lg:min-h-0 bg-white sketch-border sketch-shadow rounded-xl overflow-hidden shrink-0">
          
          {/* List Tab Navigation */}
          <div className="flex border-b border-[#e6dfd3] text-xs font-handwriting font-black select-none bg-[#fdfaf4]">
            {(["All Mail", "Primary", "Starred", "Important", "Sent", "Drafts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIndex(0);
                  const first = emails.find(e => {
                    if (tab === "All Mail") return true;
                    if (tab === "Starred") return e.starred;
                    if (tab === "Important") return e.category === "Important";
                    if (tab === "Sent") return e.category === "Sent";
                    if (tab === "Drafts") return e.category === "Drafts";
                    return e.category !== "Sent" && e.category !== "Drafts";
                  });
                  setSelectedEmail(first || null);
                }}
                className={`flex-1 py-2 text-center border-r border-[#e6dfd3] last:border-r-0 cursor-pointer ${
                  activeTab === tab 
                    ? "bg-white text-[#b83227] font-black" 
                    : "text-[#2b2725]/60 hover:bg-[#e6dfd3]/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Action checklist controllers */}
          <div className="p-2.5 px-4 bg-[#fcfaf4] border-b border-[#e6dfd3] flex justify-between items-center text-xs font-handwriting font-bold select-none text-[#2b2725]/65">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="w-3.5 h-3.5 accent-[#b83227]" />
              <span>Select all</span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="hover:text-[#b83227] cursor-pointer">Filter</button>
              <button className="hover:text-[#b83227] cursor-pointer"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Email Scroll List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 notebook-grid-small">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#b83227]" />
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 font-handwriting text-[#2b2725]/40 font-bold select-none">
                No scrolls in this bento box.
              </div>
            ) : (
              filteredEmails.map((email, idx) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      setSelectedIndex(idx);
                    }}
                    className={`p-3.5 bg-white border cursor-pointer transition-all border-b-3 border-r-3 select-none relative ${
                      isSelected
                        ? "sketch-border-thick border-[#b83227] scale-[1.01] shadow"
                        : "sketch-border-sm border-[#e6dfd3] hover:border-gray-400 hover:scale-[1.005]"
                    }`}
                  >
                    {/* Unread indicator */}
                    {email.unread && (
                      <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-[#b83227]" />
                    )}

                    <div className="flex justify-between items-baseline mb-1 pl-1">
                      <span className="font-bold text-xs truncate max-w-[140px] text-[#2b2725]">
                        {email.sender}
                      </span>
                      <span className="text-[9px] font-mono text-[#2b2725]/45 font-bold">
                        {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className={`font-handwriting text-sm leading-tight mb-1 truncate pl-1 ${
                      email.unread ? "font-black text-[#2b2725]" : "font-bold text-[#2b2725]/75"
                    }`}>
                      {email.subject}
                    </h4>
                    
                    <p className="text-[11px] text-[#2b2725]/60 truncate pl-1 font-medium">
                      {email.snippet}
                    </p>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e6dfd3] border-dashed pl-1">
                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                          className="text-[#2b2725]/30 hover:text-yellow-500 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${email.starred ? "fill-yellow-400 text-yellow-500" : ""}`} />
                        </button>
                        {email.hasAttachment && (
                          <span className="text-[9px] font-mono text-gray-400 font-bold">📎 Attachment</span>
                        )}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 border font-bold uppercase tracking-wider rounded font-mono ${getPriorityBadgeColor(email.priority)}`}>
                        {email.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Pagination box */}
          <div className="p-3 bg-[#fdfaf4] border-t border-[#e6dfd3] flex justify-between items-center text-xs font-handwriting font-bold select-none text-[#2b2725]/60 shrink-0">
            <span>1-{filteredEmails.length} of {filteredEmails.length}</span>
            <div className="flex space-x-1.5">
              <button className="p-1 bg-white sketch-border-sm cursor-pointer hover:bg-gray-50"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="p-1 bg-white sketch-border-sm cursor-pointer hover:bg-gray-50"><ChevronRightIcon className="w-3.5 h-3.5" /></button>
            </div>
          </div>

        </div>

        {/* PANE 2: EMAIL DETAILS (60% width) */}
        <div className="flex-1 bg-white sketch-border sketch-shadow flex flex-col overflow-hidden min-h-[400px] lg:min-h-0 rounded-xl relative">
          
          {/* Fuji landscape watermark background */}
          <VectorLandscape />

          {selectedEmail ? (
            <div className="flex-1 flex flex-col min-h-0 relative z-10">
              
              {/* Reading Tool bar actions */}
              <div className="p-3 border-b border-[#e6dfd3] bg-[#fdfaf4] flex justify-between items-center text-[#2b2725]/60 select-none shrink-0">
                <div className="flex items-center space-x-3.5">
                  <button onClick={() => setSelectedEmail(null)} className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer lg:hidden">
                    <ChevronLeft className="w-4 h-4 text-[#b83227]" />
                  </button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Archive"><Archive className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Delete"><Trash2 className="w-4 h-4 text-red-700" /></button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Mark Unread"><Mail className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Snooze"><Clock className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Move to Folder"><FolderOpen className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer" title="Tags"><Tag className="w-4 h-4" /></button>
                </div>
                <button className="p-1 hover:bg-[#e6dfd3]/30 rounded cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Title & tags */}
              <div className="p-6 pb-4 border-b border-dashed border-[#e6dfd3] bg-white/70 shrink-0">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2.5xl font-handwriting font-black text-[#2b2725] leading-tight flex items-center gap-1.5">
                    {selectedEmail.subject}
                    <button onClick={() => toggleStar(selectedEmail.id)} className="text-[#2b2725]/30 hover:text-yellow-500 transition-colors">
                      <Star className={`w-4 h-4 ${selectedEmail.starred ? "fill-yellow-400 text-yellow-500" : ""}`} />
                    </button>
                  </h2>
                  <div className="flex space-x-1.5 shrink-0">
                    <span className="text-[10px] px-2.5 py-0.5 border font-mono font-bold bg-[#ebdcc8]/20 border-[#2b2725]/20 text-[#2b2725]/75 rounded-full select-none">
                      {selectedEmail.category}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 border font-mono font-bold rounded-full select-none ${getPriorityBadgeColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority}
                    </span>
                  </div>
                </div>

                {/* Sender card details */}
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-9 h-9 rounded-full bg-[#3c6382]/10 text-[#3c6382] font-mono font-bold flex items-center justify-center border border-[#3c6382]/30 text-sm">
                    {selectedEmail.sender.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate text-left leading-tight">
                    <div className="flex items-baseline space-x-1.5">
                      <h4 className="font-handwriting font-black text-xs text-[#2b2725]">{selectedEmail.sender}</h4>
                      <span className="text-[9px] font-mono text-[#2b2725]/45 font-bold">&lt;{selectedEmail.senderEmail}&gt;</span>
                    </div>
                    <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-bold mt-0.5">to me</p>
                  </div>
                  <div className="ml-auto text-[10px] font-mono text-[#2b2725]/45 font-bold select-none">
                    {new Date(selectedEmail.receivedAt).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Message scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 font-sans text-xs sm:text-sm text-[#2b2725]/85 leading-relaxed whitespace-pre-wrap font-medium bg-white/40 border-b border-[#e6dfd3]">
                {selectedEmail.body}
                
                {/* Attachments Section if exists */}
                {selectedEmail.hasAttachment && (
                  <div className="mt-8 pt-5 border-t border-dashed border-[#e6dfd3] max-w-sm">
                    <h5 className="font-handwriting font-black text-xs text-[#2b2725]/75 mb-2.5">Attachments (1 file)</h5>
                    <div className="p-3 bg-white border border-[#2b2725]/15 rounded-xl flex items-center justify-between shadow-inner select-none">
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="p-1.5 bg-[#b83227]/5 rounded text-[#b83227] border border-dashed border-[#b83227]/25 text-xs font-bold">PDF</div>
                        <div className="truncate text-left leading-none">
                          <p className="text-xs font-handwriting font-black text-[#2b2725] truncate">{selectedEmail.attachmentName}</p>
                          <p className="text-[9px] font-mono text-[#2b2725]/50 mt-0.5">{selectedEmail.attachmentSize}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1.5 text-[#2b2725]/50">
                        <button className="p-1.5 hover:bg-[#e6dfd3]/30 rounded-lg cursor-pointer" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 hover:bg-[#e6dfd3]/30 rounded-lg cursor-pointer" title="Save to Drive"><HardDrive className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Quick action row */}
              <div className="p-4 bg-white border-b border-[#e6dfd3] flex justify-between items-center select-none shrink-0">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/dashboard/compose?to=${encodeURIComponent(selectedEmail.sender + ' <' + selectedEmail.senderEmail + '>')}&subject=${encodeURIComponent('Re: ' + selectedEmail.subject)}`)}
                    className="p-1.5 px-3.5 bg-[#2b2725] hover:bg-black text-white font-handwriting font-black text-xs rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer border-b-2"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                  <button className="p-1.5 px-3.5 bg-white border border-[#e6dfd3] text-[#2b2725]/80 hover:bg-[#e6dfd3]/10 font-handwriting font-black text-xs rounded-lg flex items-center space-x-1.5 transition-colors">
                    <CornerUpLeft className="w-3.5 h-3.5" />
                    <span>Reply all</span>
                  </button>
                  <button className="p-1.5 px-3.5 bg-white border border-[#e6dfd3] text-[#2b2725]/80 hover:bg-[#e6dfd3]/10 font-handwriting font-black text-xs rounded-lg flex items-center space-x-1.5 transition-colors">
                    <Forward className="w-3.5 h-3.5" />
                    <span>Forward</span>
                  </button>
                </div>
                
                {/* Ask Doot AI trigger */}
                <button
                  onClick={() => triggerDootAction("reply")}
                  className="p-1.5 px-3 bg-[#fcdfd7] text-[#b83227] font-handwriting font-black text-xs rounded-lg border border-[#b83227]/30 hover:bg-[#fbd0c7] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Doot AI</span>
                </button>
              </div>

              {/* Bottom Doot AI suggests Panel */}
              <div className="p-5 bg-[#fdfbf7] flex flex-col sm:flex-row items-center sm:space-x-5 relative overflow-hidden shrink-0 select-none">
                
                {/* Stone Lantern illustration background */}
                <VectorLantern />

                {/* Left mascot illustration */}
                <DootReadingMascot />

                {/* Action card buttons */}
                <div className="flex-1 space-y-2 mt-4 sm:mt-0 z-10 relative text-left">
                  <h3 className="font-handwriting font-black text-sm text-[#b83227] flex items-center gap-1">
                    🌸 Doot AI suggests
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerDootAction("summarize")}
                      className="p-2 bg-white hover:bg-[#fcdfd7] text-[10px] font-handwriting font-extrabold text-[#2b2725] rounded-xl border border-dashed border-[#e6dfd3] transition-all truncate text-left shadow-inner flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#f5b041] shrink-0" />
                      <span className="truncate">Summarize this email</span>
                    </button>
                    <button
                      onClick={() => triggerDootAction("reply")}
                      className="p-2 bg-white hover:bg-[#fcdfd7] text-[10px] font-handwriting font-extrabold text-[#2b2725] rounded-xl border border-dashed border-[#e6dfd3] transition-all truncate text-left shadow-inner flex items-center space-x-1.5 cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#b83227] shrink-0" />
                      <span className="truncate">Draft a reply</span>
                    </button>
                    <button
                      onClick={() => triggerDootAction("action-items")}
                      className="p-2 bg-white hover:bg-[#fcdfd7] text-[10px] font-handwriting font-extrabold text-[#2b2725] rounded-xl border border-dashed border-[#e6dfd3] transition-all truncate text-left shadow-inner flex items-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#388e3c] shrink-0" />
                      <span className="truncate">Extract action items</span>
                    </button>
                    <button
                      onClick={() => triggerDootAction("meeting")}
                      className="p-2 bg-white hover:bg-[#fcdfd7] text-[10px] font-handwriting font-extrabold text-[#2b2725] rounded-xl border border-dashed border-[#e6dfd3] transition-all truncate text-left shadow-inner flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#3c6382] shrink-0" />
                      <span className="truncate">Schedule a meeting</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none font-handwriting text-lg text-[#2b2725]/40 font-bold space-y-4">
              <DootReadingMascot />
              <p>Select a scroll letter from the inbox to read.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
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
  Clock
} from "lucide-react";

type Email = {
  id: string;
  entityId: string;
  subject: string;
  sender: string;
  to: string;
  snippet: string;
  body: string;
  receivedAt: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  summary?: string;
};

export default function InboxPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compose Modal State
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // AI draft assistant suggestion
  const [aiDraftSuggested, setAiDraftSuggested] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Fetch emails
  const fetchEmails = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inbox?userId=${uid}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        if (data.emails.length > 0) {
          setSelectedEmail(data.emails[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Manual Sync trigger
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
      console.error("Error running manual inbox sync:", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEmails(currentUser.uid);
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
    
    if (activeTab === "ALL") return matchesSearch;
    return email.priority === activeTab && matchesSearch;
  });

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in inputs
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.min(prev + 1, filteredEmails.length - 1);
          setSelectedEmail(filteredEmails[next] || null);
          return next;
        });
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          setSelectedEmail(filteredEmails[next] || null);
          return next;
        });
      } else if (e.key === "c") {
        e.preventDefault();
        setIsComposing(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsComposing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEmails]);

  // Handle Compose Send
  const handleSendEmail = async () => {
    if (!user || !composeTo || !composeSubject || !composeBody) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          to: composeTo,
          subject: composeSubject,
          body: composeBody
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsComposing(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        alert("Email sent successfully! 🌸");
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to send email. Check console for details.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Generate AI reply suggestion
  const generateAiReply = async () => {
    if (!selectedEmail) return;
    setGeneratingDraft(true);
    setAiDraftSuggested("");
    try {
      // Simulating quick OpenAI/Gemini drafting based on email context
      setTimeout(() => {
        const generated = `Dear ${selectedEmail.sender.split(" <")[0]},\n\nThank you for reaching out. I've reviewed your request regarding "${selectedEmail.subject}" and I would be happy to coordinate with you.\n\nLet's catch up later this week to lock down the specifics.\n\nWarm regards,\n${user?.displayName || "DootAI User"}`;
        setAiDraftSuggested(generated);
        setGeneratingDraft(false);
      }, 1500);
    } catch (e) {
      setGeneratingDraft(false);
    }
  };

  // Pre-fill Compose modal with AI draft
  const useAiDraft = () => {
    if (!selectedEmail) return;
    setComposeTo(selectedEmail.sender);
    setComposeSubject(`Re: ${selectedEmail.subject}`);
    setComposeBody(aiDraftSuggested);
    setIsComposing(true);
  };

  const formatTime = (dateStr: any) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-[#b83227] border-[#b83227]/30";
      case "MEDIUM":
        return "bg-amber-50 text-[#f5b041] border-[#f5b041]/30";
      default:
        return "bg-green-50 text-[#388e3c] border-[#388e3c]/30";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      
      {/* Keyboard shortcuts banner */}
      <div className="washi-tape washi-tape-blue px-4 py-1.5 text-xs text-white font-mono flex items-center justify-between mb-4 shadow-sm">
        <span>⌨ SHORTCUTS: <strong>[j]</strong> Down • <strong>[k]</strong> Up • <strong>[c]</strong> Compose • <strong>[esc]</strong> Close</span>
        <span className="opacity-80">Superhuman Mode Active</span>
      </div>

      {/* Main Inbox layout split pane */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left pane: Email List */}
        <div className="flex-1 lg:max-w-md flex flex-col min-h-0 bg-white sketch-border sketch-shadow">
          {/* Search Bar & Sync */}
          <div className="p-4 border-b border-[#e6dfd3] flex items-center justify-between bg-[#fbf8f3]">
            <div className="flex items-center flex-1">
              <Search className="w-4 h-4 text-[#2b2725]/40 mr-2" />
              <input
                type="text"
                placeholder="Search scroll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-[#2b2725]/30 font-sans"
              />
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="ml-2 px-2.5 py-1.5 bg-[#3c6382]/10 hover:bg-[#3c6382]/20 text-[#3c6382] font-mono font-bold text-[10px] uppercase rounded sketch-border-sm flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-50"
              title="Sync latest emails from Gmail"
            >
              {syncing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span>Sync</span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e6dfd3] text-xs font-handwriting font-bold select-none bg-[#fbf8f3]">
            {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIndex(0);
                }}
                className={`flex-1 py-2 text-center border-r border-[#e6dfd3] last:border-r-0 cursor-pointer ${
                  activeTab === tab ? "bg-white text-[#b83227] font-extrabold" : "text-[#2b2725]/60 hover:bg-[#e6dfd3]/10"
                }`}
              >
                {tab === "ALL" && "All"}
                {tab === "HIGH" && "🔴 High"}
                {tab === "MEDIUM" && "🟡 Mid"}
                {tab === "LOW" && "🟢 Low"}
              </button>
            ))}
          </div>

          {/* Email Cards Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 notebook-grid-small">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3c6382]" />
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 font-handwriting text-[#2b2725]/40">
                No scrolls in this bento box.
              </div>
            ) : (
              filteredEmails.map((email, index) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      setSelectedIndex(index);
                    }}
                    className={`p-4 bg-white border cursor-pointer transition-all ${
                      isSelected
                        ? "sketch-border-thick border-[#b83227] sketch-shadow scale-[1.01]"
                        : "sketch-border-sm border-[#e6dfd3] hover:border-[#2b2725]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs truncate max-w-[160px]">
                        {(email.sender || "Unknown Sender").split(" <")[0]}
                      </span>
                      <span className="text-[9px] font-mono text-[#2b2725]/40 whitespace-nowrap">
                        {formatTime(email.receivedAt)}
                      </span>
                    </div>
                    <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-tight mb-1 truncate">
                      {email.subject}
                    </h4>
                    <p className="text-[11px] text-[#2b2725]/60 truncate">
                      {email.snippet}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e6dfd3] border-dashed">
                      <span className="text-[9px] text-[#2b2725]/40 font-mono">
                        {email.category}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase tracking-wider rounded font-mono ${getPriorityBadgeColor(email.priority)}`}>
                        {email.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: Reading Pane & Doot AI Side-Widget */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          
          {/* Selected Email detail card */}
          <div className="flex-1 bg-white sketch-border sketch-shadow flex flex-col overflow-hidden min-h-0">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Email Header info */}
                <div className="p-6 border-b border-[#e6dfd3] bg-[#fbf8f3]/50">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold font-handwriting text-[#2b2725] leading-tight">
                      {selectedEmail.subject}
                    </h2>
                    <span className={`text-xs px-2.5 py-0.5 border font-bold rounded font-mono ${getPriorityBadgeColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority} Priority
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-[#2b2725]/70">
                    <div>
                      <p>From: <strong>{selectedEmail.sender}</strong></p>
                      <p className="mt-0.5">To: {selectedEmail.to}</p>
                    </div>
                    <span className="font-mono">
                      {formatDateTime(selectedEmail.receivedAt)}
                    </span>
                  </div>
                </div>

                {/* Email Body content */}
                <div className="flex-1 overflow-y-auto p-6 font-sans text-sm text-[#2b2725] leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-[#e6dfd3] bg-[#fbf8f3] flex space-x-3">
                  <button
                    onClick={() => {
                      setComposeTo(selectedEmail.sender);
                      setComposeSubject(`Re: ${selectedEmail.subject}`);
                      setIsComposing(true);
                    }}
                    className="px-4 py-2 bg-[#2b2725] text-white font-bold text-xs sketch-border-sm sketch-shadow-hover hover:scale-102 cursor-pointer transition-all"
                  >
                    Reply Scroll
                  </button>
                  <button className="px-4 py-2 bg-white text-[#2b2725] border border-[#e6dfd3] font-bold text-xs hover:border-[#2b2725]">
                    Archive
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center font-handwriting text-lg text-[#2b2725]/40 p-12 text-center">
                Select a scroll letter to read.
              </div>
            )}
          </div>

          {/* Doot AI Assistant recommendation pane */}
          <div className="w-full md:w-80 bg-white sketch-border sketch-shadow flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center space-x-2 pb-3 border-b border-dashed border-[#e6dfd3]">
              <Sparkles className="w-5 h-5 text-[#f5b041]" />
              <h3 className="font-handwriting text-lg font-bold text-[#3c6382]">Doot Summary</h3>
            </div>

            {selectedEmail ? (
              <>
                {/* Summary section */}
                <div className="p-4 bg-[#fbf8f3] sketch-border-sm space-y-2 text-left">
                  <h4 className="font-bold text-xs text-[#2b2725]/60 font-mono uppercase tracking-wider">TL;DR Abstract</h4>
                  <p className="text-xs text-[#2b2725] leading-relaxed italic">
                    "{selectedEmail.summary || "Doot is preparing the abstract summary..."}"
                  </p>
                </div>

                {/* AI Suggestions / Actions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-1.5">
                    <PenTool className="w-4 h-4 text-[#b83227]" />
                    <h4 className="font-handwriting text-sm font-bold text-[#2b2725]">Doot Suggested Replies</h4>
                  </div>
                  
                  {aiDraftSuggested ? (
                    <div className="space-y-3">
                      <textarea
                        value={aiDraftSuggested}
                        onChange={(e) => setAiDraftSuggested(e.target.value)}
                        className="w-full p-3 bg-[#fbf8f3] sketch-border-sm text-xs h-32 focus:outline-none focus:ring-1 focus:ring-[#3c6382] font-mono leading-relaxed"
                      />
                      <button
                        onClick={useAiDraft}
                        className="w-full py-2 bg-[#3c6382] text-white text-xs font-bold sketch-border-sm sketch-shadow-hover hover:scale-102 transition-all cursor-pointer"
                      >
                        Apply to Reply Draft
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={generateAiReply}
                      disabled={generatingDraft}
                      className="w-full py-3 bg-[#b83227]/5 border border-dashed border-[#b83227]/30 hover:border-[#b83227] text-[#b83227] text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      {generatingDraft ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Drafting with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Draft AI response</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Calendar / Tasks Shortcut suggestions */}
                <div className="space-y-3 pt-3 border-t border-dashed border-[#e6dfd3]">
                  <h4 className="font-handwriting text-sm font-bold text-[#2b2725] flex items-center">
                    <Clock className="w-4 h-4 text-[#3c6382] mr-1.5" /> Action Checklist
                  </h4>
                  <button className="w-full text-left p-2.5 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 sketch-border-sm text-xs font-bold flex items-center justify-between">
                    <span>📅 Book 9 AM Review Session</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#3c6382]" />
                  </button>
                  <button className="w-full text-left p-2.5 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 sketch-border-sm text-xs font-bold flex items-center justify-between">
                    <span>✓ Add Task: Finalize paper styles</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#388e3c]" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-[#2b2725]/50 py-12">
                Doot will analyze email priority and create smart actions.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-[#2b2725]/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fbf8f3] w-full max-w-xl p-6 sketch-border sketch-shadow relative space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-[#e6dfd3]">
              <span className="font-handwriting text-lg font-bold text-[#b83227]">Write new scroll letter</span>
              <button
                onClick={() => setIsComposing(false)}
                className="text-xs font-bold underline hover:text-[#b83227] cursor-pointer"
              >
                Close [esc]
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">To (Recipient)</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Letter subject..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Message Scroll Body</label>
                <textarea
                  placeholder="Write your message here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full p-3 bg-white sketch-border-sm text-xs h-48 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-6 py-2.5 bg-[#b83227] text-white font-bold text-sm sketch-border sketch-shadow-hover hover:scale-102 flex items-center space-x-2 cursor-pointer transition-all"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Scroll...</span>
                  </>
                ) : (
                  <>
                    <span>Send Scroll</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

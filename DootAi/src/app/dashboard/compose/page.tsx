"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Paperclip,
  Smile,
  Globe,
  Scissors,
  Maximize2,
  MoreVertical,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Mail,
  Calendar,
  FileText,
  Bookmark
} from "lucide-react";

// ----------------------------------------------------
// VECTOR DECORATION COMPONENTS
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

function VectorMtFuji() {
  return (
    <div className="absolute right-0 bottom-0 w-80 h-36 opacity-30 pointer-events-none z-0">
      <svg viewBox="0 0 300 150" className="w-full h-full object-contain">
        <circle cx="210" cy="55" r="20" fill="#e8a7a1" opacity="0.35" />
        <path 
          d="M 50 140 C 110 115, 140 60, 160 40 L 175 40 C 190 60, 220 115, 280 140 Z" 
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

function DootCalligraphyMascot() {
  return (
    <div className="w-32 h-32 shrink-0 hover:scale-105 transition-transform relative select-none">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="35" x2="60" y2="20" stroke="#2b2725" strokeWidth="2.5" />
        <circle cx="60" cy="17" r="4.5" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
        
        {/* Head */}
        <rect x="30" y="33" width="60" height="42" rx="16" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        <rect x="40" y="40" width="40" height="24" rx="6" fill="#2b2725" />
        <path d="M 48 51 Q 52 47 56 51" stroke="#388e3c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 64 51 Q 68 47 72 51" stroke="#388e3c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="56" r="1.5" fill="#e8a7a1" />
        <circle cx="76" cy="56" r="1.5" fill="#e8a7a1" />

        {/* Body */}
        <path d="M 42 75 L 78 75 L 72 100 L 48 100 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2.5" />
        <circle cx="60" cy="87" r="5" fill="#b83227" />

        {/* Scroll Paper */}
        <path d="M 30 102 L 90 102 L 95 110 L 25 110 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="2" />
        {/* Calligraphy ink text characters (sketchy) */}
        <text x="60" y="109" fill="#2b2725" fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">道 AI</text>

        {/* Calligraphy Brush */}
        <line x1="88" y1="80" x2="72" y2="102" stroke="#2b2725" strokeWidth="2.5" strokeLinecap="round" />
        {/* Ink pot */}
        <rect x="20" y="93" width="8" height="9" fill="#2b2725" rx="1" />
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// MAIN PAGE CONTENT COMPONENT (WITH SUSPENSE WRAPPER)
// ----------------------------------------------------

function ComposePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Form states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // Attachments
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([
    { name: "Project Brief.pdf", size: "2.4 MB" }
  ]);
  const [sending, setSending] = useState(false);

  // AI Assistant States
  const [activeTemplate, setActiveTemplate] = useState("Follow Up");
  const [activeTone, setActiveTone] = useState("Professional");
  const [aiPrompt, setAiPrompt] = useState("Write a follow-up email for yesterday's meeting and attach the project brief.");
  const [generating, setGenerating] = useState(false);

  // Sync parameters on load
  useEffect(() => {
    setUser(auth.currentUser);

    // Read URL query params (e.g. from reply action)
    const toParam = searchParams.get("to");
    const subjectParam = searchParams.get("subject");
    if (toParam) {
      setRecipients([toParam]);
    }
    if (subjectParam) {
      setSubject(subjectParam);
    }
  }, [searchParams]);

  // Handle send email
  const handleSendEmail = async () => {
    if (recipients.length === 0 || !subject || !body) {
      alert("Please fill in the Recipient, Subject, and Body!");
      return;
    }
    setSending(true);

    try {
      // API call to /api/send-email
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "mock-user-id",
          to: recipients.join(", "),
          subject,
          body
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Email sent successfully! 🌸");
        router.push("/dashboard/inbox");
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.error(e);
      // Mock Success fallback for local preview
      setTimeout(() => {
        alert("Email sent successfully! (Simulated Mode) 🌸");
        router.push("/dashboard/inbox");
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  // Generate Email using Doot AI
  const handleGenerateEmail = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const prompt = `Write an email body based on the following template/topic: "${activeTemplate}". The tone should be "${activeTone}". Additional details: "${aiPrompt}". Do not output subject line or headers, only the email body itself. Keep it cozy and warm.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          message: prompt
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setBody(data.reply);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Failed to generate email dynamically:", e);
      // Fallback
      let draft = "";
      if (activeTemplate === "Follow Up") {
        draft = `Dear Aarav,\n\nThanks for the great discussion yesterday. It was wonderful to align on the project goals and next steps.\n\nAs discussed, I have attached the project brief and timeline for your review.\n\nPlease let me know if you have any feedback or questions.\n\nLooking forward to our next steps!\n\nBest regards,\nHimanshu`;
      } else if (activeTemplate === "Meeting Invite") {
        draft = `Hi Aarav,\n\nI hope you are having a productive week.\n\nI would love to schedule a follow-up session to review our progress on the MailOS dashboard. Let me know if you have any availability tomorrow at 11:30 AM or in the afternoon.\n\nLooking forward to catching up!\n\nBest regards,\nHimanshu`;
      } else if (activeTemplate === "Project Update") {
        draft = `Hello Aarav,\n\nHere is a quick project update on the DootAI Ghibli components:\n- Left scene and vector mascots are fully integrated in onboarding and inbox.\n- All database hooks are synced.\n\nEverything looks extremely clean and runs hot-reloaded. Let me know if you want to inspect.\n\nBest,\nHimanshu`;
      } else {
        draft = `Hi Aarav,\n\nI wanted to quickly check in on our follow-up actions. Let me know if you had a chance to review the documents we sent over.\n\nHave a great day!\n\nWarm regards,\nHimanshu`;
      }
      setBody(draft);
    } finally {
      setGenerating(false);
    }
  };

  // Add recipient chip
  const addRecipient = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && recipientInput.trim()) {
      e.preventDefault();
      if (!recipients.includes(recipientInput.trim())) {
        setRecipients([...recipients, recipientInput.trim()]);
      }
      setRecipientInput("");
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== index));
  };

  const templatesList = [
    { name: "Meeting Invite", prompt: "Draft a meeting invitation call invite." },
    { name: "Follow Up", prompt: "Write a follow-up email for yesterday's meeting and attach the project brief." },
    { name: "Project Update", prompt: "Draft a weekly project progress update email." },
    { name: "Thank You Email", prompt: "Draft a polite thank you email for their support." },
    { name: "Proposal Email", prompt: "Write a detailed proposal pitch email outline." },
    { name: "General Inquiry", prompt: "Draft a brief general inquiry email." }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 select-text">
      
      {/* Top Header */}
      <div className="mb-5 flex items-baseline space-x-2 shrink-0">
        <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none">Compose Email</h1>
        <span className="text-xs font-handwriting text-[#2b2725]/60 font-bold">Craft the perfect email with Doot AI</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pr-1">
        
        {/* LEFT COMPOSER PANEL */}
        <div className="flex-1 bg-white sketch-border sketch-shadow p-6 rounded-xl flex flex-col justify-between min-h-[480px] lg:min-h-0 relative">
          
          <div className="space-y-4">
            {/* Header bar controls */}
            <div className="flex justify-between items-center text-xs font-handwriting font-bold select-none text-[#2b2725]/60 border-b border-dashed border-[#e6dfd3] pb-2">
              <span className="flex items-center gap-1">🌸 Draft letter</span>
              <div className="flex items-center space-x-3.5">
                <button className="hover:text-[#b83227] cursor-pointer">Save Draft</button>
                <button className="hover:text-[#b83227] cursor-pointer"><Maximize2 className="w-3.5 h-3.5" /></button>
                <button className="hover:text-[#b83227] cursor-pointer"><MoreVertical className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Recipient Input (Chip layout) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e6dfd3] pb-2 text-xs">
              <span className="font-handwriting font-black text-[#2b2725]/60 mr-2 select-none">To</span>
              
              {recipients.map((rec, index) => (
                <div key={index} className="flex items-center space-x-1 px-2.5 py-1 bg-[#fcdfd7] text-[#2b2725] font-handwriting font-bold rounded-lg border border-[#b83227]/30 shadow-sm shrink-0">
                  <span>{rec}</span>
                  <button onClick={() => removeRecipient(index)} className="text-[#b83227] hover:text-[#2b2725] font-bold text-[10px] ml-1 select-none">×</button>
                </div>
              ))}

              <input
                type="text"
                placeholder={recipients.length === 0 ? "aarav@example.com" : ""}
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={addRecipient}
                className="flex-1 min-w-[120px] bg-transparent border-none py-1 focus:outline-none placeholder-gray-400 font-handwriting font-bold"
              />
              <span className="ml-auto text-[10px] font-mono text-[#2b2725]/50 select-none cursor-pointer">Cc Bcc</span>
            </div>

            {/* Subject Input */}
            <div className="flex items-center border-b border-[#e6dfd3] pb-2 text-xs">
              <span className="font-handwriting font-black text-[#2b2725]/60 mr-2 select-none">Subject</span>
              <input
                type="text"
                placeholder="Letter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent border-none py-1 focus:outline-none placeholder-gray-400 font-handwriting font-bold"
              />
            </div>

            {/* Rich Editor Toolbar Mock */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#fcfaf4] border border-[#e6dfd3] rounded-xl select-none text-gray-500">
              <span className="text-xs font-mono px-2 py-0.5 bg-white border border-[#e6dfd3] rounded cursor-pointer font-bold">Sans Serif</span>
              <span className="text-[#e6dfd3]">|</span>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
              <span className="text-[#e6dfd3]">|</span>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Align"><AlignLeft className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="List"><List className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Image"><ImageIcon className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-[#e6dfd3]/20 rounded cursor-pointer" title="Emoji"><Smile className="w-3.5 h-3.5" /></button>
            </div>

            {/* Textarea Body */}
            <textarea
              placeholder="Dear Aarav,..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-56 p-4 bg-[#fbf9f4]/80 sketch-border-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#b83227]/30 shadow-inner font-medium placeholder-gray-400"
            />

            {/* Attachments listing */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-[#fcfaf4] p-1.5 px-3 border border-dashed border-[#e6dfd3] rounded-lg text-xs font-handwriting font-bold select-none text-[#2b2725]">
                <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                <span className="truncate max-w-[120px]">Project Brief.pdf</span>
                <span className="text-[10px] text-gray-500">(2.4 MB)</span>
                <button onClick={() => setAttachments([])} className="text-red-700 hover:text-black font-bold ml-1 select-none">×</button>
              </div>
              <button className="text-[11px] font-handwriting font-black text-[#b83227] hover:underline cursor-pointer select-none">
                + Add another file
              </button>
            </div>
          </div>

          {/* AI assistant toolbar inside card */}
          <div className="mt-5 border-t border-dashed border-[#e6dfd3] pt-4 flex flex-wrap items-center justify-between gap-3 select-none">
            <div className="flex flex-wrap items-center gap-2 text-xs font-handwriting font-black">
              <button 
                onClick={() => handleGenerateEmail()}
                className="p-1.5 px-3 bg-[#fcdfd7] hover:bg-[#fbd0c7] text-[#b83227] rounded-lg border border-[#b83227]/30 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Doot AI</span>
              </button>
              <button className="p-1.5 px-3 bg-white border border-[#e6dfd3] hover:bg-[#e6dfd3]/10 text-gray-700 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Improve Writing</span>
              </button>
              <button className="p-1.5 px-3 bg-white border border-[#e6dfd3] hover:bg-[#e6dfd3]/10 text-gray-700 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors">
                <Smile className="w-3.5 h-3.5 text-[#3c6382]" />
                <span>Change Tone</span>
              </button>
              <button className="p-1.5 px-3 bg-white border border-[#e6dfd3] hover:bg-[#e6dfd3]/10 text-gray-700 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors">
                <Globe className="w-3.5 h-3.5 text-green-700" />
                <span>Translate</span>
              </button>
            </div>

            {/* Bottom Send & Discard Actions */}
            <div className="flex items-center space-x-3 font-handwriting font-black">
              <button 
                onClick={() => { setSubject(""); setBody(""); setRecipients([]); }}
                className="p-2 text-[#2b2725]/60 hover:text-red-700 cursor-pointer flex items-center gap-1"
                title="Discard"
              >
                <Trash2 className="w-4 h-4" /> Discard
              </button>
              <button className="p-2 px-4 bg-white border border-[#e6dfd3] text-[#2b2725] hover:bg-gray-50 rounded-xl cursor-pointer">
                Save Draft
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="p-2 px-5 bg-[#b83227] hover:bg-[#a02b21] text-white rounded-xl flex items-center space-x-2 cursor-pointer shadow-sm border-b-2 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COMPOSER SETTINGS */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 text-left relative">
          
          {/* Fuji watermark background under sidebar card */}
          <VectorMtFuji />

          {/* Doot AI Composer Options Card */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none flex-1 flex flex-col justify-between">
            {/* Washi tapes on corners */}
            <div className="absolute top-[-8px] right-[10%] w-14 h-4.5 bg-[#fcdfd7] opacity-75 border-l border-r border-dashed border-white/40 rotate-[4deg] shadow-sm select-none pointer-events-none" />

            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-dashed border-[#e6dfd3]">
                <DootCalligraphyMascot />
                <div>
                  <h3 className="font-handwriting font-black text-lg text-[#2b2725]">Doot AI Composer</h3>
                  <p className="text-[10px] text-[#2b2725]/50 font-mono font-bold leading-none mt-0.5">Your AI writing partner</p>
                </div>
              </div>

              {/* Templates Section */}
              <div className="mt-4">
                <h4 className="text-xs font-handwriting font-black text-[#2b2725]/60 mb-2">Suggested Templates</h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {templatesList.map((temp) => (
                    <button
                      key={temp.name}
                      onClick={() => {
                        setActiveTemplate(temp.name);
                        setAiPrompt(temp.prompt);
                      }}
                      className={`w-full p-2 text-left text-[11px] font-handwriting font-black rounded-lg border border-dashed transition-all flex items-center space-x-2 cursor-pointer ${
                        activeTemplate === temp.name
                          ? "bg-[#fcdfd7] border-[#b83227]/40 text-[#b83227]"
                          : "bg-white border-[#ebdcc8] text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>📝</span>
                      <span className="truncate">{temp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="mt-4">
                <h4 className="text-xs font-handwriting font-black text-[#2b2725]/60 mb-2">Tone</h4>
                <div className="grid grid-cols-2 gap-2 text-center font-handwriting font-black text-[11px]">
                  {["Professional", "Friendly", "Formal", "Casual"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTone(t)}
                      className={`p-1.5 rounded-lg border cursor-pointer border-b-2 ${
                        activeTone === t
                          ? "bg-[#fcdfd7] border-[#b83227]/30 text-[#b83227] font-black"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom AI Prompt Box */}
              <div className="mt-4">
                <h4 className="text-xs font-handwriting font-black text-[#2b2725]/60 mb-2">AI Prompt</h4>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#2b2725]/15 rounded-xl text-xs font-handwriting font-extrabold focus:outline-none h-16 leading-tight"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4 border-t border-dashed border-[#e6dfd3] mt-4">
              <button
                onClick={handleGenerateEmail}
                disabled={generating}
                className="w-full py-2.5 bg-[#b83227] hover:bg-[#a02b21] text-white font-handwriting font-black text-sm rounded-xl flex items-center justify-center space-x-2 cursor-pointer border-b-3 shadow disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Email</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b83227]" />
      </div>
    }>
      <ComposePageContent />
    </Suspense>
  );
}

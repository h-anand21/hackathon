"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, User as FirebaseUser, signOut } from "firebase/auth";
import {
  Mail,
  Calendar,
  Check,
  Loader2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Lock,
  LogOut,
  Moon,
  Sun
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Onboarding Step State
  const [step, setStep] = useState(1);
  
  // Plugin connection states
  const [connections, setConnections] = useState<{ gmail: boolean; googlecalendar: boolean }>({
    gmail: false,
    googlecalendar: false
  });
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Sync animation state
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusText, setSyncStatusText] = useState("Initializing connection...");
  const [isSyncing, setIsSyncing] = useState(false);

  // AI Preferences
  const [preferences, setPreferences] = useState({
    autoPriority: true,
    smartReplies: true,
    morningBriefing: false,
    vectorSearch: true
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Check URL query parameters on load
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const parsedStep = parseInt(stepParam);
      if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
        setStep(parsedStep);
      }
    }
  }, [searchParams]);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      if (currentUser) {
        // Fetch active connections status
        fetchConnectionsStatus(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch connection status from API
  const fetchConnectionsStatus = async (uid: string) => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/corsair/status?tenantId=${uid}`);
      const data = await res.json();
      if (data.success) {
        const plugins: string[] = data.connectedPlugins || [];
        setConnections({
          gmail: plugins.includes("gmail"),
          googlecalendar: plugins.includes("googlecalendar")
        });
      }
    } catch (e) {
      console.error("Error fetching connection status:", e);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Step 0: Handle Google Sign-In via Firebase
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      
      // Sync user details to our database
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          photoUrl: currentUser.photoURL
        })
      });
      
      // Refresh connection status
      await fetchConnectionsStatus(currentUser.uid);
    } catch (error) {
      console.error("Firebase Login / Sync Error:", error);
    }
  };

  // Sign out helper
  const handleSignOut = async () => {
    await signOut(auth);
    setStep(1);
  };

  // Trigger Google OAuth Connect for Corsair Gmail/Calendar
  const connectPlugin = (pluginId: 'gmail' | 'googlecalendar') => {
    if (!user) return;
    window.location.href = `/api/corsair/auth/connect?pluginId=${pluginId}&tenantId=${user.uid}`;
  };

  // Handle Sync Progress Simulation (Step 3)
  useEffect(() => {
    if (step === 3 && !isSyncing) {
      setIsSyncing(true);
      setSyncProgress(0);
      
      const statusSteps = [
        { progress: 10, text: "Contacting Google Mail & Calendar APIs..." },
        { progress: 25, text: "Retrieving latest 50 inbox messages..." },
        { progress: 45, text: "Parsing calendar events & upcoming schedules..." },
        { progress: 65, text: "Running AI prioritizer on unread emails..." },
        { progress: 85, text: "Generating pgvector semantic index embeddings..." },
        { progress: 100, text: "All synced! Creating your MailOS workspace..." }
      ];

      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < statusSteps.length) {
          const target = statusSteps[currentStepIndex];
          setSyncProgress(target.progress);
          setSyncStatusText(target.text);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          setIsSyncing(false);
          // Transition to Step 4 after a short delay
          setTimeout(() => {
            setStep(4);
          }, 1000);
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Step 4: Save preferences and go to step 5
  const savePreferences = async () => {
    if (!user) return;
    setSavingPreferences(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          preferences
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep(5);
      }
    } catch (e) {
      console.error("Error saving preferences:", e);
    } finally {
      setSavingPreferences(false);
    }
  };

  // Navigation handlers
  const handleStartOnboarding = () => {
    if (!user) {
      handleSignIn();
    } else {
      setStep(2);
    }
  };

  // Render Loading screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3c6382] mx-auto" />
          <p className="font-handwriting text-xl text-[#2b2725]/70">Opening DootAI notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Outer Notebook Card */}
      <div className="relative w-full max-w-4xl min-h-[550px] bg-[#fbf8f3] sketch-border sketch-shadow flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Spiral Binder (Hidden on small screens) */}
        <div className="hidden md:flex w-16 spiral-binder flex-col justify-around py-8 items-center relative z-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="spiral-ring -mr-10 my-2" />
          ))}
        </div>

        {/* Right Page Contents */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between relative">
          
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-6 border-b border-dashed border-[#e6dfd3] mb-6">
            <div className="flex items-center space-x-2">
              <span className="font-handwriting text-2xl text-[#b83227] font-bold">DootAI MailOS</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#3c6382]/10 text-[#3c6382] uppercase font-mono font-bold tracking-wider">
                Japanese Ink Theme
              </span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-[#2b2725]/60 font-mono">Tenant Connected</p>
                </div>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-[#2b2725]"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-full hover:bg-red-50 text-[#b83227] sketch-border-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Step Contents */}

          {/* STEP 1: Welcome Notebook Cover */}
          {step === 1 && (
            <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-8 py-4">
              <div className="space-y-4 max-w-md text-left">
                <div className="washi-tape washi-tape-blue inline-block px-4 py-1 text-sm font-handwriting mb-2">
                  Konnichiwa! こんにちは
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-handwriting tracking-tight text-[#2b2725]">
                  AI-Powered Email & Calendar Operating System
                </h1>
                <p className="text-sm text-[#2b2725]/80 leading-relaxed font-sans">
                  DootAI MailOS merges Google Calendar & Gmail inside a beautiful, minimalist, hand-drawn Japanese sketchbook theme. Fast keyboard shortcuts, smart priorities, and interactive AI agent chat wait inside.
                </p>
                <div className="pt-4 flex items-center space-x-4">
                  <button
                    onClick={handleStartOnboarding}
                    className="px-6 py-3 bg-[#b83227] text-white font-bold sketch-border sketch-shadow-hover hover:scale-105 flex items-center space-x-2 cursor-pointer transition-all duration-200"
                  >
                    <span>{user ? "Open Notebook" : "Sign in with Google"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {!user && (
                    <span className="text-xs font-mono text-[#2b2725]/60 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Firebase Secure Authentication
                    </span>
                  )}
                </div>
              </div>

              {/* Graphic Mascot and Fuji */}
              <div className="flex flex-col items-center">
                {/* Waving Mascot Doot SVG */}
                <svg viewBox="0 0 120 120" className="w-32 h-32 animate-bounce duration-1000">
                  <rect x="30" y="30" width="60" height="40" rx="15" fill="#fbf8f3" stroke="#2b2725" strokeWidth="2.5" />
                  <rect x="40" y="38" width="40" height="24" rx="8" fill="#3c6382" opacity="0.15" stroke="#2b2725" strokeWidth="1.5" />
                  <path d="M 48 48 Q 52 44 56 48" stroke="#2b2725" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 64 48 Q 68 44 72 48" stroke="#2b2725" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <line x1="60" y1="30" x2="60" y2="15" stroke="#2b2725" strokeWidth="2.5" />
                  <circle cx="60" cy="12" r="5" fill="#b83227" stroke="#2b2725" strokeWidth="2" />
                  <path d="M 40 70 L 80 70 L 75 100 L 45 100 Z" fill="#fbf8f3" stroke="#2b2725" strokeWidth="2.5" />
                  <path d="M 80 78 Q 95 65 105 50" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <circle cx="105" cy="48" r="4" fill="#388e3c" stroke="#2b2725" strokeWidth="1.5" />
                  <path d="M 40 78 Q 25 85 20 95" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>

                {/* Hanko stamp */}
                <div className="hanko-stamp rounded-full w-20 h-20 border-4 border-dashed border-[#b83227] flex flex-col items-center justify-center p-2 text-xs font-bold bg-[#b83227]/5 select-none rotate-[-8deg] mt-4">
                  <span className="font-handwriting tracking-widest text-[#b83227] text-base leading-none">AI OS</span>
                  <span className="text-[9px] text-[#b83227]/80 tracking-widest font-mono">DOOT</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Connect Google Services */}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
              <div className="max-w-xl text-left">
                <div className="washi-tape washi-tape-green inline-block px-4 py-1 text-sm font-handwriting mb-2">
                  Integrations (接続)
                </div>
                <h2 className="text-2xl font-bold font-handwriting text-[#2b2725]">
                  Connect Google Gmail & Calendar via Corsair
                </h2>
                <p className="text-xs text-[#2b2725]/60 mt-1">
                  We securely sync your mail cache to PostgreSQL and use state-of-the-art token encryption.
                </p>
              </div>

              {/* Integrations grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                {/* Gmail Card */}
                <div className="p-6 bg-[#fbf8f3] sketch-border sketch-shadow flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-[#b83227]/10 text-[#b83227] sketch-border-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold font-handwriting text-lg leading-tight">Google Gmail</h3>
                      <p className="text-[11px] text-[#2b2725]/50">Synchronize inbox & send mail</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      connections.gmail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {connections.gmail ? "CONNECTED ✓" : "NOT CONNECTED"}
                    </span>
                    <button
                      onClick={() => connectPlugin("gmail")}
                      disabled={connections.gmail}
                      className={`px-4 py-2 text-xs font-bold sketch-border-sm ${
                        connections.gmail 
                          ? 'opacity-50 bg-[#e6dfd3] cursor-not-allowed text-[#2b2725]/50'
                          : 'bg-white text-[#2b2725] sketch-shadow-hover hover:scale-105 transition-all'
                      }`}
                    >
                      {connections.gmail ? "Linked" : "Connect"}
                    </button>
                  </div>
                </div>

                {/* Calendar Card */}
                <div className="p-6 bg-[#fbf8f3] sketch-border sketch-shadow flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-[#3c6382]/10 text-[#3c6382] sketch-border-sm">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold font-handwriting text-lg leading-tight">Google Calendar</h3>
                      <p className="text-[11px] text-[#2b2725]/50">Sync schedule & create events</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      connections.googlecalendar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {connections.googlecalendar ? "CONNECTED ✓" : "NOT CONNECTED"}
                    </span>
                    <button
                      onClick={() => connectPlugin("googlecalendar")}
                      disabled={connections.googlecalendar}
                      className={`px-4 py-2 text-xs font-bold sketch-border-sm ${
                        connections.googlecalendar 
                          ? 'opacity-50 bg-[#e6dfd3] cursor-not-allowed text-[#2b2725]/50'
                          : 'bg-white text-[#2b2725] sketch-shadow-hover hover:scale-105 transition-all'
                      }`}
                    >
                      {connections.googlecalendar ? "Linked" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Navigation */}
              <div className="pt-6 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold underline hover:text-[#b83227] cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!connections.gmail}
                  className={`px-6 py-2.5 font-bold sketch-border flex items-center space-x-2 ${
                    connections.gmail
                      ? 'bg-[#b83227] text-white sketch-shadow-hover cursor-pointer'
                      : 'bg-[#e6dfd3] text-[#2b2725]/40 border-[#d2c9b1] cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Sync</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preparing Workspace & Syncing */}
          {step === 3 && (
            <div className="flex-1 flex flex-col justify-center py-4 items-center text-center space-y-6">
              <div className="relative">
                {/* Mt Fuji drawing */}
                <svg viewBox="0 0 200 120" className="w-48 h-32 opacity-70">
                  <circle cx="60" cy="50" r="30" fill="#b83227" opacity="0.3" />
                  <path d="M 10 110 L 90 20 Q 95 15 105 15 Q 115 15 120 20 L 190 110 Z" fill="#f1ebe0" stroke="#2b2725" strokeWidth="2" />
                  <path d="M 80 43 L 90 20 Q 95 15 105 15 Q 115 15 120 20 L 130 43 Q 120 48 115 42 Q 110 37 105 45 Q 100 48 95 40 Q 90 42 80 43 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="1.5" />
                  <path d="M 5 95 Q 25 85 45 95 Q 65 85 75 95" fill="none" stroke="#2b2725" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                
                {/* Floating spinner on top */}
                <div className="absolute inset-0 flex items-center justify-center pt-8">
                  <Loader2 className="w-12 h-12 animate-spin text-[#3c6382]" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold font-handwriting text-[#2b2725]">
                  Preparing Workspace...
                </h3>
                <p className="text-xs text-[#2b2725]/60 font-mono">
                  {syncStatusText}
                </p>
              </div>

              {/* Progress bar container (sketchy) */}
              <div className="w-full max-w-md h-6 bg-white sketch-border overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#3c6382] rounded transition-all duration-500 ease-out"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              <div className="text-sm font-mono text-[#3c6382] font-bold">
                {syncProgress}% Complete
              </div>
            </div>
          )}

          {/* STEP 4: AI Capabilities Checklist */}
          {step === 4 && (
            <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
              <div className="max-w-xl text-left">
                <div className="washi-tape washi-tape-blue inline-block px-4 py-1 text-sm font-handwriting mb-2">
                  Preferences (設定)
                </div>
                <h2 className="text-2xl font-bold font-handwriting text-[#2b2725]">
                  Configure AI Agent Capabilities
                </h2>
                <p className="text-xs text-[#2b2725]/60 mt-1">
                  Toggle on-device and serverless AI assistance services for your inbox.
                </p>
              </div>

              {/* Option checkboxes */}
              <div className="space-y-4 max-w-2xl">
                {/* Auto Priority */}
                <label className="flex items-start p-4 bg-white sketch-border-sm sketch-shadow cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferences.autoPriority}
                    onChange={(e) => setPreferences({ ...preferences, autoPriority: e.target.checked })}
                    className="mt-1 mr-4 w-4 h-4 accent-[#b83227] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold font-handwriting text-base text-[#2b2725] flex items-center">
                      Auto-priority labeling for incoming emails
                      <Sparkles className="w-3.5 h-3.5 text-[#f5b041] ml-1.5" />
                    </span>
                    <p className="text-[11px] text-[#2b2725]/60">
                      Sort incoming emails instantly into High, Medium, or Low priority badges.
                    </p>
                  </div>
                </label>

                {/* Smart Replies */}
                <label className="flex items-start p-4 bg-white sketch-border-sm sketch-shadow cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferences.smartReplies}
                    onChange={(e) => setPreferences({ ...preferences, smartReplies: e.target.checked })}
                    className="mt-1 mr-4 w-4 h-4 accent-[#b83227] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold font-handwriting text-base text-[#2b2725]">
                      Smart Auto-Replies
                    </span>
                    <p className="text-[11px] text-[#2b2725]/60">
                      Let the AI agent draft suggestible responses next to your active reading pane.
                    </p>
                  </div>
                </label>

                {/* Morning Briefing */}
                <label className="flex items-start p-4 bg-white sketch-border-sm sketch-shadow cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferences.morningBriefing}
                    onChange={(e) => setPreferences({ ...preferences, morningBriefing: e.target.checked })}
                    className="mt-1 mr-4 w-4 h-4 accent-[#b83227] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold font-handwriting text-base text-[#2b2725]">
                      Daily Morning Summary Email
                    </span>
                    <p className="text-[11px] text-[#2b2725]/60">
                      Get a single summarized brief of your critical emails and calendar schedule every morning at 7:00 AM.
                    </p>
                  </div>
                </label>

                {/* Vector Search */}
                <label className="flex items-start p-4 bg-white sketch-border-sm sketch-shadow cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preferences.vectorSearch}
                    onChange={(e) => setPreferences({ ...preferences, vectorSearch: e.target.checked })}
                    className="mt-1 mr-4 w-4 h-4 accent-[#b83227] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold font-handwriting text-base text-[#2b2725]">
                      pgvector Semantic search
                    </span>
                    <p className="text-[11px] text-[#2b2725]/60">
                      Index and search across your entire workspace naturally using concept similarity (e.g. "taxes 2025").
                    </p>
                  </div>
                </label>
              </div>

              {/* Progress Navigation */}
              <div className="pt-6 flex justify-end items-center">
                <button
                  onClick={savePreferences}
                  disabled={savingPreferences}
                  className="px-6 py-2.5 bg-[#b83227] text-white font-bold sketch-border sketch-shadow-hover hover:scale-105 flex items-center space-x-2 cursor-pointer transition-all duration-200"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Options...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Finalize</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Onboarding Finished */}
          {step === 5 && (
            <div className="flex-1 flex flex-col justify-center py-4 items-center text-center space-y-8">
              
              {/* Massive Approved Hanko Stamp */}
              <div className="relative flex items-center justify-center">
                {/* Waving Mascot Doot SVG */}
                <svg viewBox="0 0 120 120" className="w-40 h-40">
                  <rect x="30" y="30" width="60" height="40" rx="15" fill="#fbf8f3" stroke="#2b2725" strokeWidth="2.5" />
                  <rect x="40" y="38" width="40" height="24" rx="8" fill="#388e3c" opacity="0.1" stroke="#2b2725" strokeWidth="1.5" />
                  <path d="M 48 50 Q 60 58 72 50" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <circle cx="48" cy="42" r="3.5" fill="#2b2725" />
                  <circle cx="72" cy="42" r="3.5" fill="#2b2725" />
                  <line x1="60" y1="30" x2="60" y2="15" stroke="#2b2725" strokeWidth="2.5" />
                  <circle cx="60" cy="12" r="5" fill="#388e3c" stroke="#2b2725" strokeWidth="2" />
                  <path d="M 40 70 L 80 70 L 75 100 L 45 100 Z" fill="#fbf8f3" stroke="#2b2725" strokeWidth="2.5" />
                  {/* Both hands up in celebration */}
                  <path d="M 40 78 Q 20 60 15 50" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 80 78 Q 100 60 105 50" stroke="#2b2725" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>

                {/* Hanko red stamp overlay */}
                <div className="absolute bottom-2 right-2 hanko-stamp w-28 h-28 border-4 border-[#b83227] rounded-none rotate-[-12deg] flex flex-col justify-center items-center font-bold text-[#b83227] bg-[#b83227]/5 select-none">
                  <span className="text-[10px] tracking-widest font-mono">DootAI OS</span>
                  <span className="font-handwriting text-xl tracking-wider leading-none my-0.5">APPROVED</span>
                  <span className="text-[9px] tracking-widest font-mono">WORKSPACE</span>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <h2 className="text-3xl font-bold font-handwriting text-[#2b2725]">
                  Workspace is Ready!
                </h2>
                <p className="text-sm text-[#2b2725]/80 leading-relaxed font-sans">
                  Konnichiwa, your mailbox and calendar cache are indexed. You can now access your sketchbook dashboard and invoke the DootAI assistant.
                </p>
              </div>

              <div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-8 py-3.5 bg-[#b83227] text-white font-bold sketch-border sketch-shadow-hover hover:scale-105 flex items-center space-x-2 text-lg cursor-pointer transition-all duration-200"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-6 border-t border-dashed border-[#e6dfd3] flex justify-between items-center text-[10px] text-[#2b2725]/50 font-mono">
            <span>DootAI MailOS v0.1.0</span>
            <span>Made with ☕ & 🍙</span>
          </div>

        </div>

      </div>
    </div>
  );
}

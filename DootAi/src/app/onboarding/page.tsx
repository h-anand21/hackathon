"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, User as FirebaseUser, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  PlusSquare,
  Users
} from "lucide-react";

function OnboardingPageContent() {
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
    summarizeEmails: true,
    draftReplies: true,
    manageMeetings: true,
    morningBriefing: true,
    taskExtraction: true
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
    console.log("DootAI Auth: Initializing onAuthStateChanged listener...");
    
    const fallbackTimeout = setTimeout(() => {
      console.warn("DootAI Auth: Auth state listener timed out. Bypassing stuck loading screen...");
      setLoadingAuth(false);
    }, 3000);

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      clearTimeout(fallbackTimeout);
      console.log("DootAI Auth: onAuthStateChanged fired. Current user:", currentUser ? currentUser.email : "Null");
      setUser(currentUser);
      setLoadingAuth(false);
      
      if (currentUser) {
        fetchConnectionsStatus(currentUser.uid);
      }
    }, (error) => {
      clearTimeout(fallbackTimeout);
      console.error("DootAI Auth: onAuthStateChanged error:", error);
      setLoadingAuth(false);
    });

    return () => {
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
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

  // Handle Sync Progress Simulation & Real Backend Sync (Step 3)
  useEffect(() => {
    if (step === 3 && !isSyncing) {
      setIsSyncing(true);
      setSyncProgress(0);
      
      if (user) {
        fetch("/api/corsair/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid })
        }).catch(err => {
          console.error("Real sync failed in onboarding:", err);
        });
      }
      
      const statusSteps = [
        { progress: 15, text: "Contacting Google Mail & Calendar APIs..." },
        { progress: 35, text: "Retrieving latest inbox messages..." },
        { progress: 55, text: "Parsing calendar events & schedules..." },
        { progress: 75, text: "Running AI prioritizer on unread emails..." },
        { progress: 90, text: "Generating pgvector semantic index embeddings..." },
        { progress: 100, text: "All synced! Workspace is ready..." }
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
          setTimeout(() => {
            setStep(4);
          }, 1500);
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [step, user]);

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

  // Helper checkmark animation component
  function AnimatedCheck({ delay = 0 }: { delay?: number }) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay }}
        className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center border border-green-400 shadow-sm shrink-0"
      >
        <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
    );
  }

  // Render Loading screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#d1c8b7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#b83227] mx-auto" />
          <p className="font-handwriting text-xl text-[#2b2725]/70 font-bold">Opening DootAI notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d1c8b7] flex items-center justify-center p-0 md:p-6 select-text font-sans overflow-x-hidden relative">
      
      {/* Soft watercolor background blobs */}
      <div className="watercolor-blob w-80 h-80 top-[10%] left-[5%] bg-[#ffb7c5]/35"></div>
      <div className="watercolor-blob w-[360px] h-[360px] top-[40%] right-[10%] bg-[#f5b041]/15"></div>
      <div className="watercolor-blob w-80 h-80 bottom-[10%] left-[20%] bg-[#388e3c]/15"></div>

      {/* Decorative floating sakura petals */}
      <div className="sakura-petal w-4 h-4 top-[15%] left-[80%]" style={{ animationDelay: '0s' }}></div>
      <div className="sakura-petal w-3.5 h-3 top-[35%] left-[72%]" style={{ animationDelay: '3s' }}></div>
      <div className="sakura-petal w-3 h-3 top-[50%] left-[92%]" style={{ animationDelay: '1.5s' }}></div>
      <div className="sakura-petal w-4 h-3 top-[75%] left-[85%]" style={{ animationDelay: '6s' }}></div>

      {/* Main Notebook Card */}
      <div className="relative w-full max-w-5xl min-h-[620px] bg-white sketch-border-thick sketch-shadow flex flex-col md:flex-row overflow-hidden rounded-2xl">
        
        {/* Left Side: Ghibli background & Mascot column */}
        <div className="w-full md:w-[45%] max-w-[440px] hidden md:block border-r-2 border-dashed border-[#e6dfd3] relative overflow-hidden bg-[#fdfaf4]">
          
          {/* Custom spiral holes at the interface border */}
          <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-between py-8 z-20 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-2.5 h-4 bg-[#1e1b1a] rounded-sm ml-[-5px] shadow-inner" />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <img
                src={
                  step === 1 ? "/boarding_left_step1.png" :
                  step === 2 ? "/boarding_left_step2.png" :
                  step === 3 ? "/boarding_left_step3.png" :
                  step === 4 ? "/boarding_left_step4.png" :
                  "/boarding_left_step5.png"
                }
                alt={`Step ${step} background`}
                className="w-full h-full object-cover mix-blend-multiply select-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Main Sketchbook Card Page */}
        <div className="flex-1 p-6 sm:p-10 md:p-12 washi-paper relative z-10 flex flex-col justify-between min-h-[580px]">
          
          {/* Header Bar */}
          <header className="w-full flex justify-between items-center pb-5 border-b border-dashed border-[#e6dfd3] mb-6">
            <div className="flex items-center space-x-3 select-none">
              <img 
                src="/hanko_logo.png" 
                alt="DootAI Stamp Logo" 
                className="w-9 h-9 object-contain mix-blend-multiply rotate-[-3deg]" 
              />
              <div className="flex flex-col text-left">
                <span className="font-handwriting text-2xl font-extrabold text-[#2b2725] leading-none">DootAI</span>
                <span className="text-[9px] text-[#2b2725]/60 font-mono tracking-wider">AI Executive Assistant</span>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-handwriting font-bold leading-none text-[#2b2725]">
                    {user.displayName || user.email?.split("@")[0]}
                  </p>
                  <p className="text-[9px] text-[#2b2725]/50 font-mono">Workspace Connected</p>
                </div>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-[#2b2725] object-cover"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-full hover:bg-red-50 text-[#b83227] border border-dashed border-[#b83227]/30 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </header>

          {/* Interactive Card Section with Transitions */}
          <main className="flex-1 flex flex-col justify-center my-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                
                {/* STEP 1: Welcome & Google Connect */}
                {step === 1 && (
                  <div className="space-y-6 max-w-md mx-auto text-left relative">
                    <div className="absolute top-[-32px] left-[35%] w-32 h-6 bg-[#f5b041]/85 border-l border-r border-dashed border-white/50 rotate-[-2deg] shadow-sm flex items-center justify-center text-[10px] font-mono text-white select-none">
                      ★ WELCOME ★
                    </div>
                    
                    <div className="pt-2">
                      <h2 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none mb-1">
                        Welcome {user ? <span className="text-[#b83227]">{user.displayName?.split(" ")[0] || "Traveler"}</span> : "Himanshu"} 👋
                      </h2>
                      <p className="text-sm font-handwriting font-bold text-[#2b2725]/60">
                        Let's connect your workspace.
                      </p>
                    </div>

                    <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-1" />

                    <div className="space-y-4">
                      <p className="text-xs font-handwriting font-extrabold text-[#2b2725]/75">
                        DootAI needs access to:
                      </p>

                      <div className="p-4 bg-[#fbf9f4]/80 border border-dashed border-[#e6dfd3] rounded-xl space-y-3 shadow-sm">
                        {/* Gmail Row */}
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-[#b83227]/10 rounded-lg text-[#b83227] border border-dashed border-[#b83227]/20">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">Gmail</h4>
                            <p className="text-[11px] font-handwriting text-[#2b2725]/60 font-semibold leading-normal">
                              Read, send and organize your emails.
                            </p>
                          </div>
                        </div>

                        {/* Calendar Row */}
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-[#3c6382]/10 rounded-lg text-[#3c6382] border border-dashed border-[#3c6382]/20">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">Google Calendar</h4>
                            <p className="text-[11px] font-handwriting text-[#2b2725]/60 font-semibold leading-normal">
                              Manage your schedule and events.
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] font-handwriting text-[#2b2725]/50 font-bold text-center">
                        to help manage your day.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col space-y-3">
                      {!user ? (
                        <button
                          onClick={handleSignIn}
                          className="w-full py-3.5 bg-[#b83227] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-md border-b-4 border-[#8e231b] hover:brightness-105"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span>Connect Google</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => connectPlugin("gmail")}
                          className="w-full py-3.5 bg-[#b83227] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border-b-4 border-[#8e231b] hover:brightness-105"
                        >
                          <span>Connect Google</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                      
                      <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-[#2b2725]/50">
                        <Lock className="w-3 h-3" />
                        <span>Your data is private and secure.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Google Connected Checklist */}
                {step === 2 && (
                  <div className="space-y-5 max-w-md mx-auto text-left relative">
                    <div className="absolute top-[-32px] left-[35%] w-32 h-6 bg-[#3c6382]/85 border-l border-r border-dashed border-white/50 rotate-[2deg] shadow-sm flex items-center justify-center text-[10px] font-mono text-white select-none">
                      ★ AUTHORIZED ★
                    </div>

                    <div className="pt-2 flex flex-col items-center text-center">
                      <div className="relative mb-2">
                        <div className="w-14 h-14 rounded-full bg-white border border-[#2b2725] flex items-center justify-center shadow-sm">
                          <svg className="w-7 h-7" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center border-2 border-white text-[9px] font-bold">
                          ✓
                        </div>
                      </div>

                      <h2 className="text-3xl font-handwriting font-black leading-none">
                        Google <span className="text-[#b83227]">Connected</span>
                      </h2>
                      <p className="text-[11px] font-handwriting text-[#2b2725]/60 mt-1 font-bold">
                        {connections.gmail && connections.googlecalendar 
                          ? "DootAI is now connected to your Google Account."
                          : "Connect both services to proceed with sync."}
                      </p>
                    </div>

                    <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-1" />

                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-[#2b2725]/60 text-center uppercase tracking-wider font-bold">
                        Permissions Requested
                      </p>

                      <div className="p-3 bg-[#fbf9f4]/90 border border-dashed border-[#e6dfd3] rounded-xl space-y-2">
                        {/* Permission 1: Read Emails */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Read Emails</h4>
                              <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold">View and read your emails.</p>
                            </div>
                          </div>
                          {connections.gmail ? <AnimatedCheck delay={0.1} /> : <div className="w-4 h-4 border border-dashed border-gray-400 rounded-full" />}
                        </div>

                        {/* Permission 2: Send Emails */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Send className="w-3.5 h-3.5 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Send Emails</h4>
                              <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold">Send emails on your behalf.</p>
                            </div>
                          </div>
                          {connections.gmail ? <AnimatedCheck delay={0.2} /> : <div className="w-4 h-4 border border-dashed border-gray-400 rounded-full" />}
                        </div>

                        {/* Permission 3: Read Calendar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Read Calendar</h4>
                              <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold">View your events and schedule.</p>
                            </div>
                          </div>
                          {connections.googlecalendar ? <AnimatedCheck delay={0.3} /> : <div className="w-4 h-4 border border-dashed border-gray-400 rounded-full" />}
                        </div>

                        {/* Permission 4: Create Events */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <PlusSquare className="w-3.5 h-3.5 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Create Events</h4>
                              <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold">Create and manage events.</p>
                            </div>
                          </div>
                          {connections.googlecalendar ? <AnimatedCheck delay={0.4} /> : <div className="w-4 h-4 border border-dashed border-gray-400 rounded-full" />}
                        </div>

                        {/* Permission 5: Access Contacts */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-3.5 h-3.5 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Access Contacts</h4>
                              <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold">View and manage your contacts.</p>
                            </div>
                          </div>
                          {connections.gmail ? <AnimatedCheck delay={0.5} /> : <div className="w-4 h-4 border border-dashed border-gray-400 rounded-full" />}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2.5">
                      {connections.gmail && connections.googlecalendar ? (
                        <button
                          onClick={() => setStep(3)}
                          className="w-full py-3 bg-[#b83227] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border-b-4 border-[#8e231b] hover:brightness-105"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => connectPlugin(connections.gmail ? "googlecalendar" : "gmail")}
                          className="w-full py-3 bg-[#3c6382] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border-b-4 border-[#243f54] hover:brightness-105"
                        >
                          <span>Connect {connections.gmail ? "Google Calendar" : "Google Gmail"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono text-[#2b2725]/50">
                        <Lock className="w-3 h-3" />
                        <span>Your data stays private. We never share it.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Preparing Workspace & Syncing */}
                {step === 3 && (
                  <div className="space-y-4 max-w-md mx-auto text-left relative">
                    <div className="text-center">
                      <h2 className="text-3xl font-handwriting font-black text-[#2b2725] leading-none flex items-center justify-center gap-1">
                        🌸 Preparing Your Workspace
                      </h2>
                      <p className="text-[11px] font-handwriting font-bold text-[#2b2725]/60 mt-1">
                        {syncStatusText}
                      </p>
                    </div>

                    {/* Doot desk illustration */}
                    <div className="w-full flex justify-center py-2 bg-[#fbf9f4]/80 border border-dashed border-[#e6dfd3] rounded-xl overflow-hidden shadow-inner">
                      <img
                        src="/boarding_step3_doot.png"
                        alt="Doot preparing workspace"
                        className="h-28 object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="space-y-2.5">
                      {/* Email Progress */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs font-handwriting font-bold leading-none">
                          <span className="text-[#2b2725]/75">Importing Emails...</span>
                          <span className="text-[#3c6382]">{Math.min(60, Math.round(syncProgress * 1.0))}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white border border-[#2b2725]/30 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(60, Math.round(syncProgress * 1.0))}%` }}
                            className="h-full bg-purple-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Calendar Progress */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs font-handwriting font-bold leading-none">
                          <span className="text-[#2b2725]/75">Importing Calendar...</span>
                          <span className="text-[#388e3c]">{Math.min(80, Math.round(syncProgress * 1.1))}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white border border-[#2b2725]/30 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(80, Math.round(syncProgress * 1.1))}%` }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Profile Progress */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs font-handwriting font-bold leading-none">
                          <span className="text-[#2b2725]/75">Teaching Doot about you...</span>
                          <span className="text-[#b83227]">{syncProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-white border border-[#2b2725]/30 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${syncProgress}%` }}
                            className="h-full bg-[#b83227] rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status Box */}
                    <div className="p-3 bg-[#fef5f0] border border-dashed border-[#b83227]/30 rounded-xl flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-[#2b2725] flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/hanko_logo.png" alt="Doot Mascot" className="w-6 h-6 object-contain mix-blend-multiply" />
                      </div>
                      <div>
                        <h5 className="font-handwriting font-black text-xs text-[#b83227]">Almost there!</h5>
                        <p className="text-[10px] font-handwriting text-[#2b2725]/70 leading-tight">
                          Your AI assistant is getting everything ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: AI Capabilities Checklist */}
                {step === 4 && (
                  <div className="space-y-4 max-w-md mx-auto text-left relative">
                    <div className="absolute top-[-32px] left-[35%] w-32 h-6 bg-[#f5b041]/85 border-l border-r border-dashed border-white/50 rotate-[-1deg] shadow-sm flex items-center justify-center text-[10px] font-mono text-white select-none">
                      ★ PREFERENCES ★
                    </div>

                    <div className="pt-2 text-center">
                      <h2 className="text-3xl font-handwriting font-black text-[#2b2725] leading-none">
                        How would you like <span className="text-[#b83227]">Doot</span> to help?
                      </h2>
                      <p className="text-[11px] font-handwriting text-[#2b2725]/60 mt-1">
                        Choose the capabilities you want to enable for your AI Executive Assistant
                      </p>
                    </div>

                    <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-1" />

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {/* Option 1: Summarize */}
                      <label className="flex items-start p-3 bg-white border border-[#2b2725]/20 hover:border-[#b83227]/40 rounded-xl cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={preferences.summarizeEmails}
                          onChange={(e) => setPreferences({ ...preferences, summarizeEmails: e.target.checked })}
                          className="mt-1 mr-3 w-4 h-4 accent-[#b83227] cursor-pointer"
                        />
                        <div>
                          <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1 flex items-center">
                            Summarize emails <Sparkles className="w-3 h-3 text-[#f5b041] ml-1" />
                          </h4>
                          <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold leading-normal">
                            Get smart summaries of long emails and important threads.
                          </p>
                        </div>
                      </label>

                      {/* Option 2: Draft Replies */}
                      <label className="flex items-start p-3 bg-white border border-[#2b2725]/20 hover:border-[#b83227]/40 rounded-xl cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={preferences.draftReplies}
                          onChange={(e) => setPreferences({ ...preferences, draftReplies: e.target.checked })}
                          className="mt-1 mr-3 w-4 h-4 accent-[#b83227] cursor-pointer"
                        />
                        <div>
                          <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">
                            Draft replies
                          </h4>
                          <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold leading-normal">
                            Let Doot draft professional replies in your tone.
                          </p>
                        </div>
                      </label>

                      {/* Option 3: Manage Meetings */}
                      <label className="flex items-start p-3 bg-white border border-[#2b2725]/20 hover:border-[#b83227]/40 rounded-xl cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={preferences.manageMeetings}
                          onChange={(e) => setPreferences({ ...preferences, manageMeetings: e.target.checked })}
                          className="mt-1 mr-3 w-4 h-4 accent-[#b83227] cursor-pointer"
                        />
                        <div>
                          <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">
                            Manage meetings
                          </h4>
                          <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold leading-normal">
                            Schedule, reschedule and organize your meetings.
                          </p>
                        </div>
                      </label>

                      {/* Option 4: Daily Briefing */}
                      <label className="flex items-start p-3 bg-white border border-[#2b2725]/20 hover:border-[#b83227]/40 rounded-xl cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={preferences.morningBriefing}
                          onChange={(e) => setPreferences({ ...preferences, morningBriefing: e.target.checked })}
                          className="mt-1 mr-3 w-4 h-4 accent-[#b83227] cursor-pointer"
                        />
                        <div>
                          <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">
                            Daily briefing
                          </h4>
                          <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold leading-normal">
                            Get your personalized daily briefing every morning.
                          </p>
                        </div>
                      </label>

                      {/* Option 5: Task Extraction */}
                      <label className="flex items-start p-3 bg-white border border-[#2b2725]/20 hover:border-[#b83227]/40 rounded-xl cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={preferences.taskExtraction}
                          onChange={(e) => setPreferences({ ...preferences, taskExtraction: e.target.checked })}
                          className="mt-1 mr-3 w-4 h-4 accent-[#b83227] cursor-pointer"
                        />
                        <div>
                          <h4 className="font-handwriting font-bold text-sm text-[#2b2725] leading-none mb-1">
                            Task extraction
                          </h4>
                          <p className="text-[10px] font-handwriting text-[#2b2725]/50 font-semibold leading-normal">
                            Extract tasks and action items from emails and meetings.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2 font-handwriting font-bold">
                      <button
                        onClick={savePreferences}
                        disabled={savingPreferences}
                        className="w-full py-3 bg-[#b83227] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border-b-4 border-[#8e231b] hover:brightness-105 disabled:opacity-50"
                      >
                        {savingPreferences ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving preferences...</span>
                          </>
                        ) : (
                          <>
                            <span>Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono text-[#2b2725]/50 font-normal">
                        <Lock className="w-3 h-3" />
                        <span>You can change these settings anytime</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Workspace Ready */}
                {step === 5 && (
                  <div className="space-y-4 max-w-md mx-auto text-left relative">
                    <div className="absolute top-[-32px] left-[35%] w-32 h-6 bg-[#388e3c]/85 border-l border-r border-dashed border-white/50 rotate-[-1deg] shadow-sm flex items-center justify-center text-[10px] font-mono text-white select-none">
                      ★ COMPLETE ★
                    </div>

                    <div className="pt-2 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center border-2 border-green-500 shadow-sm mb-2">
                        <svg className="w-6 h-6 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      <h2 className="text-3xl font-handwriting font-black text-[#2b2725] leading-none">
                        Workspace <span className="text-[#b83227]">Ready</span>
                      </h2>
                      <p className="text-xs font-handwriting text-[#2b2725]/60 mt-1 font-bold">
                        Everything is all set up and you're good to go!
                      </p>
                    </div>

                    <div className="h-[2px] bg-dashed bg-[#e6dfd3] my-1" />

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-mono text-[#2b2725]/60 text-center uppercase tracking-wider font-bold">
                        Connected Services
                      </p>

                      <div className="p-3 bg-[#fbf9f4]/90 border border-dashed border-[#e6dfd3] rounded-xl space-y-2">
                        {/* Gmail Connection Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Mail className="w-4 h-4 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Gmail</h4>
                              <p className="text-[10px] font-handwriting text-green-700 font-bold">Emails synced successfully</p>
                            </div>
                          </div>
                          <AnimatedCheck delay={0.1} />
                        </div>

                        {/* Calendar Connection Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Calendar className="w-4 h-4 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Google Calendar</h4>
                              <p className="text-[10px] font-handwriting text-green-700 font-bold">Your schedule is ready</p>
                            </div>
                          </div>
                          <AnimatedCheck delay={0.2} />
                        </div>

                        {/* Contacts Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Users className="w-4 h-4 text-[#2b2725]/60" />
                            <div>
                              <h4 className="font-handwriting font-bold text-xs text-[#2b2725] leading-none">Contacts</h4>
                              <p className="text-[10px] font-handwriting text-green-700 font-bold">Your contacts are imported</p>
                            </div>
                          </div>
                          <AnimatedCheck delay={0.3} />
                        </div>
                      </div>
                    </div>

                    {/* Doot ready alert */}
                    <div className="p-3 bg-[#fef5f0] border border-dashed border-[#b83227]/30 rounded-xl flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-[#2b2725] flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/hanko_logo.png" alt="Doot Mascot" className="w-6 h-6 object-contain mix-blend-multiply" />
                      </div>
                      <div>
                        <h5 className="font-handwriting font-black text-xs text-[#b83227]">Your AI assistant is ready</h5>
                        <p className="text-[10px] font-handwriting text-[#2b2725]/70 leading-tight">
                          Doot is all set to help you save time and stay ahead every day.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2">
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3.5 bg-[#b83227] text-white font-handwriting font-black text-lg rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md border-b-4 border-[#8e231b] hover:brightness-105"
                      >
                        <span>Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono text-[#2b2725]/50">
                        <Lock className="w-3 h-3" />
                        <span>Your data is private and secure.</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom Card Footer - Trusted ribbon on Step 1, copyright on others */}
          {step === 1 ? (
            <div className="w-full flex justify-center mt-6 z-10 pt-4 border-t border-dashed border-[#e6dfd3]">
              <div className="p-2 px-5 bg-[#fdfbf7]/80 border border-dashed border-[#e6dfd3] rounded-full text-[11px] font-handwriting font-bold text-[#2b2725]/75 flex items-center justify-center space-x-2 relative select-none shadow-sm">
                <span>Trusted by professionals to save time and stay ahead every day.</span>
                <span className="text-red-500">🌸</span>
                <span className="inline-block animate-pulse">✈</span>
              </div>
            </div>
          ) : (
            <div className="pt-5 border-t border-dashed border-[#e6dfd3] flex justify-between items-center text-[9px] text-[#2b2725]/40 font-mono select-none">
              <span>DootAI MailOS v0.1.0</span>
              <span>Secure OAuth Workspaces</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3c6382] mx-auto" />
          <p className="font-handwriting text-xl text-[#2b2725]/70">Opening DootAI notebook...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}

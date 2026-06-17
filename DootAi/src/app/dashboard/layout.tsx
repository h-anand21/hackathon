"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import Link from "next/link";
import {
  Sparkles,
  Inbox,
  Calendar as CalendarIcon,
  CheckSquare,
  Settings,
  Loader2,
  BookOpen,
  User as UserIcon,
  LogOut,
  Keyboard,
  Home,
  Mail,
  PenTool,
  Users,
  Bot,
  Search,
  Bell,
  Layers,
  ChevronDown
} from "lucide-react";

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

function VectorBonsai({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className}>
      <path d="M 60 70 Q 55 50 45 42 Q 38 35 45 28 Q 50 25 58 32 Q 68 45 70 70" fill="none" stroke="#2b2725" strokeWidth="3" strokeLinecap="round" />
      <path d="M 45 42 Q 35 35 28 42 Q 30 48 45 45" fill="none" stroke="#2b2725" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 32 Q 40 22 45 15 Q 52 18 52 28" fill="none" stroke="#2b2725" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 58 32 Q 70 24 82 28 Q 78 35 65 35" fill="none" stroke="#2b2725" strokeWidth="2" strokeLinecap="round" />
      
      <circle cx="28" cy="42" r="10" fill="#388e3c" opacity="0.35" />
      <circle cx="28" cy="42" r="7" fill="#2e7d32" opacity="0.2" />
      <circle cx="45" cy="15" r="12" fill="#388e3c" opacity="0.4" />
      <circle cx="43" cy="17" r="8" fill="#1b5e20" opacity="0.15" />
      <circle cx="82" cy="28" r="11" fill="#388e3c" opacity="0.35" />
      
      <path d="M 20 40 Q 28 35 36 40 Q 34 47 24 47 Z" fill="none" stroke="#2b2725" strokeWidth="1" />
      <path d="M 37 13 Q 47 7 53 15 Q 49 23 39 20 Z" fill="none" stroke="#2b2725" strokeWidth="1" />
      <path d="M 74 26 Q 84 20 90 28 Q 84 34 76 31 Z" fill="none" stroke="#2b2725" strokeWidth="1" />
      
      <path d="M 35 70 Q 32 68 35 66 Z" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />
      <path d="M 85 70 Q 88 68 85 66 Z" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />

      <ellipse cx="60" cy="70" rx="30" ry="6" fill="#fcf2eb" stroke="#2b2725" strokeWidth="2" />
      <path d="M 30 70 L 35 77 L 85 77 L 90 70 Z" fill="#ebdcc8" stroke="#2b2725" strokeWidth="2" />
      <line x1="33" y1="73" x2="87" y2="73" stroke="#2b2725" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        // Not logged in, send to onboarding
        router.push("/onboarding");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Logout handler
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/onboarding");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3c6382] mx-auto" />
          <p className="font-handwriting text-xl text-[#2b2725]/70">Opening your workspace...</p>
        </div>
      </div>
    );
  }

  // Sidebar Menu Items
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home, color: "text-[#f5b041]" },
    { name: "Inbox", path: "/dashboard/inbox", icon: Mail, color: "text-[#b83227]", badge: 12 },
    { name: "Compose", path: "#compose", icon: PenTool, color: "text-[#3c6382]" },
    { name: "Calendar", path: "/dashboard/calendar", icon: CalendarIcon, color: "text-[#388e3c]" },
    { name: "Tasks", path: "/dashboard/tasks", icon: CheckSquare, color: "text-[#b83227]", badge: 5 },
    { name: "Contacts", path: "#contacts", icon: Users, color: "text-[#3c6382]" },
    { name: "AI Assistant", path: "#ai-assistant", icon: Bot, color: "text-[#f5b041]" },
    { name: "Search", path: "#search", icon: Search, color: "text-[#2b2725]" },
    { name: "Notifications", path: "#notifications", icon: Bell, color: "text-[#b83227]", badge: 5 },
    { name: "Integrations", path: "#integrations", icon: Layers, color: "text-[#388e3c]" },
    { name: "Settings", path: "#settings", icon: Settings, color: "text-[#2b2725]" }
  ];

  return (
    <div className="min-h-screen bg-[#e6dfd3] flex p-2 sm:p-4 md:p-6 overflow-hidden h-screen w-screen relative select-none">
      
      {/* Outer Sketchbook Wrapper */}
      <div className="flex-1 bg-[#fbf8f3] sketch-border sketch-shadow flex overflow-hidden relative w-full h-full rounded-2xl">
        
        {/* Spiral Binder Rings on the far left edge of the binder */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-8 items-center z-20 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-5 h-2.5 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 border border-[#2b2725] rounded-full shadow-md my-1 -ml-2.5"
            />
          ))}
        </div>

        {/* Left Sidebar (Sketchbook cover/inside cover page) */}
        <aside className="w-64 bg-[#fdfaf4] border-r border-[#e6dfd3] flex flex-col justify-between p-6 pl-8 relative z-10 select-none shrink-0">
          <div className="space-y-6">
            {/* Header Title (DootAI Stamp Logo + Text) */}
            <div className="flex items-center space-x-3 pb-4 border-b border-dashed border-[#e6dfd3]">
              <HankoLogoSVG className="w-9 h-9" />
              <div className="flex flex-col text-left">
                <span className="font-handwriting text-2xl font-extrabold text-[#2b2725] leading-none">DootAI</span>
                <span className="text-[9px] text-[#2b2725]/60 font-mono tracking-wider">AI Executive Assistant</span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1 overflow-y-auto max-h-[55vh] pr-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path || (item.name === "Dashboard" && pathname === "/dashboard");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2 font-handwriting font-bold text-sm transition-all duration-200 cursor-pointer rounded-xl ${
                      isActive
                        ? "bg-[#fcdfd7] text-[#2b2725] border border-[#b83227]/30 shadow-sm scale-[1.02]"
                        : "hover:bg-[#e6dfd3]/20 text-[#2b2725]/85"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#b83227]' : item.color}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#b83227] text-white' : 'bg-[#e6dfd3]/50 text-[#2b2725]/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer & Mascot */}
          <div className="space-y-4">
            {/* Potted Bonsai Drawing */}
            <div className="flex justify-center">
              <VectorBonsai className="w-24 h-16" />
            </div>

            {/* Profile widget */}
            <div className="p-3 bg-white sketch-border-sm flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-[#2b2725]" />
                ) : (
                  <div className="w-7 h-7 bg-[#3c6382]/10 rounded-full flex items-center justify-center text-xs font-bold font-mono border border-[#2b2725]">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate text-left">
                  <p className="text-[10px] font-bold leading-tight truncate">{user?.displayName || "User"}</p>
                  <p className="text-[9px] text-[#2b2725]/50 leading-none">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 text-[#b83227] rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Work Area (Notebook Page) */}
        <main className="flex-1 flex flex-col bg-[#fbf8f3] overflow-hidden relative">
          
          {/* Subtle Ruling Line on the left side of page */}
          <div className="absolute top-0 bottom-0 left-[20px] w-0.5 border-l border-red-300 opacity-60 pointer-events-none" />
          
          {/* Main content scroll container */}
          <div className="flex-1 flex flex-col overflow-hidden pl-8 pr-6 py-6 relative z-10 select-text">
            {children}
          </div>

        </main>

      </div>
    </div>
  );
}

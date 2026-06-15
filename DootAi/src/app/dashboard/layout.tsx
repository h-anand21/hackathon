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
  Keyboard
} from "lucide-react";

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
    { name: "Ask Doot", path: "/dashboard", icon: Sparkles, color: "text-[#f5b041]" },
    { name: "Inbox", path: "/dashboard/inbox", icon: Inbox, color: "text-[#b83227]" },
    { name: "Calendar", path: "/dashboard/calendar", icon: CalendarIcon, color: "text-[#3c6382]" },
    { name: "Tasks", path: "/dashboard/tasks", icon: CheckSquare, color: "text-[#388e3c]" },
  ];

  return (
    <div className="min-h-screen bg-[#e6dfd3] flex p-2 sm:p-4 md:p-6 overflow-hidden h-screen w-screen">
      
      {/* Outer Sketchbook Wrapper */}
      <div className="flex-1 bg-[#fbf8f3] sketch-border sketch-shadow flex overflow-hidden relative w-full h-full">
        
        {/* Left Sidebar (Sketchbook cover/inside cover page) */}
        <aside className="w-64 bg-[#fbf8f3] border-r border-[#e6dfd3] flex flex-col justify-between p-6 relative z-10 select-none">
          <div className="space-y-8">
            {/* Header Title */}
            <div className="flex items-center space-x-2.5 pb-4 border-b border-dashed border-[#e6dfd3]">
              <BookOpen className="w-5 h-5 text-[#b83227]" />
              <span className="font-handwriting text-xl font-bold tracking-tight text-[#2b2725]">MailOS Binder</span>
            </div>

            {/* Menu Links */}
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 font-handwriting font-bold text-base transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#2b2725] text-[#fbf8f3] sketch-border sketch-shadow scale-[1.02]"
                        : "hover:bg-[#e6dfd3]/30 text-[#2b2725]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer & Mascot */}
          <div className="space-y-6">
            {/* Small Bonsai Drawing */}
            <div className="flex justify-center opacity-60">
              <svg viewBox="0 0 100 60" className="w-24 h-16">
                {/* Trunk */}
                <path d="M 50 50 Q 45 35 35 30 Q 30 25 35 20 Q 40 18 45 25 Q 52 35 55 50" fill="none" stroke="#2b2725" strokeWidth="2.5" />
                <path d="M 35 20 Q 25 15 20 22 Q 22 28 35 25" fill="none" stroke="#2b2725" strokeWidth="1.5" />
                {/* Pot */}
                <path d="M 25 50 L 75 50 L 70 58 L 30 58 Z" fill="#fbf8f3" stroke="#2b2725" strokeWidth="2" />
                {/* Foliage (Japanese Green Watercolor effect) */}
                <circle cx="20" cy="22" r="10" fill="#388e3c" opacity="0.3" />
                <circle cx="35" cy="18" r="12" fill="#388e3c" opacity="0.4" />
                <circle cx="45" cy="25" r="9" fill="#388e3c" opacity="0.25" />
              </svg>
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
                className="p-1 hover:bg-red-50 text-[#b83227] rounded transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Spiral Binder Rings (Dividing sidebar & main content) */}
        <div className="w-4 flex flex-col justify-around py-8 items-center relative z-20 pointer-events-none -ml-2.5 mr-[-6px]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-5 h-2.5 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 border border-[#2b2725] rounded-full shadow-md my-1"
            />
          ))}
        </div>

        {/* Main Work Area (Notebook Page) */}
        <main className="flex-1 flex flex-col bg-[#fbf8f3] overflow-hidden relative">
          
          {/* Subtle Ruling Line on the left side of page */}
          <div className="absolute top-0 bottom-0 left-[20px] w-0.5 border-l border-red-300 opacity-60 pointer-events-none" />
          
          {/* Main content scroll container */}
          <div className="flex-1 flex flex-col overflow-hidden pl-8 pr-6 py-6 relative z-10">
            {children}
          </div>

        </main>

      </div>
    </div>
  );
}

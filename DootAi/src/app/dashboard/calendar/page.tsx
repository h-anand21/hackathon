"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Loader2,
  Sparkles,
  MoreVertical,
  CheckSquare
} from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string; // ISO date
  end: string;
  location?: string;
  col: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  top: string; // CSS top percent or px
  height: string; // CSS height percent or px
  color: string; // Tailwind bg/text color classes
};

// ----------------------------------------------------
// VECTOR DESIGN COMPONENTS & MASCOTS
// ----------------------------------------------------

function VectorBamboo() {
  return (
    <div className="absolute right-1 bottom-1 opacity-20 pointer-events-none z-0">
      <svg viewBox="0 0 60 120" className="w-12 h-24">
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

function VectorMtFujiWatermark() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-50 select-none pointer-events-none">
      <svg viewBox="0 0 160 100" className="w-full h-24 object-contain">
        <circle cx="80" cy="40" r="16" fill="#e8a7a1" opacity="0.35" />
        <path 
          d="M 20 95 C 60 80, 75 45, 80 35 L 90 35 C 95 45, 110 80, 150 95 Z" 
          fill="#ebdcc8" 
          stroke="#2b2725" 
          strokeWidth="1.2" 
        />
        <path 
          d="M 77 47 C 80 43, 80 35, 80 35 L 90 35 C 90 35, 90 43, 93 47 C 88 52, 85 45, 83 49 C 80 45, 78 50, 77 47 Z" 
          fill="#ffffff" 
          stroke="#2b2725" 
          strokeWidth="0.8" 
        />
      </svg>
      <div className="text-center mt-2 leading-none">
        <p className="font-handwriting font-black text-xs text-[#2b2725]/70 flex items-center justify-center gap-1">🌸 Quiet Day</p>
        <p className="text-[9px] font-handwriting text-[#2b2725]/50 font-bold mt-1">Take time to focus.</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MOCK CALENDAR EVENTS (Cleared to avoid dummy/placeholder events)
// ----------------------------------------------------

const mockEventsData: CalendarEvent[] = [];


export default function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  // Dynamically calculate the current week starting on Monday
  const todayDate = new Date();
  const currentDay = todayDate.getDay();
  const daysToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const mondayOfCurrentWeek = new Date(todayDate);
  mondayOfCurrentWeek.setDate(todayDate.getDate() + daysToMon);
  mondayOfCurrentWeek.setHours(0, 0, 0, 0);

  const daysHeader: { label: string; date: number; fullDate: Date }[] = [];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const dObj = new Date(mondayOfCurrentWeek);
    dObj.setDate(mondayOfCurrentWeek.getDate() + i);
    daysHeader.push({
      label: labels[i],
      date: dObj.getDate(),
      fullDate: dObj
    });
  }

  const startMonth = mondayOfCurrentWeek.toLocaleString("en-US", { month: "short" });
  const startYear = mondayOfCurrentWeek.getFullYear();
  const sundayDate = daysHeader[6]?.fullDate || new Date();
  const endMonth = sundayDate.toLocaleString("en-US", { month: "short" });
  
  const weekRangeString = `${startMonth} ${daysHeader[0]?.date} – ${endMonth} ${daysHeader[6]?.date}, ${startYear}`;

  // Helper to shift mock events to current week dates
  const shiftMockEventsToCurrentWeek = (mocks: CalendarEvent[]): CalendarEvent[] => {
    return mocks.map((mock) => {
      const targetDayObj = daysHeader[mock.col];
      if (!targetDayObj) return mock;
      const yr = targetDayObj.fullDate.getFullYear();
      const mo = String(targetDayObj.fullDate.getMonth() + 1).padStart(2, '0');
      const da = String(targetDayObj.fullDate.getDate()).padStart(2, '0');
      
      const startParts = mock.start.split('T')[1] || "09:00:00";
      const endParts = mock.end.split('T')[1] || "10:00:00";
      
      return {
        ...mock,
        start: `${yr}-${mo}-${da}T${startParts}`,
        end: `${yr}-${mo}-${da}T${endParts}`
      };
    });
  };

  // States
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayDate.getDate()); 
  const [viewAllUpcoming, setViewAllUpcoming] = useState(false);

  // Event modal state
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTimeStart, setEventTimeStart] = useState("09:00");
  const [eventTimeEnd, setEventTimeEnd] = useState("10:00");
  const [eventDay, setEventDay] = useState(todayDate.getDate());
  const [savingEvent, setSavingEvent] = useState(false);

  // Map a database event from Corsair to the weekly calendar grid
  const mapEventToGrid = (e: any): CalendarEvent => {
    const startDate = new Date(e.start);
    const endDate = new Date(e.end);
    
    // Day index: 0=Mon, 1=Tue, 2=Wed, etc.
    let col = startDate.getDay() - 1;
    if (col < 0) col = 6; // Sunday is 6
    
    const startHour = startDate.getHours();
    const startMin = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMin = endDate.getMinutes();
    
    let topVal = ((startHour - 8 + startMin / 60) / 11) * 100;
    if (topVal < 0) topVal = 0;
    if (topVal > 100) topVal = 95;
    
    let duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (duration <= 0) duration = 0.5;
    let heightVal = (duration / 11) * 100;
    if (heightVal < 5) heightVal = 5;
    if (topVal + heightVal > 100) heightVal = 100 - topVal;
    
    const colors = [
      "bg-[#fef5f0] border-[#b83227]/40 text-[#b83227]",
      "bg-[#fcf7ec] border-[#f5b041]/40 text-[#f5b041]",
      "bg-[#f2f7fc] border-[#3c6382]/40 text-[#3c6382]",
      "bg-[#f5fbf7] border-[#388e3c]/40 text-[#388e3c]"
    ];
    const color = colors[Math.abs(e.title.charCodeAt(0) || 0) % colors.length];

    return {
      id: e.id,
      title: e.title,
      description: e.description || "",
      start: e.start,
      end: e.end,
      location: e.location || "",
      col,
      top: `${topVal.toFixed(2)}%`,
      height: `${heightVal.toFixed(2)}%`,
      color
    };
  };

  // Fetch calendar events
  const fetchEvents = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?userId=${uid}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.events) {
        const mapped = data.events.map((e: any) => mapEventToGrid(e));
        setEvents(mapped);
      } else {
        setEvents(shiftMockEventsToCurrentWeek(mockEventsData));
      }
    } catch (e) {
      console.error(e);
      setEvents(shiftMockEventsToCurrentWeek(mockEventsData));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEvents(currentUser.uid);
      } else {
        fetchEvents("mock-uid");
      }
    });
    return () => unsubscribe();
  }, []);

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
        await fetchEvents(user.uid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Add Event handler
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !user) return;
    setSavingEvent(true);

    const startHour = parseInt(eventTimeStart.split(":")[0]);
    const startMin = parseInt(eventTimeStart.split(":")[1]);
    const endHour = parseInt(eventTimeEnd.split(":")[0]);
    
    // Calculate top and height relative to 8 AM - 7 PM (11 hours total)
    const topVal = ((startHour - 8 + startMin / 60) / 11) * 100;
    const heightVal = ((endHour - startHour) / 11) * 100;

    const selectedDayObj = daysHeader.find(d => d.date === eventDay);
    if (!selectedDayObj) {
      setSavingEvent(false);
      return;
    }

    const colMap = daysHeader.indexOf(selectedDayObj);

    const yr = selectedDayObj.fullDate.getFullYear();
    const mo = String(selectedDayObj.fullDate.getMonth() + 1).padStart(2, '0');
    const da = String(selectedDayObj.fullDate.getDate()).padStart(2, '0');

    const startISO = `${yr}-${mo}-${da}T${eventTimeStart}:00`;
    const endISO = `${yr}-${mo}-${da}T${eventTimeEnd}:00`;

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          title: eventTitle,
          description: eventDescription,
          start: startISO,
          end: endISO,
          location: "Cozy Study Desk"
        })
      });
      const data = await res.json();
      if (data.success && data.event) {
        const gridEvent = mapEventToGrid(data.event);
        setEvents((prev) => [...prev, gridEvent]);
        alert("Event scheduled successfully! 📅");
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      // Local fallback
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        title: eventTitle,
        description: eventDescription,
        start: startISO,
        end: endISO,
        col: colMap,
        top: `${topVal.toFixed(2)}%`,
        height: `${heightVal.toFixed(2)}%`,
        color: "bg-[#fcf7ec] border-[#f5b041]/40 text-[#f5b041]"
      };
      setEvents((prev) => [...prev, newEvent]);
      alert("Event scheduled locally! 📅");
    } finally {
      setEventTitle("");
      setEventDescription("");
      setIsAddingEvent(false);
      setSavingEvent(false);
    }
  };

  // Filter events to only show those in the active week
  const mondayDate = daysHeader[0]?.fullDate;
  const sundayDateEnd = new Date(daysHeader[6]?.fullDate);
  sundayDateEnd.setHours(23, 59, 59, 999);
  
  const activeWeekEvents = events.filter((ev) => {
    const evDate = new Date(ev.start);
    return evDate >= mondayDate && evDate <= sundayDateEnd;
  });

  // Filter events for selected day view or all active week events
  const selectedCol = daysHeader.findIndex((d) => d.date === selectedDay);
  const selectedDayEvents = viewAllUpcoming
    ? activeWeekEvents.sort((a, b) => a.start.localeCompare(b.start))
    : activeWeekEvents
        .filter((e) => e.col === selectedCol)
        .sort((a, b) => a.start.localeCompare(b.start));

  const hours = [
    "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
    "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"
  ];

  const dootSuggestions = [
    { text: "Prepare for Project Demo", sub: "in 45 min", action: "Draft slides review" },
    { text: "Follow up with Corsair Team", sub: "after 4 PM", action: "Ask about webhook callbacks" },
    { text: "You have a free focus slot", sub: "Today 6 – 7 PM", action: "Plan tomorrow agenda" },
    { text: "Review meeting agenda", sub: "for tomorrow", action: "What is on my schedule tomorrow?" }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-text">
      
      {/* 1. TOP HEADER */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none">Calendar</h1>
          <p className="text-xs font-handwriting text-[#2b2725]/60 font-bold mt-1">Plan your day. Stay ahead with Doot AI.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="p-1.5 px-3 bg-white hover:bg-red-50 text-[#b83227] sketch-border-sm text-[10px] font-mono font-black uppercase flex items-center space-x-1 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#b83227]" />
            ) : (
              <span>Sync Now</span>
            )}
          </button>
          
          <button
            onClick={() => setIsAddingEvent(true)}
            className="p-2 px-4 bg-[#b83227] hover:bg-[#a02b21] text-white font-handwriting font-black text-xs rounded-xl flex items-center space-x-1 cursor-pointer border-b-2 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT: WEEK CALENDAR & RIGHT BAR */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto pr-1">
        
        {/* LEFT COMPONENT: WEEK GRID */}
        <div className="flex-1 bg-white sketch-border sketch-shadow rounded-xl p-5 flex flex-col min-h-[500px] lg:min-h-0">
          
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center mb-4 select-none">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setSelectedDay(todayDate.getDate())}
                className="px-3 py-1 bg-[#fcfaf4] hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-handwriting font-bold shadow-inner cursor-pointer"
              >
                Today
              </button>
              <div className="flex space-x-1">
                <button 
                  onClick={() => {
                    const idx = daysHeader.findIndex(d => d.date === selectedDay);
                    if (idx > 0) {
                      setSelectedDay(daysHeader[idx - 1].date);
                    }
                  }} 
                  className="p-1 bg-[#fcfaf4] border border-gray-200 rounded cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => {
                    const idx = daysHeader.findIndex(d => d.date === selectedDay);
                    if (idx < 6 && idx !== -1) {
                      setSelectedDay(daysHeader[idx + 1].date);
                    }
                  }} 
                  className="p-1 bg-[#fcfaf4] border border-gray-200 rounded cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-handwriting font-black text-lg text-[#2b2725]">
              {weekRangeString}
            </h3>

            {/* Day/Week/Month selector tabs */}
            <div className="flex bg-[#fcfaf4] border border-gray-200 rounded-lg p-0.5 text-xs font-handwriting font-bold">
              <button className="px-2.5 py-0.5 rounded text-gray-500 hover:text-black">Day</button>
              <button className="px-2.5 py-0.5 bg-[#fcdfd7] text-[#b83227] rounded shadow-sm">Week</button>
              <button className="px-2.5 py-0.5 rounded text-gray-500 hover:text-black">Month</button>
            </div>
          </div>

          {/* Weekly Grid container */}
          <div className="flex-1 flex flex-col min-h-0 border border-[#e6dfd3] rounded-xl overflow-hidden bg-[#fbf9f4]/45">
            
            {/* Headers row */}
            <div className="flex border-b border-[#e6dfd3] bg-[#fdfaf4] select-none text-center">
              <div className="w-16 border-r border-[#e6dfd3] py-2 text-[9px] font-mono text-gray-400 flex items-center justify-center font-bold">
                GMT+5:30
              </div>
              
              <div className="flex-1 grid grid-cols-7 text-xs font-handwriting font-black text-[#2b2725]">
                {daysHeader.map((d) => {
                  const isSel = selectedDay === d.date;
                  return (
                    <div 
                      key={d.date} 
                      onClick={() => setSelectedDay(d.date)}
                      className={`py-1.5 border-r border-[#e6dfd3] last:border-r-0 cursor-pointer transition-colors flex flex-col items-center justify-center ${
                        isSel ? "bg-[#fcdfd7]/30" : "hover:bg-[#e6dfd3]/10"
                      }`}
                    >
                      <span className="text-[10px] text-gray-500 leading-none">{d.label}</span>
                      <span className={`text-sm font-mono mt-0.5 w-6 h-6 flex items-center justify-center rounded-full leading-none ${
                        isSel ? "bg-[#b83227] text-white font-bold" : ""
                      }`}>
                        {d.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Schedule content */}
            <div className="flex-1 flex relative overflow-y-auto">
              
              {/* Left Hour labels */}
              <div className="w-16 border-r border-[#e6dfd3] bg-[#fdfaf4] select-none text-right pr-2 shrink-0">
                {hours.map((h, i) => (
                  <div key={i} className="h-14 text-[9px] font-mono text-[#2b2725]/45 font-bold pt-1.5 leading-none">
                    {h}
                  </div>
                ))}
              </div>

              {/* Weekly Columns grid */}
              <div className="flex-1 grid grid-cols-7 relative h-[720px] pr-1 select-text">
                {/* Horizontal time grids */}
                {hours.map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute left-0 right-0 border-b border-dashed border-[#e6dfd3]/50 pointer-events-none" 
                    style={{ top: `${(i / 11) * 100}%` }}
                  />
                ))}

                {/* Vertical columns */}
                {[...Array(7)].map((_, colIdx) => {
                  const isWeekend = colIdx >= 5; // Saturday or Sunday
                  return (
                    <div 
                      key={colIdx} 
                      className={`border-r border-[#e6dfd3] last:border-r-0 relative h-full ${
                        isWeekend ? "bg-[#ebdcc8]/10" : ""
                      }`}
                    >
                      
                      {/* Merged Saturday/Sunday Mount Fuji card */}
                      {colIdx === 5 && (
                        <div className="absolute inset-y-0 left-0 w-[200%] bg-[#fdfaf4]/80 z-0 pointer-events-none border-l border-[#e6dfd3]">
                          <VectorMtFujiWatermark />
                        </div>
                      )}

                      {/* Event Cards rendering */}
                      {activeWeekEvents
                        .filter((ev) => ev.col === colIdx)
                        .map((ev) => (
                          <div
                            key={ev.id}
                            style={{ top: ev.top, height: ev.height }}
                            className={`absolute left-1.5 right-1.5 border border-l-3 rounded-lg p-1.5 px-2 flex flex-col justify-between overflow-hidden cursor-pointer select-text text-left leading-tight hover:shadow shadow-sm transition-all hover:scale-[1.01] z-10 ${ev.color}`}
                            title={`${ev.title}\n${ev.description}`}
                          >
                            <div className="truncate">
                              <h4 className="text-[10px] sm:text-xs font-handwriting font-black truncate">{ev.title}</h4>
                            </div>
                            <span className="text-[8px] font-mono font-bold opacity-70">
                              {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 text-left">
          
          {/* CARD 1: TODAY'S BRIEF */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 select-none">
            <div className="absolute top-[-8px] right-[15%] w-12 h-3 bg-[#e8a7a1]/40 border-l border-r border-dashed border-white/50 rotate-[-4deg]" />
            <VectorBamboo />

            <h3 className="font-handwriting font-black text-lg text-[#2b2725] mb-3 flex items-center gap-1.5">
              Today's Brief <span className="text-red-500">🌸</span>
            </h3>

            <div className="space-y-2.5 text-xs font-handwriting font-bold relative z-10">
              <div className="flex items-center space-x-2">
                <span className="w-6 text-center text-sm">🌸</span>
                <span>12 Unread Emails</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 text-center text-sm">⛩</span>
                <span>3 Meetings Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 text-center text-sm">🎋</span>
                <span>5 Tasks Due</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 text-center text-sm">🍵</span>
                <span>1.5 hrs Focus Time</span>
              </div>
            </div>
          </div>

          {/* CARD 2: UPCOMING AGENDA */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3">
            <div className="absolute top-[-8px] left-[15%] w-10 h-3 bg-[#f5b041]/20 border-l border-r border-dashed border-[#e6dfd3] rotate-[3deg]" />
            
            <div className="flex justify-between items-baseline mb-3 select-none">
              <h3 className="font-handwriting font-black text-lg text-[#2b2725]">
                {viewAllUpcoming ? "All Upcoming" : "Upcoming"}
              </h3>
              <button 
                onClick={() => setViewAllUpcoming(!viewAllUpcoming)}
                className="text-[9px] font-handwriting font-bold text-[#b83227] hover:underline cursor-pointer"
              >
                {viewAllUpcoming ? "Show Daily" : "View all →"}
              </button>
            </div>

            {/* List of today's schedule items */}
            <div className="space-y-3.5 pl-2.5 border-l-2 border-dashed border-[#e6dfd3] relative">
              {selectedDayEvents.length === 0 ? (
                <p className="text-[10px] font-handwriting text-gray-400 font-bold py-1 select-none">No events scheduled.</p>
              ) : (
                selectedDayEvents
                  .slice(0, 5)
                  .map((ev, idx) => (
                    <div key={idx} className="relative text-left leading-snug">
                      <div className="absolute left-[-15.5px] top-[4px] w-2.5 h-2.5 rounded-full bg-[#b83227] border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-[9px] font-mono text-[#b83227] font-black">
                          {viewAllUpcoming 
                            ? `${new Date(ev.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} @ ${new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        </p>
                        <h4 className="text-xs font-handwriting font-black text-[#2b2725]">{ev.title}</h4>
                        <p className="text-[9px] text-[#2b2725]/55 font-mono leading-none mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* CARD 3: DOOT SENSEI ASSISTANT */}
          <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 flex-1 flex flex-col justify-between">
            <div className="absolute top-[-8px] right-[25%] w-11 h-3 bg-green-200/30 border-l border-r border-dashed border-white/50 rotate-[-2deg]" />

            <div>
              <h3 className="font-handwriting font-black text-lg text-[#2b2725] mb-2 flex items-center gap-1.5 select-none">
                💡 Doot Sensei
              </h3>

              <div className="space-y-2 z-10 relative">
                {dootSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => router.push(`/dashboard/ai-assistant?query=${encodeURIComponent(sug.action)}`)}
                    className="w-full text-left p-2 bg-white hover:bg-[#fcdfd7] text-[10px] font-handwriting font-black text-gray-700 rounded-lg border border-dashed border-[#ebdcc8] transition-all flex flex-col leading-tight cursor-pointer shadow-inner"
                  >
                    <span className="text-[#b83227] truncate font-extrabold">{sug.text}</span>
                    <span className="text-[8px] text-gray-500 font-mono mt-0.5 font-bold">{sug.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-[#e6dfd3] mt-4 select-none">
              <button
                onClick={() => router.push("/dashboard/ai-assistant")}
                className="w-full py-2 bg-[#b83227] hover:bg-[#a02b21] text-white font-handwriting font-black text-xs rounded-xl flex items-center justify-center space-x-1 border-b-2 shadow cursor-pointer"
              >
                <span>✨ Ask Doot AI</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-[#2b2725]/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddEvent} className="bg-[#fbf8f3] w-full max-w-md p-6 sketch-border sketch-shadow relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-[#e6dfd3]">
              <span className="font-handwriting text-lg font-bold text-[#b83227]">Schedule Event</span>
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="text-xs font-bold underline hover:text-[#b83227] cursor-pointer"
              >
                Close [esc]
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="Design review call..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Description</label>
                <textarea
                  placeholder="Sync agenda details..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs h-20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Day of {startMonth} {startYear}</label>
                  <select
                    value={eventDay}
                    onChange={(e) => setEventDay(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none font-bold"
                  >
                    {daysHeader.map(d => (
                      <option key={d.date} value={d.date}>
                        {d.label} ({d.fullDate.toLocaleString("en-US", { month: "short" })} {d.date})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eventTimeStart}
                    onChange={(e) => setEventTimeStart(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={eventTimeEnd}
                    onChange={(e) => setEventTimeEnd(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingEvent}
                className="px-5 py-2 bg-[#b83227] text-white font-bold text-xs sketch-border sketch-shadow-hover hover:scale-102 flex items-center space-x-1.5 cursor-pointer transition-all border-b-2"
              >
                {savingEvent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Schedule Event</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

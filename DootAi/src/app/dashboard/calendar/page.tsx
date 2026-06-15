"use client";

import { useEffect, useState } from "react";
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
  Sparkles
} from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location?: string;
};

export default function CalendarPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Event modal state
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTimeStart, setEventTimeStart] = useState("09:00");
  const [eventTimeEnd, setEventTimeEnd] = useState("10:00");
  const [eventDateStr, setEventDateStr] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

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
        await fetchEvents(user.uid);
      }
    } catch (e) {
      console.error("Error running manual calendar sync:", e);
    } finally {
      setSyncing(false);
    }
  };

  // Fetch events
  const fetchEvents = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(auth.currentUser);
    if (auth.currentUser) {
      fetchEvents(auth.currentUser.uid);
    }
    // Set default event date to today
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    setEventDateStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Update event form date when selectedDate changes
  useEffect(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    setEventDateStr(`${yyyy}-${mm}-${dd}`);
  }, [selectedDate]);

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get events for specific day
  const getEventsForDay = (day: number) => {
    return events.filter((ev) => {
      const evDate = new Date(ev.start);
      return (
        evDate.getDate() === day &&
        evDate.getMonth() === currentDate.getMonth() &&
        evDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Selected Day Events
  const selectedDayEvents = events.filter((ev) => {
    const evDate = new Date(ev.start);
    return (
      evDate.getDate() === selectedDate.getDate() &&
      evDate.getMonth() === selectedDate.getMonth() &&
      evDate.getFullYear() === selectedDate.getFullYear()
    );
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Handle Event Creation
  const handleAddEvent = async () => {
    if (!user || !eventTitle) return;
    setSavingEvent(true);
    try {
      // Create full start and end ISO dates
      const startIso = new Date(`${eventDateStr}T${eventTimeStart}:00`).toISOString();
      const endIso = new Date(`${eventDateStr}T${eventTimeEnd}:00`).toISOString();

      // In a real app we'd call Corsair Calendar API here
      // For now, let's update local UI state immediately
      const newEvent: CalendarEvent = {
        id: Math.random().toString(),
        title: eventTitle,
        description: eventDescription,
        start: startIso,
        end: endIso,
        location: eventLocation
      };

      setEvents((prev) => [...prev, newEvent]);
      setIsAddingEvent(false);
      setEventTitle("");
      setEventDescription("");
      setEventLocation("");
      alert("Event Scheduled! 📅");
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEvent(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      
      {/* Page Title */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-handwriting text-[#2b2725]">
            My Calendar Schedule 📅
          </h1>
          <p className="text-xs text-[#2b2725]/60 mt-1 font-mono">
            Synced via Corsair Google Calendar connector.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3 py-2 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 text-[#2b2725]/70 text-xs font-mono font-bold uppercase sketch-border-sm flex items-center space-x-1.5 cursor-pointer transition-all disabled:opacity-50"
            title="Sync latest events from Google Calendar"
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Sync Now</span>
            )}
          </button>
          <button
            onClick={() => setIsAddingEvent(true)}
            className="px-4 py-2 bg-[#b83227] text-white text-xs font-bold sketch-border sketch-shadow-hover hover:scale-105 flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Sidepane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Monthly Calendar Sheet */}
        <div className="flex-1 bg-white sketch-border sketch-shadow flex flex-col p-6 min-h-0">
          
          {/* Month Header Controller */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-handwriting text-2xl font-bold text-[#3c6382]">
              {monthName} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 sketch-border-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 sketch-border-sm text-xs font-bold cursor-pointer font-handwriting"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 bg-[#fbf8f3] hover:bg-[#e6dfd3]/20 sketch-border-sm cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-handwriting font-bold text-sm border-b border-[#e6dfd3] pb-2 text-[#2b2725]/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 gap-1.5 pt-3 notebook-grid-small">
            {/* Empty offset padding cells */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="bg-transparent" />
            ))}

            {/* Calendar Days */}
            {loading ? (
              <div className="col-span-7 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3c6382]" />
              </div>
            ) : (
              [...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const dayIsToday = isToday(day);
                const dayIsSelected = isSelected(day);

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`min-h-[60px] p-2 bg-white flex flex-col justify-between cursor-pointer transition-all ${
                      dayIsSelected
                        ? "sketch-border-thick border-[#b83227] scale-[1.01] z-10"
                        : "sketch-border-sm border-[#e6dfd3] hover:border-[#2b2725]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold font-mono px-1 rounded ${
                        dayIsToday ? "bg-[#b83227] text-white" : ""
                      }`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3c6382]" />
                      )}
                    </div>

                    {/* Small list inside day cell */}
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[9px] px-1 bg-[#3c6382]/10 text-[#3c6382] font-bold rounded truncate leading-tight border-l-2 border-[#3c6382]"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] text-[#2b2725]/40 text-center font-mono">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Daily Schedule Sidebar */}
        <div className="w-full lg:w-80 bg-white sketch-border sketch-shadow flex flex-col p-6 space-y-6">
          <div className="border-b border-dashed border-[#e6dfd3] pb-3 text-left">
            <span className="text-[10px] uppercase font-mono text-[#b83227] font-bold">Selected Schedule</span>
            <h3 className="font-handwriting text-2xl font-bold text-[#2b2725]">
              {selectedDate.toLocaleDateString("default", { weekday: "short", month: "short", day: "numeric" })}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center font-handwriting text-[#2b2725]/40 py-12">
                No events scheduled. Time to rest! 🌸
              </div>
            ) : (
              selectedDayEvents.map((ev) => {
                const startTime = new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={ev.id} className="p-4 bg-[#fbf8f3] sketch-border-sm space-y-2 text-left relative">
                    {/* Event Tag */}
                    <span className="w-1.5 absolute top-0 bottom-0 left-0 bg-[#3c6382] rounded-l" />
                    
                    <h4 className="font-bold text-sm text-[#2b2725] leading-tight pl-2">
                      {ev.title}
                    </h4>
                    
                    {ev.description && (
                      <p className="text-[11px] text-[#2b2725]/60 pl-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 pl-2 text-[10px] text-[#2b2725]/50 font-mono">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#3c6382]" />
                        {startTime} - {endTime}
                      </span>
                      {ev.location && (
                        <span className="flex items-center truncate max-w-[120px]">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-[#b83227]" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Doot Schedule Insight */}
          <div className="p-3 bg-[#3c6382]/5 sketch-border-sm border-[#3c6382] text-left">
            <span className="font-handwriting text-xs font-bold text-[#3c6382] flex items-center mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#f5b041] mr-1" /> Doot Schedule Note
            </span>
            <p className="text-[10px] text-[#2b2725]/70 italic leading-relaxed">
              {selectedDayEvents.length > 2 
                ? "This day looks busy! Try using 'Morning Summary' to bundle your action plans."
                : "You have plenty of free slots. Doot can help draft proposals or sync priorities."
              }
            </p>
          </div>
        </div>

      </div>

      {/* Add Event Postcard Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-[#2b2725]/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#fbf8f3] w-full max-w-md p-6 sketch-border sketch-shadow relative space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-[#e6dfd3]">
              <span className="font-handwriting text-lg font-bold text-[#b83227]">Schedule event</span>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="text-xs font-bold underline hover:text-[#b83227] cursor-pointer"
              >
                Close [esc]
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="Review call..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Description</label>
                <textarea
                  placeholder="Details of the event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs h-20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDateStr}
                    onChange={(e) => setEventDateStr(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Location / Link</label>
                  <input
                    type="text"
                    placeholder="Room 3 / Google Meet"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={eventTimeStart}
                    onChange={(e) => setEventTimeStart(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">End Time</label>
                  <input
                    type="time"
                    value={eventTimeEnd}
                    onChange={(e) => setEventTimeEnd(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleAddEvent}
                disabled={savingEvent}
                className="px-5 py-2 bg-[#b83227] text-white font-bold text-xs sketch-border sketch-shadow-hover hover:scale-102 flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                {savingEvent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <span>Schedule Event</span>
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

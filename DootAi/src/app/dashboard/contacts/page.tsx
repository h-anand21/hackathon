"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Globe,
  MapPin,
  Briefcase,
  Star,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type ContactNote = {
  text: string;
  date: string;
  author: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  tags: string[];
  favorite: boolean;
  role: string;
  address: string;
  website: string;
  notes: ContactNote[];
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

function VectorBamboo() {
  return (
    <svg viewBox="0 0 60 120" className="w-12 h-24 absolute right-1 bottom-1 opacity-20 pointer-events-none z-0">
      <path d="M 30 120 L 32 95 M 32 93 L 34 60 M 34 58 L 37 20 M 37 18 L 38 0" fill="none" stroke="#2b2725" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="32" cy="94" rx="2" ry="0.6" fill="#2b2725" />
      <ellipse cx="34" cy="59" rx="2" ry="0.6" fill="#2b2725" />
      
      <path d="M 32 94 Q 18 80 10 88" fill="none" stroke="#2b2725" strokeWidth="1" />
      <path d="M 10 88 Q 6 78 12 75 C 14 81 22 84 32 94" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />
      
      <path d="M 34 59 Q 50 50 56 57" fill="none" stroke="#2b2725" strokeWidth="1" />
      <path d="M 56 57 Q 52 46 45 48 C 44 53 39 55 34 59" fill="#388e3c" stroke="#2b2725" strokeWidth="0.8" />
    </svg>
  );
}

function VectorMtFujiAvatarFrame() {
  return (
    <div className="absolute inset-0 opacity-30 pointer-events-none select-none z-0">
      <svg viewBox="0 0 180 100" className="w-full h-full object-cover">
        <circle cx="90" cy="40" r="18" fill="#e8a7a1" opacity="0.3" />
        <path 
          d="M 20 95 C 60 80, 75 45, 80 35 L 100 35 C 105 45, 120 80, 160 95 Z" 
          fill="#ebdcc8" 
          stroke="#2b2725" 
          strokeWidth="1.2" 
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

function DootTeaMascot() {
  return (
    <div className="w-28 h-20 shrink-0 hover:scale-105 transition-transform relative select-none">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        {/* Antenna */}
        <line x1="60" y1="20" x2="60" y2="8" stroke="#2b2725" strokeWidth="2.5" />
        <circle cx="60" cy="5" r="4" fill="#b83227" stroke="#2b2725" strokeWidth="1.5" />
        
        {/* Head */}
        <rect x="35" y="20" width="50" height="34" rx="14" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        <rect x="42" y="25" width="36" height="18" rx="5" fill="#2b2725" />
        <path d="M 48 33 Q 52 30 56 33" stroke="#388e3c" strokeWidth="2" fill="none" />
        <path d="M 62 33 Q 66 30 70 33" stroke="#388e3c" strokeWidth="2" fill="none" />
        <circle cx="45" cy="38" r="1.5" fill="#e8a7a1" />
        <circle cx="73" cy="38" r="1.5" fill="#e8a7a1" />

        {/* Body (Sitting behind table) */}
        <path d="M 45 54 L 75 54 L 72 70 L 48 70 Z" fill="#ffffff" stroke="#2b2725" strokeWidth="2" />
        <circle cx="60" cy="62" r="4" fill="#b83227" />

        {/* Tea table */}
        <rect x="15" y="66" width="90" height="6" fill="#e6dfd3" stroke="#2b2725" strokeWidth="2" rx="1" />
        <rect x="25" y="72" width="6" height="8" fill="#dbd0be" stroke="#2b2725" strokeWidth="2" />
        <rect x="89" y="72" width="6" height="8" fill="#dbd0be" stroke="#2b2725" strokeWidth="2" />

        {/* Tea pot and cup */}
        <path d="M 75 66 L 81 66 L 83 58 Q 78 54 73 58 Z" fill="#fff" stroke="#2b2725" strokeWidth="1.5" />
        <path d="M 83 60 Q 87 60 85 64" fill="none" stroke="#2b2725" strokeWidth="1" />
        <circle cx="40" cy="63" r="3" fill="#fcf2eb" stroke="#2b2725" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function ContactsPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All Contacts" | "Favorites" | "Clients" | "Team" | "Vendors" | "Leads">("All Contacts");
  
  // Selected Contact
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Add Contact Modal State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTag, setNewTag] = useState("Client");
  const [newRole, setNewRole] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  // Note State
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.success && data.contacts && data.contacts.length > 0) {
        setContacts(data.contacts);
        setSelectedContact(data.contacts[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(auth.currentUser);
    fetchContacts();
  }, []);

  // Handle Add Contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSavingContact(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          company: newCompany,
          phone: newPhone,
          tags: [newTag],
          role: newRole,
          address: newAddress,
          website: newWebsite
        })
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => [data.contact, ...prev]);
        setSelectedContact(data.contact);
        setIsAddingContact(false);
        setNewName("");
        setNewEmail("");
        setNewCompany("");
        setNewPhone("");
        setNewRole("");
        setNewAddress("");
        setNewWebsite("");
        alert("Contact added! ⛩");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingContact(false);
    }
  };

  // Handle Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedContact) return;
    setSavingNote(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-note",
          contactId: selectedContact.id,
          text: noteText.trim(),
          author: user?.displayName || "Himanshu"
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update contact notes list
        setContacts((prev) =>
          prev.map((c) => (c.id === selectedContact.id ? data.contact : c))
        );
        setSelectedContact(data.contact);
        setNoteText("");
        setAddingNote(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
    if (selectedContact && selectedContact.id === id) {
      setSelectedContact(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
    }
  };

  // Filter contacts based on Search & Tabs
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "All Contacts") return matchesSearch;
    if (activeTab === "Favorites") return c.favorite && matchesSearch;
    
    // Tag tab filters (e.g. Clients, Team, Vendors, Leads)
    const singularTab = activeTab.slice(0, -1); // e.g. Clients -> Client
    return c.tags.includes(singularTab) && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-text">
      
      {/* 1. TOP HEADER */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3.5xl font-handwriting font-black text-[#2b2725] leading-none flex items-center gap-2">
            Contacts <span className="text-[#b83227]">⛩</span>
          </h1>
          <p className="text-xs font-handwriting text-[#2b2725]/60 font-bold mt-1">All your connections in one place.</p>
        </div>

        {/* Global Filter & Actions */}
        <div className="flex items-center space-x-3 select-none">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#2b2725]/45">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-10 py-1.5 bg-white sketch-border-sm text-xs font-handwriting font-bold w-52 focus:outline-none shadow-sm"
            />
          </div>

          <button className="p-1.5 px-3.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-handwriting font-bold flex items-center space-x-1 cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span>Filter</span>
          </button>
          
          <button 
            onClick={() => setIsAddingContact(true)}
            className="p-1.5 px-4 bg-[#b83227] hover:bg-[#a02b21] text-white font-handwriting font-black text-xs rounded-xl flex items-center space-x-1 cursor-pointer border-b-2 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 2. BODY SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto pr-1">
        
        {/* LEFT COMPONENT: GROUPS & MAIN LIST TABLE (75% width) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px] lg:min-h-0 shrink-0">
          
          {/* Groups list sidecard (w: 52) */}
          <div className="w-full lg:w-52 bg-[#fdfbf7] sketch-border-sm p-4 relative overflow-hidden rounded-xl border-b-3 border-r-3 select-none shrink-0 flex flex-col justify-between">
            <VectorBamboo />

            <div>
              <h3 className="font-handwriting font-black text-sm text-[#2b2725] mb-2 pb-1 border-b border-dashed border-[#e6dfd3]">
                Groups
              </h3>
              
              <div className="space-y-1 text-xs font-handwriting font-bold">
                {[
                  { name: "All Contacts", count: contacts.length, icon: "👥" },
                  { name: "Favorites", count: contacts.filter(c=>c.favorite).length, icon: "★" },
                  { name: "Clients", count: contacts.filter(c=>c.tags.includes("Client")).length, icon: "💼" },
                  { name: "Team", count: contacts.filter(c=>c.tags.includes("Team")).length, icon: "🌸" },
                  { name: "Vendors", count: contacts.filter(c=>c.tags.includes("Vendor")).length, icon: "📦" },
                  { name: "Leads", count: contacts.filter(c=>c.tags.includes("Lead")).length, icon: "⚡" }
                ].map((g) => (
                  <button
                    key={g.name}
                    onClick={() => {
                      setActiveTab(g.name as any);
                      const filtered = contacts.filter((c) => {
                        if (g.name === "All Contacts") return true;
                        if (g.name === "Favorites") return c.favorite;
                        const singular = g.name.slice(0, -1);
                        return c.tags.includes(singular);
                      });
                      setSelectedContact(filtered[0] || null);
                    }}
                    className={`w-full p-2 px-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === g.name
                        ? "bg-[#fcdfd7] text-[#b83227] font-black"
                        : "hover:bg-[#e6dfd3]/20 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{g.icon}</span>
                      <span>{g.name}</span>
                    </div>
                    <span className="font-mono text-[9px] bg-white border border-gray-100 rounded-full px-1.5">{g.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white border border-dashed border-[#e6dfd3] rounded-xl text-center shadow-inner mt-4">
              <HankoLogoSVG className="w-5 h-5 mx-auto text-[#b83227] mb-1.5" />
              <p className="text-[10px] font-handwriting text-[#2b2725]/70 font-bold leading-normal">
                Stay connected, build relationships.
              </p>
            </div>
          </div>

          {/* Contacts List Table Card */}
          <div className="flex-1 bg-white sketch-border sketch-shadow rounded-xl p-5 flex flex-col min-h-0">
            
            {/* Table Header Row */}
            <div className="flex items-center pb-2 border-b border-[#e6dfd3] text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold select-none pl-3">
              <div className="w-[35%] text-left">Name</div>
              <div className="w-[25%] text-left">Email</div>
              <div className="w-[18%] text-left">Company</div>
              <div className="w-[12%] text-left">Phone</div>
              <div className="w-[10%] text-right pr-4">Tags</div>
            </div>

            {/* Table Rows list */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1.5 notebook-grid-small pr-1">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#b83227]" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 font-handwriting text-gray-400 font-bold select-none">
                  No contacts found in this folder.
                </div>
              ) : (
                filteredContacts.map((c) => {
                  const isSel = selectedContact?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className={`flex items-center py-2.5 px-3 border cursor-pointer transition-all border-b-2 text-xs font-handwriting font-bold ${
                        isSel
                          ? "bg-[#fcdfd7]/30 border-[#b83227]/40 shadow-sm scale-[1.005]"
                          : "bg-white border-[#e6dfd3] hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      {/* Name & Avatar Column */}
                      <div className="w-[35%] flex items-center space-x-2.5 truncate text-left pr-2">
                        <div className="w-6.5 h-6.5 rounded-full bg-[#3c6382]/10 text-[#3c6382] font-mono font-bold flex items-center justify-center border border-[#3c6382]/30 text-[10px] shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-[#2b2725]">{c.name}</span>
                        {c.favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-500 shrink-0" />}
                      </div>

                      {/* Email Column */}
                      <div className="w-[25%] truncate text-left font-mono text-[10px] text-[#2b2725]/60 pr-2">
                        {c.email}
                      </div>

                      {/* Company Column */}
                      <div className="w-[18%] truncate text-left text-[#2b2725]/75 pr-2 flex items-center gap-1">
                        {c.company === "Exxample Inc." && <span className="text-red-700">⛩</span>}
                        <span>{c.company}</span>
                      </div>

                      {/* Phone Column */}
                      <div className="w-[12%] truncate text-left font-mono text-[10px] text-[#2b2725]/60">
                        {c.phone}
                      </div>

                      {/* Tag Badge Column */}
                      <div className="w-[10%] text-right pr-2 shrink-0">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          c.tags.includes("Client") ? "bg-green-100 text-green-700" :
                          c.tags.includes("Team") ? "bg-purple-100 text-purple-700" :
                          c.tags.includes("Vendor") ? "bg-amber-100 text-amber-700" :
                          c.tags.includes("Partner") ? "bg-blue-100 text-blue-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {c.tags[0] || "Client"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination footer */}
            <div className="pt-3 border-t border-[#e6dfd3] flex justify-between items-center text-xs font-handwriting font-bold select-none text-[#2b2725]/60 shrink-0">
              <span>Showing 1-{filteredContacts.length} of {filteredContacts.length} contacts</span>
              <div className="flex space-x-1.5">
                <button className="p-1 bg-white sketch-border-sm cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button className="p-1 bg-white sketch-border-sm cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED PROFILE VIEW (25% width) */}
        <div className="w-full lg:w-76 flex flex-col gap-6 shrink-0 text-left">
          
          {selectedContact ? (
            <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 flex-1 flex flex-col justify-between">
              {/* Slanted washi tape corner ribbon */}
              <div className="absolute top-[-8px] right-[10%] w-14 h-4.5 bg-[#fcdfd7] opacity-75 border-l border-r border-dashed border-white/40 rotate-[3deg] shadow-sm select-none pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Profile Card Header with Fuji vector frame */}
                <div className="p-4 bg-white border border-[#2b2725]/15 rounded-2xl relative overflow-hidden text-center shadow-sm">
                  <VectorMtFujiAvatarFrame />
                  
                  <div className="w-14 h-14 rounded-full bg-[#ebdcc8] border-2 border-[#2b2725] mx-auto flex items-center justify-center font-mono text-xl font-bold text-[#b83227] z-10 relative shadow">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="mt-2.5 z-10 relative">
                    <h3 className="font-handwriting font-black text-base text-[#2b2725] leading-none flex items-center justify-center gap-1">
                      {selectedContact.name}
                      <button onClick={() => toggleFavorite(selectedContact.id)} className="text-[#2b2725]/30 hover:text-yellow-500 transition-colors">
                        <Star className={`w-3.5 h-3.5 ${selectedContact.favorite ? "fill-yellow-400 text-yellow-500" : ""}`} />
                      </button>
                    </h3>
                    <p className="text-[10px] font-handwriting font-extrabold text-[#2b2725]/50 mt-1 leading-none">
                      {selectedContact.role}
                    </p>
                    <span className="text-[8px] font-mono font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase mt-2.5 inline-block">
                      {selectedContact.tags[0]}
                    </span>
                  </div>
                </div>

                {/* Quick actions links */}
                <div className="flex justify-around items-center py-2 bg-white/70 border border-dashed border-[#e6dfd3] rounded-xl select-none">
                  <button 
                    onClick={() => router.push(`/dashboard/compose?to=${encodeURIComponent(selectedContact.name + ' <' + selectedContact.email + '>')}`)}
                    className="flex flex-col items-center text-[9px] font-handwriting font-black text-[#2b2725]/75 hover:text-[#b83227] cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-[#b83227]" />
                    <span className="mt-1">Email</span>
                  </button>
                  <button className="flex flex-col items-center text-[9px] font-handwriting font-black text-[#2b2725]/75 hover:text-[#b83227] cursor-pointer">
                    <Phone className="w-4 h-4 text-[#3c6382]" />
                    <span className="mt-1">Call</span>
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/ai-assistant?query=${encodeURIComponent("Discuss with " + selectedContact.name)}`)}
                    className="flex flex-col items-center text-[9px] font-handwriting font-black text-[#2b2725]/75 hover:text-[#b83227] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-green-700" />
                    <span className="mt-1">Message</span>
                  </button>
                  <button 
                    onClick={() => router.push(`/dashboard/calendar`)}
                    className="flex flex-col items-center text-[9px] font-handwriting font-black text-[#2b2725]/75 hover:text-[#b83227] cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <span className="mt-1">Meeting</span>
                  </button>
                </div>

                {/* Profile detail lists */}
                <div className="space-y-2.5 text-[11px] font-handwriting font-bold text-[#2b2725]/85">
                  <h4 className="font-handwriting font-black text-xs text-[#2b2725]/60 select-none pb-1 border-b border-dashed border-[#e6dfd3]">
                    Contact Details
                  </h4>
                  
                  <div className="flex items-center space-x-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate font-mono text-[10px]">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="font-mono text-[10px]">{selectedContact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{selectedContact.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{selectedContact.company}</span>
                  </div>
                  <div className="flex items-center space-x-2 truncate">
                    <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <a href={`https://${selectedContact.website}`} target="_blank" rel="noreferrer" className="truncate text-[#3c6382] hover:underline">{selectedContact.website}</a>
                  </div>
                </div>

                {/* Notes logger cards */}
                <div className="space-y-2 pt-2 border-t border-dashed border-[#e6dfd3]">
                  <div className="flex justify-between items-baseline select-none">
                    <h4 className="font-handwriting font-black text-xs text-[#2b2725]/60">Notes</h4>
                    <button 
                      onClick={() => setAddingNote(!addingNote)}
                      className="text-[10px] font-handwriting font-black text-[#b83227] hover:underline cursor-pointer"
                    >
                      {addingNote ? "Cancel" : "+ Add Note"}
                    </button>
                  </div>

                  {addingNote ? (
                    <form onSubmit={handleAddNote} className="space-y-1.5 p-2 bg-white border border-dashed border-[#ebdcc8] rounded-xl">
                      <textarea
                        required
                        placeholder="Discussed project details..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full p-2 text-xs font-handwriting font-bold focus:outline-none h-16 bg-[#fbf9f4]/50"
                      />
                      <div className="text-right">
                        <button 
                          type="submit" 
                          disabled={savingNote || !noteText.trim()}
                          className="px-2.5 py-1 bg-[#b83227] text-white rounded text-[10px] font-handwriting font-black cursor-pointer disabled:opacity-50"
                        >
                          {savingNote ? "Saving..." : "Save Note"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {selectedContact.notes && selectedContact.notes.length > 0 ? (
                        selectedContact.notes.map((n, idx) => (
                          <div key={idx} className="p-2.5 bg-white border border-dashed border-[#e6dfd3] rounded-xl text-[10px] leading-relaxed relative">
                            <p className="font-handwriting font-extrabold text-[#2b2725] italic">"{n.text}"</p>
                            <div className="flex justify-between font-mono text-[8px] text-gray-400 mt-2 font-bold select-none border-t border-dashed border-gray-100 pt-1">
                              <span>{n.date}</span>
                              <span>• {n.author}</span>
                            </div>
                            <div className="absolute right-1.5 top-1 opacity-20"><HankoLogoSVG className="w-3.5 h-3.5" /></div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] font-handwriting text-gray-400 italic font-bold text-center py-4 select-none">No notes logged for this contact.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom mascot pot decoration */}
              <div className="mt-4 border-t border-dashed border-[#e6dfd3] pt-3 flex justify-center shrink-0">
                <DootTeaMascot />
              </div>

            </div>
          ) : (
            <div className="bg-[#fdfbf7] sketch-border-sm p-5 relative overflow-hidden rounded-xl shadow-sm border-b-3 border-r-3 flex-1 flex flex-col justify-center items-center text-center select-none font-handwriting text-gray-400 font-bold space-y-3">
              <DootTeaMascot />
              <p>Select a contact details.</p>
            </div>
          )}

        </div>

      </div>

      {/* Add Contact Postcard Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-[#2b2725]/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddContact} className="bg-[#fbf8f3] w-full max-w-md p-6 sketch-border sketch-shadow relative space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-[#e6dfd3]">
              <span className="font-handwriting text-lg font-bold text-[#b83227]">Add New Contact</span>
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="text-xs font-bold underline hover:text-[#b83227] cursor-pointer"
              >
                Close [esc]
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Mehta..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Exxample Inc."
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Role</label>
                  <input
                    type="text"
                    placeholder="CEO / UI Designer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Group Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none font-bold"
                  >
                    <option value="Client">Client</option>
                    <option value="Team">Team</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Partner">Partner</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Mumbai, India"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2b2725]/60 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="www.exxample.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full p-2.5 bg-white sketch-border-sm text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingContact}
                className="px-5 py-2 bg-[#b83227] text-white font-bold text-xs sketch-border sketch-shadow-hover hover:scale-102 flex items-center space-x-1.5 cursor-pointer transition-all border-b-2"
              >
                {savingContact ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Add Contact</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

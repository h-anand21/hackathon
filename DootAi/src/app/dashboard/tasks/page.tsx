"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  CheckCircle2,
  Tag
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  createdAt: string;
};

export default function TasksPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [saving, setSaving] = useState(false);

  // Fetch tasks
  const fetchTasks = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
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
      fetchTasks(auth.currentUser.uid);
    }
  }, []);

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          title: newTitle,
          priority: newPriority
        })
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
        setNewPriority("Medium");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Completed status
  const handleToggleCompleted = async (task: Task) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
      );
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          completed: !task.completed
        })
      });
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await fetch(`/api/tasks?taskId=${taskId}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-[#b83227] bg-[#b83227]/5 border-[#b83227]/25";
      case "Medium":
        return "text-[#f5b041] bg-[#f5b041]/5 border-[#f5b041]/25";
      default:
        return "text-[#388e3c] bg-[#388e3c]/5 border-[#388e3c]/25";
    }
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-handwriting text-[#2b2725]">
          Tasks & Checklists 📋
        </h1>
        <p className="text-xs text-[#2b2725]/60 mt-1 font-mono">
          Email action items and custom tasks tracked here.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Tasks List */}
        <div className="flex-1 bg-white sketch-border sketch-shadow flex flex-col p-6 min-h-0">
          
          {/* Add Task Postcard Form */}
          <form onSubmit={handleAddTask} className="p-4 bg-[#fbf8f3] sketch-border-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Add task scroll item..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-white p-2.5 sketch-border-sm text-xs focus:outline-none"
              required
            />
            
            <div className="flex items-center space-x-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="bg-white p-2.5 sketch-border-sm text-xs focus:outline-none font-bold"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Mid</option>
                <option value="Low">🟢 Low</option>
              </select>
              
              <button
                type="submit"
                disabled={saving || !newTitle.trim()}
                className="px-4 py-2.5 bg-[#b83227] text-white font-bold text-xs sketch-border sketch-shadow-hover hover:scale-102 flex items-center space-x-1 cursor-pointer transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Active Tasks Scroll list */}
          <div className="flex-1 overflow-y-auto space-y-4 notebook-grid-small pr-1">
            <h3 className="font-handwriting text-xl font-bold text-[#b83227] mb-2 text-left">
              Active Items ({activeTasks.length})
            </h3>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3c6382]" />
              </div>
            ) : activeTasks.length === 0 ? (
              <p className="text-xs text-[#2b2725]/40 italic py-6 text-center">
                No active task items. All clear! 🌸
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white sketch-border-sm flex items-center justify-between hover:border-[#2b2725] transition-all"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <button
                        onClick={() => handleToggleCompleted(task)}
                        className="text-[#2b2725]/40 hover:text-[#b83227] transition-colors"
                      >
                        <Square className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-sans text-[#2b2725]">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[9px] px-2 py-0.5 border font-bold uppercase rounded font-mono ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[#2b2725]/30 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks section */}
            {completedTasks.length > 0 && (
              <div className="pt-6 border-t border-dashed border-[#e6dfd3] mt-6">
                <h3 className="font-handwriting text-xl font-bold text-[#388e3c] mb-3 text-left">
                  Completed Items ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-[#fbf8f3]/60 sketch-border-sm flex items-center justify-between opacity-60"
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <button
                          onClick={() => handleToggleCompleted(task)}
                          className="text-[#388e3c]"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-sans text-[#2b2725] line-through">
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[#2b2725]/30 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Doot AI Suggestions Sidebar */}
        <div className="w-full lg:w-80 bg-white sketch-border sketch-shadow flex flex-col p-6 space-y-6">
          <div className="border-b border-dashed border-[#e6dfd3] pb-3 text-left">
            <span className="text-[10px] uppercase font-mono text-[#388e3c] font-bold">AI Assistant</span>
            <h3 className="font-handwriting text-2xl font-bold text-[#2b2725]">
              Doot AI Task Tips
            </h3>
          </div>

          <div className="space-y-4 text-left">
            {/* Mascot drawing card */}
            <div className="p-4 bg-[#fbf8f3] sketch-border-sm flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-[#f5b041] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-handwriting text-sm font-bold text-[#3c6382]">Smart Suggestions</h4>
                <p className="text-[11px] text-[#2b2725]/70 leading-relaxed italic">
                  "I scanned your latest emails. You have an action item from <strong>Aarav Patel</strong> about 'finalizing paper styles' that you haven't added to your checklist yet. Would you like to add it?"
                </p>
              </div>
            </div>

            <button className="w-full py-2 bg-[#b83227]/5 border border-dashed border-[#b83227]/30 hover:border-[#b83227] text-[#b83227] text-xs font-bold transition-all cursor-pointer">
              ✓ Add: Finalize paper styles
            </button>
          </div>

          <div className="p-3 bg-[#3c6382]/5 sketch-border-sm border-[#3c6382] text-left">
            <span className="font-handwriting text-xs font-bold text-[#3c6382] flex items-center mb-1">
              💡 Task Productivity Tip
            </span>
            <p className="text-[10px] text-[#2b2725]/70 italic leading-relaxed">
              Bundle related email tasks together! You can mark them completed directly from the Inbox sidebar reading pane.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

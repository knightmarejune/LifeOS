import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore, getAuthToken } from "./auth";

export type Priority = "must" | "should" | "optional";

export interface Task {
  id: string;
  _id?: string; // MongoDB id
  title: string;
  notes?: string;
  priority: Priority;
  date: string; // ISO date yyyy-mm-dd
  completed: boolean;
  createdAt: number;
}

interface TasksState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearTasks: () => void;
  loadSeed: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const seed: Task[] = [
  { id: "t1", title: "Ship LifeOS v1 dashboard", priority: "must", date: today(), completed: false, createdAt: Date.now() - 9e6, notes: "Polish hero stats + animations" },
  { id: "t2", title: "Deep work block — algorithms", priority: "must", date: today(), completed: true, createdAt: Date.now() - 8e6 },
  { id: "t3", title: "Reply to founder emails", priority: "should", date: today(), completed: false, createdAt: Date.now() - 7e6 },
  { id: "t4", title: "30-min run", priority: "should", date: today(), completed: false, createdAt: Date.now() - 6e6 },
  { id: "t5", title: "Read 20 pages", priority: "optional", date: today(), completed: false, createdAt: Date.now() - 5e6 },
  { id: "t6", title: "Weekly review", priority: "should", date: today(), completed: false, createdAt: Date.now() - 4e6 },
];

import { API_BASE_URL } from "@/lib/api";

const API_URL = `${API_BASE_URL}/tasks`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  if (!token) return null;
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  return fetch(url, { ...options, headers });
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: seed, // Default to seed
      loadSeed: () => set({ tasks: seed }),
      clearTasks: () => set({ tasks: [] }),
      fetchTasks: async () => {
        const res = await fetchWithAuth(API_URL);
        if (!res) return;
        try {
          const data = await res.json();
          if (Array.isArray(data)) {
            set({ tasks: data });
          } else {
            set({ tasks: [] });
          }
        } catch (err) {
          console.error('Failed to fetch tasks:', err);
          set({ tasks: [] });
        }
      },
      addTask: async (t) => {
        const newTask = { ...t, id: crypto.randomUUID(), completed: false, createdAt: Date.now() };
        set((s) => ({ tasks: [newTask, ...s.tasks] }));
        
        const res = await fetchWithAuth(API_URL, {
          method: 'POST',
          body: JSON.stringify(newTask),
        });
        
        if (res && res.ok) {
          const syncedTask = await res.json();
          // Replace optimistic task with backend task (which has _id)
          set((s) => ({
            tasks: s.tasks.map(task => task.id === newTask.id ? { ...syncedTask, id: newTask.id } : task)
          }));
        }
      },
      updateTask: async (id, patch) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
        
        const task = get().tasks.find(t => t.id === id);
        const backendId = task?._id || id;

        await fetchWithAuth(`${API_URL}/${backendId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      },
      deleteTask: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        const backendId = task?._id || id;
        
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, { method: 'DELETE' });
      },
      toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const newStatus = !task.completed;
        const backendId = task._id || id;

        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: newStatus } : t)),
        }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: newStatus }),
        });
      },
    }),
    { name: "lifeos.tasks" }
  )
);

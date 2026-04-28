import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAuthToken } from "./auth";

export interface Habit {
  id: string;
  _id?: string;
  name: string;
  emoji: string;
  color: string; // css var style or hex
  history: Record<string, boolean>; // yyyy-mm-dd -> done
  createdAt: number;
}

interface HabitsState {
  habits: Habit[];
  fetchHabits: () => Promise<void>;
  addHabit: (h: Omit<Habit, "id" | "history" | "createdAt">) => void;
  deleteHabit: (id: string) => void;
  toggleDay: (id: string, date: string) => void;
  clearHabits: () => void;
  loadSeed: () => void;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

// Build 120 days of history with realistic randomness
function genHistory(rate: number): Record<string, boolean> {
  const h: Record<string, boolean> = {};
  const now = new Date();
  for (let i = 0; i < 120; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    h[iso(d)] = Math.random() < rate;
  }
  return h;
}

const seed: Habit[] = [
  { id: "h1", name: "Deep work 2h", emoji: "🧠", color: "hsl(258 90% 66%)", history: genHistory(0.78), createdAt: Date.now() },
  { id: "h2", name: "Morning run", emoji: "🏃", color: "hsl(150 70% 50%)", history: genHistory(0.62), createdAt: Date.now() },
  { id: "h3", name: "Read 20 pages", emoji: "📚", color: "hsl(192 90% 60%)", history: genHistory(0.7), createdAt: Date.now() },
  { id: "h4", name: "No social media", emoji: "🧘", color: "hsl(25 95% 60%)", history: genHistory(0.55), createdAt: Date.now() },
];

import { API_BASE_URL } from "@/lib/api";

const API_URL = `${API_BASE_URL}/habits`;

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

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: seed,
      loadSeed: () => set({ habits: seed }),
      clearHabits: () => set({ habits: [] }),
      fetchHabits: async () => {
        const res = await fetchWithAuth(API_URL);
        if (!res) return;
        try {
          const data = await res.json();
          set({ habits: data });
        } catch (err) {
          console.error('Failed to fetch habits:', err);
        }
      },
      addHabit: async (h) => {
        const newHabit = { ...h, id: crypto.randomUUID(), history: {}, createdAt: Date.now() };
        set((s) => ({ habits: [...s.habits, newHabit] }));
        
        const res = await fetchWithAuth(API_URL, {
          method: 'POST',
          body: JSON.stringify(newHabit),
        });
        
        if (res && res.ok) {
          const synced = await res.json();
          set((s) => ({
            habits: s.habits.map(hab => hab.id === newHabit.id ? { ...synced, id: newHabit.id } : hab)
          }));
        }
      },
      deleteHabit: async (id) => {
        const habit = get().habits.find(h => h.id === id);
        const backendId = habit?._id || id;
        
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, { method: 'DELETE' });
      },
      toggleDay: async (id, date) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return;
        
        const newHistory = { ...habit.history, [date]: !habit.history[date] };
        const backendId = habit._id || id;
        
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, history: newHistory } : h
          ),
        }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, {
          method: 'PATCH',
          body: JSON.stringify({ history: newHistory }),
        });
      },
    }),
    { name: "lifeos.habits" }
  )
);

export function computeStreak(history: Record<string, boolean>): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (history[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

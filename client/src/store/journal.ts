import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAuthToken } from "./auth";

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  _id?: string;
  date: string;
  thought: string;
  wentWell: string;
  wasted: string;
  mood: Mood;
  createdAt: number;
}

interface JournalState {
  entries: JournalEntry[];
  fetchEntries: () => Promise<void>;
  addEntry: (e: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateEntry: (id: string, patch: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  clearEntries: () => void;
  loadSeed: () => void;
}

const seed: JournalEntry[] = [
  {
    id: "j1",
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    thought: "Consistency beats intensity. Small reps, every day.",
    wentWell: "Shipped the dashboard refactor. Ran 5k in the morning.",
    wasted: "30 minutes doom-scrolling after lunch.",
    mood: 4,
    createdAt: Date.now() - 86400000,
  },
];

import { API_BASE_URL } from "@/lib/api";

const API_URL = `${API_BASE_URL}/journal`;

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

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: seed,
      loadSeed: () => set({ entries: seed }),
      clearEntries: () => set({ entries: [] }),
      fetchEntries: async () => {
        const res = await fetchWithAuth(API_URL);
        if (!res) return;
        try {
          const data = await res.json();
          set({ entries: data });
        } catch (err) {
          console.error('Failed to fetch journal entries:', err);
        }
      },
      addEntry: async (e) => {
        const newEntry = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
        set((s) => ({ entries: [newEntry, ...s.entries] }));
        
        const res = await fetchWithAuth(API_URL, {
          method: 'POST',
          body: JSON.stringify(newEntry),
        });
        
        if (res && res.ok) {
          const synced = await res.json();
          set((s) => ({
            entries: s.entries.map(ent => ent.id === newEntry.id ? { ...synced, id: newEntry.id } : ent)
          }));
        }
      },
      updateEntry: async (id, patch) => {
        const entry = get().entries.find(e => e.id === id);
        const backendId = entry?._id || id;
        
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
      },
      deleteEntry: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        const backendId = entry?._id || id;
        
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        
        await fetchWithAuth(`${API_URL}/${backendId}`, { method: 'DELETE' });
      },
    }),
    { name: "lifeos.journal" }
  )
);

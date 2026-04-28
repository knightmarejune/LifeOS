import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FocusSession {
  id: string;
  tag: string;
  durationMin: number;
  startedAt: number;
  completed: boolean;
}

interface FocusState {
  sessions: FocusSession[];
  addSession: (s: Omit<FocusSession, "id">) => void;
  clearSessions: () => void;
  loadSeed: () => void;
}

// seed last 14 days of focus data
function seedSessions(): FocusSession[] {
  const tags = ["Study", "Coding", "Writing", "Design"];
  const arr: FocusSession[] = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    arr.push({
      id: crypto.randomUUID(),
      tag: tags[i % tags.length],
      durationMin: 25 + Math.floor(Math.random() * 60),
      startedAt: now - daysAgo * 86400000 - Math.random() * 36000000,
      completed: true,
    });
  }
  return arr;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      sessions: seedSessions(),
      loadSeed: () => set({ sessions: seedSessions() }),
      clearSessions: () => set({ sessions: [] }),
      addSession: (s) =>
        set((st) => ({ sessions: [{ ...s, id: crypto.randomUUID() }, ...st.sessions] })),
    }),
    { name: "lifeos.focus" }
  )
);

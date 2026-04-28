import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UpcomingEvent {
  id: string;
  title: string;
  at: number; // timestamp
  kind: "meeting" | "deadline" | "personal";
}

interface EventsState {
  events: UpcomingEvent[];
  clearEvents: () => void;
  loadSeed: () => void;
}

const h = 3600_000;
const seed: UpcomingEvent[] = [
  { id: "e1", title: "1:1 with Alex", at: Date.now() + 2 * h, kind: "meeting" },
  { id: "e2", title: "Design review", at: Date.now() + 5 * h, kind: "meeting" },
  { id: "e3", title: "Ship v1 deadline", at: Date.now() + 26 * h, kind: "deadline" },
  { id: "e4", title: "Gym session", at: Date.now() + 30 * h, kind: "personal" },
];

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      events: seed,
      loadSeed: () => set({ events: seed }),
      clearEvents: () => set({ events: [] }),
    }),
    { name: "lifeos.events" }
  )
);

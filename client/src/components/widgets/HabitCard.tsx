import { motion } from "framer-motion";
import { Flame, Trash2 } from "lucide-react";
import { type Habit, computeStreak, useHabitsStore } from "@/store/habits";
import { HeatmapGrid } from "./HeatmapGrid";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);

export function HabitCard({ habit }: { habit: Habit }) {
  const toggleDay = useHabitsStore((s) => s.toggleDay);
  const del = useHabitsStore((s) => s.deleteHabit);
  const streak = computeStreak(habit.history);
  const doneToday = !!habit.history[today()];

  const total = Object.values(habit.history).filter(Boolean).length;
  const rate = Math.round((total / Math.max(1, Object.keys(habit.history).length)) * 100);

  return (
    <motion.div layout className="glass-card p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl border border-border/60 bg-muted flex items-center justify-center text-xl shrink-0">
            {habit.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium truncate">{habit.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-warning" /> {streak}d streak
              </span>
              <span>{rate}% success</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleDay(habit.id, today())}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              doneToday
                ? "bg-gradient-primary border-transparent text-primary-foreground shadow-glow"
                : "border-border hover:border-primary/50 text-foreground"
            )}
          >
            {doneToday ? "Done ✓" : "Check in"}
          </button>
          <button
            onClick={() => del(habit.id)}
            className="opacity-0 group-hover:opacity-100 transition p-1.5 text-muted-foreground hover:text-destructive"
            aria-label="Delete habit"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5">
        <HeatmapGrid history={habit.history} color={habit.color} />
      </div>
    </motion.div>
  );
}

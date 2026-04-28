import { useMemo, useState } from "react";
import { TrendingUp, Timer, Flame, CheckCircle2, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { StatCard } from "@/components/widgets/StatCard";
import { TaskCard } from "@/components/widgets/TaskCard";
import { useTasksStore } from "@/store/tasks";
import { useHabitsStore, computeStreak } from "@/store/habits";
import { useFocusStore } from "@/store/focus";
import { useEventsStore } from "@/store/events";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";

function useStats() {
  const tasks = useTasksStore((s) => s.tasks);
  const habits = useHabitsStore((s) => s.habits);
  const sessions = useFocusStore((s) => s.sessions);

  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeSessions = Array.isArray(sessions) ? sessions : [];

    const todays = safeTasks.filter((t) => t.date === today);
    const done = todays.filter((t) => t.completed).length;
    const productivity = todays.length ? Math.round((done / todays.length) * 100) : 0;

    const weekAgo = Date.now() - 7 * 86400000;
    const focusMin = safeSessions.filter((s) => s.startedAt > weekAgo).reduce((a, b) => a + b.durationMin, 0);
    const focusHrs = +(focusMin / 60).toFixed(1);

    const habitPct = habits.length ? Math.round((doneHabitsToday / habits.length) * 100) : 0;

    return { productivity, focusHrs, streak, habitPct, todays, done };
  }, [tasks, habits, sessions]);
}

export default function Dashboard() {
  const nav = useNavigate();
  const { productivity, focusHrs, streak, habitPct, todays } = useStats();
  const upcomingEvents = useEventsStore((s) => s.events) || [];

  const byPriority = useMemo(() => {
    const o = { must: [] as typeof todays, should: [] as typeof todays, optional: [] as typeof todays };
    todays.forEach((t) => o[t.priority].push(t));
    return o;
  }, [todays]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-primary-glow">Plan → Execute → Track → Reflect</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-4 leading-tight max-w-xl">
              You're <span className="gradient-text">{productivity}%</span> through today's mission.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {productivity >= 80
                ? "Outstanding execution. Keep the momentum."
                : productivity >= 50
                ? "Good pace. A few more reps to close strong."
                : "The day is still young. One task at a time."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              Add task
            </Button>
            <Button variant="outline" onClick={() => nav("/focus")} className="border-border/60 bg-card/40">
              <Timer className="h-4 w-4 mr-2" /> Start focus
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productivity" value={productivity} suffix="%" icon={TrendingUp} progress={productivity} gradient="bg-gradient-primary" delay={0} trend="+12% vs last week" />
        <StatCard label="Focus Time" value={focusHrs} suffix="hrs / wk" icon={Timer} gradient="bg-gradient-focus" delay={0.05} trend="On target" />
        <StatCard label="Active Streak" value={streak} suffix="days" icon={Flame} gradient="bg-gradient-streak" delay={0.1} trend="🔥 Personal best" />
        <StatCard label="Habits Today" value={habitPct} suffix="%" icon={CheckCircle2} progress={habitPct} gradient="bg-gradient-habit" delay={0.15} />
      </section>

      {/* Two-column */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-2 glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Today's tasks</h3>
              <p className="text-xs text-muted-foreground">Grouped by priority</p>
            </div>
            <Link to="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
              All tasks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {todays.length === 0 ? (
            <EmptyTasks onAdd={() => setAddOpen(true)} />
          ) : (
            <div className="space-y-5">
              {(["must", "should", "optional"] as const).map((p) =>
                byPriority[p].length === 0 ? null : (
                  <div key={p}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 pl-1">
                      {p === "must" ? "Must do" : p === "should" ? "Should do" : "Optional"}
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {byPriority[p].map((t) => (
                          <TaskCard key={t.id} task={t} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Upcoming</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((e, i) => {
              const kindColor =
                e.kind === "deadline" ? "bg-destructive" : e.kind === "meeting" ? "bg-primary" : "bg-success";
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 transition"
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${kindColor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      in {formatDistanceToNowStrict(e.at)}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                    {e.kind}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function EmptyTasks({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-6 w-6 text-primary" />
      </div>
      <div className="font-medium">Inbox zero for today</div>
      <div className="text-sm text-muted-foreground mt-1 max-w-xs">Plan tomorrow tonight. Or seize the moment — add one more task.</div>
      <Button onClick={onAdd} className="mt-4 bg-gradient-primary text-primary-foreground">Add task</Button>
    </div>
  );
}

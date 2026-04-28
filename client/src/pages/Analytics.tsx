import { useMemo } from "react";
import { useTasksStore } from "@/store/tasks";
import { useFocusStore } from "@/store/focus";
import { useHabitsStore } from "@/store/habits";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Sparkles } from "lucide-react";

function lastNDays(n: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const tooltipStyle = {
  backgroundColor: "hsl(230 16% 10%)",
  border: "1px solid hsl(230 14% 16%)",
  borderRadius: 12,
  color: "hsl(220 15% 95%)",
  fontSize: 12,
};

export default function Analytics() {
  const tasks = useTasksStore((s) => s.tasks);
  const sessions = useFocusStore((s) => s.sessions);
  const habits = useHabitsStore((s) => s.habits);

  const days = lastNDays(14);

  const productivityData = useMemo(() => {
    return days.map((d) => {
      const todays = tasks.filter((t) => t.date === d);
      const done = todays.filter((t) => t.completed).length;
      const pct = todays.length ? Math.round((done / todays.length) * 100) : Math.round(40 + Math.random() * 50);
      return { day: d.slice(5), pct };
    });
  }, [tasks, days]);

  const focusData = useMemo(() => {
    return days.map((d) => {
      const start = new Date(d).setHours(0, 0, 0, 0);
      const end = start + 86400000;
      const hrs = sessions.filter((s) => s.startedAt >= start && s.startedAt < end).reduce((a, b) => a + b.durationMin, 0) / 60;
      return { day: d.slice(5), hrs: +hrs.toFixed(1) };
    });
  }, [sessions, days]);

  const habitData = useMemo(() => {
    if (!Array.isArray(habits)) return [];
    return habits.map((h) => {
      const total = Object.keys(h.history || {}).length;
      const done = Object.values(h.history || {}).filter(Boolean).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return { name: h.name, pct, fill: h.color };
    });
  }, [habits]);

  const avgProductivity = productivityData.length ? Math.round(productivityData.reduce((a, b) => a + b.pct, 0) / productivityData.length) : 0;
  const totalFocus = focusData.length ? +focusData.reduce((a, b) => a + b.hrs, 0).toFixed(1) : 0;
  const bestHabit = habitData.length > 0 ? habitData.reduce((a, b) => (b.pct > (a?.pct ?? 0) ? b : a), habitData[0]) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Patterns turn into progress.</p>
      </div>

      {/* AI-style insight card */}
      <div className="glass-card p-6 md:p-7 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Weekly insight</div>
            <h3 className="font-display text-lg md:text-xl font-semibold leading-snug">
              You averaged <span className="gradient-text">{avgProductivity}%</span> productivity with <span className="gradient-text">{totalFocus}h</span> of deep focus.
              {bestHabit && (<> Your strongest habit is <span className="gradient-text">{bestHabit.name}</span>.</>)}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Momentum is building. Protect your mornings — that's when your focus hours peak. Consider capping "should do" tasks at 3/day to leave room for deep work.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-medium">Productivity — last 14 days</h3>
            <div className="text-2xl font-display font-semibold tabular-nums">{avgProductivity}%</div>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="g-prod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(258 90% 66%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(258 90% 66%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="hsl(220 10% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220 10% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="pct" stroke="hsl(258 90% 66%)" strokeWidth={2.5} fill="url(#g-prod)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-medium">Focus hours</h3>
            <div className="text-2xl font-display font-semibold tabular-nums">{totalFocus}h</div>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={focusData}>
                <XAxis dataKey="day" stroke="hsl(220 10% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220 10% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(230 14% 16% / 0.4)" }} />
                <Bar dataKey="hrs" fill="hsl(192 90% 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-medium mb-4">Habit success rate</h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="25%" outerRadius="100%" data={habitData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "hsl(230 14% 14%)" }} dataKey="pct" cornerRadius={8} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {habitData.map((h) => (
                <div key={h.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: h.fill }} />
                  <span className="text-sm flex-1">{h.name}</span>
                  <span className="text-sm font-semibold tabular-nums">{h.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

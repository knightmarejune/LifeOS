import { useMemo } from "react";
import { cn } from "@/lib/utils";

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function HeatmapGrid({ history, color = "hsl(258 90% 66%)" }: { history: Record<string, boolean>; color?: string }) {
  const { weeks, labels } = useMemo(() => {
    const today = startOfDay(new Date());
    const days: { key: string; done: boolean; date: Date }[] = [];
    for (let i = 119; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, done: !!history[key], date: d });
    }
    // Pad front so each column is aligned by weekday
    const firstDay = days[0].date.getDay();
    const pad = Array.from({ length: firstDay }, () => null);
    const cells = [...pad, ...days] as (null | { key: string; done: boolean; date: Date })[];
    const weeks: (null | { key: string; done: boolean; date: Date })[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    // Month labels
    const labels: { idx: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, i) => {
      const first = w.find(Boolean);
      if (first) {
        const m = first.date.getMonth();
        if (m !== lastMonth) {
          labels.push({ idx: i, label: first.date.toLocaleString("en", { month: "short" }) });
          lastMonth = m;
        }
      }
    });
    return { weeks, labels };
  }, [history]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1 text-[10px] text-muted-foreground mb-1 pl-6">
          {weeks.map((_, i) => {
            const l = labels.find((x) => x.idx === i);
            return (
              <div key={i} className="w-3 shrink-0">
                {l?.label ?? ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-1 justify-around pt-0.5">
            <span>M</span>
            <span>W</span>
            <span>F</span>
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di];
                  if (!cell) return <div key={di} className="h-3 w-3" />;
                  return (
                    <div
                      key={di}
                      title={`${cell.key} — ${cell.done ? "Done" : "Missed"}`}
                      className={cn(
                        "h-3 w-3 rounded-[3px] transition-all hover:ring-2 hover:ring-primary/50",
                        cell.done ? "" : "bg-muted/60"
                      )}
                      style={cell.done ? { backgroundColor: color, boxShadow: `0 0 8px ${color}40` } : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

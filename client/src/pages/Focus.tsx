import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { ProgressRing } from "@/components/widgets/ProgressRing";
import { cn } from "@/lib/utils";
import { useFocusStore } from "@/store/focus";
import { toast } from "sonner";
import { motion } from "framer-motion";

const tags = ["Study", "Coding", "Writing", "Design", "Reading"];
const presets = [15, 25, 45, 60];

export default function Focus() {
  const [tag, setTag] = useState("Coding");
  const [targetMin, setTargetMin] = useState(25);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const addSession = useFocusStore((s) => s.addSession);
  const sessions = useFocusStore((s) => s.sessions);

  const total = targetMin * 60;
  const progress = Math.min(1, elapsed / total);
  const mm = String(Math.floor((total - elapsed) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, (total - elapsed) % 60)).padStart(2, "0");

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= total) {
          setRunning(false);
          addSession({ tag, durationMin: targetMin, startedAt: Date.now() - total * 1000, completed: true });
          toast.success("Focus session complete", { description: `${targetMin} min • ${tag}` });
          return total;
        }
        return e + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [running, total, tag, targetMin, addSession]);

  const stop = () => {
    setRunning(false);
    if (elapsed > 30) {
      addSession({ tag, durationMin: Math.round(elapsed / 60), startedAt: Date.now() - elapsed * 1000, completed: false });
      toast("Session saved", { description: `${Math.round(elapsed / 60)} min logged` });
    }
    setElapsed(0);
  };

  const recent = sessions.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Focus</h1>
        <p className="text-muted-foreground text-sm">Single-task. Deep work. No distractions.</p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col items-center">
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => !running && setTag(t)}
              disabled={running}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                tag === t ? "border-primary/60 bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:border-primary/30",
                running && "opacity-50 cursor-not-allowed"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div animate={running ? { scale: [1, 1.02, 1] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 2 }}>
          <ProgressRing progress={progress} size={260} stroke={14} label={`${mm}:${ss}`} sublabel={`${tag} • ${targetMin} min`} />
        </motion.div>

        <div className="flex gap-2 mt-8">
          {presets.map((p) => (
            <button
              key={p}
              disabled={running}
              onClick={() => { setTargetMin(p); setElapsed(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                targetMin === p ? "border-primary/60 bg-primary/10" : "border-border/60 text-muted-foreground hover:border-primary/30",
                running && "opacity-40 cursor-not-allowed"
              )}
            >
              {p}m
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setRunning((r) => !r)}
            className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center text-primary-foreground shadow-glow transition-transform active:scale-95",
              running ? "bg-gradient-streak" : "bg-gradient-primary"
            )}
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button
            onClick={() => setElapsed(0)}
            className="h-14 w-14 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-center hover:border-primary/40"
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={stop}
            className="h-14 w-14 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-center hover:border-destructive/40 hover:text-destructive"
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Recent sessions</h3>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground">No sessions yet. Start your first one.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/40">
                <div>
                  <div className="text-sm font-medium">{s.tag}</div>
                  <div className="text-xs text-muted-foreground">{new Date(s.startedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{s.durationMin}m</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

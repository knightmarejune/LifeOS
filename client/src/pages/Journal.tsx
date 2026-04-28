import { useState } from "react";
import { useJournalStore, type Mood } from "@/store/journal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moods: { v: Mood; e: string; l: string }[] = [
  { v: 1, e: "😞", l: "Rough" },
  { v: 2, e: "😕", l: "Meh" },
  { v: 3, e: "😐", l: "Okay" },
  { v: 4, e: "🙂", l: "Good" },
  { v: 5, e: "🤩", l: "Great" },
];

export default function Journal() {
  const { entries, addEntry, deleteEntry } = useJournalStore();
  const [thought, setThought] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [wasted, setWasted] = useState("");
  const [mood, setMood] = useState<Mood>(4);

  const submit = () => {
    if (!thought.trim() && !wentWell.trim() && !wasted.trim()) {
      toast.error("Write at least one field");
      return;
    }
    addEntry({
      date: new Date().toISOString().slice(0, 10),
      thought: thought.trim(),
      wentWell: wentWell.trim(),
      wasted: wasted.trim(),
      mood,
    });
    setThought(""); setWentWell(""); setWasted(""); setMood(4);
    toast.success("Reflection saved");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Journal</h1>
        <p className="text-muted-foreground text-sm">Reflection closes the loop. Don't skip it.</p>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-5">
        <div>
          <label className="text-xs text-muted-foreground">Thought of the day</label>
          <Input
            placeholder="One sentence that captures today…"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            className="bg-card/60 mt-1.5 h-11 text-base"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-success">✓ What went well</label>
            <Textarea rows={4} value={wentWell} onChange={(e) => setWentWell(e.target.value)} className="bg-card/60 mt-1.5 resize-none" />
          </div>
          <div>
            <label className="text-xs text-destructive">✗ What was wasted</label>
            <Textarea rows={4} value={wasted} onChange={(e) => setWasted(e.target.value)} className="bg-card/60 mt-1.5 resize-none" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Mood</label>
          <div className="flex gap-2 mt-2">
            {moods.map((m) => (
              <button
                key={m.v}
                onClick={() => setMood(m.v)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all",
                  mood === m.v ? "border-primary/60 bg-primary/10 scale-105" : "border-border/60 hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{m.e}</span>
                <span className="text-[10px] text-muted-foreground">{m.l}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">Save reflection</Button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold mb-3">Past entries</h3>
        {entries.length === 0 ? (
          <div className="text-sm text-muted-foreground glass-card p-8 text-center">No entries yet.</div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {entries.map((e) => {
                const m = moods.find((x) => x.v === e.mood)!;
                return (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass-card p-5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{m.e}</span>
                        <div>
                          <div className="text-xs text-muted-foreground">{format(new Date(e.date), "EEEE, MMM d")}</div>
                          {e.thought && <div className="font-medium mt-0.5">{e.thought}</div>}
                        </div>
                      </div>
                      <button onClick={() => deleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {(e.wentWell || e.wasted) && (
                      <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
                        {e.wentWell && (
                          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                            <div className="text-[10px] uppercase tracking-wider text-success mb-1">Went well</div>
                            <div className="text-muted-foreground">{e.wentWell}</div>
                          </div>
                        )}
                        {e.wasted && (
                          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div className="text-[10px] uppercase tracking-wider text-destructive mb-1">Wasted</div>
                            <div className="text-muted-foreground">{e.wasted}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

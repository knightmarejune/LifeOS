import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHabitsStore } from "@/store/habits";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const emojis = ["🧠", "🏃", "📚", "🧘", "💪", "💧", "☀️", "✍️", "🎯", "🌙"];
const colors = [
  "hsl(258 90% 66%)",
  "hsl(192 90% 60%)",
  "hsl(150 70% 50%)",
  "hsl(25 95% 60%)",
  "hsl(330 85% 65%)",
];

export function AddHabitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(emojis[0]);
  const [color, setColor] = useState(colors[0]);
  const addHabit = useHabitsStore((s) => s.addHabit);

  const submit = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), emoji, color });
    toast.success("Habit created", { description: name });
    setName(""); setEmoji(emojis[0]); setColor(colors[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder="Habit name…" value={name} onChange={(e) => setName(e.target.value)} className="bg-card/60 h-11" autoFocus />

          <div>
            <div className="text-xs text-muted-foreground mb-2">Icon</div>
            <div className="flex flex-wrap gap-2">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "h-10 w-10 rounded-lg border text-lg transition-all",
                    emoji === e ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Color</div>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

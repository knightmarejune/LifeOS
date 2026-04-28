import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTasksStore, type Priority } from "@/store/tasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const priorities: { key: Priority; label: string; desc: string }[] = [
  { key: "must", label: "Must", desc: "Non-negotiable" },
  { key: "should", label: "Should", desc: "High value" },
  { key: "optional", label: "Optional", desc: "Nice to have" },
];

export function AddTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("should");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const addTask = useTasksStore((s) => s.addTask);

  const submit = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), notes: notes.trim() || undefined, priority, date });
    toast.success("Task added", { description: title });
    setTitle(""); setNotes(""); setPriority("should");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New task</DialogTitle>
          <DialogDescription>What's the next move?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            autoFocus
            placeholder="Task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
            className="bg-card/60 border-border/60 text-base h-11"
          />
          <Textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-card/60 border-border/60 resize-none"
            rows={2}
          />

          <div>
            <div className="text-xs text-muted-foreground mb-2">Priority</div>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPriority(p.key)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-all",
                    priority === p.key
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 hover:border-primary/30"
                  )}
                >
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Date</div>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-card/60 border-border/60" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

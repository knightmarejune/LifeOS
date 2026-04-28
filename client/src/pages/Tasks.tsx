import { useEffect, useMemo, useState } from "react";
import { useTasksStore, type Priority } from "@/store/tasks";
import { TaskCard } from "@/components/widgets/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks } from "lucide-react";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const filters = ["All", "Today", "Completed", "Open"] as const;
type Filter = (typeof filters)[number];

export default function Tasks() {
  const { tasks, fetchTasks } = useTasksStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("Today");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const shown = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => {
      if (filter === "Today") return t.date === today;
      if (filter === "Completed") return t.completed;
      if (filter === "Open") return !t.completed;
      return true;
    });
  }, [tasks, filter]);

  const groups: Record<Priority, typeof tasks> = { must: [], should: [], optional: [] };
  shown.forEach((t) => groups[t.priority].push(t));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm">Plan with intent. Execute with precision.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> New task
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filter === f
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/60 text-muted-foreground hover:border-primary/30"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <ListChecks className="h-8 w-8 text-muted-foreground mb-3" />
          <div className="font-medium">No tasks here</div>
          <div className="text-sm text-muted-foreground mt-1">Add your first task to get started.</div>
          <Button onClick={() => setOpen(true)} className="mt-4 bg-gradient-primary text-primary-foreground">Add task</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {(["must", "should", "optional"] as const).map((p) =>
            groups[p].length === 0 ? null : (
              <div key={p} className="glass-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {p === "must" ? "Must do" : p === "should" ? "Should do" : "Optional"}
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-auto">{groups[p].length}</div>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {groups[p].map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <AddTaskDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

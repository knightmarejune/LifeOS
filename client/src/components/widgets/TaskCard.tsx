import { motion } from "framer-motion";
import { Check, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Task, type Priority, useTasksStore } from "@/store/tasks";

const priorityStyles: Record<Priority, { label: string; cls: string }> = {
  must: { label: "Must", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  should: { label: "Should", cls: "bg-warning/15 text-warning border-warning/30" },
  optional: { label: "Optional", cls: "bg-secondary/15 text-secondary border-secondary/30" },
};

export function TaskCard({ task }: { task: Task }) {
  const toggle = useTasksStore((s) => s.toggleTask);
  const del = useTasksStore((s) => s.deleteTask);
  const p = priorityStyles[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-3.5 py-3 transition-all hover:border-primary/30 hover:bg-card/80",
        task.completed && "opacity-60"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block" />

      <button
        onClick={() => toggle(task.id)}
        className={cn(
          "relative h-5 w-5 rounded-md border-2 shrink-0 transition-all flex items-center justify-center",
          task.completed
            ? "bg-gradient-primary border-transparent"
            : "border-border hover:border-primary"
        )}
        aria-label="Toggle task"
      >
        {task.completed && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium truncate", task.completed && "line-through")}>
          {task.title}
        </div>
        {task.notes && <div className="text-xs text-muted-foreground truncate mt-0.5">{task.notes}</div>}
      </div>

      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border", p.cls)}>
        {p.label}
      </span>

      <button
        onClick={() => del(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

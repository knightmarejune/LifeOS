import { useState } from "react";
import { Plus, ListChecks, Timer, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Action {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  gradient: string;
}

export function FloatingActionButton({ onAddTask }: { onAddTask: () => void }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const actions: Action[] = [
    { icon: ListChecks, label: "Add Task", onClick: () => { onAddTask(); setOpen(false); }, gradient: "bg-gradient-primary" },
    { icon: Timer, label: "Start Focus", onClick: () => { nav("/focus"); setOpen(false); }, gradient: "bg-gradient-focus" },
    { icon: BookOpen, label: "Add Thought", onClick: () => { nav("/journal"); setOpen(false); }, gradient: "bg-gradient-habit" },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-30">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-2.5"
          >
            {actions.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                onClick={a.onClick}
                className="group flex items-center gap-3"
              >
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur border border-border/60 shadow-md">
                  {a.label}
                </span>
                <span className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shadow-elegant", a.gradient)}>
                  <a.icon className="h-4 w-4 text-primary-foreground" />
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center text-primary-foreground"
        aria-label="Quick actions"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </motion.div>
      </motion.button>
    </div>
  );
}

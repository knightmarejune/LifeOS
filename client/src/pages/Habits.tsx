import { useState } from "react";
import { useHabitsStore } from "@/store/habits";
import { HabitCard } from "@/components/widgets/HabitCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddHabitDialog } from "@/components/dialogs/AddHabitDialog";

export default function Habits() {
  const habits = useHabitsStore((s) => s.habits);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">Habits</h1>
          <p className="text-muted-foreground text-sm">Tiny reps compound. Show up every day.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> New habit
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} />
        ))}
      </div>

      {habits.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="font-medium">No habits yet</div>
          <Button onClick={() => setOpen(true)} className="mt-4 bg-gradient-primary text-primary-foreground">Create habit</Button>
        </div>
      )}

      <AddHabitDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

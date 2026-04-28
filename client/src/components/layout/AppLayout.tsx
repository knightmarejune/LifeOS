import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";
import { FloatingActionButton } from "./FloatingActionButton";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useTasksStore } from "@/store/tasks";
import { useHabitsStore } from "@/store/habits";
import { useJournalStore } from "@/store/journal";
import { useFocusStore } from "@/store/focus";
import { useEventsStore } from "@/store/events";

export function AppLayout() {
  const [taskOpen, setTaskOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { fetchTasks, clearTasks, loadSeed: loadTaskSeed } = useTasksStore();
  const { fetchHabits, clearHabits, loadSeed: loadHabitSeed } = useHabitsStore();
  const { fetchEntries, clearEntries, loadSeed: loadJournalSeed } = useJournalStore();
  const { clearSessions, loadSeed: loadFocusSeed } = useFocusStore();
  const { clearEvents, loadSeed: loadEventSeed } = useEventsStore();

  useEffect(() => {
    if (user) {
      // Clear demo data and fetch user data
      clearTasks();
      clearHabits();
      clearEntries();
      clearSessions();
      clearEvents();
      
      fetchTasks();
      fetchHabits();
      fetchEntries();
    } else {
      // Load demo data for guests
      loadTaskSeed();
      loadHabitSeed();
      loadJournalSeed();
      loadFocusSeed();
      loadEventSeed();
    }
  }, [
    user, 
    fetchTasks, fetchHabits, fetchEntries, 
    clearTasks, clearHabits, clearEntries, clearSessions, clearEvents,
    loadTaskSeed, loadHabitSeed, loadJournalSeed, loadFocusSeed, loadEventSeed
  ]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-64">
        <TopBar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12 max-w-[1400px] mx-auto"
        >
          <Outlet />
        </motion.main>
      </div>
      <MobileNav />
      <FloatingActionButton onAddTask={() => setTaskOpen(true)} />
      <AddTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  );
}

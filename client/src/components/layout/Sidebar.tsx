import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ListChecks, Flame, Timer, BookOpen, BarChart3, Sparkles, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border/60">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold leading-none tracking-tight">LifeOS</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Personal OS</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "relative group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                active
                   ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn("relative h-4 w-4", active && "text-primary")} />
              <span className="relative">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 rounded-xl border border-border/60">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.displayName}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/5 to-transparent border border-primary/20">
          <div className="text-xs text-muted-foreground">Today's intent</div>
          <div className="text-sm font-medium mt-1 leading-snug">
            Consistency beats intensity.
          </div>
        </div>
      </div>
    </aside>
  );
}

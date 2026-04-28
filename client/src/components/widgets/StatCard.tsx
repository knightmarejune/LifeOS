import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  gradient?: string;
  progress?: number; // 0-100
  delay?: number;
  trend?: string;
}

export function StatCard({ label, value, suffix, icon: Icon, gradient = "bg-gradient-primary", progress, delay = 0, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card glass-card-hover p-5 overflow-hidden relative"
    >
      <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20", gradient)} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold tabular-nums">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {trend && <div className="mt-1 text-xs text-success">{trend}</div>}
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", gradient)}>
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            className={cn("h-full rounded-full", gradient)}
          />
        </div>
      )}
    </motion.div>
  );
}

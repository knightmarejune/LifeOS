import { format } from "date-fns";
import { Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function TopBar() {
  const now = new Date();
  const { user, login, logout, loading } = useAuthStore();
  const name = user?.displayName || "Operator";

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{format(now, "EEEE, MMMM d")}</div>
          <h1 className="font-display text-lg md:text-xl font-semibold leading-tight truncate">
            {greeting()}, <span className="gradient-text">{name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 w-56 bg-card/60 border-border/60 h-10" />
          </div>
          
          <button
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-xl border border-border/60 bg-card/60 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 overflow-hidden border border-border/60">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-card">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => login()} size="sm" className="rounded-xl shadow-glow">
                Login with Google
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

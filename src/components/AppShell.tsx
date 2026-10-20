import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Leaf,
  LogOut,
  MessageCircle,
  Repeat2,
  ScanSearch,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: null },
  { to: "/swap-board", label: "Swap board", short: "Swap", icon: Repeat2 },
  { to: "/rewear", label: "Rewear", short: "Rewear", icon: CalendarCheck },
  { to: "/calculator", label: "Impact", short: "Impact", icon: Leaf },
  { to: "/greenwash-check", label: "Greenwash check", short: "Check", icon: ScanSearch },
  { to: "/ai-chat", label: "Ask AI", short: "Ask AI", icon: MessageCircle },
  { to: "/about", label: "About", icon: null },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <NavLink to="/dashboard" className="shrink-0" aria-label="Home">
            <BrandMark />
          </NavLink>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-primary after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-stitch"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground lg:block">
              {user?.name ?? user?.email ?? "Signed in"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        {children}
      </main>

      <footer className="hidden border-t border-border py-6 text-center text-sm text-muted-foreground md:block">
        Wear It Again. Every rewear counts.
      </footer>

      {/* phone tab bar: the five everyday tools, one tap away */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV_ITEMS.filter((i) => i.icon).map((item) => {
          const Icon = item.icon!;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-secondary",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  {"short" in item ? item.short : item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

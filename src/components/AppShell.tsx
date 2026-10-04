import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "home" },
  { to: "/swap-board", label: "swap_board" },
  { to: "/rewear", label: "rewear" },
  { to: "/calculator", label: "impact_calc" },
  { to: "/greenwash-check", label: "greenwash_check" },
  { to: "/ai-chat", label: "ai_chat" },
  { to: "/about", label: "about" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex size-7 items-center justify-center rounded-sm border border-border bg-ok/10 text-ok font-bold">
              ♻
            </span>
            <span className="hidden font-semibold tracking-tight sm:block">
              wear-it-again
            </span>
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto term-scroll">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-sm px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-ok/15 text-ok font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <span className="text-ok/70">./</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden text-xs text-muted-foreground md:block">
              {user?.name ?? user?.email ?? "rewearer"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleSignOut}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">exit</span>
            </Button>
          </div>
        </div>
      </header>      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Wear It Again v1.0 — reworn, not reborn ·{" "}
        <RefreshCw className="inline size-3" /> every rewear counts
      </footer>
    </div>
  );
}

import { RewearAction } from "@/components/RewearAction";
import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { ArrowRight, MessageSquareText, Repeat2, Shuffle } from "lucide-react";
import { Link } from "react-router";

const QUICK_LINKS = [
  {
    to: "/swap-board",
    icon: Shuffle,
    label: "swap_board",
    desc: "Post an item or claim one",
  },
  {
    to: "/rewear",
    icon: Repeat2,
    label: "rewear",
    desc: "Live leaderboard standings",
  },
  {
    to: "/ai-chat",
    icon: MessageSquareText,
    label: "ai_chat",
    desc: "Ask about sustainable fashion",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const mySwapItems = useQuery(api.swapItems.mine);
  const leaderboard = useQuery(api.leaderboard.list);

  const itemsPosted = mySwapItems?.length ?? 0;
  const itemsClaimed = mySwapItems?.filter((i) => i.claimed).length ?? 0;
  const totalPlayers = leaderboard?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> whoami
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.name || user?.email || "student"}@campus:~
        </h1>
        <p className="text-sm text-muted-foreground">
          Rewearing is the most sustainable outfit you own.
        </p>
      </div>

      {/* V1 hero feature: rewear button + my points */}
      <RewearAction />

      {/* quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <TermWindow title="stats --items-posted">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            items posted
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {mySwapItems === undefined ? "…" : itemsPosted}
          </p>
        </TermWindow>
        <TermWindow title="stats --items-claimed">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            your items claimed
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {mySwapItems === undefined ? "…" : itemsClaimed}
          </p>
        </TermWindow>
        <TermWindow title="stats --players">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            students in challenge
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {leaderboard === undefined ? "…" : totalPlayers}
          </p>
        </TermWindow>
      </div>

      {/* quick links */}
      <TermWindow title="ls ./programs">
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group rounded-md border border-border bg-background p-4 transition-colors hover:border-ok/50 hover:bg-ok/5"
            >
              <div className="flex items-center gap-2 text-ok">
                <l.icon className="size-4" />
                <span className="font-semibold">
                  <span className="text-ok/70">./</span>
                  {l.label}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{l.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                run <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </TermWindow>
    </div>
  );
}

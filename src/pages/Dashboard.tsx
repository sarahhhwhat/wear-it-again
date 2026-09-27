import { RewearAction } from "@/components/RewearAction";
import { TermWindow } from "@/components/TermWindow";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  MessageSquareText,
  Repeat2,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link } from "react-router";

const QUICK_LINKS = [
  {
    to: "/swap-board",
    icon: Repeat2,
    label: "swap_board",
    desc: "Browse the rack, post an item, claim a find",
  },
  {
    to: "/rewear",
    icon: Repeat2,
    label: "rewear",
    desc: "Log today's rewear and see the standings",
  },
  {
    to: "/ai-chat",
    icon: MessageSquareText,
    label: "ai_chat",
    desc: "Ask anything about sustainable fashion",
  },
];

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const mySwapItems = useQuery(api.swapItems.mine);
  const purchases = useQuery(api.orders.myPurchases);
  const sales = useQuery(api.orders.mySales);

  const itemsPosted = mySwapItems?.length ?? 0;
  const itemsClaimed = mySwapItems?.filter((i) => i.claimed).length ?? 0;
  const orders = purchases?.length ?? 0;

  const firstName = user?.name?.split(" ")[0] ?? user?.email ?? "friend";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> whoami
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          hey {firstName} — wardrobe:~
        </h1>
        <p className="text-sm text-muted-foreground">
          The greenest outfit is the one you already own.
        </p>
      </div>

      {/* V1 hero feature: rewear button + my points */}
      <RewearAction />

      {/* quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <TermWindow title="stats --listed">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            items you've listed
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {mySwapItems === undefined ? "…" : itemsPosted}
          </p>
        </TermWindow>
        <TermWindow title="stats --rehomed">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            items rehomed
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {mySwapItems === undefined ? "…" : itemsClaimed}
          </p>
        </TermWindow>
        <TermWindow title="stats --orders">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            items you picked up
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-ok">
            {purchases === undefined ? "…" : orders}
          </p>
        </TermWindow>
      </div>

      {/* orders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TermWindow title="orders --purchases" bodyClassName="p-3 sm:p-4">
          {purchases === undefined ? (
            <p className="p-2 text-sm text-muted-foreground">loading…</p>
          ) : purchases.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              Nothing picked up yet.{" "}
              <Link
                to="/swap-board"
                className="text-primary underline-offset-4 hover:underline"
              >
                Browse the rack →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {purchases.slice(0, 4).map((o) => (
                <li
                  key={o._id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    to={`/swap-board/${o.itemId}`}
                    className="min-w-0 truncate text-sm hover:text-ok"
                  >
                    {o.itemTitle}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {money(o.amountCents)}{" "}
                    <span className="text-xs font-normal text-ok">
                      ({o.status})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TermWindow>

        <TermWindow title="orders --sales" bodyClassName="p-3 sm:p-4">
          {sales === undefined ? (
            <p className="p-2 text-sm text-muted-foreground">loading…</p>
          ) : sales.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              No sales yet — price a listing and it will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {sales.slice(0, 4).map((o) => (
                <li
                  key={o._id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    to={`/swap-board/${o.itemId}`}
                    className="min-w-0 truncate text-sm hover:text-ok"
                  >
                    {o.itemTitle}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {money(o.amountCents)}{" "}
                    <span className="text-xs font-normal text-ok">
                      ({o.status})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TermWindow>
      </div>

      {/* quick links */}
      <TermWindow title="ls ./programs">
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className="group rounded-md border border-border bg-background p-4 transition-colors hover:border-ok/50 hover:bg-ok/5"
            >
              <div className="flex items-center gap-2 text-ok">
                {i === 0 ? (
                  <Store className="size-4" />
                ) : (
                  <l.icon className="size-4" />
                )}
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

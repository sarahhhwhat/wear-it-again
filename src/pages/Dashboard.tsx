import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RewearAction } from "@/components/RewearAction";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { CalendarCheck, MessageCircle, Repeat2, ScanSearch } from "lucide-react";
import { Link } from "react-router";

const QUICK_LINKS = [
  {
    to: "/swap-board",
    icon: Repeat2,
    label: "Swap board",
    desc: "Browse the rack, post an item, claim a find.",
  },
  {
    to: "/greenwash-check",
    icon: ScanSearch,
    label: "Greenwash check",
    desc: "Test a brand's claim before you buy.",
  },
  {
    to: "/ai-chat",
    icon: MessageCircle,
    label: "Ask AI",
    desc: "Questions about materials, care and repair.",
  },
  {
    to: "/rewear",
    icon: CalendarCheck,
    label: "Leaderboard",
    desc: "See who is rewearing the most.",
  },
];

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function Count({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold tabular-nums text-primary">
        {value}
      </p>
    </div>
  );
}

function OrderList({
  rows,
  empty,
}: {
  rows: { _id: string; itemId: string; itemTitle: string; amountCents: number; status: string }[] | undefined;
  empty: React.ReactNode;
}) {
  if (rows === undefined)
    return <p className="text-sm text-muted-foreground">Loading</p>;
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="divide-y divide-border">
      {rows.slice(0, 4).map((o) => (
        <li
          key={o._id}
          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <Link
            to={`/swap-board/${o.itemId}`}
            className="min-w-0 truncate font-medium hover:text-primary"
          >
            {o.itemTitle}
          </Link>
          <span className="shrink-0 text-sm tabular-nums">
            {money(o.amountCents)}{" "}
            <span className="text-muted-foreground">({o.status})</span>
          </span>
        </li>
      ))}
    </ul>
  );
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Hi ${firstName}`}
        description="The greenest outfit is the one you already own."
      />

      <RewearAction />

      <div className="grid gap-4 sm:grid-cols-3">
        <Count label="Items you've listed" value={mySwapItems === undefined ? "…" : itemsPosted} />
        <Count label="Items rehomed" value={mySwapItems === undefined ? "…" : itemsClaimed} />
        <Count label="Items you picked up" value={purchases === undefined ? "…" : orders} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Your pickups">
          <OrderList
            rows={purchases}
            empty={
              <>
                Nothing picked up yet.{" "}
                <Link to="/swap-board" className="font-medium text-primary hover:underline">
                  Browse the rack
                </Link>
              </>
            }
          />
        </Panel>
        <Panel title="Your sales">
          <OrderList
            rows={sales}
            empty="No sales yet. Add a price to a listing and it will show up here."
          />
        </Panel>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Jump back in</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/50"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <l.icon className="size-5" />
              </span>
              <p className="mt-3 font-display font-semibold">{l.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

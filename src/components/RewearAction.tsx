import { Button } from "@/components/ui/button";
import { Panel } from "@/components/Panel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Loader2, Repeat2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function sameUtcDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/70 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-3xl font-bold tabular-nums">
        {value}
      </p>
    </div>
  );
}

/** "I rewore something today" panel: 10 pts, once per day per user. */
export function RewearAction() {
  const me = useQuery(api.leaderboard.me);
  const logRewear = useMutation(api.leaderboard.logRewear);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyToday =
    me?.lastLoggedAt != null && sameUtcDay(me.lastLoggedAt, Date.now());

  const handleLog = async () => {
    setPending(true);
    setError(null);
    try {
      await logRewear({});
      // reactive queries update points + leaderboard automatically
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^Uncaught Error: /, "")
          : "Failed to log rewear.",
      );
    } finally {
      setPending(false);
    }
  };

  const canLog = me !== undefined && !alreadyToday && !pending;

  return (
    <Panel stitched bodyClassName="p-6 sm:p-7">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Did you rewear something today?
          </h2>
          <p className="mt-1 text-muted-foreground">
            Log it once a day and earn 10 points.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Points" value={me === undefined ? "…" : (me?.points ?? 0)} />
          <Stat label="Rank" value={me?.rank != null ? `#${me.rank}` : "–"} />
          <Stat
            label="Today"
            value={me === undefined ? "…" : alreadyToday ? "Logged" : "Open"}
          />
        </div>

        <Button
          size="lg"
          onClick={handleLog}
          disabled={!canLog}
          className="h-12 text-base font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Logging
            </>
          ) : alreadyToday ? (
            <>
              <CheckCircle2 className="size-5" /> Logged. See you tomorrow
            </>
          ) : (
            <>
              <Repeat2 className="size-5" /> I rewore something today
            </>
          )}
        </Button>

        {error && (
          <p className="rounded-lg border border-warn/40 bg-accent px-3 py-2 text-sm text-warn">
            {error}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Want to see where you stand?{" "}
          <Link to="/rewear" className="font-medium text-primary hover:underline">
            Open the leaderboard
          </Link>
        </p>
      </div>
    </Panel>
  );
}

import { Button } from "@/components/ui/button";
import { TermWindow } from "@/components/TermWindow";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Loader2, Repeat2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function todayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function sameUtcDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
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
    <TermWindow title="rewear --log-today">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs text-muted-foreground">
            <span className="text-ok">$</span> wear-it-again rewear-challenge
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Rewear Challenge
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rewearing beats rebuying. Log it once a day, earn{" "}
            <span className="text-ok font-semibold">+10 points</span>.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-md border border-border bg-muted/60 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              my points
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-ok">
              {me === undefined ? "…" : (me?.points ?? 0)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/60 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              my rank
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {me?.rank != null ? `#${me.rank}` : "—"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/60 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              status today
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${alreadyToday ? "text-warn" : "text-ok"}`}
            >
              {me === undefined ? "…" : alreadyToday ? "DONE" : "OPEN"}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleLog}
          disabled={!canLog}
          className="h-12 text-base font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-5 animate-spin" /> logging…
            </>
          ) : alreadyToday ? (
            <>
              <CheckCircle2 className="size-5" /> logged today — see you tomorrow
            </>
          ) : (
            <>
              <Repeat2 className="size-5" /> I rewore something today (+10)
            </>
          )}
        </Button>

        {error && (
          <p className="rounded border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn">
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Watching the live leaderboard?{" "}
          <Link
            to="/rewear"
            className="text-primary underline-offset-4 hover:underline"
          >
            open ./rewear →
          </Link>
        </p>
      </div>
    </TermWindow>
  );
}

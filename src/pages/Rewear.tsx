import { RewearAction } from "@/components/RewearAction";
import { TermWindow } from "@/components/TermWindow";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rewear() {
  const { user } = useAuth();
  const leaderboard = useQuery(api.leaderboard.list);

  const meUserId = user?._id;
  const topThree = (leaderboard ?? []).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <span className="text-ok">$</span> ./rewear --leaderboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Rewear Challenge
        </h1>
        <p className="text-sm text-muted-foreground">
          Log a rewear once a day for +10 points. Live standings below.
        </p>
      </div>

      <RewearAction />

      <TermWindow title="leaderboard --live" bodyClassName="p-0 sm:p-0">
        {leaderboard === undefined ? (
          <p className="p-6 text-sm text-muted-foreground">loading standings…</p>
        ) : leaderboard.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No one has logged yet. Be the first — hit the button above.
          </p>
        ) : (
          <div className="overflow-x-auto term-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">rewearer</th>
                  <th className="px-4 py-3 text-right font-medium">points</th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    last log
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => {
                  const isMe = meUserId != null && row.userId === meUserId;
                  return (
                    <tr
                      key={row._id}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        isMe && "bg-ok/10",
                      )}
                    >
                      <td className="px-4 py-3 tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          {row.rank === 1 ? (
                            <Crown className="size-3.5 text-warn" />
                          ) : row.rank <= 3 ? (
                            <Medal className="size-3.5 text-ok" />
                          ) : null}
                          {row.rank}
                        </span>
                      </td>
                      <td className="max-w-40 truncate px-4 py-3">
                        {isMe ? (
                          <span className="font-semibold text-ok">
                            you ({row.name})
                          </span>
                        ) : (
                          row.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {row.points}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-xs tabular-nums text-muted-foreground sm:table-cell">
                        {row.lastLoggedAt
                          ? new Date(row.lastLoggedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TermWindow>

      <p className="text-xs text-muted-foreground">
        {topThree.length > 0
          ? `Top of the board: ${topThree.map((r) => r.name).join(", ")}.`
          : "Standings update in real time."}
      </p>
    </div>
  );
}

import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RewearAction } from "@/components/RewearAction";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Crown, Medal } from "lucide-react";

export default function Rewear() {
  const { user } = useAuth();
  const leaderboard = useQuery(api.leaderboard.list);

  const meUserId = user?._id;
  const topThree = (leaderboard ?? []).slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Rewear challenge"
        description="Log a rewear once a day for 10 points. The standings update live."
      />

      <RewearAction />

      <Panel title="Leaderboard" bodyClassName="p-0">
        {leaderboard === undefined ? (
          <p className="p-6 text-sm text-muted-foreground">Loading standings</p>
        ) : leaderboard.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No one has logged yet. Be the first and hit the button above.
          </p>
        ) : (
          <div className="soft-scroll overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Rewearer</th>
                  <th className="px-5 py-3 text-right font-medium">Points</th>
                  <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">
                    Last logged
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
                        isMe && "bg-accent",
                      )}
                    >
                      <td className="px-5 py-3 tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          {row.rank === 1 ? (
                            <Crown className="size-4 text-stitch" />
                          ) : row.rank <= 3 ? (
                            <Medal className="size-4 text-primary" />
                          ) : null}
                          {row.rank}
                        </span>
                      </td>
                      <td className="max-w-40 truncate px-5 py-3">
                        {isMe ? (
                          <span className="font-semibold">You ({row.name})</span>
                        ) : (
                          row.name
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {row.points}
                      </td>
                      <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                        {row.lastLoggedAt
                          ? new Date(row.lastLoggedAt).toLocaleDateString()
                          : "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-sm text-muted-foreground">
        {topThree.length > 0
          ? `Top of the board: ${topThree.map((r) => r.name).join(", ")}.`
          : "Standings update in real time."}
      </p>
    </div>
  );
}

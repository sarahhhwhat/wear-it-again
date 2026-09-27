import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ---------- public API ----------

/** The signed-in user's leaderboard row (points, rank, last log time). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const row = await ctx.db
      .query("leaderboard")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!row) return { points: 0, rank: null, lastLoggedAt: null };

    const all = await ctx.db.query("leaderboard").collect();
    const sorted = [...all].sort((a, b) => b.points - a.points);
    const rank = sorted.findIndex((r) => r._id === row._id) + 1;
    return { points: row.points, rank, lastLoggedAt: row.lastLoggedAt ?? null };
  },
});

/** Full leaderboard, sorted by points descending. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leaderboard").collect();
    const sorted = [...rows].sort(
      (a, b) => b.points - a.points || a._creationTime - b._creationTime,
    );
    return sorted.map((row, i) => ({
      _id: row._id,
      userId: row.userId,
      name: row.name,
      points: row.points,
      lastLoggedAt: row.lastLoggedAt ?? null,
      rank: i + 1,
    }));
  },
});

/**
 * Log "I rewore something today" — adds 10 points, once per calendar day
 * per user (UTC).
 */
export const logRewear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    const name =
      user?.name?.trim() ||
      user?.email?.split("@")[0] ||
      `rewearer-${userId.slice(-4)}`;

    const row = await ctx.db
      .query("leaderboard")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const now = Date.now();
    if (row?.lastLoggedAt) {
      const last = new Date(row.lastLoggedAt);
      const today = new Date(now);
      const sameUtcDay =
        last.getUTCFullYear() === today.getUTCFullYear() &&
        last.getUTCMonth() === today.getUTCMonth() &&
        last.getUTCDate() === today.getUTCDate();
      if (sameUtcDay) {
        throw new ConvexError("Already logged today — come back tomorrow!");
      }
    }

    const delta = 10;
    if (row) {
      await ctx.db.patch(row._id, { points: row.points + delta, lastLoggedAt: now });
    } else {
      await ctx.db.insert("leaderboard", {
        userId,
        name,
        points: delta,
        lastLoggedAt: now,
      });
    }
    return { ok: true as const, points: (row?.points ?? 0) + delta };
  },
});

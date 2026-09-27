import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Comments on an item, oldest first. */
export const list = query({
  args: { itemId: v.id("swapItems") },
  handler: async (ctx, { itemId }) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .order("asc")
      .collect();
  },
});

/** Add a comment to an item. */
export const add = mutation({
  args: { itemId: v.id("swapItems"), body: v.string() },
  handler: async (ctx, { itemId, body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to comment.");

    const clean = body.trim().slice(0, 500);
    if (clean.length === 0) throw new ConvexError("Write something first.");

    const user = await ctx.db.get(userId);
    const name =
      user?.name?.trim() ||
      user?.email?.split("@")[0] ||
      `rewearer-${userId.slice(-4)}`;

    await ctx.db.insert("comments", { itemId, userId, name, body: clean });
    return { ok: true as const };
  },
});

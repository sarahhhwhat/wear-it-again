import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
] as const;

export const categories = query({
  args: {},
  handler: () => CATEGORIES,
});

/** All swap items, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("swapItems")
      .withIndex("by_creation_time")
      .order("desc")
      .take(200);

    const users = await Promise.all(
      rows.map((row) => ctx.db.get(row.postedBy)),
    );

    return rows.map((row, i) => ({
      _id: row._id,
      title: row.title,
      category: row.category,
      size: row.size,
      contact: row.contact,
      claimed: row.claimed,
      createdAt: row._creationTime,
      posterName: users[i]?.name ?? "unknown",
      posterEmail: users[i]?.email ?? undefined,
      isMine: false, // filled in on the client via currentUserId comparison
    }));
  },
});

/** Items posted by the signed-in user. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("swapItems")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", userId))
      .order("desc")
      .collect();
    return rows.map((row) => ({
      _id: row._id,
      title: row.title,
      category: row.category,
      size: row.size,
      contact: row.contact,
      claimed: row.claimed,
      createdAt: row._creationTime,
      posterName: null as string | null,
      posterEmail: null as string | null,
      isMine: true,
    }));
  },
});

/** Post a new swap item. */
export const post = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    size: v.string(),
    contact: v.string(),
  },
  handler: async (ctx, { title, category, size, contact }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const cleanTitle = title.trim().slice(0, 120);
    const cleanContact = contact.trim().slice(0, 120);
    if (cleanTitle.length === 0) {
      throw new ConvexError("Title must be 1-120 characters");
    }
    if (cleanContact.length === 0) {
      throw new ConvexError("Contact must be 1-120 characters");
    }

    await ctx.db.insert("swapItems", {
      title: cleanTitle,
      category,
      size,
      postedBy: userId,
      contact: cleanContact,
      claimed: false,
    });
    return { ok: true as const };
  },
});

/** Claim an unclaimed item that isn't yours. */
export const claim = mutation({
  args: { id: v.id("swapItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const item = await ctx.db.get(id);
    if (!item) throw new ConvexError("Item not found");
    if (item.claimed) throw new ConvexError("Item already claimed");
    if (item.postedBy === userId) {
      throw new ConvexError("You can't claim your own item");
    }

    await ctx.db.patch(id, { claimed: true });
    return { ok: true as const };
  },
});

/** Un-claim one of your claims (accidental click recovery). */
export const unclaim = mutation({
  args: { id: v.id("swapItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const item = await ctx.db.get(id);
    if (!item) throw new ConvexError("Item not found");
    if (!item.claimed) throw new ConvexError("Item isn't claimed");

    await ctx.db.patch(id, { claimed: false });
    return { ok: true as const };
  },
});

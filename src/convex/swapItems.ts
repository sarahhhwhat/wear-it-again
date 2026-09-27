import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Create a new listing. */
export const post = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    size: v.string(),
    contact: v.string(),
    description: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    imageDataUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to post an item.");

    const title = args.title.trim().slice(0, 120);
    if (title.length === 0) throw new ConvexError("Give your item a title.");

    const contact = args.contact.trim().slice(0, 120);
    if (contact.length === 0) {
      throw new ConvexError("Add a contact so people can reach you.");
    }

    const priceCents =
      args.priceCents != null && args.priceCents > 0
        ? Math.round(args.priceCents)
        : undefined;

    const imageDataUrl =
      args.imageDataUrl &&
      args.imageDataUrl.length > 0 &&
      args.imageDataUrl.length <= 700_000
        ? args.imageDataUrl
        : undefined;

    return await ctx.db.insert("swapItems", {
      title,
      category: args.category,
      size: args.size,
      contact,
      description: args.description?.trim().slice(0, 1000) || undefined,
      priceCents,
      imageDataUrl,
      postedBy: userId,
      claimed: false,
    });
  },
});

/** Catalog with keyword search (title, description, category) and filters. */
export const list = query({
  args: {
    q: v.optional(v.string()),
    category: v.optional(v.string()),
    claimedFilter: v.optional(
      v.union(v.literal("all"), v.literal("available"), v.literal("claimed")),
    ),
    includeMine: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { q, category, claimedFilter = "available", includeMine = true },
  ) => {
    const userId = await getAuthUserId(ctx);
    const rows = await ctx.db.query("swapItems").order("desc").collect();

    const needle = (q ?? "").trim().toLowerCase();
    return rows
      .filter((row) => {
        if (claimedFilter === "available" && row.claimed) return false;
        if (claimedFilter === "claimed" && !row.claimed) return false;
        if (category && category !== "all" && row.category !== category) {
          return false;
        }
        if (needle) {
          const hay = `${row.title} ${row.description ?? ""} ${row.category}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        if (!includeMine && row.postedBy === userId) return false;
        return true;
      })
      .map((row) => ({
        _id: row._id,
        title: row.title,
        category: row.category,
        size: row.size,
        contact: row.contact,
        claimed: row.claimed,
        priceCents: row.priceCents ?? null,
        description: row.description ?? null,
        hasImage: row.imageDataUrl != null,
        createdAt: row._creationTime,
        isMine: userId != null && row.postedBy === userId,
      }));
  },
});

/** The signed-in user's own listings. */
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
      priceCents: row.priceCents ?? null,
      claimed: row.claimed,
      hasImage: row.imageDataUrl != null,
      createdAt: row._creationTime,
    }));
  },
});

/** Detail page for one item, including seller info and comment count. */
export const getById = query({
  args: { id: v.id("swapItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const item = await ctx.db.get(id);
    if (!item) return null;

    const seller = await ctx.db.get(item.postedBy);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_item", (q) => q.eq("itemId", id))
      .collect();

    return {
      _id: item._id,
      title: item.title,
      category: item.category,
      size: item.size,
      contact: item.contact,
      claimed: item.claimed,
      priceCents: item.priceCents ?? null,
      description: item.description ?? null,
      imageDataUrl: item.imageDataUrl ?? null,
      createdAt: item._creationTime,
      sellerName: seller?.name ?? null,
      sellerEmail: seller?.email ?? null,
      isMine: userId != null && item.postedBy === userId,
      commentCount: comments.length,
    };
  },
});

/** Claim an item (free swap flow). */
export const claim = mutation({
  args: { id: v.id("swapItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in first.");

    const item = await ctx.db.get(id);
    if (!item) throw new ConvexError("Item not found.");
    if (item.claimed) throw new ConvexError("Already claimed.");
    if (item.postedBy === userId) {
      throw new ConvexError("That's your own listing.");
    }

    await ctx.db.patch(id, {
      claimed: true,
      claimedBy: userId,
      claimedAt: Date.now(),
    });
    return { ok: true as const };
  },
});

/** Seller: put a claimed item back on the board. */
export const unclaim = mutation({
  args: { id: v.id("swapItems") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in first.");

    const item = await ctx.db.get(id);
    if (!item) throw new ConvexError("Item not found.");
    if (item.postedBy !== userId) {
      throw new ConvexError("Only the poster can un-claim an item.");
    }

    await ctx.db.patch(id, {
      claimed: false,
      claimedBy: undefined,
      claimedAt: undefined,
    });
    return { ok: true as const };
  },
});

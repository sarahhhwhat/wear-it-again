import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Orders the signed-in user bought. */
export const myPurchases = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.itemId);
        return {
          _id: row._id,
          itemId: row.itemId,
          itemTitle: item?.title ?? "(deleted listing)",
          itemImage: item?.imageDataUrl ?? null,
          amountCents: row.amountCents,
          status: row.status,
          createdAt: row._creationTime,
        };
      }),
    );
  },
});

/** Orders for items the signed-in user sold. */
export const mySales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.itemId);
        return {
          _id: row._id,
          itemId: row.itemId,
          itemTitle: item?.title ?? "(deleted listing)",
          amountCents: row.amountCents,
          status: row.status,
          createdAt: row._creationTime,
        };
      }),
    );
  },
});

/** Create a pending order for a priced item (checkout entry point). */
export const createPending = mutation({
  args: { itemId: v.id("swapItems") },
  handler: async (ctx, { itemId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in to buy.");

    const item = await ctx.db.get(itemId);
    if (!item) throw new ConvexError("Item not found.");
    if (item.priceCents == null) {
      throw new ConvexError("This item is swap-only — use Claim instead.");
    }
    if (item.claimed) throw new ConvexError("Already taken.");
    if (item.postedBy === userId) {
      throw new ConvexError("That's your own listing.");
    }

    const id = await ctx.db.insert("orders", {
      itemId,
      buyerId: userId,
      sellerId: item.postedBy,
      amountCents: item.priceCents,
      status: "pending",
    });
    return { orderId: id };
  },
});

/** Mark an order paid (called by the checkout confirmation flow). */
export const markPaid = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Sign in first.");

    const order = await ctx.db.get(orderId);
    if (!order) throw new ConvexError("Order not found.");
    if (order.buyerId !== userId) {
      throw new ConvexError("This order belongs to someone else.");
    }

    await ctx.db.patch(orderId, { status: "paid" });

    const item = await ctx.db.get(order.itemId);
    if (item && !item.claimed) {
      await ctx.db.patch(order.itemId, {
        claimed: true,
        claimedBy: userId,
        claimedAt: Date.now(),
      });
    }
    return { ok: true as const };
  },
});

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---- Wear It Again ----

    // Items listed on the swap board
    swapItems: defineTable({
      title: v.string(),
      category: v.string(),
      size: v.string(),
      postedBy: v.id("users"),
      contact: v.string(),
      claimed: v.boolean(),
      // optional sale price; null means "swap only" (no checkout)
      priceCents: v.optional(v.number()),
      // who claimed/bought the item (set on claim or successful checkout)
      claimedBy: v.optional(v.id("users")),
      claimedAt: v.optional(v.number()),
      // short description shown on the detail page
      description: v.optional(v.string()),
      // uploaded photo stored as a data URL string (small images only)
      imageDataUrl: v.optional(v.string()),
    })
      .index("by_postedBy", ["postedBy"])
      .index("by_claimed", ["claimed"])
      .index("by_claimedBy", ["claimedBy"]),

    // Comments on a swap item's detail page
    comments: defineTable({
      itemId: v.id("swapItems"),
      userId: v.id("users"),
      name: v.string(),
      body: v.string(),
    }).index("by_item", ["itemId"]),

    // Purchases made through checkout
    orders: defineTable({
      itemId: v.id("swapItems"),
      buyerId: v.id("users"),
      sellerId: v.id("users"),
      amountCents: v.number(),
      // "pending" until payment confirms; "paid" after checkout completes
      status: v.union(v.literal("pending"), v.literal("paid")),
    })
      .index("by_item", ["itemId"])
      .index("by_buyer", ["buyerId"])
      .index("by_seller", ["sellerId"]),

    // Rewear challenge points; one row per user
    leaderboard: defineTable({
      userId: v.id("users"),
      name: v.string(),
      points: v.number(),
      lastLoggedAt: v.optional(v.number()),
    })
      .index("by_userId", ["userId"])
      .index("by_points", ["points"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

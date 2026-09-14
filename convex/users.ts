import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Demo identity helper — anyone who knows the deployment URL can create users by email.
 * Not real auth. Email is normalized; invalid shapes are rejected. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isPlausibleEmail(email: string): boolean {
  // Intentionally light: demo gate, not RFC validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
  },
});

export const ensureByEmail = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, { email, name }) => {
    const normalized = normalizeEmail(email);
    if (!isPlausibleEmail(normalized)) {
      throw new Error("Invalid email");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email: normalized,
      name,
      createdAt: Date.now(),
    });
  },
});

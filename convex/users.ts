import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		return await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();
	},
});

export const ensureByEmail = mutation({
	args: { email: v.string(), name: v.optional(v.string()) },
	handler: async (ctx, { email, name }) => {
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();

		if (existing) {
			return existing._id;
		}

		return await ctx.db.insert("users", {
			email,
			name,
			createdAt: Date.now(),
		});
	},
});


import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query("savedSearches")
			.withIndex("by_user_sortOrder", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		userId: v.id("users"),
		name: v.string(),
		searchState: v.any(),
		isPublic: v.optional(v.boolean()),
	},
	handler: async (ctx, { userId, name, searchState, isPublic }) => {
		// newest first by default: negative timestamp sortOrder is an easy stable sort key.
		const now = Date.now();
		return await ctx.db.insert("savedSearches", {
			userId,
			name,
			searchState,
			sortOrder: -now,
			updatedAt: now,
			isPublic: isPublic ?? false,
		});
	},
});

export const rename = mutation({
	args: { id: v.id("savedSearches"), name: v.string() },
	handler: async (ctx, { id, name }) => {
		await ctx.db.patch(id, { name, updatedAt: Date.now() });
	},
});

export const remove = mutation({
	args: { id: v.id("savedSearches") },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	},
});


import { v } from "convex/values";
import { query } from "./_generated/server";
import { autocompleteTypeValidator } from "./autocompleteTypes";

/**
 * Values live in `autocompleteValues` (deduped by string + `types[]`).
 * Facet browse without a query uses `autocompleteTypeIndex`; text search uses one shared
 * search index on `value` then filters by facet `type`.
 */
export const getOptions = query({
	args: {
		type: autocompleteTypeValidator,
		query: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { type, query, limit }) => {
		const max = Math.min(Math.max(limit ?? 50, 1), 1000);
		const q = (query ?? "").trim();

		if (q.length > 0) {
			const oversample = Math.min(max * 8, 2500);
			const hits = await ctx.db
				.query("autocompleteValues")
				.withSearchIndex("search_value", (q2) => q2.search("value", q))
				.take(oversample);
			const filtered = hits.filter((d) => d.types.includes(type)).slice(0, max);
			return { suggestions: filtered.map((d) => d.value) };
		}

		const links = await ctx.db
			.query("autocompleteTypeIndex")
			.withIndex("by_type", (q2) => q2.eq("type", type))
			.take(max);
		const rows = await Promise.all(links.map((l) => ctx.db.get(l.valueId)));
		const suggestions = rows.filter((d): d is NonNullable<typeof d> => d !== null).map((d) => d.value);
		return { suggestions };
	},
});

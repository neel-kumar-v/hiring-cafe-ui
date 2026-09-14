import { v } from "convex/values";
import { query } from "./_generated/server";
import { autocompleteTypeValidator } from "./autocompleteTypes";

/**
 * Values live in `autocompleteValues` (deduped by string + `types[]`).
 * Facet browse without a query uses `autocompleteTypeIndex`.
 * Text search uses type-scoped `search_value_by_type` on the type index
 * (falls back to shared-value oversample when denormalized `value` is missing).
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
      const typedHits = await ctx.db
        .query("autocompleteTypeIndex")
        .withSearchIndex("search_value_by_type", (q2) => q2.search("value", q).eq("type", type))
        .take(max);

      const fromTyped = typedHits.map((d) => d.value).filter((value): value is string => typeof value === "string" && value.length > 0);

      if (fromTyped.length > 0 || typedHits.length > 0) {
        // Prefer type-scoped results; if links lack denormalized value, resolve via valueId.
        if (fromTyped.length >= typedHits.length) {
          return { suggestions: fromTyped.slice(0, max) };
        }
        const resolved = await Promise.all(typedHits.map(async (link) => link.value ?? (await ctx.db.get(link.valueId))?.value ?? null));
        return { suggestions: resolved.filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, max) };
      }

      // Legacy fallback before type-index values are backfilled / re-seeded.
      const oversample = Math.min(Math.max(max * 4, max), 400);
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
    const suggestions = (
      await Promise.all(links.map(async (l) => l.value ?? (await ctx.db.get(l.valueId))?.value ?? null))
    ).filter((value): value is string => typeof value === "string" && value.length > 0);
    return { suggestions };
  },
});

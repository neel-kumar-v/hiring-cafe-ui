import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		// Will be populated once auth is added.
		authSubject: v.optional(v.string()),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_authSubject", ["authSubject"])
		.index("by_email", ["email"]),

	jobs: defineTable({
		// Stable identifier from scraped dataset (must be unique).
		externalId: v.string(),

		jobTitle: v.string(),
		companyName: v.string(),

		// Normalized for simple filtering.
		// (We’ll expand these as filter functionality is implemented.)
		workplaceType: v.optional(v.string()), // e.g. remote/hybrid/onsite
		country: v.optional(v.string()),
		region: v.optional(v.string()), // state/province
		city: v.optional(v.string()),

		// Simple text search field for quick parity with SQLite `LIKE`.
		searchText: v.optional(v.string()),

		// Timestamps (ms since epoch).
		dateFetched: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),

		// Full raw job payload (JSON-compatible).
		// NOTE: kept lightweight; heavy fields (e.g. description) are stored in `jobDetails`.
		raw: v.any(),
	})
		.index("by_externalId", ["externalId"])
		.index("by_companyName", ["companyName"])
		.index("by_jobTitle", ["jobTitle"])
		.index("by_workplaceType", ["workplaceType"])
		.index("by_workplaceType_companyName", ["workplaceType", "companyName"])
		.searchIndex("search_searchText", {
			searchField: "searchText",
			filterFields: ["companyName", "jobTitle", "workplaceType"],
		}),

	jobDetails: defineTable({
		// Stable identifier from scraped dataset (must be unique).
		externalId: v.string(),
		// Full raw payload (including large description text).
		raw: v.any(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_externalId", ["externalId"]),

	savedSearches: defineTable({
		userId: v.id("users"),
		name: v.string(),
		// JSON-compatible object representing filter state.
		searchState: v.any(),
		sortOrder: v.number(),
		updatedAt: v.number(),
		isPublic: v.boolean(),
	})
		.index("by_user_sortOrder", ["userId", "sortOrder"])
		.index("by_user_updatedAt", ["userId", "updatedAt"])
		.index("by_public", ["isPublic"]),

	searchOptions: defineTable({
		type: v.string(),
		value: v.string(),
	})
		.index("by_type", ["type"])
		.searchIndex("search_value", {
			searchField: "value",
			filterFields: ["type"],
		}),
});


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

	companies: defineTable({
		/** Stable slug used for routing (derived from canonical domain when present). */
		companyId: v.string(),
		/** Canonical domain when known (e.g. rogersandhollands.com). */
		canonicalDomain: v.optional(v.string()),
		name: v.string(),
		nameLower: v.optional(v.string()),

		homepageUri: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		tagline: v.optional(v.string()),
		description: v.optional(v.string()),

		yearFounded: v.optional(v.number()),
		numEmployees: v.optional(v.number()),
		hqCountry: v.optional(v.string()),
		industries: v.array(v.string()),
		activities: v.array(v.string()),

		/** Small preview list for company pages (max 5, maintained during ingestion). */
		jobIdsPreview: v.array(v.id("jobs")),

		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_companyId", ["companyId"])
		.index("by_canonicalDomain", ["canonicalDomain"])
		.index("by_nameLower", ["nameLower"]),

	jobs: defineTable({
		/** Stable identifier from scraped dataset (must be unique). */
		externalId: v.string(),

		title: v.string(),
		applyUrl: v.optional(v.string()),

		companyId: v.id("companies"),

		/** For quick display and full-text search; should include title/company/summary/etc. */
		searchText: v.string(),

		/** Dialog payload lives in `jobDetails`. */
		detailsId: v.id("jobDetails"),

		// --- Card fields ---
		workplaceType: v.optional(v.string()), // Remote/Hybrid/Onsite
		commitment: v.array(v.string()), // Full Time, Part Time, etc.

		workplaceCities: v.array(v.string()),
		workplaceStates: v.array(v.string()),
		workplaceCountries: v.array(v.string()),
		workplaceContinents: v.array(v.string()),

		geoloc: v.array(v.object({ lat: v.number(), lon: v.number() })),

		minIcYoe: v.optional(v.number()),
		minMgmtYoe: v.optional(v.number()),

		requirementsSummary: v.optional(v.string()),
		skills: v.array(v.string()),

		estimatedPublishDate: v.optional(v.string()),
		estimatedPublishDateMillis: v.optional(v.number()),

		views: v.number(),
		saves: v.number(),
		applies: v.number(),

		// --- Advanced search fields (mirrors `src/types/search.d.ts`) ---
		department: v.optional(v.string()),

		// Salary / compensation
		listedCompensationCurrency: v.optional(v.string()),
		listedCompensationFrequency: v.optional(v.string()),
		isCompensationTransparent: v.optional(v.boolean()),
		hourlyMinComp: v.optional(v.number()),
		hourlyMaxComp: v.optional(v.number()),
		dailyMinComp: v.optional(v.number()),
		dailyMaxComp: v.optional(v.number()),
		weeklyMinComp: v.optional(v.number()),
		weeklyMaxComp: v.optional(v.number()),
		biWeeklyMinComp: v.optional(v.number()),
		biWeeklyMaxComp: v.optional(v.number()),
		monthlyMinComp: v.optional(v.number()),
		monthlyMaxComp: v.optional(v.number()),
		yearlyMinComp: v.optional(v.number()),
		yearlyMaxComp: v.optional(v.number()),

		// Workplace activity / physical + cognitive requirements
		workplaceEnvironment: v.optional(v.string()),
		workplaceMobility: v.optional(v.string()),
		physicalLaborIntensity: v.optional(v.string()),
		cognitiveDemand: v.optional(v.string()),
		computerUsage: v.optional(v.string()),
		oralCommunicationLevel: v.optional(v.string()),

		// Education
		associatesDegreeRequirement: v.optional(v.string()),
		associatesDegreeFieldsOfStudy: v.array(v.string()),
		bachelorsDegreeRequirement: v.optional(v.string()),
		bachelorsDegreeFieldsOfStudy: v.array(v.string()),
		mastersDegreeRequirement: v.optional(v.string()),
		mastersDegreeFieldsOfStudy: v.array(v.string()),
		doctorateDegreeRequirement: v.optional(v.string()),
		doctorateDegreeFieldsOfStudy: v.array(v.string()),

		// Licenses / certifications
		licensesOrCertifications: v.array(v.string()),
		licensesOrCertificationsNotMentioned: v.optional(v.boolean()),

		securityClearance: v.optional(v.string()),
		languageRequirements: v.array(v.string()),

		// Shifts / availability / on-call / travel
		morningShiftWork: v.optional(v.string()),
		eveningShiftWork: v.optional(v.string()),
		overnightWork: v.optional(v.string()),
		weekendAvailabilityRequired: v.optional(v.boolean()),
		holidayAvailabilityRequired: v.optional(v.boolean()),
		overtimeRequired: v.optional(v.boolean()),
		onCallRequirement: v.optional(v.string()),
		airTravelRequirement: v.optional(v.string()),
		landTravelRequirement: v.optional(v.string()),

		// Benefits + encouraged flags
		generousPaidTimeOff: v.optional(v.boolean()),
		fourDayWorkWeek: v.optional(v.boolean()),
		matching401k: v.optional(v.boolean()),
		generousParentalLeave: v.optional(v.boolean()),
		retirementPlan: v.optional(v.boolean()),
		tuitionReimbursement: v.optional(v.boolean()),
		visaSponsorship: v.optional(v.boolean()),
		relocationAssistance: v.optional(v.boolean()),
		militaryVeterans: v.optional(v.boolean()),
		fairChance: v.optional(v.boolean()),

		// Company-related search fields (denormalized for single-query filtering)
		companyProfit: v.optional(v.string()), // For-Profit | Non-Profit
		companyStage: v.optional(v.string()), // Public | Private
		companyFoundedYear: v.optional(v.number()),
		companyNumEmployees: v.optional(v.number()),
		companyIndustries: v.array(v.string()),
		companyActivities: v.array(v.string()),

		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_externalId", ["externalId"])
		.index("by_companyId", ["companyId"])
		.searchIndex("search_searchText", {
			searchField: "searchText",
			filterFields: [
				"companyId",
				"workplaceType",
				"department",
				"listedCompensationCurrency",
				"listedCompensationFrequency",
			],
		}),

	jobCards: defineTable({
		/** Mirrors jobs.externalId for idempotent upserts and lookup. */
		externalId: v.string(),
		/** Link back to source jobs document so detail lookups stay unchanged. */
		jobId: v.id("jobs"),
		detailsId: v.id("jobDetails"),

		title: v.string(),
		applyUrl: v.optional(v.string()),
		companyId: v.id("companies"),
		/** Stable slug/domain identifier used in routes and filter mapping. */
		companySlug: v.string(),

		searchText: v.string(),

		workplaceType: v.optional(v.string()),
		commitment: v.array(v.string()),
		workplaceCities: v.array(v.string()),
		workplaceStates: v.array(v.string()),
		workplaceCountries: v.array(v.string()),
		workplaceContinents: v.array(v.string()),
		geoloc: v.array(v.object({ lat: v.number(), lon: v.number() })),

		minIcYoe: v.optional(v.number()),
		minMgmtYoe: v.optional(v.number()),
		requirementsSummary: v.optional(v.string()),
		skills: v.array(v.string()),
		estimatedPublishDate: v.optional(v.string()),
		estimatedPublishDateMillis: v.optional(v.number()),
		/** Primary numeric key used for "recent" sorting. */
		sortPublishMillis: v.number(),

		views: v.number(),
		saves: v.number(),
		applies: v.number(),

		department: v.optional(v.string()),
		listedCompensationCurrency: v.optional(v.string()),
		listedCompensationFrequency: v.optional(v.string()),
		isCompensationTransparent: v.optional(v.boolean()),
		hourlyMinComp: v.optional(v.number()),
		hourlyMaxComp: v.optional(v.number()),
		dailyMinComp: v.optional(v.number()),
		dailyMaxComp: v.optional(v.number()),
		weeklyMinComp: v.optional(v.number()),
		weeklyMaxComp: v.optional(v.number()),
		biWeeklyMinComp: v.optional(v.number()),
		biWeeklyMaxComp: v.optional(v.number()),
		monthlyMinComp: v.optional(v.number()),
		monthlyMaxComp: v.optional(v.number()),
		yearlyMinComp: v.optional(v.number()),
		yearlyMaxComp: v.optional(v.number()),

		companyProfit: v.optional(v.string()),
		companyStage: v.optional(v.string()),
		companyFoundedYear: v.optional(v.number()),
		companyNumEmployees: v.optional(v.number()),

		companyName: v.string(),
		companyImageUrl: v.optional(v.string()),
		companyTagline: v.optional(v.string()),
		companyHomepageUri: v.optional(v.string()),
		companyIndustries: v.array(v.string()),
		companyActivities: v.array(v.string()),
		companyHqCountry: v.optional(v.string()),

		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_externalId", ["externalId"])
		.index("by_jobId", ["jobId"])
		.index("by_recent", ["sortPublishMillis"])
		.index("by_companyId_and_recent", ["companyId", "sortPublishMillis"])
		.index("by_workplaceType_and_recent", ["workplaceType", "sortPublishMillis"])
		.index("by_department_and_recent", ["department", "sortPublishMillis"])
		.index("by_currency_and_frequency_and_recent", [
			"listedCompensationCurrency",
			"listedCompensationFrequency",
			"sortPublishMillis",
		])
		.index("by_companyProfit_and_recent", ["companyProfit", "sortPublishMillis"])
		.index("by_companyStage_and_recent", ["companyStage", "sortPublishMillis"])
		.searchIndex("search_searchText", {
			searchField: "searchText",
			filterFields: [
				"companyId",
				"workplaceType",
				"department",
				"listedCompensationCurrency",
				"listedCompensationFrequency",
				"companyProfit",
				"companyStage",
			],
		}),

	jobDetails: defineTable({
		jobId: v.optional(v.id("jobs")),
		description: v.string(),
		roleActivities: v.array(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_jobId", ["jobId"]),

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

	// --- Autocomplete option tables (seeded from `src/data/*.json`) ---
	autocompleteCompanies: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteIndustries: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteCompanyActivities: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteCurrencies: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteLanguages: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteLicenses: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteInvestors: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteRoundTypes: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteJobTitles: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteTechnologies: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteBachelorsFields: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	// Currently unused in UI, but split for completeness.
	autocompleteAssociateFields: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteMasterFields: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteDoctorateFields: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteCompanyHqCountries: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	autocompleteScrapeStates: defineTable({ value: v.string() })
		.index("by_value", ["value"])
		.searchIndex("search_value", { searchField: "value" }),

	/** Denormalized counters (e.g. total jobs) so queries avoid full table scans. */
	counters: defineTable({
		name: v.string(),
		value: v.number(),
		updatedAt: v.number(),
	}).index("by_name", ["name"]),
});


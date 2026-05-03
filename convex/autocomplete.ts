import { v } from "convex/values";
import { query } from "./_generated/server";
import type { AutocompleteType } from "./autocompleteTypes";
import { autocompleteTypeValidator } from "./autocompleteTypes";

function typeToTable(type: AutocompleteType) {
	switch (type) {
		case "companies":
			return "autocompleteCompanies" as const;
		case "industries":
			return "autocompleteIndustries" as const;
		case "company_activities":
			return "autocompleteCompanyActivities" as const;
		case "currencies":
			return "autocompleteCurrencies" as const;
		case "languages":
			return "autocompleteLanguages" as const;
		case "licenses":
			return "autocompleteLicenses" as const;
		case "investors":
			return "autocompleteInvestors" as const;
		case "round_types":
			return "autocompleteRoundTypes" as const;
		case "job_title":
			return "autocompleteJobTitles" as const;
		case "technology_keywords":
		case "description_keywords":
		case "requirements_keywords":
			return "autocompleteTechnologies" as const;
		case "bachelors_degree_titles":
		case "bachelor_fields":
			return "autocompleteBachelorsFields" as const;
		case "associate_fields":
			return "autocompleteAssociateFields" as const;
		case "master_fields":
			return "autocompleteMasterFields" as const;
		case "doctorate_fields":
			return "autocompleteDoctorateFields" as const;
		case "company_hq_country":
			return "autocompleteCompanyHqCountries" as const;
		case "scrape_state":
			return "autocompleteScrapeStates" as const;
	}
}

export const getOptions = query({
	args: {
		type: autocompleteTypeValidator,
		query: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { type, query, limit }) => {
		const max = Math.min(Math.max(limit ?? 50, 1), 1000);
		const q = (query ?? "").trim();
		const table = typeToTable(type);

		const docs =
			q.length > 0
				? await ctx.db
						.query(table)
						.withSearchIndex("search_value", (q2) => q2.search("value", q))
						.take(max)
				: await ctx.db.query(table).withIndex("by_value", (q2) => q2).take(max);

		return { suggestions: docs.map((d) => d.value) };
	},
});


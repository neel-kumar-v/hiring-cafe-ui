import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { AutocompleteType } from "./autocompleteTypes";
import { autocompleteTypeValidator } from "./autocompleteTypes";
import type { Id } from "./_generated/dataModel";

import companiesJson from "../src/data/company_name.json";
import industriesJson from "../src/data/company_industry.json";
import companyActivitiesJson from "../src/data/company_activities.json";
import currenciesJson from "../src/data/currencies.json";
import languagesJson from "../src/data/languages.json";
import licensesJson from "../src/data/licenses_certifications.json";
import investorsJson from "../src/data/investors.json";
import roundTypesJson from "../src/data/latest_round.json";
import jobTitlesJson from "../src/data/job_titles.json";
import technologiesJson from "../src/data/technologies.json";
import associateFieldsJson from "../src/data/associate_fields.json";
import bachelorFieldsJson from "../src/data/bachelor_fields.json";
import masterFieldsJson from "../src/data/master_fields.json";
import doctorateFieldsJson from "../src/data/doctorate_fields.json";
import companyHqCountryJson from "../src/data/company_hq_country.json";

type SuggestionsJson = { suggestions: string[] };

function jsonForType(type: AutocompleteType): SuggestionsJson {
	switch (type) {
		case "companies":
			return companiesJson as SuggestionsJson;
		case "industries":
			return industriesJson as SuggestionsJson;
		case "company_activities":
			return companyActivitiesJson as SuggestionsJson;
		case "currencies":
			return currenciesJson as SuggestionsJson;
		case "languages":
			return languagesJson as SuggestionsJson;
		case "licenses":
			return licensesJson as SuggestionsJson;
		case "investors":
			return investorsJson as SuggestionsJson;
		case "round_types":
			return roundTypesJson as SuggestionsJson;
		case "job_title":
			return jobTitlesJson as SuggestionsJson;
		case "technology_keywords":
		case "description_keywords":
		case "requirements_keywords":
			return technologiesJson as SuggestionsJson;
		case "bachelors_degree_titles":
		case "bachelor_fields":
			return bachelorFieldsJson as SuggestionsJson;
		case "associate_fields":
			return associateFieldsJson as SuggestionsJson;
		case "master_fields":
			return masterFieldsJson as SuggestionsJson;
		case "doctorate_fields":
			return doctorateFieldsJson as SuggestionsJson;
		case "company_hq_country":
			return companyHqCountryJson as SuggestionsJson;
		case "scrape_state":
			return { suggestions: [] };
	}
}

function normalize(value: string) {
	return value.trim();
}

async function upsertValueAndLink(
	ctx: MutationCtx,
	type: AutocompleteType,
	value: string,
): Promise<{ createdNewAssociation: boolean }> {
	const existingValue = await ctx.db
		.query("autocompleteValues")
		.withIndex("by_value", (q) => q.eq("value", value))
		.unique();

	let valueId: Id<"autocompleteValues">;
	if (!existingValue) {
		valueId = await ctx.db.insert("autocompleteValues", { value, types: [type] });
		await ctx.db.insert("autocompleteTypeIndex", { type, valueId });
		return { createdNewAssociation: true };
	}

	valueId = existingValue._id;
	const typesSet = new Set(existingValue.types ?? []);
	const hadType = typesSet.has(type);
	if (!hadType) {
		typesSet.add(type);
		await ctx.db.patch(valueId, { types: Array.from(typesSet) });
	}

	const existingLink = await ctx.db
		.query("autocompleteTypeIndex")
		.withIndex("by_type_and_valueId", (q) => q.eq("type", type).eq("valueId", valueId))
		.unique();
	if (!existingLink) {
		await ctx.db.insert("autocompleteTypeIndex", { type, valueId });
		return { createdNewAssociation: true };
	}

	return { createdNewAssociation: false };
}

export const seedBatch = mutation({
	args: {
		type: autocompleteTypeValidator,
		start: v.optional(v.number()),
		count: v.optional(v.number()),
	},
	handler: async (ctx, { type, start, count }) => {
		const batchStart = Math.max(0, Math.floor(start ?? 0));
		const batchCount = Math.min(Math.max(Math.floor(count ?? 200), 1), 500);

		const json = jsonForType(type);
		const all = Array.isArray(json?.suggestions) ? json.suggestions : [];
		const slice = all.slice(batchStart, batchStart + batchCount);

		let inserted = 0;
		let processed = 0;

		const seen = new Set<string>();
		for (const raw of slice) {
			processed++;
			if (typeof raw !== "string") continue;
			const value = normalize(raw);
			if (!value) continue;
			if (seen.has(value)) continue;
			seen.add(value);

			const { createdNewAssociation } = await upsertValueAndLink(ctx, type, value);
			if (createdNewAssociation) inserted++;
		}

		const nextStart = batchStart + batchCount;
		return {
			type,
			inserted,
			processed,
			start: batchStart,
			nextStart,
			total: all.length,
			done: nextStart >= all.length,
		};
	},
});

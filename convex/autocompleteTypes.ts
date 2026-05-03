import { v } from "convex/values";

export const AUTOCOMPLETE_TYPES = [
	"companies",
	"industries",
	"company_activities",
	"currencies",
	"languages",
	"licenses",
	"investors",
	"round_types",
	"job_title",
	"technology_keywords",
	"description_keywords",
	"requirements_keywords",
	"bachelors_degree_titles",
	"associate_fields",
	"bachelor_fields",
	"master_fields",
	"doctorate_fields",
	"company_hq_country",
	"scrape_state",
] as const;

export type AutocompleteType = (typeof AUTOCOMPLETE_TYPES)[number];

export const autocompleteTypeValidator = v.union(
	v.literal("companies"),
	v.literal("industries"),
	v.literal("company_activities"),
	v.literal("currencies"),
	v.literal("languages"),
	v.literal("licenses"),
	v.literal("investors"),
	v.literal("round_types"),
	v.literal("job_title"),
	v.literal("technology_keywords"),
	v.literal("description_keywords"),
	v.literal("requirements_keywords"),
	v.literal("bachelors_degree_titles"),
	v.literal("associate_fields"),
	v.literal("bachelor_fields"),
	v.literal("master_fields"),
	v.literal("doctorate_fields"),
	v.literal("company_hq_country"),
	v.literal("scrape_state"),
);


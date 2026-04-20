import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { addCompanyJobPreview, upsertCompanyFromIngest } from "./companies";

const JOBS_COUNTER_NAME = "jobs";

async function getJobsCounter(ctx: any) {
	return await ctx.db.query("counters").withIndex("by_name", (q: any) => q.eq("name", JOBS_COUNTER_NAME)).unique();
}

async function incrementJobsCounter(ctx: any, delta: number) {
	if (delta === 0) return;
	const now = Date.now();
	const row = await getJobsCounter(ctx);
	if (!row) {
		await ctx.db.insert("counters", { name: JOBS_COUNTER_NAME, value: Math.max(0, delta), updatedAt: now });
	} else {
		await ctx.db.patch(row._id, { value: Math.max(0, row.value + delta), updatedAt: now });
	}
}

export const ingestBatch = mutation({
	args: {
		items: v.array(
			v.object({
				externalId: v.string(),
				applyUrl: v.optional(v.string()),
				title: v.string(),
				description: v.string(),
				roleActivities: v.array(v.string()),
				searchText: v.string(),

				// Company identity + metadata (already normalized/slugged by scraper).
				company: v.object({
					companyId: v.string(),
					canonicalDomain: v.optional(v.string()),
					name: v.string(),
					homepageUri: v.optional(v.string()),
					imageUrl: v.optional(v.string()),
					tagline: v.optional(v.string()),
					description: v.optional(v.string()),
					yearFounded: v.optional(v.number()),
					numEmployees: v.optional(v.number()),
					hqCountry: v.optional(v.string()),
					industries: v.array(v.string()),
					activities: v.array(v.string()),
				}),

				// Card fields
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

				// Stats (counts)
				views: v.optional(v.number()),
				saves: v.optional(v.number()),
				applies: v.optional(v.number()),

				// Advanced search fields
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

				workplaceEnvironment: v.optional(v.string()),
				workplaceMobility: v.optional(v.string()),
				physicalLaborIntensity: v.optional(v.string()),
				cognitiveDemand: v.optional(v.string()),
				computerUsage: v.optional(v.string()),
				oralCommunicationLevel: v.optional(v.string()),

				associatesDegreeRequirement: v.optional(v.string()),
				associatesDegreeFieldsOfStudy: v.array(v.string()),
				bachelorsDegreeRequirement: v.optional(v.string()),
				bachelorsDegreeFieldsOfStudy: v.array(v.string()),
				mastersDegreeRequirement: v.optional(v.string()),
				mastersDegreeFieldsOfStudy: v.array(v.string()),
				doctorateDegreeRequirement: v.optional(v.string()),
				doctorateDegreeFieldsOfStudy: v.array(v.string()),

				licensesOrCertifications: v.array(v.string()),
				licensesOrCertificationsNotMentioned: v.optional(v.boolean()),
				securityClearance: v.optional(v.string()),
				languageRequirements: v.array(v.string()),

				morningShiftWork: v.optional(v.string()),
				eveningShiftWork: v.optional(v.string()),
				overnightWork: v.optional(v.string()),
				weekendAvailabilityRequired: v.optional(v.boolean()),
				holidayAvailabilityRequired: v.optional(v.boolean()),
				overtimeRequired: v.optional(v.boolean()),
				onCallRequirement: v.optional(v.string()),
				airTravelRequirement: v.optional(v.string()),
				landTravelRequirement: v.optional(v.string()),

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

				companyProfit: v.optional(v.string()),
				companyStage: v.optional(v.string()),
				companyFoundedYear: v.optional(v.number()),
				companyNumEmployees: v.optional(v.number()),
				companyIndustries: v.array(v.string()),
				companyActivities: v.array(v.string()),
			}),
		),
	},
	handler: async (ctx, { items }) => {
		const now = Date.now();
		let insertedJobs = 0;
		let insertedCompanies = 0;

		for (const item of items) {
			const { companyDocId, inserted } = await upsertCompanyFromIngest(ctx, item.company);
			if (inserted) insertedCompanies += 1;

			const existing = await ctx.db
				.query("jobs")
				.withIndex("by_externalId", (q) => q.eq("externalId", item.externalId))
				.unique();

			let detailsId: Id<"jobDetails">;
			if (existing) {
				detailsId = existing.detailsId;
				await ctx.db.patch(detailsId, {
					description: item.description,
					roleActivities: item.roleActivities,
					updatedAt: now,
				});
			} else {
				detailsId = await ctx.db.insert("jobDetails", {
					jobId: undefined,
					description: item.description,
					roleActivities: item.roleActivities,
					createdAt: now,
					updatedAt: now,
				});
			}

			const patch = {
				externalId: item.externalId,
				title: item.title,
				applyUrl: item.applyUrl,
				companyId: companyDocId,
				searchText: item.searchText,
				detailsId,

				workplaceType: item.workplaceType,
				commitment: item.commitment,
				workplaceCities: item.workplaceCities,
				workplaceStates: item.workplaceStates,
				workplaceCountries: item.workplaceCountries,
				workplaceContinents: item.workplaceContinents,
				geoloc: item.geoloc,

				minIcYoe: item.minIcYoe,
				minMgmtYoe: item.minMgmtYoe,
				requirementsSummary: item.requirementsSummary,
				skills: item.skills,
				estimatedPublishDate: item.estimatedPublishDate,
				estimatedPublishDateMillis: item.estimatedPublishDateMillis,

				views: item.views ?? 0,
				saves: item.saves ?? 0,
				applies: item.applies ?? 0,

				department: item.department,

				listedCompensationCurrency: item.listedCompensationCurrency,
				listedCompensationFrequency: item.listedCompensationFrequency,
				isCompensationTransparent: item.isCompensationTransparent,
				hourlyMinComp: item.hourlyMinComp,
				hourlyMaxComp: item.hourlyMaxComp,
				dailyMinComp: item.dailyMinComp,
				dailyMaxComp: item.dailyMaxComp,
				weeklyMinComp: item.weeklyMinComp,
				weeklyMaxComp: item.weeklyMaxComp,
				biWeeklyMinComp: item.biWeeklyMinComp,
				biWeeklyMaxComp: item.biWeeklyMaxComp,
				monthlyMinComp: item.monthlyMinComp,
				monthlyMaxComp: item.monthlyMaxComp,
				yearlyMinComp: item.yearlyMinComp,
				yearlyMaxComp: item.yearlyMaxComp,

				workplaceEnvironment: item.workplaceEnvironment,
				workplaceMobility: item.workplaceMobility,
				physicalLaborIntensity: item.physicalLaborIntensity,
				cognitiveDemand: item.cognitiveDemand,
				computerUsage: item.computerUsage,
				oralCommunicationLevel: item.oralCommunicationLevel,

				associatesDegreeRequirement: item.associatesDegreeRequirement,
				associatesDegreeFieldsOfStudy: item.associatesDegreeFieldsOfStudy,
				bachelorsDegreeRequirement: item.bachelorsDegreeRequirement,
				bachelorsDegreeFieldsOfStudy: item.bachelorsDegreeFieldsOfStudy,
				mastersDegreeRequirement: item.mastersDegreeRequirement,
				mastersDegreeFieldsOfStudy: item.mastersDegreeFieldsOfStudy,
				doctorateDegreeRequirement: item.doctorateDegreeRequirement,
				doctorateDegreeFieldsOfStudy: item.doctorateDegreeFieldsOfStudy,

				licensesOrCertifications: item.licensesOrCertifications,
				licensesOrCertificationsNotMentioned: item.licensesOrCertificationsNotMentioned,
				securityClearance: item.securityClearance,
				languageRequirements: item.languageRequirements,

				morningShiftWork: item.morningShiftWork,
				eveningShiftWork: item.eveningShiftWork,
				overnightWork: item.overnightWork,
				weekendAvailabilityRequired: item.weekendAvailabilityRequired,
				holidayAvailabilityRequired: item.holidayAvailabilityRequired,
				overtimeRequired: item.overtimeRequired,
				onCallRequirement: item.onCallRequirement,
				airTravelRequirement: item.airTravelRequirement,
				landTravelRequirement: item.landTravelRequirement,

				generousPaidTimeOff: item.generousPaidTimeOff,
				fourDayWorkWeek: item.fourDayWorkWeek,
				matching401k: item.matching401k,
				generousParentalLeave: item.generousParentalLeave,
				retirementPlan: item.retirementPlan,
				tuitionReimbursement: item.tuitionReimbursement,
				visaSponsorship: item.visaSponsorship,
				relocationAssistance: item.relocationAssistance,
				militaryVeterans: item.militaryVeterans,
				fairChance: item.fairChance,

				companyProfit: item.companyProfit,
				companyStage: item.companyStage,
				companyFoundedYear: item.companyFoundedYear,
				companyNumEmployees: item.companyNumEmployees,
				companyIndustries: item.companyIndustries,
				companyActivities: item.companyActivities,

				updatedAt: now,
			};

			let jobId: Id<"jobs">;
			if (existing) {
				await ctx.db.patch(existing._id, patch);
				jobId = existing._id;
			} else {
				jobId = await ctx.db.insert("jobs", { ...patch, createdAt: now });
				insertedJobs += 1;
				await incrementJobsCounter(ctx, 1);
			}

			// Backfill jobId on details (only needed for new details).
			const details = await ctx.db.get(detailsId);
			if (details && !details.jobId) {
				await ctx.db.patch(detailsId, { jobId, updatedAt: now });
			}

			await addCompanyJobPreview(ctx, companyDocId, jobId);
		}

		// If we created companies via ingestion but counters row was missing, the company helper increments it.
		// This local variable is kept for observability in the return value.
		return { upserted: items.length, insertedJobs, insertedCompanies };
	},
});

export type ConvexJobSearchFilters = {
	workplaceType?: string;
	companyIds?: string[]; // company routing ids (slug)
	department?: string[];
	commitment?: string[];
};

export const search = query({
	args: {
		q: v.optional(v.string()),
		filters: v.optional(v.any()),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, { q, filters, paginationOpts }) => {
		const queryText = (q ?? "").trim().toLowerCase();

		// NOTE: This will be expanded to apply *all* SearchState-derived filters.
		// For now, keep parity with existing board behavior: query text + workplaceType/company include.
		const f = (filters ?? {}) as ConvexJobSearchFilters;
		const workplaceType = f.workplaceType?.trim().toLowerCase();

		let companyDocIds: Id<"companies">[] | undefined;
		if (Array.isArray(f.companyIds) && f.companyIds.length) {
			const companies = await Promise.all(
				f.companyIds.map((cid) =>
					ctx.db.query("companies").withIndex("by_companyId", (q2) => q2.eq("companyId", cid)).unique(),
				),
			);
			companyDocIds = companies.filter(Boolean).map((c: any) => c._id);
		}

		const page = queryText
			? await ctx.db
					.query("jobs")
					.withSearchIndex("search_searchText", (q2) => {
						let qq = q2.search("searchText", queryText);
						if (workplaceType) qq = qq.eq("workplaceType", workplaceType);
						return qq;
					})
					.paginate(paginationOpts)
			: await ctx.db.query("jobs").order("desc").paginate(paginationOpts);

		let filtered = page.page;
		if (companyDocIds && companyDocIds.length) {
			const set = new Set(companyDocIds.map(String));
			filtered = filtered.filter((j) => set.has(String(j.companyId)));
		}
		if (workplaceType && !queryText) {
			filtered = filtered.filter((j) => (j.workplaceType ?? "").toLowerCase() === workplaceType);
		}

		// Join companies for card rendering.
		const uniq = Array.from(new Set(filtered.map((j) => String(j.companyId))));
		const companyDocs = await Promise.all(uniq.map((id) => ctx.db.get(id as any)));
		const byId = new Map<string, any>();
		for (const c of companyDocs) if (c) byId.set(String(c._id), c);

		const card = filtered.map((j) => ({
			job: j,
			company: byId.get(String(j.companyId)) ?? null,
		}));

		return {
			page: card,
			continueCursor: page.continueCursor,
			isDone: page.isDone,
		};
	},
});

export const getDetails = query({
	args: { jobId: v.id("jobs") },
	handler: async (ctx, { jobId }) => {
		const job = await ctx.db.get(jobId);
		if (!job) return null;
		const details = await ctx.db.query("jobDetails").withIndex("by_jobId", (q) => q.eq("jobId", jobId)).unique();
		const company = await ctx.db.get(job.companyId);
		return { job, details, company };
	},
});

export const distinctJobTitles = query({
	args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
	handler: async (ctx, { query, limit }) => {
		const q = (query ?? "").trim().toLowerCase();
		const max = Math.min(Math.max(limit ?? 50, 1), 200);
		const readLimit = Math.min(Math.max(max * 6, 120), 600);

		const docs = q
			? await ctx.db.query("jobs").withSearchIndex("search_searchText", (q2) => q2.search("searchText", q)).take(readLimit)
			: await ctx.db.query("jobs").order("desc").take(readLimit);

		const titles = new Set<string>();
		for (const d of docs) {
			const t = (d.title ?? "").trim();
			if (t) titles.add(t);
			if (titles.size >= max) break;
		}
		return Array.from(titles);
	},
});

/** Distinct skill tags from jobs (used for description-keyword @ suggestions). */
export const distinctSkills = query({
	args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
	handler: async (ctx, { query, limit }) => {
		const q = (query ?? "").trim().toLowerCase();
		const max = Math.min(Math.max(limit ?? 50, 1), 200);
		const readLimit = Math.min(Math.max(max * 8, 120), 800);

		const docs = q
			? await ctx.db
					.query("jobs")
					.withSearchIndex("search_searchText", (q2) => q2.search("searchText", q))
					.take(readLimit)
			: await ctx.db.query("jobs").order("desc").take(readLimit);

		const skills = new Set<string>();
		for (const d of docs) {
			for (const raw of d.skills ?? []) {
				const s = (raw ?? "").trim();
				if (!s) continue;
				if (q && !s.toLowerCase().includes(q)) continue;
				skills.add(s);
				if (skills.size >= max) break;
			}
			if (skills.size >= max) break;
		}
		return Array.from(skills);
	},
});

/** Distinct requirements summary lines from jobs (for requirements-keyword @ suggestions). */
export const distinctRequirementsSummaries = query({
	args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
	handler: async (ctx, { query, limit }) => {
		const q = (query ?? "").trim().toLowerCase();
		const max = Math.min(Math.max(limit ?? 50, 1), 200);
		const readLimit = Math.min(Math.max(max * 8, 120), 800);

		const docs = q
			? await ctx.db
					.query("jobs")
					.withSearchIndex("search_searchText", (q2) => q2.search("searchText", q))
					.take(readLimit)
			: await ctx.db.query("jobs").order("desc").take(readLimit);

		const lines = new Set<string>();
		for (const d of docs) {
			const s = (d.requirementsSummary ?? "").trim();
			if (!s) continue;
			if (q && !s.toLowerCase().includes(q)) continue;
			lines.add(s);
			if (lines.size >= max) break;
		}
		return Array.from(lines);
	},
});

export const count = query({
	args: {},
	handler: async (ctx) => {
		const row = await getJobsCounter(ctx);
		return row?.value ?? null;
	},
});

export const byExternalIds = query({
	args: { ids: v.array(v.string()) },
	handler: async (ctx, { ids }) => {
		const docs = await Promise.all(
			ids.map((externalId) =>
				ctx.db.query("jobs").withIndex("by_externalId", (q) => q.eq("externalId", externalId)).unique(),
			),
		);
		const jobs = docs.filter((d): d is NonNullable<typeof d> => d !== null);
		const uniqCompanies = Array.from(new Set(jobs.map((j) => String(j.companyId))));
		const companyDocs = await Promise.all(uniqCompanies.map((id) => ctx.db.get(id as any)));
		const byId = new Map<string, any>();
		for (const c of companyDocs) if (c) byId.set(String(c._id), c);
		return jobs.map((job: any) => ({ job, company: byId.get(String(job.companyId)) ?? null }));
	},
});


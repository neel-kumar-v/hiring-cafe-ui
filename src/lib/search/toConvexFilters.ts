import type { SearchState, Select } from "@/types/search";

export type ConvexJobSearchFilters = {
	workplaceTypes?: string[];
	companyIds?: string[];
	departments?: string[];
	commitment?: string[];
	currencies?: string[];
	frequencies?: string[];
	postedAfterMillis?: number;
	locationCountries?: string[];
	locationStates?: string[];
	locationCities?: string[];
	minYearlyComp?: number;
	maxYearlyComp?: number;
	minIcYoe?: number;
	minMgmtYoe?: number;
	companyProfit?: string[];
	companyStage?: string[];
};

function asArray<T>(sel: Select<T>): T[] {
	return Array.isArray(sel) ? sel : [];
}

function toMillisFromDateRange(state: SearchState): number | undefined {
	const magnitude = state.date_range?.magnitude;
	const unit = state.date_range?.unit;
	if (!magnitude || magnitude <= 0 || !unit) return undefined;
	const now = Date.now();
	const unitToMs: Record<string, number> = {
		Minutes: 60_000,
		Hours: 3_600_000,
		Days: 86_400_000,
		Weeks: 604_800_000,
		Months: 2_592_000_000,
		Years: 31_536_000_000,
	};
	const factor = unitToMs[unit];
	if (!factor) return undefined;
	return now - magnitude * factor;
}

function getLocationFilterLists(state: SearchState): {
	countries: string[];
	states: string[];
	cities: string[];
} {
	const countries = new Set<string>();
	const states = new Set<string>();
	const cities = new Set<string>();

	for (const loc of state.location?.location ?? []) {
		for (const component of loc.address?.components ?? []) {
			if (component.types.includes("Country")) countries.add(component.long_name);
			if (component.types.includes("Admin Area")) states.add(component.long_name);
			if (component.types.includes("Locality")) cities.add(component.long_name);
		}
	}

	return {
		countries: Array.from(countries),
		states: Array.from(states),
		cities: Array.from(cities),
	};
}

export function toConvexJobSearchFilters(state: SearchState): ConvexJobSearchFilters {
	const workplaceTypes = asArray(state.location?.workplace_type).filter(Boolean);
	const companyIds = asArray(state.company?.include).filter(Boolean);
	const departments = asArray(state.department).filter(Boolean);
	const commitment = asArray(state.commitment).filter(Boolean);

	const currencyRaw = state.salary?.currency;
	const listedUnitRaw = state.salary?.listedUnit;
	const currencies = listedUnitRaw && listedUnitRaw !== "Any" && currencyRaw && currencyRaw !== "Any" ? [currencyRaw] : [];
	const frequencies = listedUnitRaw && listedUnitRaw !== "Any" ? [listedUnitRaw] : [];

	const postedAfterMillis = toMillisFromDateRange(state);
	const locations = getLocationFilterLists(state);
	const minYearlyComp = state.salary?.min_range?.min ? state.salary.min_range.min : undefined;
	const maxYearlyComp = state.salary?.max_range?.max ? state.salary.max_range.max : undefined;
	const minIcYoe = state.experience?.individualContributor?.min ?? undefined;
	const minMgmtYoe = state.experience?.peopleManager?.min ?? undefined;
	const companyProfit = Array.isArray(state.industry?.profit) ? state.industry.profit : [];
	const companyStage = Array.isArray(state.stage_funding?.current) ? state.stage_funding.current : [];

	return {
		workplaceTypes: workplaceTypes.length ? workplaceTypes : undefined,
		companyIds: companyIds.length ? companyIds : undefined,
		departments: departments.length ? departments : undefined,
		commitment: commitment.length ? commitment : undefined,
		currencies: currencies.length ? currencies : undefined,
		frequencies: frequencies.length ? frequencies : undefined,
		postedAfterMillis,
		locationCountries: locations.countries.length ? locations.countries : undefined,
		locationStates: locations.states.length ? locations.states : undefined,
		locationCities: locations.cities.length ? locations.cities : undefined,
		minYearlyComp,
		maxYearlyComp,
		minIcYoe,
		minMgmtYoe,
		companyProfit: companyProfit.length ? companyProfit : undefined,
		companyStage: companyStage.length ? companyStage : undefined,
	};
}


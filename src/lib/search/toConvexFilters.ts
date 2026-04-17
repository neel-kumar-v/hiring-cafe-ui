import type { SearchState, Select } from "@/types/search";

export type ConvexJobSearchFilters = {
	workplaceType?: string;
	companyNames?: string[];
};

function asArray<T>(sel: Select<T>): T[] {
	return Array.isArray(sel) ? sel : [];
}

export function toConvexJobSearchFilters(state: SearchState): ConvexJobSearchFilters {
	const workplaceTypeRaw = state.location?.workplace_type;
	const workplaceType = Array.isArray(workplaceTypeRaw) && workplaceTypeRaw.length
		? String(workplaceTypeRaw[0]).toLowerCase()
		: undefined;

	const companyNames = asArray(state.company?.include).filter(Boolean);

	return {
		workplaceType,
		companyNames: companyNames.length ? companyNames : undefined,
	};
}


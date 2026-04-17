import type { SearchState } from "@/types/search";

export function encodeSearchState(state: SearchState): string {
	// Keep URL stable and relatively compact.
	return encodeURIComponent(JSON.stringify(state));
}

export function decodeSearchState(raw: string): SearchState | null {
	try {
		const json = decodeURIComponent(raw);
		return JSON.parse(json) as SearchState;
	} catch {
		return null;
	}
}


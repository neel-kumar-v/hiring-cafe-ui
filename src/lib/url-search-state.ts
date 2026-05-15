import type { SearchState } from "@/types/search";

export function encodeSearchState(state: SearchState): string {
	// Keep URL stable and relatively compact.
	return encodeURIComponent(JSON.stringify(state));
}

function fullyDecodeURIComponent(raw: string): string {
	let prev = raw;
	for (let i = 0; i < 8; i++) {
		const next = decodeURIComponent(prev);
		if (next === prev) break;
		prev = next;
	}
	return prev;
}

export function decodeSearchState(raw: string): SearchState | null {
	try {
		const json = fullyDecodeURIComponent(raw);
		return JSON.parse(json) as SearchState;
	} catch {
		return null;
	}
}


import type { AutocompleteType } from "../../convex/autocompleteTypes";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";

// These options are filtered locally by the controls. Keep the initial
// reactive payload bounded so opening the search UI does not read thousands of
// documents for every facet at once.
const SEARCH_DATA_LIMIT = 250;

export function useSearchData(type: string, uppercase: boolean = false) {
  const result = useQuery(api.autocomplete.getOptions, {
    type: type as AutocompleteType,
    limit: SEARCH_DATA_LIMIT,
  });

  const loading = result === undefined;

  const rawStrings = useMemo(() => {
    if (!result?.suggestions) return [];
    if (type === "currencies") {
      const seen = new Set<string>();
      const list: string[] = [];
      for (const item of result.suggestions) {
        if (typeof item !== "string") continue;
        const code = item.trim().toUpperCase();
        if (code && /^[A-Z]{3}$/.test(code) && !seen.has(code)) {
          seen.add(code);
          list.push(code);
        }
      }
      return list;
    }
    return result.suggestions.map((item) => (uppercase ? item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)) : item));
  }, [result, uppercase, type]);

  const options = useMemo(() => rawStrings.map((s) => ({ label: s, value: s })), [rawStrings]);

  return { options, rawStrings, loading };
}

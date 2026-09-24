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
    return result.suggestions.map((item) => (uppercase ? item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)) : item));
  }, [result, uppercase]);

  const options = useMemo(() => rawStrings.map((s) => ({ label: s, value: s })), [rawStrings]);

  return { options, rawStrings, loading };
}

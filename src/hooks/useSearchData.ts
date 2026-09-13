import type { AutocompleteType } from "../../convex/autocompleteTypes";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";

export function useSearchData(type: string, uppercase: boolean = false) {
  const result = useQuery(api.autocomplete.getOptions, {
    type: type as AutocompleteType,
    limit: 1000,
  });

  const loading = result === undefined;

  const rawStrings = useMemo(() => {
    if (!result?.suggestions) return [];
    return result.suggestions.map((item) => (uppercase ? item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)) : item));
  }, [result, uppercase]);

  const options = useMemo(() => rawStrings.map((s) => ({ label: s, value: s })), [rawStrings]);

  return { options, rawStrings, loading };
}

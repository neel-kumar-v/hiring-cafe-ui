import { useEffect, useState } from 'react';

export function useSearchData(type: string, uppercase: boolean = false) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [rawStrings, setRawStrings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
    
    async function fetchOptions() {
      try {
        const res = await fetch(`/api/search?type=${type}&limit=1000`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (mounted && data.suggestions) {
            const strings: string[] = data.suggestions.map((item: string) => {
                return uppercase 
                    ? item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)) 
                    : item;
            });
            
            setRawStrings(strings);
            setOptions(strings.map(s => ({ label: s, value: s })));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(`Error fetching search data for ${type}:`, err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    void fetchOptions();
    }, 200);

    return () => { 
      mounted = false; 
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [type, uppercase]);

  return { options, rawStrings, loading };
}

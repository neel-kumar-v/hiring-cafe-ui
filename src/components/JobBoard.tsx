import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCompanyName } from "@/lib/job-company";
import { normalizeJob } from "@/lib/jobs/normalizeJob";
import { toConvexJobSearchFilters } from "@/lib/search/toConvexFilters";
import type { Job, JobCollection } from "@/types/job";
import { usePaginatedQuery } from "convex/react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
  ssr: false,
});

// Keeping pages smaller avoids Convex "many bytes read" warnings when job payloads are large.
const PAGE_LIMIT = 50;

const JobBoard = () => {
  const { boardSearchQuery } = useSearchUI();
  const { searchOptions } = useApp();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(boardSearchQuery.trim()), 280);
    return () => window.clearTimeout(id);
  }, [boardSearchQuery]);

  const is3xl = useMediaQuery("(min-width: 1920px)");
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isMd = useMediaQuery("(min-width: 768px)");

  let columns = 1;
  if (is3xl) columns = 5;
  else if (is2xl) columns = 4;
  else if (isXl) columns = 3;
  else if (isMd) columns = 2;

  const initialCount = columns * 4;
  const [loadedCount, setLoadedCount] = useState(initialCount);
  const [revealLoading, setRevealLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const convexFilters = useMemo(() => toConvexJobSearchFilters(searchOptions), [searchOptions]);

  const {
    results: accumulatedJobs,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(api.jobs.search, { q: debouncedQuery || undefined, filters: convexFilters }, { initialNumItems: PAGE_LIMIT });

  useEffect(() => {
    setLoadedCount(columns * 4);
  }, [columns]);

  const allJobCollections = useMemo(() => {
    if (!accumulatedJobs.length) return [];

    const collectionsMap = new Map<string, JobCollection>();
    const len = accumulatedJobs.length;

    for (let i = 0; i < len; i++) {
      const job = normalizeJob(accumulatedJobs[i]);
      const companyName = getCompanyName(job) || "Unknown Company";

      let collection = collectionsMap.get(companyName);
      if (!collection) {
        collection = {
          source_and_board_token: job.source_and_board_token,
          source: job.source,
          board_token: job.board_token,
          jobs: [],
        };
        collectionsMap.set(companyName, collection);
      }

      collection.jobs.push({
        ...job,
        currentJobIndex: 0,
      } as Job);
    }

    return Array.from(collectionsMap.values());
  }, [accumulatedJobs]);

  const displayedCollections = useMemo(() => {
    return allJobCollections.slice(0, loadedCount);
  }, [allJobCollections, loadedCount]);

  const loadMoreItems = () => {
    if (revealLoading || isLoading) return;

    if (loadedCount < allJobCollections.length) {
      setRevealLoading(true);
      window.setTimeout(() => {
        setLoadedCount((c) => Math.min(c + 8, allJobCollections.length));
        setRevealLoading(false);
      }, 100);
      return;
    }

    if (status === "CanLoadMore") {
      loadMore(PAGE_LIMIT);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2000) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadedCount, loadMoreItems]);

  if (status === "LoadingFirstPage") {
    return <div className="col-span-full text-center py-16 text-text">Loading jobs...</div>;
  }

  if (!accumulatedJobs.length) {
    const searched = Boolean(debouncedQuery.trim());
    if (searched) {
      return (
        <div className="col-span-full text-center py-16 text-text">
          No jobs match <span className="font-medium text-pink-600 dark:text-pink-400">&quot;{debouncedQuery.trim()}&quot;</span>
          Try different keywords or clear the search bar.
        </div>
      );
    }
    return (
      <div className="col-span-full text-center py-16 text-text">
        No jobs found in Convex. Run the scraper, then import into Convex: <code className="text-sm">python scraper/import_json_to_convex.py</code>.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid min-h-screen scroll-mt-14 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
      {displayedCollections.map((collection) => {
        const companyName = getCompanyName(collection.jobs[0]) || collection.source_and_board_token;
        return (
          <Suspense key={companyName} fallback={<div className="text-center py-8 text-gray-500">Loading...</div>}>
            <JobBoardCard jobCollection={collection} data-job-card="true" />
          </Suspense>
        );
      })}
      {(revealLoading || isLoading) && <div className="col-span-full text-center py-4 text-gray-500">Loading more jobs...</div>}
    </div>
  );
};

export default JobBoard;

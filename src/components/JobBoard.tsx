import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toConvexJobSearchFilters } from "@/lib/search/toConvexFilters";
import type { CompanyDTO, JobCardResultDTO, JobDTO } from "@/types/convexJobs";
import { usePaginatedQuery } from "convex/react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import JobBoardCardSkeleton from "./job/JobBoardCardSkeleton";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
  ssr: false,
});

// Keeping pages smaller avoids Convex "many bytes read" warnings when job payloads are large.
const PAGE_LIMIT = 50;

function formatRoundedNumber(value: number, round = 3) {
  return (Math.round(value / 10 ** round) * 10 ** round).toLocaleString();
}

const JobBoard = ({
  companyCount,
  jobCount,
  location,
}: {
  companyCount?: number;
  jobCount?: number;
  location?: string;
}) => {
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
    const items = accumulatedJobs as unknown as JobCardResultDTO[];
    if (!items.length) return [];

    const collectionsMap = new Map<string, { company: CompanyDTO | null; jobs: JobDTO[] }>();
    for (const item of items) {
      const companyKey = item.company?.companyId ?? "unknown";
      const existing = collectionsMap.get(companyKey);
      if (existing) {
        existing.jobs.push(item.job);
      } else {
        collectionsMap.set(companyKey, { company: item.company, jobs: [item.job] });
      }
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

  const gridClassName =
    "grid min-h-screen scroll-mt-14 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5";

  const skeletonCount = Math.max(initialCount, 8);

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-6">
        {jobCount !== undefined || companyCount !== undefined || location ? (
          <div className="text-sm text-muted-foreground">
            {jobCount !== undefined ? <span>{formatRoundedNumber(jobCount, 3)} jobs</span> : null}
            {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
            {companyCount !== undefined ? <span>{formatRoundedNumber(companyCount, 3)} companies</span> : null}
            {(jobCount !== undefined || companyCount !== undefined) && location ? <span> - </span> : null}
            {location ? <span>{location}</span> : null}
          </div>
        ) : null}
        <div className={gridClassName}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <JobBoardCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!accumulatedJobs.length) {
    const searched = Boolean(debouncedQuery.trim());
    if (searched) {
      return (
        <div className="col-span-full text-center py-16 text-text">
          No jobs match <span className="font-medium text-primary dark:text-primary">&quot;{debouncedQuery.trim()}&quot;</span>
          Try different keywords or clear the search bar.
        </div>
      );
    }
    return (
      <div className="col-span-full text-center py-16 text-text">
        No jobs found in Convex. Run the scraper: <code className="text-sm">python scraper/scrape_to_convex.py</code>.
      </div>
    );
  }

  return (
    <>
    {(jobCount !== undefined || companyCount !== undefined || location) ? (
      <div className="text-sm text-muted-foreground my-2">
        {jobCount !== undefined ? <span>{formatRoundedNumber(jobCount, 3)} jobs</span> : null}
        {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
        {companyCount !== undefined ? <span>{formatRoundedNumber(companyCount, 3)} companies</span> : null}
        {(jobCount !== undefined || companyCount !== undefined) && location ? <span> - </span> : null}
        {location ? <span>{location}</span> : null}
      </div>
    ) : null}
    <div className="space-y-6">
      <div ref={containerRef} className={gridClassName}>
        {displayedCollections.map((collection) => {
          const companyKey = collection.company?.companyId ?? "unknown";
          return (
            <Suspense key={companyKey} fallback={<JobBoardCardSkeleton />}>
              <JobBoardCard jobCollection={collection} data-job-card="true" />
            </Suspense>
          );
        })}
        {(revealLoading || isLoading) && (
          <>
            {Array.from({ length: Math.min(columns * 2, 6) }).map((_, i) => (
              <JobBoardCardSkeleton key={`more-${i}`} />
            ))}
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default JobBoard;

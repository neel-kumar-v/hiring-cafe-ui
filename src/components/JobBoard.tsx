import jobsData from "@/data/jobs_data.json" with { type: "json" };
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Job, JobCollection } from "@/types/job";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
    ssr: false
});

const JobBoard = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allJobCollections = useMemo(() => {
    const collectionsMap = new Map<string, JobCollection>();
    const results = jobsData.results;
    const len = results.length;

    for (let i = 0; i < len; i++) {
      const job = results[i];
      const key = job.source_and_board_token;
      
      let collection = collectionsMap.get(key);
      if (!collection) {
        collection = {
          source_and_board_token: key,
          source: job.source,
          board_token: job.board_token,
          jobs: [],
        };
        collectionsMap.set(key, collection);
      }

      collection.jobs.push({
        ...job,
        currentJobIndex: 0,
      } as Job);
    }

    return Array.from(collectionsMap.values());
  }, []);

  const displayedCollections = useMemo(() => {
    return allJobCollections.slice(0, loadedCount);
  }, [allJobCollections, loadedCount]);

  const loadMoreItems = () => {
    if (isLoading || loadedCount >= allJobCollections.length) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newCount = Math.min(loadedCount + 8, allJobCollections.length);
      setLoadedCount(newCount);
      setIsLoading(false);
    }, 100);
  };

  useEffect(() => {
    setLoadedCount(columns * 4);
  }, [columns]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2000) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadedCount, isLoading]);

  return (
    <div ref={containerRef} className="grid 3xl:grid-cols-5 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
      {displayedCollections.map((collection) => (
        <Suspense key={collection.board_token} fallback={<div className="text-center py-8 text-gray-500">Loading...</div>}>
          <JobBoardCard 
            jobCollection={collection}
            data-job-card="true"
          />
        </Suspense>
      ))}
      {isLoading && (
        <div className="col-span-full text-center py-4 text-gray-500">
          Loading more jobs...
        </div>
      )}
    </div>
  );
};

export default JobBoard;

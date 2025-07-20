import jobsData from "@/data/jobs_data.json" with { type: "json" };
import type { Job, JobCollection } from "@/types/job";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
    ssr: false
});

const JobBoard = () => {
  const [loadedCount, setLoadedCount] = useState(12);
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
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedCount, isLoading]);

  return (
    <div ref={containerRef} className="grid 3xl:grid-cols-5 grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
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

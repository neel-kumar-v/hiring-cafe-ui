"use client";

import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { JOB_FADE_DURATION_MS } from "@/lib/jobs/fadeTransition";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { stableCompanyKey } from "@/lib/jobs/stableCompanyKey";
import type { CompanyDTO, JobCardResultDTO, JobDTO } from "@/types/convexJobs";
import dynamic from "next/dynamic";

const JobDialogContent = dynamic(() => import("@/components/job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false,
});

const JobDrawerContent = dynamic(() => import("@/components/job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false,
});

const NAV_FADE_OUT_MS = JOB_FADE_DURATION_MS;
const NAV_SETTLE_MS = 50;

type PrefetchOptions = {
  delayMs?: number;
  maxInflight?: number;
  maxSeen?: number;
};

/** Shared dialog/drawer open state, desktop breakpoint sync, and fade transitions. */
export function useJobPreviewChrome(prefetchOptions?: PrefetchOptions) {
  const { isDesktop } = useResponsiveBreakpoint();
  const { prefetch, prefetchNow } = useJobDetailsPrefetch(prefetchOptions ?? { delayMs: 150, maxInflight: 2 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeCompanyChrome, setFadeCompanyChrome] = useState(false);
  const transitionInFlightRef = useRef(false);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
      return;
    }
    setDialogOpen(false);
  }, [isDesktop]);

  const openPreview = useCallback(() => {
    if (isDesktop) setDialogOpen(true);
    else setDrawerOpen(true);
  }, [isDesktop]);

  const closePreview = useCallback(() => {
    setDialogOpen(false);
    setDrawerOpen(false);
  }, []);

  const runTransition = useCallback(async (navigate: () => void | boolean | Promise<void | boolean>, opts?: { fadeCompanyChrome?: boolean }) => {
    if (transitionInFlightRef.current) return;
    transitionInFlightRef.current = true;
    setFadeCompanyChrome(Boolean(opts?.fadeCompanyChrome));
    setIsTransitioning(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, NAV_FADE_OUT_MS));
      await navigate();
      await new Promise((resolve) => window.setTimeout(resolve, NAV_SETTLE_MS));
    } finally {
      transitionInFlightRef.current = false;
      setIsTransitioning(false);
      setFadeCompanyChrome(false);
    }
  }, []);

  return {
    isDesktop,
    dialogOpen,
    setDialogOpen,
    drawerOpen,
    setDrawerOpen,
    isTransitioning,
    fadeCompanyChrome,
    prefetch,
    prefetchNow,
    openPreview,
    closePreview,
    runTransition,
  };
}

/** Linear prev/next preview over a job sequence (list / kanban). */
export function useJobPreviewSequence({
  sequence,
  selectedId,
  onSelectId,
  prefetchOptions,
  previousAriaLabel = "Previous job",
  nextAriaLabel = "Next job",
}: {
  sequence: JobCardResultDTO[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  prefetchOptions?: PrefetchOptions;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
}) {
  const chrome = useJobPreviewChrome(prefetchOptions);
  const { prefetch, prefetchNow, openPreview, runTransition, closePreview } = chrome;

  const selectedIndex = useMemo(
    () => (selectedId ? sequence.findIndex((row) => row.job.externalId === selectedId) : -1),
    [selectedId, sequence]
  );
  const selectedRow = selectedIndex >= 0 ? (sequence[selectedIndex] ?? null) : null;
  const canNavigate = sequence.length > 1;

  useEffect(() => {
    if (!selectedId) {
      closePreview();
      return;
    }
    if (!sequence.some((row) => row.job.externalId === selectedId)) {
      onSelectId(null);
      closePreview();
    }
  }, [closePreview, onSelectId, selectedId, sequence]);

  const prefetchNeighbors = useCallback(() => {
    if (selectedIndex < 0 || sequence.length < 2) return;
    const previousIndex = (selectedIndex - 1 + sequence.length) % sequence.length;
    const nextIndex = (selectedIndex + 1) % sequence.length;
    prefetch(getDetailsLookupId(sequence[previousIndex].job));
    if (nextIndex !== previousIndex) prefetch(getDetailsLookupId(sequence[nextIndex].job));
  }, [prefetch, selectedIndex, sequence]);

  const openJob = useCallback(
    (externalId: string) => {
      onSelectId(externalId);
      openPreview();
    },
    [onSelectId, openPreview]
  );

  const handlePrevious = useCallback(async () => {
    if (selectedIndex < 0 || !canNavigate) return;
    const previousIndex = (selectedIndex - 1 + sequence.length) % sequence.length;
    const current = sequence[selectedIndex];
    const target = sequence[previousIndex];
    const fade = stableCompanyKey(current.company, current.job) !== stableCompanyKey(target.company, target.job);
    prefetchNow(getDetailsLookupId(target.job));
    await runTransition(() => onSelectId(target.job.externalId), { fadeCompanyChrome: fade });
  }, [canNavigate, onSelectId, prefetchNow, runTransition, selectedIndex, sequence]);

  const handleNext = useCallback(async () => {
    if (selectedIndex < 0 || !canNavigate) return;
    const nextIndex = (selectedIndex + 1) % sequence.length;
    const current = sequence[selectedIndex];
    const target = sequence[nextIndex];
    const fade = stableCompanyKey(current.company, current.job) !== stableCompanyKey(target.company, target.job);
    prefetchNow(getDetailsLookupId(target.job));
    await runTransition(() => onSelectId(target.job.externalId), { fadeCompanyChrome: fade });
  }, [canNavigate, onSelectId, prefetchNow, runTransition, selectedIndex, sequence]);

  return {
    ...chrome,
    selectedRow,
    selectedIndex,
    canNavigate,
    openJob,
    prefetchNeighbors,
    handlePrevious,
    handleNext,
    previousAriaLabel,
    nextAriaLabel,
  };
}

export interface JobPreviewOverlayProps {
  job: JobDTO | null;
  company: CompanyDTO | null;
  isDesktop: boolean;
  dialogOpen: boolean;
  drawerOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onDrawerClose: () => void;
  isApplied: boolean;
  isBookmarked: boolean;
  isInterviewing?: boolean;
  fadeCompanyChrome: boolean;
  isTransitioning: boolean;
  onApplyToggle: () => void;
  onBookmarkToggle: () => void;
  onDetailsResolved?: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  footerNavigation?: ComponentProps<typeof JobDialogContent>["footerNavigation"];
  outsideCanGoPrevious?: boolean;
  outsideCanGoNext?: boolean;
  onOutsidePrevious?: () => void;
  onOutsideNext?: () => void;
}

export function JobPreviewOverlay({
  job,
  company,
  isDesktop,
  dialogOpen,
  drawerOpen,
  onDialogOpenChange,
  onDrawerClose,
  isApplied,
  isBookmarked,
  isInterviewing,
  fadeCompanyChrome,
  isTransitioning,
  onApplyToggle,
  onBookmarkToggle,
  onDetailsResolved,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  previousAriaLabel = "Previous job",
  nextAriaLabel = "Next job",
  footerNavigation,
  outsideCanGoPrevious,
  outsideCanGoNext,
  onOutsidePrevious,
  onOutsideNext,
}: JobPreviewOverlayProps) {
  if (!job) return null;

  return (
    <>
      {isDesktop ? (
        <JobDialogContent
          company={company}
          currentJob={job}
          onDetailsResolved={onDetailsResolved}
          footerNavigation={footerNavigation}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing ?? false}
          fadeCompanyChrome={fadeCompanyChrome}
          isTransitioning={isTransitioning}
          onApplyToggle={onApplyToggle}
          onBookmarkToggle={onBookmarkToggle}
          onOpenChange={onDialogOpenChange}
          open={dialogOpen}
          outsideNavigation={{
            onPrevious: onOutsidePrevious ?? onPrevious,
            onNext: onOutsideNext ?? onNext,
            onPreviousHover: undefined,
            onNextHover: undefined,
            canGoPrevious: outsideCanGoPrevious ?? canGoPrevious,
            canGoNext: outsideCanGoNext ?? canGoNext,
            previousAriaLabel,
            nextAriaLabel,
          }}
        />
      ) : (
        <JobDrawerContent
          company={company}
          currentJob={job}
          onDetailsResolved={onDetailsResolved}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          fadeCompanyChrome={fadeCompanyChrome}
          isTransitioning={isTransitioning}
          navigation={{
            onPrevious,
            onNext,
            canGoPrevious,
            canGoNext,
          }}
          onApplyToggle={onApplyToggle}
          onBookmarkToggle={onBookmarkToggle}
          onClose={onDrawerClose}
          open={drawerOpen}
        />
      )}
    </>
  );
}

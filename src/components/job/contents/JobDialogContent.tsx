import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { useJobDetailsLite } from "@/hooks/useJobDetailsLite";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { DialogFooterNavigationProps } from "../dialog/DialogFooter";
import { DialogBadges, DialogFooter, DialogJobDescription, DialogJobTitle, DialogRequirements, DialogSkills, DialogStats } from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import DialogResponsibilities from "../dialog/DialogResponsibilities";

export interface JobDialogOutsideNavigationProps {
  onPrevious: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
  onPreviousHover?: () => void;
  onNextHover?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
}

interface JobDialogContentProps {
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isBookmarked: boolean;
  isApplied: boolean;
  isInterviewing: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  onDetailsResolved?: (jobId: string) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  isTransitioning?: boolean;
  /** When true with `isTransitioning`, fades company line, logo/tagline, and description (footer in-card hops keep this false). */
  fadeCompanyChrome?: boolean;
  footerNavigation?: DialogFooterNavigationProps;
  outsideNavigation?: JobDialogOutsideNavigationProps;
}

const JobDialogContent = ({
  currentJob,
  company,
  isBookmarked,
  isApplied,
  isInterviewing,
  onBookmarkToggle,
  onApplyToggle,
  onDetailsResolved,
  children,
  open,
  onOpenChange,
  scrollContainerRef,
  isTransitioning = false,
  fadeCompanyChrome = false,
  footerNavigation,
  outsideNavigation,
}: JobDialogContentProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const perfEnabled = process.env.NODE_ENV !== "production";
  const openedAtRef = useRef<number | null>(null);
  const detailsResolvedForRef = useRef<string | null>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const details = useJobDetailsLite(currentJob, dialogOpen);
  const isDetailsLoading = dialogOpen && details === undefined;
  const detailsLoadFailed = dialogOpen && details === null;
  const job = details?.job ?? currentJob;
  const detailsDoc = details?.details ?? null;
  const companyDoc = details?.company ?? company;

  const compensation = toCompensationRange(job);

  const processed = {
    estimated_publish_date: job.estimatedPublishDate,
    workplace_cities: job.workplaceCities,
    technical_tools: job.skills,
    commitment: job.commitment,
    workplace_type: job.workplaceType,
    requirements_summary: job.requirementsSummary,
    min_industry_and_role_yoe: job.minIcYoe ?? null,
    min_management_and_leadership_yoe: job.minMgmtYoe ?? null,
    role_activities: detailsDoc?.roleActivities ?? [],
  };

  const companyData = toUiCompany(companyDoc);

  const lookupId = useMemo(() => getDetailsLookupId(currentJob), [currentJob]);

  useEffect(() => {
    if (!dialogOpen) {
      detailsResolvedForRef.current = null;
      return;
    }
    if (lookupId && detailsResolvedForRef.current !== lookupId) {
      // New selection while dialog is open: allow callback once it resolves.
      detailsResolvedForRef.current = null;
    }
  }, [dialogOpen, lookupId]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (details === undefined) return;
    if (!lookupId) return;
    if (detailsResolvedForRef.current === lookupId) return;
    detailsResolvedForRef.current = lookupId;
    onDetailsResolved?.(lookupId);
  }, [details, dialogOpen, lookupId, onDetailsResolved]);

  useEffect(() => {
    if (!perfEnabled) return;
    if (!dialogOpen) {
      openedAtRef.current = null;
      return;
    }
    openedAtRef.current = performance.now();
  }, [dialogOpen, perfEnabled, lookupId]);

  useEffect(() => {
    if (!perfEnabled) return;
    if (!dialogOpen) return;
    if (details === undefined) return;
    if (!openedAtRef.current) return;
    const elapsed = performance.now() - openedAtRef.current;
    if (elapsed > 120) {
       
      console.log(`[perf] getDetailsLite dialog ${elapsed.toFixed(1)}ms jobId=${lookupId}`);
    }
  }, [details, dialogOpen, lookupId, perfEnabled]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle();
  };

  const dialogContent = (
    <div className="relative p-8 pt-16">
      <DialogStats
        appliedCount={job.applies}
        applyUrl={job.applyUrl ?? ""}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        isInterviewing={isInterviewing}
        isTransitioning={isTransitioning}
        onBookmarkClick={handleBookmarkClick}
        publishDate={processed.estimated_publish_date}
        savedCount={job.saves}
        viewedCount={job.views}
      />

      <div className="-mx-8 sticky top-0 z-20 bg-background px-8 dark:bg-card">
        <DialogJobTitle
          companyName={companyData.name}
          fadeCompanyChrome={fadeCompanyChrome}
          isTransitioning={isTransitioning}
          jobTitle={job.title}
          tools={processed.technical_tools ?? []}
          workplaceCities={processed.workplace_cities ?? []}
        />
      </div>

      <div className={jobFadeClass(isTransitioning)}>
        <DialogBadges
          commitments={processed.commitment ?? []}
          compensation={compensation}
          workplaceCities={processed.workplace_cities ?? []}
          workType={processed.workplace_type ?? ""}
        />
      </div>

      <DialogCompanyLogoCard companyData={companyData} fadeCompanyChrome={fadeCompanyChrome} isTransitioning={isTransitioning} />

      <DialogResponsibilities isTransitioning={isTransitioning} roleActivities={processed.role_activities ?? []} />

      <DialogRequirements
        isTransitioning={isTransitioning}
        minIndustryAndRoleYoe={processed.min_industry_and_role_yoe}
        minManagementAndLeadershipYoe={processed.min_management_and_leadership_yoe}
        requirementsSummary={processed.requirements_summary ?? ""}
      />

      <DialogSkills isTransitioning={isTransitioning} technicalTools={processed.technical_tools ?? []} />

      <DialogJobDescription
        description={detailsDoc?.description ?? ""}
        fadeCompanyChrome={fadeCompanyChrome}
        isLoading={isDetailsLoading}
        loadFailed={detailsLoadFailed}
        isTransitioning={isTransitioning}
      />

      <DialogFooter
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        onBookmarkToggle={onBookmarkToggle}
        applyUrl={job.applyUrl ?? ""}
        companyWebsite={companyData.website}
        navigation={footerNavigation}
      />
    </div>
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={dialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent showCloseButton={false} className="h-[90vh] w-225  min-w-[65vw] max-w-[90vw] border border-border/60 bg-background p-0 dark:border-border dark:bg-card">
        <VisuallyHidden>
          <DialogTitle>Job Details</DialogTitle>
        </VisuallyHidden>
        <DialogClose className="absolute top-4 right-4 z-30 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {outsideNavigation ? (
          <>
            <button
              aria-label={outsideNavigation.previousAriaLabel ?? "Previous job group"}
              className={cn(
                "absolute top-1/2 -left-16 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-accent md:flex",
                outsideNavigation.canGoPrevious === false && "cursor-not-allowed opacity-40 hover:bg-background/95"
              )}
              disabled={outsideNavigation.canGoPrevious === false}
              onClick={() => void outsideNavigation.onPrevious()}
              onMouseEnter={outsideNavigation.onPreviousHover}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label={outsideNavigation.nextAriaLabel ?? "Next job group"}
              className={cn(
                "absolute top-1/2 -right-16 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-accent md:flex",
                outsideNavigation.canGoNext === false && "cursor-not-allowed opacity-40 hover:bg-background/95"
              )}
              disabled={outsideNavigation.canGoNext === false}
              onClick={() => void outsideNavigation.onNext()}
              onMouseEnter={outsideNavigation.onNextHover}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
        <div className="h-full overflow-y-auto" ref={scrollContainerRef}>
          {dialogContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDialogContent;

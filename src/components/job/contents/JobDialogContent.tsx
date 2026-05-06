import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO, JobDetailsResultDTO } from "@/types/convexJobs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
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

  const details = useQuery(api.jobs.getDetailsLite, dialogOpen ? { jobId: getDetailsLookupId(currentJob) as any } : "skip") as unknown as
    | JobDetailsResultDTO
    | null
    | undefined;
  const isDetailsLoading = dialogOpen && details === undefined;
  const job = details?.job ?? currentJob;
  const detailsDoc = details?.details ?? null;
  const companyDoc = details?.company ?? company;

  const compensation = {
    yearly_min_compensation: job.yearlyMinComp ?? null,
    yearly_max_compensation: job.yearlyMaxComp ?? null,
    monthly_min_compensation: job.monthlyMinComp ?? null,
    monthly_max_compensation: job.monthlyMaxComp ?? null,
    weekly_min_compensation: job.weeklyMinComp ?? null,
    weekly_max_compensation: job.weeklyMaxComp ?? null,
    hourly_min_compensation: job.hourlyMinComp ?? null,
    hourly_max_compensation: job.hourlyMaxComp ?? null,
    "bi-weekly_min_compensation": job.biWeeklyMinComp ?? null,
    "bi-weekly_max_compensation": job.biWeeklyMaxComp ?? null,
    daily_min_compensation: job.dailyMinComp ?? null,
    daily_max_compensation: job.dailyMaxComp ?? null,
  };

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

  const companyData = {
    name: companyDoc?.name ?? "",
    website: companyDoc?.homepageUri ?? "",
    image_url: companyDoc?.imageUrl ?? "",
    tagline: companyDoc?.tagline ?? "",
    subsidiaries: [],
    parent_company: "",
    linkedin_url: "",
    industries: companyDoc?.industries ?? [],
    activities: companyDoc?.activities ?? [],
    is_non_profit: false,
    is_public_company: false,
    is_dissolved: false,
    is_acquired: false,
    num_employees: companyDoc?.numEmployees ?? 0,
    year_founded: companyDoc?.yearFounded ?? 0,
    headquarters_country: companyDoc?.hqCountry ?? "",
    total_funding_amount: null,
    total_funding_currency: null,
    latest_investment_amount: null,
    latest_investment_currency: null,
    latest_investment_year: null,
    latest_investment_series: null,
    investors: [],
    stock_exchange: null,
    stock_symbol: null,
    latest_revenue: null,
    latest_revenue_currency: null,
    latest_revenue_year: null,
  };

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
      // eslint-disable-next-line no-console
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
      <div className={cn("transition-opacity duration-300 ease-in-out", isTransitioning ? "opacity-0" : "opacity-100")}>
        <DialogStats
          appliedCount={job.applies}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          onBookmarkClick={handleBookmarkClick}
          publishDate={processed.estimated_publish_date}
          savedCount={job.saves}
          viewedCount={job.views}
          applyUrl={job.applyUrl ?? ""}
        />

        <DialogJobTitle companyName={companyData.name} jobTitle={job.title} workplaceCities={processed.workplace_cities ?? []} tools={processed.technical_tools ?? []} />

        <DialogBadges
          commitments={processed.commitment ?? []}
          compensation={compensation}
          workplaceCities={processed.workplace_cities ?? []}
          workType={processed.workplace_type ?? ""}
        />
      </div>

      <DialogCompanyLogoCard companyData={companyData} />

      <div className={cn("transition-opacity duration-300 ease-in-out", isTransitioning ? "opacity-0" : "opacity-100")}>
        <DialogResponsibilities roleActivities={processed.role_activities ?? []} />

        <DialogRequirements
          requirementsSummary={processed.requirements_summary ?? ""}
          minIndustryAndRoleYoe={processed.min_industry_and_role_yoe}
          minManagementAndLeadershipYoe={processed.min_management_and_leadership_yoe}
        />

        <DialogSkills technicalTools={processed.technical_tools ?? []} />

        <DialogJobDescription description={detailsDoc?.description ?? ""} isLoading={isDetailsLoading} />
      </div>

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
      <DialogContent showCloseButton={false} className="h-[90vh] w-[900px]  min-w-[60vw] max-w-[90vw] border border-border/60 bg-background p-0 dark:border-border dark:bg-card">
        <VisuallyHidden>
          <DialogTitle>Job Details</DialogTitle>
        </VisuallyHidden>
        <DialogClose className="absolute top-4 right-4 z-10 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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

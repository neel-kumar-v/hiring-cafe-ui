import { DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useJobDetailsLite } from "@/hooks/useJobDetailsLite";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DialogBadges, DialogJobDescription, DialogJobTitle, DialogRequirements, DialogSkills } from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import { DialogActionButtons } from "../dialog/DialogFooter";
import DialogResponsibilities from "../dialog/DialogResponsibilities";
export interface JobDrawerNavigationProps {
  onPrevious: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

const JobDrawerContent = ({
  currentJob,
  company,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  onDetailsResolved,
  open,
  onClose,
  navigation,
  isTransitioning = false,
  fadeCompanyChrome = false,
}: {
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  onDetailsResolved?: (jobId: string) => void;
  open: boolean;
  onClose: () => void;
  navigation?: JobDrawerNavigationProps;
  isTransitioning?: boolean;
  fadeCompanyChrome?: boolean;
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasHorizontalSwipe, setHasHorizontalSwipe] = useState(false);
  const perfEnabled = process.env.NODE_ENV !== "production";
  const openedAtRef = useRef<number | null>(null);
  const detailsResolvedForRef = useRef<string | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setHasHorizontalSwipe(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!touchStart || !navigation) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
        setHasHorizontalSwipe(true);
      }
    },
    [navigation, touchStart]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!touchStart || !navigation) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0 && navigation.canGoNext !== false) {
          void navigation.onNext();
        }
        if (deltaX > 0 && navigation.canGoPrevious !== false) {
          void navigation.onPrevious();
        }
      }

      setTouchStart(null);
      if (hasHorizontalSwipe) {
        e.preventDefault();
        e.stopPropagation();
      }
      setHasHorizontalSwipe(false);
    },
    [hasHorizontalSwipe, navigation, touchStart]
  );

  const details = useJobDetailsLite(currentJob, open);
  const isDetailsLoading = open && details === undefined;
  const detailsLoadFailed = open && details === null;
  const job = details?.job ?? currentJob;
  const detailsDoc = details?.details ?? null;
  const companyDoc = details?.company ?? company;

  const companyData = toUiCompany(companyDoc);

  const processed = {
    workplace_cities: job.workplaceCities,
    technical_tools: job.skills,
    commitment: job.commitment,
    workplace_type: job.workplaceType,
    requirements_summary: job.requirementsSummary,
    min_industry_and_role_yoe: job.minIcYoe ?? null,
    min_management_and_leadership_yoe: job.minMgmtYoe ?? null,
    role_activities: detailsDoc?.roleActivities ?? [],
  };

  const lookupId = useMemo(() => getDetailsLookupId(currentJob), [currentJob]);

  useEffect(() => {
    if (!open) {
      detailsResolvedForRef.current = null;
      return;
    }
    if (lookupId && detailsResolvedForRef.current !== lookupId) {
      detailsResolvedForRef.current = null;
    }
  }, [lookupId, open]);

  useEffect(() => {
    if (!open) return;
    if (details === undefined) return;
    if (!lookupId) return;
    if (detailsResolvedForRef.current === lookupId) return;
    detailsResolvedForRef.current = lookupId;
    onDetailsResolved?.(lookupId);
  }, [details, lookupId, onDetailsResolved, open]);

  useEffect(() => {
    if (!perfEnabled) return;
    if (!open) {
      openedAtRef.current = null;
      return;
    }
    openedAtRef.current = performance.now();
  }, [open, perfEnabled, lookupId]);

  useEffect(() => {
    if (!perfEnabled) return;
    if (!open) return;
    if (details === undefined) return;
    if (!openedAtRef.current) return;
    const elapsed = performance.now() - openedAtRef.current;
    if (elapsed > 120) {
       
      console.log(`[perf] getDetailsLite drawer ${elapsed.toFixed(1)}ms jobId=${lookupId}`);
    }
  }, [details, lookupId, open, perfEnabled]);

  return (
    <Drawer
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
    >
      <DrawerContent className="w-full max-w-full rounded-t-xl">
        <VisuallyHidden>
          <DialogTitle>Job Details</DialogTitle>
        </VisuallyHidden>
        <div className="sticky top-0 z-10 border-border p-2 max-sm:border-b dark:border-border">
          <DialogActionButtons
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={onApplyToggle}
            onBookmarkToggle={onBookmarkToggle}
            applyUrl={job.applyUrl ?? ""}
            companyUrl={companyData.website}
          />
        </div>
        <div className="space-y-4 overflow-y-auto p-4" onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove} onTouchStart={handleTouchStart}>
          <DialogJobTitle
            companyName={companyData.name}
            fadeCompanyChrome={fadeCompanyChrome}
            isTransitioning={isTransitioning}
            jobTitle={job.title}
            tools={processed.technical_tools ?? []}
            workplaceCities={processed.workplace_cities ?? []}
          />
          <DialogCompanyLogoCard companyData={companyData} fadeCompanyChrome={fadeCompanyChrome} isTransitioning={isTransitioning} />
          <div className={jobFadeClass(isTransitioning)}>
            <DialogBadges
              commitments={processed.commitment ?? []}
              compensation={toCompensationRange(job)}
              workplaceCities={processed.workplace_cities ?? []}
              workType={processed.workplace_type ?? ""}
              compact={true}
            />
          </div>
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JobDrawerContent;

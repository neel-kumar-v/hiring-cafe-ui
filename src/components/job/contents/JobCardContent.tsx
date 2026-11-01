import { jobFadeClass, jobKeepVisibleClass } from "@/lib/jobs/fadeTransition";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { memo, useMemo } from "react";
import CardCompanyInfo from "../card/CardCompanyInfo";
import CardHeader from "../card/CardHeader";
import CardJobDescription from "../card/CardJobDescription";
import NewBadge, { isJobNew, shouldShowNewBadge } from "../card/NewBadge";

interface JobCardContentProps {
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isTransitioning: boolean;
  isSelected?: boolean;
  isSeen?: boolean;
  unreadView?: boolean;
}

const JobCardContent = memo(({ currentJob, company, isTransitioning, isSelected = false, isSeen = false, unreadView = false }: JobCardContentProps) => {
  const compensation = useMemo(() => toCompensationRange(currentJob), [currentJob]);

  const requirementsSummary = useMemo(() => currentJob.requirementsSummary ?? "", [currentJob.requirementsSummary]);

  const technicalTools = useMemo(() => currentJob.skills ?? [], [currentJob.skills]);

  const minIndustryAndRoleYoe = useMemo(() => currentJob.minIcYoe ?? null, [currentJob.minIcYoe]);

  const minManagementAndLeadershipYoe = useMemo(() => currentJob.minMgmtYoe ?? null, [currentJob.minMgmtYoe]);

  const companySubtitle = useMemo(() => company?.tagline?.trim() || company?.description?.trim() || "", [company?.tagline, company?.description]);

  const workplaceLocations = useMemo(() => {
    const cities = currentJob.workplaceCities ?? [];
    if (cities.length > 0) return cities;
    const states = currentJob.workplaceStates ?? [];
    const countries = currentJob.workplaceCountries ?? [];
    const parts = [...states, ...countries].filter((s) => typeof s === "string" && s.trim());
    if (parts.length > 0) return [parts.slice(0, 3).join(", ")];
    return [];
  }, [currentJob.workplaceCities, currentJob.workplaceStates, currentJob.workplaceCountries]);
  const commitments = currentJob.commitment ?? [];
  const workType = currentJob.workplaceType ?? "";

  // Same predicate the board's "Unread" filter uses, gated by session seen state,
  // selection state, and the active unread view.
  const isNew = useMemo(() => isJobNew(currentJob), [currentJob]);
  const showBadge = useMemo(
    () =>
      shouldShowNewBadge({
        isNew,
        isSeen,
        isSelected,
        unreadView,
      }),
    [isNew, isSeen, isSelected, unreadView]
  );

  return (
    <div className="flex flex-1 flex-col">
      {showBadge ? (
        // The card root (JobBoardCard) is `position: relative`, so this pill
        // anchors to the card border instead of the content box: it straddles
        // the top edge (the job title starts below, in the card's top padding)
        // and stays put when the card expands on hover.
        <div className={cn(jobFadeClass(isTransitioning), "pointer-events-none absolute top-0 left-2 z-20 -translate-y-1/2")}>
          <NewBadge />
        </div>
      ) : null}
      <div className={jobFadeClass(isTransitioning)}>
        <CardHeader
          tools={technicalTools}
          commitments={commitments}
          companyName={company?.name ?? ""}
          compensation={compensation}
          jobTitle={currentJob.title}
          workplaceCities={workplaceLocations}
          workType={workType}
        />
      </div>

      {/* Company info is shared by every job in the collection, so it stays visible while the rest of the card fades. */}
      <div className={jobKeepVisibleClass()}>
        <CardCompanyInfo companyData={toUiCompany(company)} tagline={companySubtitle} />
      </div>

      <div className={jobFadeClass(isTransitioning)}>
        <CardJobDescription
          requirementsSummary={requirementsSummary}
          technicalTools={technicalTools}
          minIndustryAndRoleYoe={minIndustryAndRoleYoe}
          minManagementAndLeadershipYoe={minManagementAndLeadershipYoe}
        />
      </div>
    </div>
  );
});

JobCardContent.displayName = "JobCardContent";

export default JobCardContent;

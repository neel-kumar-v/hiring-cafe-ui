"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatState, getCleanJobTitle, getCompensation, getExperienceInfo, getLocation } from "@/lib/job-info";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn, decodeLocationForDisplay } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import type { JobCategory } from "@/types/tracker";
import { Briefcase, Building2, Clock, DollarSign, MapPin, type LucideIcon } from "lucide-react";
import { memo, useMemo, type ReactNode } from "react";
import CompanyLogo from "../util/CompanyLogo";
import ScrapeTime from "../util/ScrapeTime";

interface ListJobCardContentsProps {
  job: JobDTO;
  company: CompanyDTO | null;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

function FactLine({ icon: Icon, children, emphasize = false }: { icon: LucideIcon; children: ReactNode; emphasize?: boolean }) {
  if (children == null || children === false || children === "") return null;
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90">
      <Icon className="size-3.5 shrink-0 text-foreground/65" aria-hidden />
      <span className={cn("truncate", emphasize && "font-medium tracking-[-0.01em] text-foreground tabular-nums")}>{children}</span>
    </div>
  );
}

function shortCompanyBlurb(company: CompanyDTO | null): string {
  const raw = company?.tagline?.trim() || company?.description?.trim() || "";
  if (!raw) return "";
  const clause = (raw.split(/[.|•\n]/)[0] ?? raw).trim();
  if (!clause) return "";
  return clause.length > 52 ? `${clause.slice(0, 49).trimEnd()}…` : clause;
}

const ListJobCardContents = memo(({ job, company, currentStage, onMoveJob }: ListJobCardContentsProps) => {
  const cities = job.workplaceCities ?? [];
  const states = job.workplaceStates ?? [];
  const countries = job.workplaceCountries ?? [];

  const cityLocations = cities.map(getLocation).filter(Boolean);
  const stateLocations = states.map((state) => formatState(decodeLocationForDisplay(state))).filter(Boolean);
  const countryLocations = countries.map(decodeLocationForDisplay).filter((country) => country && !/^(us|united states)$/i.test(country));

  const locationLabels =
    cityLocations.length > 0 ? cityLocations : stateLocations.length > 0 ? stateLocations : countryLocations.length > 0 ? countryLocations : [];

  const primaryLocation = locationLabels[0] ?? (job.workplaceType?.toLowerCase().includes("remote") ? "Remote" : "");
  const moreLocationCount = Math.max(0, locationLabels.length - 1);
  const moreLocationsText = useMemo(() => locationLabels.slice(1).join("\n"), [locationLabels]);

  const compensation = useMemo(() => getCompensation(toCompensationRange(job)), [job]);
  const experience = useMemo(() => getExperienceInfo(job.minIcYoe, job.minMgmtYoe), [job.minIcYoe, job.minMgmtYoe]);
  const experienceLabel = experience.industryBadge || experience.leadershipBadge || "";
  const workplaceType = job.workplaceType?.trim() || "";
  const commitment = (job.commitment ?? []).filter(Boolean)[0] || "";
  const companyBlurb = useMemo(() => shortCompanyBlurb(company), [company]);
  const cleanTitle = useMemo(
    () => getCleanJobTitle(job.title, company?.name ?? "", primaryLocation, job.skills ?? []),
    [company?.name, job.skills, job.title, primaryLocation]
  );
  const hasFacts = Boolean(primaryLocation || workplaceType || commitment || experienceLabel || compensation);

  const handleStageChange = (stageId: string) => {
    if (onMoveJob && stageId !== currentStage) {
      onMoveJob(job.externalId, currentStage, stageId as JobCategory);
    }
  };

  return (
    <div className="flex flex-row items-stretch gap-3.5 max-[480px]:flex-col">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <CompanyLogo companyData={toUiCompany(company)} size="list" variant="default" className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-[0.9375rem] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground">
                {cleanTitle}
              </h3>
              <p className="mt-0.5 truncate text-[0.75rem] leading-snug tracking-[0.01em] text-muted-foreground">
                <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-foreground/85">{company?.name ?? ""}</span>
                {companyBlurb ? <span className="text-muted-foreground"> · {companyBlurb}</span> : null}
              </p>
            </div>
            <ScrapeTime
              postedAt={job.estimatedPublishDate ?? ""}
              postedAtMillis={job.estimatedPublishDateMillis}
              createdAt={job.createdAt}
              iconClassName="size-3"
              textClassName="text-[0.6875rem] tracking-[0.02em] text-muted-foreground"
              className="shrink-0 pt-0.5"
            />
          </div>

          {hasFacts ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-1">
                {primaryLocation ? (
                  <div className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90">
                    <MapPin className="size-3.5 shrink-0 text-foreground/65" aria-hidden />
                    <span className="truncate">{primaryLocation}</span>
                    {moreLocationCount > 0 ? (
                      <Tooltip>
                        <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <span
                            tabIndex={0}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex shrink-0 cursor-default items-center text-[0.8125rem] font-medium leading-snug tracking-[0.01em] text-foreground/50 underline-offset-2 transition-colors hover:text-foreground/75 hover:underline focus:outline-none focus-visible:text-foreground/75 focus-visible:underline"
                          >
                            +{moreLocationCount} more
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={4} className="max-h-60 max-w-xs overflow-y-auto text-xs">
                          <p className="whitespace-pre-line leading-snug">{moreLocationsText}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                ) : null}
                <FactLine icon={Building2}>{workplaceType}</FactLine>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <FactLine icon={Clock}>{commitment}</FactLine>
                <FactLine icon={Briefcase}>{experienceLabel}</FactLine>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <FactLine icon={DollarSign} emphasize>
                  {compensation}
                </FactLine>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="flex shrink-0 items-center max-[480px]:w-full"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Select value={currentStage} onValueChange={(e) => handleStageChange(e)}>
          <SelectTrigger className="w-32 max-[480px]:w-full px-3 py-2 text-sm">
            <SelectValue placeholder="Select Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

ListJobCardContents.displayName = "ListJobCardContents";

export default ListJobCardContents;

"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatState, getCleanJobTitle, getCompensation, getExperienceInfo, getLocation } from "@/lib/job-info";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { decodeLocationForDisplay } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import type { JobCategory } from "@/types/tracker";
import { DollarSign, MapPin } from "lucide-react";
import { memo, useMemo } from "react";
import CompanyLogo from "../util/CompanyLogo";
import ScrapeTime from "../util/ScrapeTime";

interface ListJobCardContentsProps {
  job: JobDTO;
  company: CompanyDTO | null;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const ListJobCardContents = memo(({ job, company, currentStage, onMoveJob }: ListJobCardContentsProps) => {
  const cities = job.workplaceCities ?? [];
  const states = job.workplaceStates ?? [];
  const countries = job.workplaceCountries ?? [];

  const cityLocations = cities.map(getLocation).filter(Boolean);
  const stateLocations = states.map((state) => formatState(decodeLocationForDisplay(state))).filter(Boolean);
  const countryLocations = countries.map(decodeLocationForDisplay).filter((country) => country && !/^(us|united states)$/i.test(country));

  const locations =
    cityLocations.length > 0
      ? cityLocations.join(", ")
      : stateLocations.length > 0
        ? stateLocations.join(", ")
        : countryLocations.length > 0
          ? countryLocations.join(", ")
          : "Remote";

  const compensation = useMemo(() => getCompensation(toCompensationRange(job)), [job]);
  const experience = useMemo(() => getExperienceInfo(job.minIcYoe, job.minMgmtYoe), [job.minIcYoe, job.minMgmtYoe]);
  const skills = useMemo(() => (job.skills ?? []).filter(Boolean).slice(0, 4), [job.skills]);
  const workplaceType = job.workplaceType?.trim() || "";
  const commitment = (job.commitment ?? []).filter(Boolean)[0] || "";
  const cleanTitle = useMemo(
    () => getCleanJobTitle(job.title, company?.name ?? "", locations, job.skills ?? []),
    [company?.name, job.skills, job.title, locations]
  );

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
          <div>
            <h3 className="truncate text-sm font-semibold leading-snug text-foreground">{cleanTitle}</h3>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{company?.name ?? ""}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {locations ? (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {locations !== "Remote" ? <MapPin className="size-3 shrink-0" /> : null}
                  <span>{locations}</span>
                </Badge>
              ) : null}
              {workplaceType ? (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {workplaceType}
                </Badge>
              ) : null}
              {commitment ? (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {commitment}
                </Badge>
              ) : null}
              {experience.industryBadge ? (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {experience.industryBadge}
                </Badge>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {compensation ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-foreground">
                  <DollarSign className="size-3 shrink-0" />
                  {compensation}
                </span>
              ) : null}
              <ScrapeTime
                postedAt={job.estimatedPublishDate ?? ""}
                postedAtMillis={job.estimatedPublishDateMillis}
                createdAt={job.createdAt}
                iconClassName="size-3"
                textClassName="text-xs"
              />
            </div>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                  {skill}
                </Badge>
              ))}
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

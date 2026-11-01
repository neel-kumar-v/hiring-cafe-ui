"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCompanyWebsite } from "@/lib/company-info";
import { getCleanJobTitle, getCompensation, getExperienceInfo, getLocations } from "@/lib/job-info";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { Bookmark, DollarSign, EyeOff, Link2, MapPin, Send } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { JobBoardCollection } from "@/lib/jobs/jobBoard";
import NewBadge, { isJobNew, shouldShowNewBadge } from "./card/NewBadge";
import CardStats from "./card/CardStats";
import CompanyLogo from "./util/CompanyLogo";
import ScrapeTime from "./util/ScrapeTime";

interface JobBoardListRowProps {
  job: JobDTO;
  company: CompanyDTO | null;
  collection?: JobBoardCollection;
  collectionIndex?: number;
  currentJobIndex?: number;
  onJobIndexChange?: (collectionIndex: number, nextJobIndex: number) => void;
  onOpenJob?: (collectionIndex: number, jobIndex: number) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onClick: (event: React.MouseEvent) => void;
  onHide?: (event: React.MouseEvent) => void;
}

/**
 * Taller list row for the board List layout. Keeps the card identity (logo,
 * title, company) but adds salary, workplace, YOE, skills, and a requirements
 * snippet without the sparse icon-column chrome LinkedIn-style cards waste.
 */
const JobBoardListRow = memo(
  ({
    job,
    company,
    collection,
    collectionIndex,
    currentJobIndex,
    onJobIndexChange,
    onOpenJob,
    isSelected = false,
    selectionMode = false,
    onClick,
    onHide,
  }: JobBoardListRowProps) => {
    const { unreadView, isJobSeen } = useSearchUI();
    const { prefetchNow } = useJobDetailsPrefetch({ delayMs: 160, maxInflight: 4, maxSeen: 600 });
    const [localJobIndex, setLocalJobIndex] = useState(0);

    const jobs = useMemo(() => {
      if (collection?.jobs && collection.jobs.length > 0) {
        return collection.jobs;
      }
      return [job];
    }, [collection?.jobs, job]);

    const activeIndex = currentJobIndex ?? localJobIndex;
    const currentJob = jobs[activeIndex] ?? jobs[0] ?? job;

    const handleRoleSelect = useCallback(
      (index: number) => {
        setLocalJobIndex(index);
        if (onJobIndexChange && collectionIndex !== undefined) {
          onJobIndexChange(collectionIndex, index);
        }
        if (jobs[index]) {
          prefetchNow(getDetailsLookupId(jobs[index]));
        }
      },
      [collectionIndex, jobs, onJobIndexChange, prefetchNow]
    );

    const otherRoles = useMemo(() => {
      if (jobs.length <= 1) return [];
      return jobs
        .map((j, index) => ({ job: j, index }))
        .filter((item) => item.index !== activeIndex);
    }, [jobs, activeIndex]);

    // Same tracker state the card footer actions read and write, so the row's
    // Apply / Save buttons mirror the card view exactly.
    const { addJob, removeJob, user } = useApp();
    const companyName = company?.name ?? "";
    const workplaceCities = currentJob.workplaceCities ?? [];
    const workplaceStates = currentJob.workplaceStates ?? [];
    const workplaceCountries = currentJob.workplaceCountries ?? [];

    const title = useMemo(
      () => getCleanJobTitle(currentJob.title, companyName, workplaceCities[0] ?? "", currentJob.skills ?? []),
      [companyName, currentJob.skills, currentJob.title, workplaceCities]
    );

    const locationLabels = useMemo(() => {
      const fromCities = getLocations(workplaceCities);
      if (fromCities.length > 0) return fromCities.slice(0, 2);
      const states = workplaceStates.map((s) => s.trim()).filter(Boolean);
      if (states.length > 0) return states.slice(0, 2);
      const countries = workplaceCountries.map((c) => c.trim()).filter((c) => c && !/^(us|united states)$/i.test(c));
      return countries.slice(0, 2);
    }, [workplaceCities, workplaceCountries, workplaceStates]);

    const compensation = useMemo(() => getCompensation(toCompensationRange(currentJob)), [currentJob]);
    const isSeen = isJobSeen(currentJob.externalId);
    const isNew = useMemo(() => isJobNew(currentJob), [currentJob]);
    const hasNewUnseen = useMemo(() => jobs.some((j) => isJobNew(j) && !isJobSeen(j.externalId)), [jobs, isJobSeen]);
    const showBadge = useMemo(() => shouldShowNewBadge({ isNew: hasNewUnseen || isNew, isSeen, isSelected, unreadView }), [hasNewUnseen, isNew, isSeen, isSelected, unreadView]);
    const tagline = useMemo(() => company?.tagline?.trim() || company?.description?.trim() || "", [company?.description, company?.tagline]);
    const workplaceType = currentJob.workplaceType?.trim() || "";
    const commitment = (currentJob.commitment ?? []).filter(Boolean).slice(0, 1).join("");
    const experience = useMemo(() => getExperienceInfo(currentJob.minIcYoe, currentJob.minMgmtYoe), [currentJob.minIcYoe, currentJob.minMgmtYoe]);
    const skills = useMemo(() => (currentJob.skills ?? []).filter(Boolean).slice(0, 4), [currentJob.skills]);
    const summary = currentJob.requirementsSummary?.trim() || "";
    const industry = company?.industries?.[0]?.trim() || "";
    const companyWebsite = useMemo(
      () => company?.homepageUri || (company?.canonicalDomain ? `https://${company.canonicalDomain}` : ""),
      [company?.canonicalDomain, company?.homepageUri]
    );

    const isBookmarked = useMemo(
      () => user.saved.includes(currentJob.externalId) || user.applied.includes(currentJob.externalId) || user.interviewing.includes(currentJob.externalId),
      [user.saved, user.applied, user.interviewing, currentJob.externalId]
    );

    const isApplied = useMemo(
      () => user.applied.includes(currentJob.externalId) || user.interviewing.includes(currentJob.externalId),
      [user.applied, user.interviewing, currentJob.externalId]
    );

    const isInterviewing = useMemo(() => user.interviewing.includes(currentJob.externalId), [user.interviewing, currentJob.externalId]);

    const handleBookmarkToggle = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookmarked) {
          if (user.saved.includes(currentJob.externalId)) removeJob(currentJob.externalId, "saved");
          if (user.applied.includes(currentJob.externalId)) removeJob(currentJob.externalId, "applied");
          if (user.interviewing.includes(currentJob.externalId)) removeJob(currentJob.externalId, "interviewing");
        } else {
          addJob(currentJob.externalId, "saved");
        }
      },
      [isBookmarked, user.saved, user.applied, user.interviewing, currentJob.externalId, removeJob, addJob]
    );

    const handleHide = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onHide) {
          onHide(e);
          return;
        }
        const jobId = currentJob.externalId;
        if (user.hidden.includes(jobId)) {
          toast.info("Job is already hidden.");
          return;
        }
        if (user.saved.includes(jobId)) removeJob(jobId, "saved");
        if (user.applied.includes(jobId)) removeJob(jobId, "applied");
        if (user.interviewing.includes(jobId)) removeJob(jobId, "interviewing");
        if (user.rejected.includes(jobId)) removeJob(jobId, "rejected");

        addJob(jobId, "hidden");
        toast.success("Job hidden.");
      },
      [addJob, currentJob.externalId, onHide, removeJob, user.applied, user.hidden, user.interviewing, user.rejected, user.saved]
    );

    if (user.hidden.includes(currentJob.externalId)) {
      return null;
    }

  return (
    <Card
      data-job-card="true"
      onClick={onClick}
      className={cn(
        "group/row @container/row relative flex cursor-pointer flex-col gap-2.5 border bg-background p-3.5 shadow-sm sm:p-4",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
        selectionMode && "select-none"
      )}
    >
      {showBadge ? (
        <div className="pointer-events-none absolute top-0 left-3 z-20 -translate-y-1/2">
          <NewBadge />
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <CompanyLogo companyData={toUiCompany(company)} size="list" variant="card" className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg">{title}</h3>
              {locationLabels.map((loc) => (
                <Badge key={loc} variant="outline" className="font-normal text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span>{loc}</span>
                </Badge>
              ))}
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
              ) : experience.leadershipBadge ? (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {experience.leadershipBadge}
                </Badge>
              ) : null}
            </div>
            <div className="hidden shrink-0 items-center gap-2 @min-[520px]/row:flex">
              {compensation ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-foreground">
                  <DollarSign className="size-3 shrink-0" />
                  {compensation}
                </span>
              ) : null}
              <ScrapeTime
                postedAt={currentJob.estimatedPublishDate ?? ""}
                postedAtMillis={currentJob.estimatedPublishDateMillis}
                createdAt={currentJob.createdAt}
                iconClassName="size-3"
                textClassName="text-xs"
              />
            </div>
          </div>

          <p className="truncate text-xs text-muted-foreground sm:text-[0.8125rem]">
            <span className="text-sm font-medium text-foreground/80">{companyName || "Unknown company"}</span>
            {industry ? <span className="text-muted-foreground"> · {industry}</span> : null}
            {tagline ? <span className="text-muted-foreground"> · {tagline}</span> : null}
          </p>
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {summary ? <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary}</p> : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground @min-[520px]/row:hidden">
        {compensation ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 font-medium text-foreground">
            <DollarSign className="size-3 shrink-0" />
            {compensation}
          </span>
        ) : null}
        <ScrapeTime
          postedAt={currentJob.estimatedPublishDate ?? ""}
          postedAtMillis={currentJob.estimatedPublishDateMillis}
          createdAt={currentJob.createdAt}
          iconClassName="size-3"
          textClassName="text-xs"
        />
      </div>

      {otherRoles.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {otherRoles.map(({ job: otherJob, index: otherIndex }) => {
            const otherTitle =
              getCleanJobTitle(otherJob.title, companyName, otherJob.workplaceCities?.[0] ?? "", otherJob.skills ?? []) ||
              otherJob.title ||
              "Role";
            return (
              <Button
                key={otherJob.externalId}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 max-w-full truncate px-2.5 text-xs font-normal hover:border-primary/50 hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect(otherIndex);
                }}
                onMouseEnter={() => {
                  prefetchNow(getDetailsLookupId(otherJob));
                }}
                title={otherTitle}
              >
                <span className="truncate">{otherTitle}</span>
              </Button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <CardStats
          appliedCount={currentJob.applies}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          onBookmarkToggle={handleBookmarkToggle}
          savedCount={currentJob.saves}
          viewedCount={currentJob.views}
          applyUrl={currentJob.applyUrl ?? ""}
        />

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
          {currentJob.applyUrl ? (
            <Button
              asChild
              size="sm"
              variant="default"
              className="h-8 gap-1.5 bg-primary text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <a
                href={currentJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Send className="size-3.5" />
                <span>Apply Now</span>
              </a>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="default"
              disabled
              className="h-8 gap-1.5 bg-primary text-xs font-medium text-primary-foreground shadow-xs opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Send className="size-3.5" />
              <span>Apply Now</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleBookmarkToggle}
            className="h-8 gap-1.5 text-xs font-normal"
          >
            <Bookmark className={cn("size-3.5", isBookmarked && "fill-primary text-primary")} />
            <span>{isBookmarked ? "Saved" : "Save"}</span>
          </Button>

          {companyWebsite ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-normal"
            >
              <a
                href={formatCompanyWebsite(companyWebsite)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Link2 className="size-3.5" />
                <span>Company Link</span>
              </a>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              className="h-8 gap-1.5 text-xs font-normal opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 className="size-3.5" />
              <span>Company Link</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleHide}
            className="h-8 gap-1.5 text-xs font-normal text-muted-foreground hover:text-destructive"
          >
            <EyeOff className="size-3.5" />
            <span>Hide</span>
          </Button>
        </div>
      </div>
    </Card>
  );
});

JobBoardListRow.displayName = "JobBoardListRow";

export default JobBoardListRow;

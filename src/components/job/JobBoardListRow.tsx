"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCompanyWebsite } from "@/lib/company-info";
import { getCleanJobTitle, getCompensation, getExperienceInfo, getLocations } from "@/lib/job-info";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  EyeOff,
  Link2,
  MapPin,
  MoreHorizontal,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { JobBoardCollection } from "@/lib/jobs/jobBoard";
import NewBadge, { isJobNew, shouldShowNewBadge } from "./card/NewBadge";
import CardStats from "./card/CardStats";
import CompanyLogo from "./util/CompanyLogo";
import ScrapeTime from "./util/ScrapeTime";

/** Jobright-style meta fact: icon + plain text (no outline pill). */
function FactLine({ icon: Icon, children, emphasize = false }: { icon: LucideIcon; children: ReactNode; emphasize?: boolean }) {
  if (children == null || children === false || children === "") return null;
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90">
      <Icon className="size-3.5 shrink-0 text-foreground/65" aria-hidden />
      <span className={cn("truncate", emphasize && "font-medium tracking-[-0.01em] text-foreground tabular-nums")}>{children}</span>
    </div>
  );
}

/** First clause of tagline/description (not industry) — full clause, not character-clipped. */
function shortCompanyBlurb(company: CompanyDTO | null): string {
  const raw = company?.tagline?.trim() || company?.description?.trim() || "";
  if (!raw) return "";
  return (raw.split(/[.|•\n]/)[0] ?? raw).trim();
}

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
 * List-mode board row: logo + title + company blurb, Jobright-style icon-grid
 * facts (location/workplace · commitment/level · salary), compact skill chips,
 * then footer (stats · sibling roles · Apply/Save/···). No match-% panel.
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

    const handleRoleClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        if (index === activeIndex) return;
        handleRoleSelect(index);
        if (onOpenJob && collectionIndex !== undefined) {
          onOpenJob(collectionIndex, index);
        }
      },
      [activeIndex, collectionIndex, handleRoleSelect, onOpenJob]
    );

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
      if (fromCities.length > 0) return fromCities;
      const states = workplaceStates.map((s) => s.trim()).filter(Boolean);
      if (states.length > 0) return states;
      const countries = workplaceCountries.map((c) => c.trim()).filter((c) => c && !/^(us|united states)$/i.test(c));
      return countries;
    }, [workplaceCities, workplaceCountries, workplaceStates]);

    const primaryLocation = locationLabels[0] ?? "";
    const moreLocationCount = Math.max(0, locationLabels.length - 1);
    const moreLocationsText = useMemo(() => locationLabels.slice(1).join("\n"), [locationLabels]);

    const compensation = useMemo(() => getCompensation(toCompensationRange(currentJob)), [currentJob]);
    const isSeen = isJobSeen(currentJob.externalId);
    const isNew = useMemo(() => isJobNew(currentJob), [currentJob]);
    const hasNewUnseen = useMemo(() => jobs.some((j) => isJobNew(j) && !isJobSeen(j.externalId)), [jobs, isJobSeen]);
    const showBadge = useMemo(() => shouldShowNewBadge({ isNew: hasNewUnseen || isNew, isSeen, isSelected, unreadView }), [hasNewUnseen, isNew, isSeen, isSelected, unreadView]);
    const workplaceType = currentJob.workplaceType?.trim() || "";
    const commitment = (currentJob.commitment ?? []).filter(Boolean).slice(0, 1).join("");
    const experience = useMemo(() => getExperienceInfo(currentJob.minIcYoe, currentJob.minMgmtYoe), [currentJob.minIcYoe, currentJob.minMgmtYoe]);
    const experienceLabel = experience.industryBadge || experience.leadershipBadge || "";
    const companyBlurb = useMemo(() => shortCompanyBlurb(company), [company]);
    const companyWebsite = useMemo(
      () => company?.homepageUri || (company?.canonicalDomain ? `https://${company.canonicalDomain}` : ""),
      [company?.canonicalDomain, company?.homepageUri]
    );
    const hasFacts = Boolean(primaryLocation || workplaceType || commitment || experienceLabel || compensation);

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

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CompanyLogo companyData={toUiCompany(company)} size="list" variant="card" className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[0.9375rem] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground sm:text-[1.0625rem]">
              {title}
            </h3>
            <p className="mt-0.5 text-[0.75rem] leading-snug tracking-[0.01em] text-muted-foreground sm:text-[0.8125rem]">
              <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-foreground/85 sm:text-sm">
                {companyName || "Unknown company"}
              </span>
              {companyBlurb ? <span className="text-muted-foreground"> · {companyBlurb}</span> : null}
            </p>
          </div>
        </div>

        <ScrapeTime
          postedAt={currentJob.estimatedPublishDate ?? ""}
          postedAtMillis={currentJob.estimatedPublishDateMillis}
          createdAt={currentJob.createdAt}
          iconClassName="size-3"
          textClassName="text-[0.6875rem] tracking-[0.02em] text-muted-foreground"
          className="shrink-0 pt-1"
        />
      </div>

      {/* Jobright-style facts: 3 columns of icon + plain text (not outline pills). */}
      {hasFacts ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 @[380px]/row:grid-cols-3">
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

      {/* 3-zone footer: left stats | center roles | right actions */}
      <div data-card-footer="true" className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex shrink-0 items-center">
          <CardStats
            appliedCount={currentJob.applies}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            isInterviewing={isInterviewing}
            onBookmarkToggle={handleBookmarkToggle}
            savedCount={currentJob.saves}
            viewedCount={currentJob.views}
            applyUrl={currentJob.applyUrl ?? ""}
            quiet
          />
        </div>

        {jobs.length > 1 ? (
          <div
            className="order-3 flex w-full min-w-0 flex-wrap items-center justify-center gap-1.5 px-1 sm:order-none sm:w-auto sm:flex-1 sm:px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {jobs.map((roleJob, roleIndex) => {
              const isSelectedRole = roleIndex === activeIndex;
              const roleTitle =
                getCleanJobTitle(roleJob.title, companyName, roleJob.workplaceCities?.[0] ?? "", roleJob.skills ?? []) ||
                roleJob.title ||
                "Role";
              return (
                <Button
                  key={roleJob.externalId}
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-pressed={isSelectedRole}
                  className={cn(
                    "h-7 max-w-[200px] truncate px-2.5 text-xs transition-colors sm:max-w-[260px]",
                    isSelectedRole
                      ? "border-primary bg-primary/10 font-medium text-primary hover:bg-primary/15 hover:border-primary"
                      : "font-normal text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-foreground"
                  )}
                  onClick={(e) => handleRoleClick(e, roleIndex)}
                  onMouseEnter={() => {
                    prefetchNow(getDetailsLookupId(roleJob));
                  }}
                  title={roleTitle}
                >
                  <span className="truncate">{roleTitle}</span>
                </Button>
              );
            })}
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="size-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {companyWebsite ? (
                <DropdownMenuItem asChild>
                  <a
                    href={formatCompanyWebsite(companyWebsite)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Link2 className="size-4" />
                    <span>Company Link</span>
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <Link2 className="size-4" />
                  <span>Company Link</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleHide}
                className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-destructive focus:text-destructive"
              >
                <EyeOff className="size-4" />
                <span>Hide</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});

JobBoardListRow.displayName = "JobBoardListRow";

export default JobBoardListRow;

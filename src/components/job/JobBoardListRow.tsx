"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCompanyWebsite } from "@/lib/company-info";
import { isInteractiveCardTarget } from "@/lib/jobs/cardClickTargets";
import { getCleanJobTitle, getCompensation, getExperienceInfo, getLocations } from "@/lib/job-info";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { cn } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bookmark, Briefcase, Building2, Clock, DollarSign, EyeOff, Link2, MapPin, Send, type LucideIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { JobBoardCollection } from "@/lib/jobs/jobBoard";
import NewBadge, { isJobNew, shouldShowNewBadge } from "./card/NewBadge";
import CardStats from "./card/CardStats";
import { LAST_LINE_FADE_CLASSES, useLastLineClamp } from "./card/lastLineClamp";
import CompanyLogo from "./util/CompanyLogo";
import MoreLocationsControl from "./util/MoreLocationsControl";
import ScrapeTime from "./util/ScrapeTime";

/*
 * Footer action cluster sizing. Apply (solid primary) and Save (outline) share
 * ACTION_BUTTON_SIZE_CLASS verbatim — same 32px height, horizontal padding,
 * gap and text size — so the solid pink fill cannot render taller or chunkier
 * than the outline beside it. Radius comes from Button's base `rounded-lg`,
 * and both icon buttons take the same h-8, so all four controls sit on one
 * baseline. Icons match too: the labelled buttons share one icon size.
 */
const ACTION_BUTTON_SIZE_CLASS = "h-8 gap-1.5 px-2.5 text-xs";
const ACTION_BUTTON_ICON_CLASS = "size-3.5";
const ACTION_ICON_BUTTON_CLASS = "h-8 w-8 p-0";

/** Jobright-style meta fact: icon + plain text (no outline pill). */
function FactLine({ icon: Icon, children, emphasize = false, className }: { icon: LucideIcon; children: ReactNode; emphasize?: boolean; className?: string }) {
  if (children == null || children === false || children === "") return null;
  return (
    <div className={cn("flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90", className)}>
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
  isSelected?: boolean;
  selectionMode?: boolean;
  onClick: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
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
    isSelected = false,
    selectionMode = false,
    onClick,
    onMouseDown,
    onHide,
  }: JobBoardListRowProps) => {
    const { unreadView, isJobSeen } = useSearchUI();
    const { prefetchNow } = useJobDetailsPrefetch({ delayMs: 160, maxInflight: 4, maxSeen: 600 });
    const [localJobIndex, setLocalJobIndex] = useState(0);
    // The company blurb is the row's only prose. It rests at two lines with the
    // same last-line vignette the card description uses, so a long tagline
    // cannot push the facts and actions around; the measured clamp keeps the
    // second line whole when the bold name span makes it taller.
    const blurbRef = useRef<HTMLSpanElement>(null);
    const blurbClamp = useLastLineClamp(blurbRef);

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
        // Role chips only switch which sibling role the card previews; the
        // detail dialog opens from the card body, never from here.
        handleRoleSelect(index);
      },
      [activeIndex, handleRoleSelect]
    );

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        // Clicks on interactive chrome (role chips, Apply, Save, icon actions)
        // stay on that control and never bubble up to the dialog opener.
        if (isInteractiveCardTarget(e.target)) return;
        onClick(e);
      },
      [onClick]
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
    // Wide rows group the facts into up to three stacks (location/workplace ·
    // commitment/level · salary). Missing facts collapse whole stacks, so the
    // grid column count (and the reserved space) follows what is actually
    // rendered — a job without salary cannot strand an empty third column.
    const hasLocationColumn = Boolean(primaryLocation || workplaceType);
    const hasCommitmentColumn = Boolean(commitment || experienceLabel);
    const wideFactColumnCount = [hasLocationColumn, hasCommitmentColumn, Boolean(compensation)].filter(Boolean).length;
    const wideFactsColumnClass = wideFactColumnCount >= 3 ? "@[560px]/row:grid-cols-3" : wideFactColumnCount === 2 ? "@[560px]/row:grid-cols-2" : "@[560px]/row:grid-cols-1";

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
        onClick={handleCardClick}
        onMouseDown={onMouseDown}
        className={cn(
          "group/row @container/row relative flex cursor-pointer select-none flex-col gap-2.5 border bg-background px-3.5 pt-3.5 pb-2.5 shadow-sm sm:px-4 sm:pt-4 sm:pb-2.5",
          isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
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
              <h3 className="truncate font-display text-[0.9375rem] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground sm:text-[1.0625rem]">{title}</h3>
              <p
                className={cn(
                  "mt-0.5 overflow-hidden text-[0.75rem] leading-snug tracking-[0.01em] text-muted-foreground sm:text-[0.8125rem]",
                  blurbClamp.overflows && LAST_LINE_FADE_CLASSES
                )}
                style={blurbClamp.overflows ? { maxHeight: `${blurbClamp.collapsedHeight}px` } : undefined}
              >
                <span ref={blurbRef} className="block">
                  <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-foreground/85 sm:text-sm">{companyName || "Unknown company"}</span>
                  {companyBlurb ? <span className="text-muted-foreground"> · {companyBlurb}</span> : null}
                </span>
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

        {/*
          Jobright-style facts: icon + plain text (not outline pills). Column
          count follows the row's own width, not the viewport. Under 280px the
          facts stack in one column. A phone row (~340-400px) is two columns
          in reading order, and an empty fact renders nothing, so a missing
          level cannot leave salary alone on the left.
          Wide rows (≥560px) switch to grouped stacks: location/workplace in
          column 1, commitment/level in column 2, salary top-aligned in
          column 3. Only the stacks that have content are rendered, so a
          missing group closes its column instead of leaving a hole.
        */}
        {hasFacts ? (
          <div className={cn("grid grid-cols-1 gap-x-4 gap-y-1.5 @[280px]/row:grid-cols-2 @[560px]/row:gap-x-5", wideFactsColumnClass)}>
            {/*
              Reading-order variant: the individual facts the narrow rows ship.
              `display: contents` lets its children join the grid directly;
              once the row is wide the whole variant hides and the grouped
              stacks below take over.
            */}
            <div className="contents @[560px]/row:hidden">
              {primaryLocation ? (
                <div className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90">
                  <MapPin className="size-3.5 shrink-0 text-foreground/65" aria-hidden />
                  <span className="truncate">{primaryLocation}</span>
                  <MoreLocationsControl count={moreLocationCount} locationsText={moreLocationsText} />
                </div>
              ) : null}
              <FactLine icon={Building2}>{workplaceType}</FactLine>
              <FactLine icon={Clock}>{commitment}</FactLine>
              <FactLine icon={Briefcase}>{experienceLabel}</FactLine>
              <FactLine icon={DollarSign} emphasize>
                {compensation}
              </FactLine>
            </div>

            {/*
              Wide variant: one stack per column; auto-placement fills the
              columns left to right, so a null stack shifts the rest and no
              column is reserved for missing facts.
            */}
            <div className="hidden @[560px]/row:contents">
              {hasLocationColumn ? (
                <div className="flex min-w-0 flex-col gap-1.5">
                  {primaryLocation ? (
                    <div className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug tracking-[0.01em] text-foreground/90">
                      <MapPin className="size-3.5 shrink-0 text-foreground/65" aria-hidden />
                      <span className="truncate">{primaryLocation}</span>
                      <MoreLocationsControl count={moreLocationCount} locationsText={moreLocationsText} />
                    </div>
                  ) : null}
                  <FactLine icon={Building2}>{workplaceType}</FactLine>
                </div>
              ) : null}
              {hasCommitmentColumn ? (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <FactLine icon={Clock}>{commitment}</FactLine>
                  <FactLine icon={Briefcase}>{experienceLabel}</FactLine>
                </div>
              ) : null}
              <FactLine icon={DollarSign} emphasize className="min-w-0">
                {compensation}
              </FactLine>
            </div>
          </div>
        ) : null}

        {/*
          3-zone footer: left stats | middle role-chip lane | right actions.
          Layout is driven by the card's own width (`@container/row`), not the
          viewport. Below 430px: stats · full-width scrolling chip row ·
          actions. 430–560px keeps the wrapped single-line flex arrangement.
          At ≥560px the footer becomes three fixed lanes: stats left, actions
          pinned right, and the chip rail confined to a scrolling middle lane
          (min-width floors dropped, so many chips never reach Apply/Save).
        */}
        <div
          data-card-footer="true"
          className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-1 @[430px]/row:gap-x-3 @[560px]/row:grid @[560px]/row:grid-cols-[max-content_minmax(0,1fr)_max-content]"
        >
          <div className="order-1 flex shrink-0 items-center @[560px]/row:col-start-1">
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
              className="order-3 flex w-full min-w-0 items-center overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @[430px]/row:order-2 @[430px]/row:w-auto @[430px]/row:min-w-[6rem] @[430px]/row:flex-1 @[560px]/row:col-span-1 @[560px]/row:col-start-2 @[560px]/row:min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Single-line chip rail: never wraps into a tall column. Inner
                  `w-max` + auto margins center the chips when they fit and
                  leave the rail scrollable from the first chip when they don't. */}
              <div className="flex w-max items-center gap-1.5 @[430px]/row:mx-auto">
                {jobs.map((roleJob, roleIndex) => {
                  const isSelectedRole = roleIndex === activeIndex;
                  const roleTitle = getCleanJobTitle(roleJob.title, companyName, roleJob.workplaceCities?.[0] ?? "", roleJob.skills ?? []) || roleJob.title || "Role";
                  return (
                    <Button
                      key={roleJob.externalId}
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-pressed={isSelectedRole}
                      className={cn(
                        // Narrow cards get a smaller chip; the card's own width
                        // (not the viewport) decides when it grows back to full size.
                        "h-5.5 max-w-[150px] shrink-0 gap-1 px-2 text-[11px] transition-colors @[430px]/row:h-6 @[430px]/row:gap-1.5 @[430px]/row:max-w-[200px] @[430px]/row:px-2.5 @[430px]/row:text-xs @[580px]/row:max-w-[260px]",
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
            </div>
          ) : null}

          <div
            className="order-2 ml-auto flex shrink-0 items-center gap-1.5 @[430px]/row:order-3 @[430px]/row:gap-2 @[560px]/row:col-start-3 @[560px]/row:ml-0"
            onClick={(e) => e.stopPropagation()}
          >
            {currentJob.applyUrl ? (
              <Button asChild size="sm" variant="default" className={cn(ACTION_BUTTON_SIZE_CLASS, "font-medium")}>
                <a href={currentJob.applyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Send className={ACTION_BUTTON_ICON_CLASS} />
                  <span>Apply</span>
                </a>
              </Button>
            ) : (
              <Button type="button" size="sm" variant="default" disabled className={cn(ACTION_BUTTON_SIZE_CLASS, "font-medium")} onClick={(e) => e.stopPropagation()}>
                <Send className={ACTION_BUTTON_ICON_CLASS} />
                <span>Apply</span>
              </Button>
            )}

            <Button type="button" size="sm" variant="outline" onClick={handleBookmarkToggle} className={cn(ACTION_BUTTON_SIZE_CLASS, "font-normal")}>
              <Bookmark className={cn(ACTION_BUTTON_ICON_CLASS, isBookmarked && "fill-primary text-primary")} />
              <span>{isBookmarked ? "Unsave" : "Save"}</span>
            </Button>

            {companyWebsite ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={formatCompanyWebsite(companyWebsite)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Company link"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), ACTION_ICON_BUTTON_CLASS, "text-muted-foreground hover:text-foreground")}
                  >
                    <Link2 className="size-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  Company link
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled
                    aria-label="Company link unavailable"
                    className={cn(ACTION_ICON_BUTTON_CLASS, "text-muted-foreground")}
                  >
                    <Link2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  No company website
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-label="Hide"
                  onClick={handleHide}
                  className={cn(ACTION_ICON_BUTTON_CLASS, "text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive")}
                >
                  <EyeOff className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                Hide
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    );
  }
);

JobBoardListRow.displayName = "JobBoardListRow";

export default JobBoardListRow;

"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { hasStatusHistory } from "@/lib/tracker/statusTimeline";
import { cn } from "@/lib/utils";
import type { ProcessedCompanyData } from "@/types/job";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import DialogExtendedCompanyInfo from "./DialogExtendedCompanyInfo";
import DialogStatusTimeline from "./DialogStatusTimeline";
import CompanyLogo from "../util/CompanyLogo";

const DialogCompanyLogoCard = ({
  companyData,
  isTransitioning = false,
  fadeCompanyChrome = false,
  jobId,
}: {
  companyData: ProcessedCompanyData;
  isTransitioning?: boolean;
  fadeCompanyChrome?: boolean;
  /** Job whose status history the "Show timeline" sibling control reveals. */
  jobId?: string;
}) => {
  const { user } = useApp();
  const [showExtended, setShowExtended] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const timelineAvailable = Boolean(jobId && hasStatusHistory(user.jobEvents, jobId));
  // Derive open state so an emptied history collapses immediately (no empty
  // bordered flash) while still driving the height animation.
  const timelineOpen = timelineAvailable && showTimeline;
  const { contentRef: extendedRef, containerProps: extendedContainerProps } = useCollapsibleHeight(showExtended);
  const { contentRef: timelineRef, containerProps: timelineContainerProps } = useCollapsibleHeight(timelineOpen);

  useEffect(() => {
    if (!timelineAvailable && showTimeline) setShowTimeline(false);
  }, [timelineAvailable, showTimeline]);

  const removeHtmlTags = (str: string) => {
    let result = str.replace(/<[^>]*>/g, "");
    const htmlEntities: { [key: string]: string } = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    result = result.replace(/&[a-zA-Z#0-9]+;/g, (entity) => {
      return htmlEntities[entity] !== undefined ? htmlEntities[entity] : "";
    });
    return result;
  };

  const fadeCompanyBlock = isTransitioning && fadeCompanyChrome;

  return (
    <div className={cn("my-4 min-h-30 items-center gap-x-8 flex flex-col", jobFadeClass(fadeCompanyBlock))}>
      <div className="w-full flex flex-row items-center gap-x-8">
        <CompanyLogo companyData={companyData} size="xl" variant="dialog" />
        <div className="flex h-full min-w-0 flex-1 flex-col justify-center">
          <p className="line-clamp-5 wrap-break-word text-foreground/80 md:text-base md:leading-relaxed">
            {removeHtmlTags(companyData.tagline || "") || <span className="text-muted-foreground italic">No description provided.</span>}
          </p>
        </div>
      </div>
      <div {...extendedContainerProps} className={cn(extendedContainerProps.className, "w-full")}>
        <div
          ref={extendedRef}
          className={cn("w-full transition-opacity duration-300 ease-in-out motion-reduce:transition-none", showExtended ? "opacity-100" : "opacity-0")}
          aria-hidden={!showExtended}
        >
          <DialogExtendedCompanyInfo companyData={companyData} />
        </div>
      </div>
      <div className="mt-9 mb-3 border-t pt-1.5 border-border w-full flex flex-wrap items-center justify-center gap-2 sm:mt-6">
        <Button
          className="rounded-md border border-border bg-background shadow-sm hover:bg-secondary/60 dark:bg-card dark:hover:bg-accent -my-6"
          onClick={() => setShowExtended((v) => !v)}
          size="sm"
          variant="outline"
          aria-expanded={showExtended}
        >
          {showExtended ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
          {showExtended ? "Show less" : "Show more company info"}
        </Button>
        {timelineAvailable ? (
          <Button
            className="rounded-md border border-border bg-background shadow-sm hover:bg-secondary/60 dark:bg-card dark:hover:bg-accent -my-6"
            onClick={() => setShowTimeline((v) => !v)}
            size="sm"
            variant="outline"
            aria-expanded={timelineOpen}
          >
            {timelineOpen ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {timelineOpen ? "Hide timeline" : "Show timeline"}
          </Button>
        ) : null}
      </div>
      {jobId ? (
        <div {...timelineContainerProps} className={cn(timelineContainerProps.className, "w-full")}>
          <div
            ref={timelineRef}
            className={cn("w-full transition-opacity duration-300 ease-in-out motion-reduce:transition-none", timelineOpen ? "opacity-100" : "opacity-0")}
            aria-hidden={!timelineOpen}
          >
            <div className="w-full rounded-lg border border-border bg-background p-3 dark:bg-card">
              <DialogStatusTimeline jobId={jobId} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DialogCompanyLogoCard;

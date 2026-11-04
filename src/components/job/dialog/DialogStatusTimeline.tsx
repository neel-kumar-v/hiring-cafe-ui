"use client";

import { useApp } from "@/contexts/AppContext";
import { statusHistoryFor } from "@/lib/tracker/statusTimeline";
import type { JobStatusEvent } from "@/types/tracker";

const STATUS_LABELS: Record<JobStatusEvent["status"], string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  rejected: "Rejected",
  hidden: "Hidden",
};

const STATUS_DOT_CLASS: Record<JobStatusEvent["status"], string> = {
  saved: "bg-primary",
  applied: "bg-info",
  interviewing: "bg-success",
  rejected: "bg-destructive",
  hidden: "bg-muted-foreground",
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatEventTime(at: number) {
  if (!Number.isFinite(at)) return "";
  return timeFormatter.format(new Date(at));
}

/**
 * Full status event history for one job — every move, backtracks included,
 * each with its timestamp. Revealed by the "Show timeline" control that sits
 * next to "Show more company info" in the job dialog and drawer.
 *
 * Deliberately the raw log: the tracker's Job flow chart aggregates logical
 * (reset-on-backtrack) paths instead, so zig-zags stay visible here and out of
 * the Sankey.
 */
export default function DialogStatusTimeline({ jobId }: { jobId: string }) {
  const { user } = useApp();
  const events = statusHistoryFor(user.jobEvents, jobId);

  // Parent only offers "Show timeline" when history exists and collapses when
  // it becomes empty — render nothing rather than lying empty copy.
  if (events.length === 0) {
    return null;
  }

  return (
    <ol className="flex flex-col gap-3">
      {events.map((event, index) => (
        <li key={`${event.status}-${event.at}-${index}`} className="flex items-start gap-2.5">
          <span className="mt-1.5 flex size-2 shrink-0 items-center justify-center">
            <span className={`size-2 rounded-full ${STATUS_DOT_CLASS[event.status]}`} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <span className="font-medium text-foreground">{STATUS_LABELS[event.status]}</span>
            {event.from ? <span className="text-muted-foreground"> from {STATUS_LABELS[event.from]}</span> : null}
            <span className="ml-2 text-[0.75rem] tracking-[0.02em] text-muted-foreground tabular-nums">{formatEventTime(event.at)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

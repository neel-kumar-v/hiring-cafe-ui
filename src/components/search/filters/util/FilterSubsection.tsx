"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleHelp, X } from "lucide-react";

/**
 * Mid-level header under a category (e.g. Salary, Experience, Size, Activity & Outcomes).
 * Smaller than the category title in the content pane; no subtitle/caption.
 */
export function FilterSubsection({
  title,
  children,
  className,
  id,
  help,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  help?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div id={id} className={cn("space-y-2", className)}>
      <div className="sticky top-10 z-20 flex h-10 items-center justify-between border-b border-border/80 bg-background px-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          {help ? (
            <button
              type="button"
              aria-label="Toggle help"
              aria-expanded={helpOpen}
              onClick={(event) => {
                event.stopPropagation();
                setHelpOpen((open) => !open);
              }}
              className="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <CircleHelp className="size-3.5 md:size-4" />
            </button>
          ) : null}
        </div>
        {action ? <div className="ml-auto flex shrink-0 items-center gap-1">{action}</div> : null}
      </div>
      {help ? (
        <div
          className={cn(
            "px-1 text-sm text-foreground/75 transition-all duration-300",
            helpOpen ? "max-h-24 opacity-100 pb-1.5" : "my-0 max-h-0 overflow-hidden opacity-0"
          )}
        >
          {typeof help === "string" ? <p>{help}</p> : help}
        </div>
      ) : null}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Top-level category title in the search content pane (General, Location, …). */
export function FilterCategoryHeader({
  title,
  editCount,
  onClear,
  className,
}: {
  title: string;
  editCount?: number;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex h-10 items-center justify-between bg-background px-1 shadow-[0_1px_0_0_hsl(var(--background))]",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-base font-bold tracking-tight text-foreground">{title}</h2>
        {editCount && editCount > 0 ? (
          <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 px-1.5 text-xs font-semibold leading-5 text-primary">
            {editCount}
          </span>
        ) : null}
      </div>
      {onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

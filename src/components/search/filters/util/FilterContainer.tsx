"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, getInitialPatchForCategory, initialSearchState, isCategoryEdited } from "@/lib/edited-filters";
import { useFilterSearchQuery, useFocusedFilterId } from "@/lib/focused-filter";
import { useIsMobile } from "@/hooks/use-mobile";

const wrapperBase = "transition-colors duration-300 ease-out";

/**
 * Every filter title uses the same header treatment as the app sidebar group headers
 * (AppSidebar `GroupSection`): 15px bold foreground text. Filters must not restyle
 * their own title, otherwise the rail ends up with a different header per filter.
 */
const titleClasses = "text-[15px] font-bold text-foreground";

export type FilterContainerChrome = "section" | "stream";

function FilterContainerInner({
  children,
  title,
  help,
  containerClasses,
  actions,
  categoryId,
  chrome = "section",
  defaultCollapsed = true,
}: {
  children?: React.ReactNode;
  title: React.ReactNode;
  help?: string;
  containerClasses?: string;
  actions?: React.ReactNode;
  categoryId?: string;
  /** `section` = sticky header + divider; `stream` = inline row under a parent group (no chrome). */
  chrome?: FilterContainerChrome;
  /**
   * When true (default), the body starts collapsed on every breakpoint and the header
   * toggles it. Sections with active edits (or the focused filter) reveal themselves.
   */
  defaultCollapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [bodyMounted, setBodyMounted] = useState(false);
  const isMobile = useIsMobile(768);
  const fallbackId = useId();
  const containerId = categoryId ?? fallbackId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { searchOptions, updateSearchOptions } = useApp();
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilterId();
  const { filterSearchQuery } = useFilterSearchQuery();
  const searching = filterSearchQuery.trim().length > 0;
  // Sentence-only / title-only filters (no body options) skip sticky section chrome.
  // `null`/`false` children count as no body so callers can omit or pass null equivalently.
  const showBody = children != null && children !== false;
  const isStream = chrome === "stream" || !showBody;
  const collapsible = !isStream && (defaultCollapsed || isMobile);
  const contentOpen = isStream || searching || (defaultCollapsed ? bodyOpen : !isMobile || bodyOpen);

  const isFocused = Boolean(categoryId) && focusedFilterId === categoryId;
  const edited = useMemo(() => (categoryId ? isCategoryEdited(searchOptions, initialSearchState, categoryId) : false), [categoryId, searchOptions]);
  const editCount = useMemo(() => (categoryId ? getCategoryEditCount(searchOptions, initialSearchState, categoryId) : 0), [categoryId, searchOptions]);

  const handleClearAll = () => {
    if (!categoryId) return;
    updateSearchOptions(getInitialPatchForCategory(categoryId, initialSearchState));
  };

  useEffect(() => {
    if (isFocused || searching || edited) {
      setBodyOpen(true);
    }
  }, [edited, isFocused, searching]);

  useEffect(() => {
    if (!showBody || bodyMounted || searching || edited || isFocused || isStream) {
      setBodyMounted(true);
    }
  }, [bodyMounted, edited, isFocused, isStream, searching, showBody]);

  useEffect(() => {
    if (!showBody || bodyMounted) return;
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setBodyMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setBodyMounted(true);
        }
      },
      { rootMargin: "240px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [bodyMounted, showBody]);

  return (
    <div
      ref={wrapperRef}
      data-filter-container-id={containerId}
      className={cn(wrapperBase, isFocused && "scroll-mt-4", containerClasses)}
      onClick={() => {
        if (categoryId) {
          setFocusedFilterId(categoryId);
        }
      }}
    >
      {isStream ? (
        /*
          Stream = sentence rows under a category. Title and body lines share one
          `space-y-4` stack — the same gap the parent category body uses between
          sibling FilterContainers — with no extra vertical padding that would
          make #general / #compensation (and peers) look uneven.
        */
        <div className="space-y-4 px-1">
          <div className="flex flex-row items-center gap-2 bg-background">
            <div className={cn("flex min-w-0 flex-1 items-center gap-1", titleClasses)}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="[&>span]:font-bold [&>span]:text-foreground" title={typeof title === "string" ? title : undefined}>
                  {title}
                </span>
                {editCount > 0 ? (
                  <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 px-1.5 text-xs font-semibold leading-5 text-primary">
                    {editCount}
                  </span>
                ) : null}
              </span>
              {help ? (
                <CircleHelp
                  className="size-3.5 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground md:size-4"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsOpen((open) => !open);
                  }}
                />
              ) : null}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
              {edited && categoryId ? (
                <Button type="button" variant="ghost" size="sm" onClick={handleClearAll} className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
          {help ? (
            <p className={cn("px-3 text-sm text-foreground/75 transition-all duration-300", isOpen ? "max-h-12 opacity-100" : "my-0 max-h-0 overflow-hidden opacity-0")}>{help}</p>
          ) : null}
          {showBody && bodyMounted ? children : null}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="border-b border-border/80 bg-background px-1 py-1.5 md:sticky md:-top-4 md:z-20 md:shadow-[0_8px_16px_-12px_hsl(var(--background))]"
            onClick={() => {
              if (collapsible && !searching) setBodyOpen((open) => !open);
            }}
          >
            <div className="flex flex-row items-center gap-2">
              <div className={cn("flex min-w-0 flex-1 items-center gap-1", titleClasses)}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate [&>span]:font-bold [&>span]:text-foreground" title={typeof title === "string" ? title : undefined}>
                    {title}
                  </span>
                  {editCount > 0 ? (
                    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 px-1.5 text-xs font-semibold leading-5 text-primary">
                      {editCount}
                    </span>
                  ) : null}
                </span>
                {help ? (
                  <CircleHelp
                    className="size-3.5 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground md:size-4"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsOpen((open) => !open);
                    }}
                  />
                ) : null}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
                {edited && categoryId ? (
                  <Button type="button" variant="ghost" size="sm" onClick={handleClearAll} className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                    Clear
                  </Button>
                ) : null}
                {collapsible ? (
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out", !contentOpen && "-rotate-90")} />
                ) : null}
              </div>
            </div>
          </div>

          {showBody || help ? (
            <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", contentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="min-h-0 overflow-hidden">
                {help ? (
                  <p className={cn("px-4 text-sm text-foreground/75 transition-all duration-300", isOpen ? "max-h-12 opacity-100" : "my-0 max-h-0 overflow-hidden opacity-0")}>
                    {help}
                  </p>
                ) : null}
                {showBody ? <div className="space-y-2 px-1 pb-1.5 [&>*:first-child]:[margin-block-start:0px]">{bodyMounted ? children : null}</div> : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const FilterContainer = memo(FilterContainerInner);
export default FilterContainer;

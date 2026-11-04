"use client";

import { memo, startTransition, useEffect, useId, useMemo, useRef, useState } from "react";
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
  defaultCollapsed = false,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
  help?: string;
  containerClasses?: string;
  actions?: React.ReactNode;
  categoryId?: string;
  /** `section` = sticky header + divider; `stream` = inline row under a parent group (no chrome). */
  chrome?: FilterContainerChrome;
  /**
   * When true, the body starts collapsed and the header toggles it.
   * Default is false (sections start open and are not collapsible).
   */
  defaultCollapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
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
  const collapsible = !isStream && defaultCollapsed;
  const [bodyMounted, setBodyMounted] = useState(!collapsible);
  const contentOpen = isStream || !collapsible || searching || (defaultCollapsed ? bodyOpen : !isMobile || bodyOpen);

  const isFocused = Boolean(categoryId) && focusedFilterId === categoryId;
  const edited = useMemo(() => (categoryId ? isCategoryEdited(searchOptions, initialSearchState, categoryId) : false), [categoryId, searchOptions]);
  const editCount = useMemo(() => (categoryId ? getCategoryEditCount(searchOptions, initialSearchState, categoryId) : 0), [categoryId, searchOptions]);
  const hasTitle = title != null && title !== "";
  const hasHeader = isStream ? Boolean(hasTitle || help || actions) : Boolean(hasTitle || help || actions || (edited && categoryId) || editCount > 0);

  const handleClearAll = () => {
    if (!categoryId) return;
    startTransition(() => updateSearchOptions(getInitialPatchForCategory(categoryId, initialSearchState)));
  };

  useEffect(() => {
    if (isFocused || searching || edited) {
      setBodyOpen(true);
    }
  }, [edited, isFocused, searching]);

  useEffect(() => {
    if (!showBody || bodyMounted || searching || edited || isFocused || isStream || !collapsible) {
      setBodyMounted(true);
    }
  }, [bodyMounted, collapsible, edited, isFocused, isStream, searching, showBody]);

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
        if (categoryId && focusedFilterId !== categoryId) {
          // Highlighting the active filter re-renders the sidebar; don't block the click.
          startTransition(() => setFocusedFilterId(categoryId));
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
        <div className="space-y-3 px-1">
          {hasHeader ? (
            <div className="flex flex-row items-center gap-2 bg-background">
              <div className={cn("flex min-w-0 flex-1 items-center gap-1", typeof title === "string" ? titleClasses : "min-w-0 text-foreground")}>
                <span className="flex min-w-0 items-center gap-2">
                  {/* Never force-bold SentenceText/static sentence copy — only string section titles use titleClasses. */}
                  <span className="min-w-0 text-foreground" title={typeof title === "string" ? title : undefined}>
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
          ) : null}
          {help ? (
            <p className={cn("px-1 text-sm text-foreground/75 transition-all duration-300", isOpen ? "max-h-24 opacity-100 pb-1.5" : "my-0 max-h-0 overflow-hidden opacity-0")}>
              {help}
            </p>
          ) : null}
          {showBody && bodyMounted ? <div className="flex flex-col gap-3">{children}</div> : null}
        </div>
      ) : (
        <div className="space-y-3">
          {hasHeader ? (
            <div
              className={cn(
                "sticky-dialog-header sticky top-10 z-20 flex h-10 items-center border-b border-border/80 bg-background px-1",
                collapsible && "cursor-pointer"
              )}
              onClick={() => {
                if (collapsible && !searching) setBodyOpen((open) => !open);
              }}
            >
              <div className="flex w-full flex-row items-center gap-2">
                <div className={cn("flex min-w-0 flex-1 items-center gap-1", typeof title === "string" ? titleClasses : "min-w-0 text-foreground")}>
                  <span className="flex min-w-0 items-center gap-2">
                    {/* Never force-bold SentenceText/static sentence copy — only string section titles use titleClasses. */}
                    {typeof title === "string" ? (
                      <h3 className={cn("truncate", titleClasses)} title={title}>
                        {title}
                      </h3>
                    ) : (
                      <span className="min-w-0 text-foreground">{title}</span>
                    )}
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
          ) : null}

          {showBody || help ? (
            <div
              className={cn(collapsible && "grid transition-[grid-template-rows] duration-300 ease-out", collapsible ? (contentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]") : "")}
            >
              <div className={cn("min-h-0", collapsible ? (contentOpen ? "overflow-visible" : "overflow-hidden") : "")}>
                {help ? (
                  <p className={cn("px-1 text-sm text-foreground/75 transition-all duration-300", isOpen ? "max-h-24 opacity-100 pb-2" : "my-0 max-h-0 overflow-hidden opacity-0")}>
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

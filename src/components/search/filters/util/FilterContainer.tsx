"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, getInitialPatchForCategory, initialSearchState, isCategoryEdited } from "@/lib/edited-filters";
import { useFocusedFilter } from "@/lib/focused-filter";
import { useIsMobile } from "@/hooks/use-mobile";

const wrapperBase = "transition-colors duration-300 ease-out";

export default function FilterContainer({
  children,
  title,
  help,
  containerClasses,
  actions,
  categoryId,
}: {
  children: React.ReactNode;
  title: string;
  help?: string;
  containerClasses?: string;
  actions?: React.ReactNode;
  categoryId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile(768);
  const fallbackId = useId();
  const containerId = categoryId ?? fallbackId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { searchOptions, updateSearchOptions } = useApp();
  const { focusedFilterId, setFocusedFilterId, filterSearchQuery } = useFocusedFilter();
  const searching = filterSearchQuery.trim().length > 0;
  const contentOpen = !isMobile || mobileOpen || searching;

  const isFocused = Boolean(categoryId) && focusedFilterId === categoryId;
  const edited = categoryId ? isCategoryEdited(searchOptions, initialSearchState, categoryId) : false;
  const editCount = categoryId ? getCategoryEditCount(searchOptions, initialSearchState, categoryId) : 0;

  const handleClearAll = () => {
    if (!categoryId) return;
    updateSearchOptions(getInitialPatchForCategory(categoryId, initialSearchState));
  };

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
      <div className="space-y-2">
        <div
          className="border-b border-border/80 bg-background px-1 pb-1.5 pt-1 md:sticky md:-top-4 md:z-20 md:pb-2 md:shadow-[0_8px_16px_-12px_hsl(var(--background))]"
          onClick={() => {
            if (isMobile && !searching) setMobileOpen((open) => !open);
          }}
        >
          <div className="flex flex-row items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1 text-sm font-semibold text-foreground md:text-base">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{title}</span>
                {editCount > 0 ? (
                  <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 px-1.5 text-xs font-semibold leading-5 text-primary">{editCount}</span>
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                  Clear
                </Button>
              ) : null}
              {isMobile ? <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out", contentOpen && "rotate-180")} /> : null}
            </div>
          </div>
        </div>

        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", contentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="min-h-0 overflow-hidden">
            {help ? (
              <p
                className={cn(
                  "px-4 text-sm text-foreground/75 transition-all duration-300",
                  isOpen ? "max-h-12 opacity-100" : "my-0 max-h-0 overflow-hidden opacity-0",
                )}
              >
                {help}
              </p>
            ) : null}
            <div className="space-y-2 px-1 pb-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

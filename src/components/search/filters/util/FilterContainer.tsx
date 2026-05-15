"use client";

import { useId, useRef, useState } from "react";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getInitialPatchForCategory, initialSearchState, isCategoryEdited } from "@/lib/edited-filters";
import { useFocusedFilter } from "@/lib/focused-filter";

const wrapperBase = "relative overflow-hidden pt-4 rounded-2xl border-2 border-border transition-all duration-500 ease-in-out dark:border-border";
const wrapperFocused = "!border-primary/40 dark:!border-primary/30";

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
  const fallbackId = useId();
  const containerId = categoryId ?? fallbackId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { searchOptions, updateSearchOptions } = useApp();
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilter();

  const isFocused = Boolean(categoryId) && focusedFilterId === categoryId;
  const edited = categoryId ? isCategoryEdited(searchOptions, initialSearchState, categoryId) : false;

  const handleClearAll = () => {
    if (!categoryId) return;
    updateSearchOptions(getInitialPatchForCategory(categoryId, initialSearchState));
  };

  return (
    <div
      ref={wrapperRef}
      data-filter-container-id={containerId}
      className={cn(wrapperBase, isFocused && wrapperFocused, containerClasses)}
      onClick={() => {
        if (categoryId) {
          setFocusedFilterId(categoryId);
        }
      }}
    >
      <div className={cn("space-y-4", edited && categoryId ? "pb-14" : undefined)}>
        <div className="sticky top-0 z-20 -mt-4 rounded-2xl bg-background px-4 pb-3 pt-4 shadow-[0_8px_16px_-12px_hsl(var(--background))]">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span>{title}</span>
              {help ? (
                <CircleHelp className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setIsOpen((open) => !open)} />
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </div>

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

        <div className="px-4 pb-4 space-y-4">{children}</div>

        {edited && categoryId ? (
          <div className="sticky bottom-4 right-4 z-20 -mt-2 flex justify-end px-4">
            <Button type="button" variant="outline" size="sm" onClick={handleClearAll} className="gap-1.5 rounded-lg">
              <X className="size-4" />
              Clear All
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

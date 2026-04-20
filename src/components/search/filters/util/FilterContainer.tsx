"use client";

import { useId, useRef, useState } from "react";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getInitialPatchForCategory, initialSearchState, isCategoryEdited } from "@/lib/edited-filters";
import { useFocusedFilter } from "@/lib/focused-filter";

const wrapperBase = "space-y-4 rounded-2xl border-2 border-border p-4 transition-all duration-500 ease-in-out dark:border-border";
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
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span>{title}</span>
            {help ? (
              <CircleHelp className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setIsOpen((open) => !open)} />
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>

        {help ? (
          <p className={cn("overflow-hidden text-sm text-foreground/75 transition-all duration-300", isOpen ? "max-h-12 opacity-100" : "my-0 max-h-0 opacity-0")}>
            {help}
          </p>
        ) : null}

        {children}

        {edited && categoryId ? (
          <div className="mt-4 flex justify-end">
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

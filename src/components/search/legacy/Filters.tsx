"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { ApplyForm, Exclusion, SortOptions, TimeUnits } from "@/types/search";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

type QuickFilterKey = "date" | "sort" | "apply" | "exclusion";

type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type SortOption = RadioOption & {
  sort: SortOptions;
};

type DateOption = RadioOption & {
  magnitude: number;
  unit: TimeUnits;
};

type ApplyOption = RadioOption & {
  applyForm: ApplyForm;
};

type ExclusionOption = {
  value: Exclusion;
  label: string;
  description?: string;
};

const SORT_OPTIONS: SortOption[] = [
  {
    value: "relevance-most",
    label: "Relevance",
    // description: "Default ranking across the strongest matches first.",
    sort: { by: "Relevance", order: "Most" },
  },
  {
    value: "recency-most",
    label: "Most recent",
    // description: "Show the newest job posts first.",
    sort: { by: "Recency", order: "Most" },
  },
  {
    value: "recency-least",
    label: "Oldest",
    // description: "Show the oldest job posts first.",
    sort: { by: "Recency", order: "Least" },
  },
  {
    value: "salary-most",
    label: "Highest salary",
    // description: "Prioritize roles with the highest compensation.",
    sort: { by: "Salary", order: "Most" },
  },
  {
    value: "salary-least",
    label: "Lowest salary",
    // description: "Prioritize roles with the lowest compensation.",
    sort: { by: "Salary", order: "Least" },
  },
  {
    value: "experience-most",
    label: "Most experience",
    // description: "Show roles asking for the most experience first.",
    sort: { by: "Experience", order: "Most" },
  },
  {
    value: "experience-least",
    label: "Least experience",
    // description: "Show roles asking for the least experience first.",
    sort: { by: "Experience", order: "Least" },
  },
];

const DATE_OPTIONS: DateOption[] = [
  {
    value: "all-time",
    label: "All time",
    // description: "Include the full available posting history.",
    magnitude: 10,
    unit: "Years",
  },
  {
    value: "24-hours",
    label: "Past 24 hours",
    // description: "Only jobs posted within the last day.",
    magnitude: 24,
    unit: "Hours",
  },
  {
    value: "3-days",
    label: "3 days",
    // description: "Only jobs posted in the last three days.",
    magnitude: 3,
    unit: "Days",
  },
  {
    value: "1-week",
    label: "1 week",
    // description: "Only jobs posted in the last week.",
    magnitude: 1,
    unit: "Weeks",
  },
  {
    value: "2-weeks",
    label: "2 weeks",
    // description: "Only jobs posted in the last two weeks.",
    magnitude: 2,
    unit: "Weeks",
  },
  {
    value: "3-weeks",
    label: "3 weeks",
    // description: "Only jobs posted in the last three weeks.",
    magnitude: 3,
    unit: "Weeks",
  },
  {
    value: "1-month",
    label: "1 month",
    // description: "Only jobs posted in the last month.",
    magnitude: 1,
    unit: "Months",
  },
  {
    value: "2-months",
    label: "2 months",
    // description: "Only jobs posted in the last two months.",
    magnitude: 2,
    unit: "Months",
  },
  {
    value: "3-months",
    label: "3 months",
    // description: "Only jobs posted in the last three months.",
    magnitude: 3,
    unit: "Months",
  },
  {
    value: "6-months",
    label: "6 months",
    // description: "Only jobs posted in the last six months.",
    magnitude: 6,
    unit: "Months",
  },
  {
    value: "1-year",
    label: "1 year",
    // description: "Only jobs posted in the last year.",
    magnitude: 1,
    unit: "Years",
  },
];

const APPLY_OPTIONS: ApplyOption[] = [
  {
    value: "all",
    label: "Easy or lengthy apply",
    description: "Include both simple and time-consuming application flows.",
    applyForm: "All",
  },
  {
    value: "fast",
    label: "Easy apply only",
    description: "Prioritize faster application forms.",
    applyForm: "Fast",
  },
  {
    value: "slow",
    label: "Lengthy apply only",
    description: "Only include more involved application flows.",
    applyForm: "Slow",
  },
];

const EXCLUSION_OPTIONS: ExclusionOption[] = [
  {
    value: "Applied",
    label: "Applied",
    // description: "Hide jobs you have already applied to.",
  },
  {
    value: "Viewed",
    label: "Viewed",
    // description: "Hide jobs you have already opened.",
  },
  {
    value: "Saved",
    label: "Saved",
    // description: "Hide jobs already saved to your list.",
  },
  {
    value: "Hidden",
    label: "Hidden",
    // description: "Hide jobs you already hid.",
  },
];

const DRAWER_META: Record<
  QuickFilterKey,
  {
    title: string;
    description: string;
  }
> = {
  date: {
    title: "Date range",
    description: "Limit results to recently posted jobs.",
  },
  sort: {
    title: "Sort jobs",
    description: "Choose how the job list should be ordered.",
  },
  apply: {
    title: "Apply type",
    description: "Filter by how simple or lengthy the apply flow is.",
  },
  exclusion: {
    title: "Excluded jobs",
    description: "Hide jobs you have already interacted with.",
  },
};

function getTriggerClassName(active = false, className?: string) {
  return cn(
    "group inline-flex items-center gap-1 py-0.5 text-left text-sm font-semibold leading-none transition-colors bg-background",
    active ? "text-primary" : "text-foreground hover:text-primary",
    className
  );
}

function QuickFilterTrigger({
  active = false,
  className,
  label,
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type={type}
      className={getTriggerClassName(active, className)}
      {...props}
    >
      <span className="whitespace-nowrap">{label}</span>
      <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-current" />
    </button>
  );
}

function DesktopMenuFrame({
  active = false,
  children,
  filterKey,
  label,
  menuLabel,
  onOpenChange,
  open,
}: {
  active?: boolean;
  children: ReactNode;
  filterKey: QuickFilterKey;
  label: string;
  menuLabel: string;
  onOpenChange: (filter: QuickFilterKey, open: boolean) => void;
  open: boolean;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={(nextOpen) => onOpenChange(filterKey, nextOpen)}>
      <DropdownMenuTrigger className={getTriggerClassName(active)}>
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-current" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[18rem] rounded-xl border-border bg-popover/95 p-1.5 shadow-xl backdrop-blur"
      >
        <DropdownMenuLabel className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {menuLabel}
        </DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OptionText({
  description,
  label,
}: {
  description?: string;
  label: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", description ? "gap-0.5" : "justify-center")}>
      <span className="truncate font-medium leading-tight text-foreground">{label}</span>
      {description ? (
        <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
      ) : null}
    </div>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
        selected ? "border-primary" : "border-border/70"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full transition-colors",
          selected ? "bg-primary" : "bg-transparent"
        )}
      />
    </span>
  );
}

function MobileChoiceButton({
  description,
  label,
  onClick,
  selected,
}: {
  description?: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        selected ? "bg-brand-soft text-primary" : "hover:bg-secondary/60"
      )}
    >
      <RadioIndicator selected={selected} />
      <OptionText description={description} label={label} />
    </button>
  );
}

function MobileCheckboxButton({
  checked,
  description,
  label,
  onClick,
}: {
  checked: boolean;
  description?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        checked ? "bg-brand-soft" : "hover:bg-secondary/60"
      )}
    >
      <Checkbox
        checked={checked}
        className="mt-0.5 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary not-data-[state=checked]:dark:bg-card"
        onCheckedChange={onClick}
        onClick={(event) => event.stopPropagation()}
      />
      <OptionText description={description} label={label} />
    </button>
  );
}

function getSortValue(sort: SortOptions) {
  const current = SORT_OPTIONS.find(
    (option) => option.sort.by === sort.by && option.sort.order === sort.order
  );
  return current?.value ?? "relevance-most";
}

function getDateValue(magnitude: number, unit: TimeUnits) {
  const current = DATE_OPTIONS.find(
    (option) => option.magnitude === magnitude && option.unit === unit
  );
  return current?.value ?? `${magnitude}-${unit.toLowerCase()}`;
}

function getDateLabel(magnitude: number, unit: TimeUnits) {
  const current = DATE_OPTIONS.find(
    (option) => option.magnitude === magnitude && option.unit === unit
  );
  if (current) return current.label;

  const normalizedUnit = unit.toLowerCase();
  const singularUnit = normalizedUnit.endsWith("s")
    ? normalizedUnit.slice(0, -1)
    : normalizedUnit;
  return `${magnitude} ${magnitude === 1 ? singularUnit : normalizedUnit}`;
}

function getApplyValue(applyForm: ApplyForm) {
  return APPLY_OPTIONS.find((option) => option.applyForm === applyForm)?.value ?? "all";
}

function getApplyLabel(applyForm: ApplyForm) {
  return APPLY_OPTIONS.find((option) => option.applyForm === applyForm)?.label ?? "Easy or lengthy apply";
}

function getExclusionLabel(exclusions: Exclusion[]) {
  if (exclusions.length === 0) return "Show all jobs";
  if (exclusions.length === 1) return `Exclude ${exclusions[0].toLowerCase()} jobs`;
  return `Exclude ${exclusions.length} job types`;
}

export default function Filters() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { showLegacyFilters } = useSearchUI();
  const { contentRef, containerProps } = useCollapsibleHeight(showLegacyFilters);
  const useDesktopMenus = useMediaQuery("(min-width: 769px)");
  const [desktopFilter, setDesktopFilter] = useState<QuickFilterKey | null>(null);
  const [mobileFilter, setMobileFilter] = useState<QuickFilterKey | null>(null);

  const currentSortValue = getSortValue(searchOptions.sort);
  const currentDateValue = getDateValue(
    searchOptions.date_range.magnitude,
    searchOptions.date_range.unit
  );
  const currentApplyValue = getApplyValue(searchOptions.apply_form);

  const applySort = (value: string) => {
    const selected = SORT_OPTIONS.find((option) => option.value === value);
    if (!selected) return;
    updateSearchOptions({ sort: selected.sort });
    setMobileFilter(null);
  };

  const applyDate = (value: string) => {
    const selected = DATE_OPTIONS.find((option) => option.value === value);
    if (!selected) return;
    updateSearchOptions({
      date_range: {
        magnitude: selected.magnitude,
        unit: selected.unit,
      },
    });
    setMobileFilter(null);
  };

  const applyApplyForm = (value: string) => {
    const selected = APPLY_OPTIONS.find((option) => option.value === value);
    if (!selected) return;
    updateSearchOptions({ apply_form: selected.applyForm });
    setMobileFilter(null);
  };

  const toggleExclusion = (value: Exclusion) => {
    const nextExclusions = searchOptions.exclusion.includes(value)
      ? searchOptions.exclusion.filter((item) => item !== value)
      : [...searchOptions.exclusion, value];
    updateSearchOptions({ exclusion: nextExclusions });
  };

  const handleDesktopMenuChange = (filter: QuickFilterKey, open: boolean) => {
    setDesktopFilter(open ? filter : null);
  };

  const renderMobileBody = () => {
    if (!mobileFilter) return null;

    if (mobileFilter === "date") {
      return DATE_OPTIONS.map((option) => (
        <MobileChoiceButton
          key={option.value}
          description={option.description}
          label={option.label}
          onClick={() => applyDate(option.value)}
          selected={option.value === currentDateValue}
        />
      ));
    }

    if (mobileFilter === "sort") {
      return SORT_OPTIONS.map((option) => (
        <MobileChoiceButton
          key={option.value}
          description={option.description}
          label={option.label}
          onClick={() => applySort(option.value)}
          selected={option.value === currentSortValue}
        />
      ));
    }

    if (mobileFilter === "apply") {
      return APPLY_OPTIONS.map((option) => (
        <MobileChoiceButton
          key={option.value}
          description={option.description}
          label={option.label}
          onClick={() => applyApplyForm(option.value)}
          selected={option.value === currentApplyValue}
        />
      ));
    }

    return EXCLUSION_OPTIONS.map((option) => (
      <MobileCheckboxButton
        key={option.value}
        checked={searchOptions.exclusion.includes(option.value)}
        description={option.description}
        label={option.label}
        onClick={() => toggleExclusion(option.value)}
      />
    ));
  };

  return (
    <div {...containerProps}>
      <div
        ref={contentRef}
        className="bg-background/95 backdrop-blur"
        aria-hidden={!showLegacyFilters}
      >
          <div className="mx-auto max-w-full px-4 py-3 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {useDesktopMenus ? (
                <>
                  <DesktopMenuFrame
                    active={searchOptions.date_range.magnitude !== 30 || searchOptions.date_range.unit !== "Days"}
                    filterKey="date"
                    label={getDateLabel(searchOptions.date_range.magnitude, searchOptions.date_range.unit)}
                    menuLabel="Date range"
                    onOpenChange={handleDesktopMenuChange}
                    open={desktopFilter === "date"}
                  >
                    <DropdownMenuRadioGroup value={currentDateValue} onValueChange={applyDate}>
                      {DATE_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="items-start rounded-lg px-2.5 py-2"
                        >
                          <OptionText description={option.description} label={option.label} />
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DesktopMenuFrame>

                  <DesktopMenuFrame
                    active={searchOptions.sort.by !== "Relevance" || searchOptions.sort.order !== "Most"}
                    filterKey="sort"
                    label={SORT_OPTIONS.find((option) => option.value === currentSortValue)?.label ?? "Relevance"}
                    menuLabel="Sort jobs"
                    onOpenChange={handleDesktopMenuChange}
                    open={desktopFilter === "sort"}
                  >
                    <DropdownMenuRadioGroup value={currentSortValue} onValueChange={applySort}>
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="items-start rounded-lg px-2.5 py-2"
                        >
                          <OptionText description={option.description} label={option.label} />
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DesktopMenuFrame>

                  <DesktopMenuFrame
                    active={searchOptions.apply_form !== "All"}
                    filterKey="apply"
                    label={getApplyLabel(searchOptions.apply_form)}
                    menuLabel="Apply type"
                    onOpenChange={handleDesktopMenuChange}
                    open={desktopFilter === "apply"}
                  >
                    <DropdownMenuRadioGroup value={currentApplyValue} onValueChange={applyApplyForm}>
                      {APPLY_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="items-start rounded-lg px-2.5 py-2"
                        >
                          <OptionText description={option.description} label={option.label} />
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DesktopMenuFrame>

                  <DesktopMenuFrame
                    active={searchOptions.exclusion.length > 0}
                    filterKey="exclusion"
                    label={getExclusionLabel(searchOptions.exclusion)}
                    menuLabel="Excluded jobs"
                    onOpenChange={handleDesktopMenuChange}
                    open={desktopFilter === "exclusion"}
                  >
                    {EXCLUSION_OPTIONS.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={searchOptions.exclusion.includes(option.value)}
                        onCheckedChange={() => toggleExclusion(option.value)}
                        onSelect={(event) => event.preventDefault()}
                        className="items-start rounded-lg px-2.5 py-2"
                      >
                        <OptionText description={option.description} label={option.label} />
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DesktopMenuFrame>
                </>
              ) : (
                <>
                  <QuickFilterTrigger
                    active={searchOptions.date_range.magnitude !== 30 || searchOptions.date_range.unit !== "Days"}
                    label={getDateLabel(searchOptions.date_range.magnitude, searchOptions.date_range.unit)}
                    onClick={() => setMobileFilter("date")}
                  />
                  <QuickFilterTrigger
                    active={searchOptions.sort.by !== "Relevance" || searchOptions.sort.order !== "Most"}
                    label={SORT_OPTIONS.find((option) => option.value === currentSortValue)?.label ?? "Relevance"}
                    onClick={() => setMobileFilter("sort")}
                  />
                  <QuickFilterTrigger
                    active={searchOptions.apply_form !== "All"}
                    label={getApplyLabel(searchOptions.apply_form)}
                    onClick={() => setMobileFilter("apply")}
                  />
                  <QuickFilterTrigger
                    active={searchOptions.exclusion.length > 0}
                    label={getExclusionLabel(searchOptions.exclusion)}
                    onClick={() => setMobileFilter("exclusion")}
                  />
                </>
              )}
            </div>
          </div>

          <Drawer
            direction="bottom"
            open={mobileFilter !== null && !useDesktopMenus}
            onOpenChange={(open) => {
              if (!open) setMobileFilter(null);
            }}
          >
            <DrawerContent className="border-border bg-background">
              <DrawerHeader className="border-b border-border px-4 pb-4">
                <DrawerTitle>{mobileFilter ? DRAWER_META[mobileFilter].title : ""}</DrawerTitle>
                <DrawerDescription>
                  {mobileFilter ? DRAWER_META[mobileFilter].description : ""}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto px-4 py-4">
                {renderMobileBody()}
              </div>
              <DrawerFooter className="border-t border-border">
                <DrawerClose asChild>
                  <Button className="rounded-xl" variant="outline">
                    Done
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
    </div>
  );
}

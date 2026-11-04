"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Hitbox } from "@/components/ui/hitbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { ApplyForm, Exclusion, SortOptions, TimeUnits } from "@/types/search";
import { Check, ChevronDown } from "lucide-react";
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

type ExclusionOption = RadioOption & {
  value: Exclusion;
};

const SORT_OPTIONS: SortOption[] = [
  {
    description: "Best match for your query and preferences.",
    label: "Relevance",
    sort: { by: "Relevance", order: "Most" },
    value: "relevance-most",
  },
  {
    description: "Freshly discovered jobs appear first.",
    label: "Most recent",
    sort: { by: "Recency", order: "Most" },
    value: "recency-most",
  },
  {
    description: "Oldest matching postings appear first.",
    label: "Oldest",
    sort: { by: "Recency", order: "Least" },
    value: "recency-least",
  },
  {
    description: "Highest compensation surfaced first.",
    label: "Highest salary",
    sort: { by: "Salary", order: "Most" },
    value: "salary-most",
  },
  {
    description: "Lowest compensation surfaced first.",
    label: "Lowest salary",
    sort: { by: "Salary", order: "Least" },
    value: "salary-least",
  },
  {
    description: "Senior and executive roles prioritized.",
    label: "Most experience",
    sort: { by: "Experience", order: "Most" },
    value: "experience-most",
  },
  {
    description: "Junior and entry roles prioritized.",
    label: "Least experience",
    sort: { by: "Experience", order: "Least" },
    value: "experience-least",
  },
];

const DATE_OPTIONS: DateOption[] = [
  {
    description: "Show jobs posted within the last 24 hours.",
    label: "Past 24 hours",
    magnitude: 24,
    unit: "Hours",
    value: "24-hours",
  },
  {
    description: "Show jobs posted within the last 3 days.",
    label: "Past 3 days",
    magnitude: 3,
    unit: "Days",
    value: "3-days",
  },
  {
    description: "Show jobs posted within the last week.",
    label: "Past week",
    magnitude: 1,
    unit: "Weeks",
    value: "1-week",
  },
  {
    description: "Show jobs posted within the last 2 weeks.",
    label: "Past 2 weeks",
    magnitude: 2,
    unit: "Weeks",
    value: "2-weeks",
  },
  {
    description: "Show jobs posted within the last 3 weeks.",
    label: "Past 3 weeks",
    magnitude: 3,
    unit: "Weeks",
    value: "3-weeks",
  },
  {
    description: "Show jobs posted within the last month.",
    label: "Past month",
    magnitude: 1,
    unit: "Months",
    value: "1-month",
  },
  {
    description: "Show jobs posted within the last 2 months.",
    label: "Past 2 months",
    magnitude: 2,
    unit: "Months",
    value: "2-months",
  },
  {
    description: "Show jobs posted within the last 3 months.",
    label: "Past 3 months",
    magnitude: 3,
    unit: "Months",
    value: "3-months",
  },
  {
    description: "Show jobs posted within the last 4 months.",
    label: "Past 4 months",
    magnitude: 4,
    unit: "Months",
    value: "4-months",
  },
  {
    description: "Show jobs posted within the last 5 months.",
    label: "Past 5 months",
    magnitude: 5,
    unit: "Months",
    value: "5-months",
  },
  {
    description: "Show jobs posted within the last 6 months.",
    label: "Past 6 months",
    magnitude: 6,
    unit: "Months",
    value: "6-months",
  },
  {
    description: "Show jobs posted within the last year.",
    label: "Past year",
    magnitude: 1,
    unit: "Years",
    value: "1-year",
  },
  {
    description: "Show jobs posted within the last 2 years.",
    label: "Past 2 years",
    magnitude: 2,
    unit: "Years",
    value: "2-years",
  },
  {
    description: "Show jobs posted within the last 3 years.",
    label: "Past 3 years",
    magnitude: 3,
    unit: "Years",
    value: "3-years",
  },
  {
    description: "Include all discovered postings without recency limits.",
    label: "All time",
    magnitude: 10,
    unit: "Years",
    value: "10-years",
  },
];

const APPLY_OPTIONS: ApplyOption[] = [
  {
    applyForm: "All",
    description: "Include every application process style.",
    label: "Easy or lengthy apply",
    value: "all",
  },
  {
    applyForm: "Fast",
    description: "Surface jobs with quick or single-page applications.",
    label: "Easy apply only",
    value: "simple",
  },
  {
    applyForm: "Slow",
    description: "Include positions that require detailed questionnaires or Workday-like flows.",
    label: "Lengthy apply only",
    value: "time-consuming",
  },
];

const EXCLUSION_OPTIONS: ExclusionOption[] = [
  {
    description: "Filter out roles you have already applied to.",
    label: "Applied",
    value: "Applied",
  },
  {
    description: "Filter out jobs you already opened and reviewed.",
    label: "Viewed",
    value: "Viewed",
  },
  {
    description: "Filter out jobs already in your saved shortlist.",
    label: "Saved",
    value: "Saved",
  },
  {
    description: "Filter out jobs you explicitly dismissed.",
    label: "Hidden",
    value: "Hidden",
  },
];

const DRAWER_META: Record<QuickFilterKey, { description: string; title: string }> = {
  apply: {
    description: "Pick whether you prefer quick-apply postings or are open to longer applications.",
    title: "Application process",
  },
  date: {
    description: "Filter jobs by when they were posted or refreshed by the source.",
    title: "Date posted",
  },
  exclusion: {
    description: "Filter out jobs by status or application type.",
    title: "Job Exclusions & Apply",
  },
  sort: {
    description: "Reorder results to prioritize recency, salary, or experience levels.",
    title: "Sort jobs",
  },
};

function getTriggerClassName(active: boolean) {
  return cn(
    "group flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors",
    active ? "border-primary/40 bg-accent text-primary shadow-xs" : "border-border/80 bg-background text-foreground/90 hover:border-border hover:bg-accent/60 hover:text-foreground"
  );
}

function QuickFilterTrigger({
  active = false,
  className,
  label,
  ...props
}: ComponentProps<"button"> & {
  active?: boolean;
  label: string;
}) {
  return (
    <button type="button" className={cn(getTriggerClassName(active), className)} {...props}>
      <span className="whitespace-nowrap">{label}</span>
      <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-current" />
    </button>
  );
}

function DesktopMenuFrame({
  active = false,
  children,
  filterKey,
  hidden = false,
  label,
  onOpenChange,
  open,
}: {
  active?: boolean;
  children: ReactNode;
  filterKey: QuickFilterKey;
  hidden?: boolean;
  label: string;
  onOpenChange: (filter: QuickFilterKey, open: boolean) => void;
  open: boolean;
}) {
  if (hidden) return null;

  return (
    <DropdownMenu open={open} onOpenChange={(nextOpen) => onOpenChange(filterKey, nextOpen)}>
      <DropdownMenuTrigger className={getTriggerClassName(active)}>
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-current" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[18rem] rounded-xl border-border bg-popover/95 p-1 shadow-xl backdrop-blur">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OptionText({ description, label }: { description?: string; label: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col", description ? "gap-0.5" : "justify-center")}>
      <span className="truncate font-medium leading-tight text-foreground">{label}</span>
      {description ? <span className="text-xs leading-relaxed text-muted-foreground">{description}</span> : null}
    </div>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors", selected ? "border-primary" : "border-border/70")}>
      <span className={cn("size-2 rounded-full transition-colors", selected ? "bg-primary" : "bg-transparent")} />
    </span>
  );
}

function MobileChoiceButton({ description, label, onClick, selected }: { description?: string; label: string; onClick: () => void; selected: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors bg-transparent")}>
      <RadioIndicator selected={selected} />
      <OptionText description={description} label={label} />
    </button>
  );
}

function MobileCheckboxButton({ checked, description, label, onClick }: { checked: boolean; description?: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors bg-transparent")}>
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
  const current = SORT_OPTIONS.find((option) => option.sort.by === sort.by && option.sort.order === sort.order);
  return current?.value ?? "relevance-most";
}

function getDateValue(magnitude: number, unit: TimeUnits) {
  const current = DATE_OPTIONS.find((option) => option.magnitude === magnitude && option.unit === unit);
  return current?.value ?? `${magnitude}-${unit.toLowerCase()}`;
}

function getApplyValue(applyForm: ApplyForm) {
  return APPLY_OPTIONS.find((option) => option.applyForm === applyForm)?.value ?? "all";
}

function getExclusionLabel(exclusions: Exclusion[]) {
  if (exclusions.length === 0) return "Show all jobs";
  if (exclusions.length === 1) return `Exclude ${exclusions[0].toLowerCase()} jobs`;
  return `Exclude ${exclusions.length} job types`;
}

export default function Filters({ companyCount, jobCount, location }: { companyCount?: number; jobCount?: number; location?: string }) {
  const { searchOptions, updateSearchOptions } = useApp();
  const { showLegacyFilters, jobBoardSelectionMode, setJobBoardSelectionMode } = useSearchUI();
  const { contentRef, containerProps } = useCollapsibleHeight(showLegacyFilters);
  const useDesktopMenus = useMediaQuery("(min-width: 769px)");
  const [desktopFilter, setDesktopFilter] = useState<QuickFilterKey | null>(null);
  const [mobileFilter, setMobileFilter] = useState<QuickFilterKey | null>(null);

  const currentSortValue = getSortValue(searchOptions.sort);
  const currentDateValue = getDateValue(searchOptions.date_range.magnitude, searchOptions.date_range.unit);
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
    const nextExclusions = searchOptions.exclusion.includes(value) ? searchOptions.exclusion.filter((item) => item !== value) : [...searchOptions.exclusion, value];
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

    return (
      <div className="space-y-4">
        <div>
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exclude jobs</div>
          {EXCLUSION_OPTIONS.map((option) => (
            <MobileCheckboxButton
              key={option.value}
              checked={searchOptions.exclusion.includes(option.value)}
              description={option.description}
              label={option.label}
              onClick={() => toggleExclusion(option.value)}
            />
          ))}
        </div>
        <div>
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application type</div>
          {APPLY_OPTIONS.map((option) => (
            <MobileChoiceButton
              key={option.value}
              description={option.description}
              label={option.label}
              onClick={() => applyApplyForm(option.value)}
              selected={option.value === currentApplyValue}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div {...containerProps}>
      <div ref={contentRef} aria-hidden={!showLegacyFilters}>
        <div className="mx-auto max-w-full px-4 py-3 lg:px-8">
          <div className="flex flex-nowrap items-center gap-x-3 gap-y-2 overflow-hidden md:flex-wrap md:gap-x-6">
            {useDesktopMenus ? (
              /* Apply folded into Exclusion dropdown (_1o) */
              <DesktopMenuFrame
                active={searchOptions.exclusion.length > 0 || searchOptions.apply_form !== "All"}
                filterKey="exclusion"
                hidden
                label={getExclusionLabel(searchOptions.exclusion)}
                onOpenChange={handleDesktopMenuChange}
                open={desktopFilter === "exclusion"}
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exclude jobs</div>
                {EXCLUSION_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={searchOptions.exclusion.includes(option.value)}
                    onCheckedChange={() => toggleExclusion(option.value)}
                    onSelect={(event) => event.preventDefault()}
                    className="items-start rounded-lg pl-2.5 pr-9 py-2 data-[state=checked]:bg-accent data-[state=checked]:text-primary"
                  >
                    <OptionText description={option.description} label={option.label} />
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator className="my-1" />
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Application type</div>
                <DropdownMenuRadioGroup value={currentApplyValue} onValueChange={applyApplyForm}>
                  {APPLY_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="items-start rounded-lg pl-2 pr-8 py-2 data-[state=checked]:bg-accent data-[state=checked]:text-primary"
                    >
                      <OptionText description={option.description} label={option.label} />
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DesktopMenuFrame>
            ) : null}
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
              <DrawerDescription className="sr-only">{mobileFilter ? DRAWER_META[mobileFilter].description : ""}</DrawerDescription>
            </DrawerHeader>

            <div className="max-h-[60vh] space-y-1 overflow-y-auto p-4">{renderMobileBody()}</div>

            <DrawerFooter className="border-t border-border p-4">
              <DrawerClose asChild>
                <Button className="w-full" variant="outline">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { companyTags, legacyFilterTags } from "@/data/search-filters";
import { getCategoryEditCount, initialSearchState } from "@/lib/edited-filters";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SearchFiltersProps {
  onIconClick?: (category: string) => void;
  onWrapChange?: (wrapped: boolean) => void;
  className?: string;
}

export default function SearchFilters({ onIconClick, onWrapChange, className }: SearchFiltersProps) {
  const { searchOptions } = useApp();
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = filtersRef.current;
    if (!node || !onWrapChange) return;

    const measure = () => {
      const items = Array.from(node.children);
      const firstTop = items[0]?.getBoundingClientRect().top;
      onWrapChange(items.some((item) => item.getBoundingClientRect().top !== firstTop));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onWrapChange]);

  const handleFilterClick = (filterName: string) => {
    onIconClick?.(filterName);
  };

  const categoryForTag: Record<string, string> = {
    Exclusion: "exclusion",
    "Activity & Outcomes": "activity-outcomes",
    "Encouraged to Apply": "encouraged",
    Salary: "salary",
    Commitment: "commitment",
    Experience: "experience",
    "Benefits & Perks": "benefits",
    Departments: "departments",
    "Job Titles & Keywords": "job-titles",
    Education: "education",
    "Licenses & Certifications": "licenses",
    "Security Clearance": "security",
    Languages: "languages",
    "Shifts & Schedules": "shifts",
    "Travel Requirement": "travel",
    Company: "company",
    Industry: "industry",
    "Stage & Funding": "stage",
    Size: "size",
    "Founding Year": "founding",
  };

  const editCount = (tag: string) => getCategoryEditCount(searchOptions, initialSearchState, categoryForTag[tag] ?? "");

  return (
    <div ref={filtersRef} className={cn("flex flex-wrap gap-2", className)}>
      {legacyFilterTags.map((tag, index) => (
        <Badge
          className={cn(
            "cursor-pointer rounded-sm border-border/70 bg-background text-foreground/80 transition-all duration-300 hover:bg-secondary lg:text-md dark:border-border dark:bg-secondary dark:text-foreground/80 dark:hover:bg-accent",
            editCount(tag) > 0 && "border-primary/50 bg-primary/10 text-primary dark:bg-primary/20"
          )}
          key={index}
          onClick={() => handleFilterClick(tag)}
          variant="outline"
        >
          {tag}
          {editCount(tag) > 0 ? <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">{editCount(tag)}</span> : null}
        </Badge>
      ))}
      {/* <span className="text-muted-foreground/25 dark:text-muted-foreground/25 text-2xl h-min leading-none">
        •
      </span> */}
      {companyTags.map((tag, index) => (
        <Badge
          className={cn(
            "cursor-pointer rounded-sm border-warning/30 bg-warning-soft text-warning-soft-foreground transition-all duration-300 hover:bg-warning-soft/80 lg:text-md",
            editCount(tag) > 0 && "border-primary/50 bg-primary/10 text-primary"
          )}
          key={index}
          onClick={() => handleFilterClick(tag)}
          variant="outline"
        >
          {tag}
          {editCount(tag) > 0 ? <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">{editCount(tag)}</span> : null}
        </Badge>
      ))}
    </div>
  );
}

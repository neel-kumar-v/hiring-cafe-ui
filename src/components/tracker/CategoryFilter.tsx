"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { JobCategory } from "@/types/tracker";
import { BookmarkIcon, EyeOffIcon, FilterIcon, PhoneOutgoingIcon, SendIcon, XIcon, type LucideIcon } from "lucide-react";

const CATEGORY_OPTIONS: ReadonlyArray<{ value: JobCategory; label: string; icon: LucideIcon }> = [
  { value: "saved", label: "Saved", icon: BookmarkIcon },
  { value: "applied", label: "Applied", icon: SendIcon },
  { value: "interviewing", label: "Interviewing", icon: PhoneOutgoingIcon },
  { value: "rejected", label: "Rejected", icon: XIcon },
  { value: "hidden", label: "Hidden", icon: EyeOffIcon },
];

interface CategoryFilterProps {
  visibleCategories: Record<JobCategory, boolean>;
  onChange: (visibleCategories: Record<JobCategory, boolean>) => void;
  className?: string;
}

const CategoryFilter = ({ visibleCategories, onChange, className }: CategoryFilterProps) => {
  const isFiltered = CATEGORY_OPTIONS.some(({ value }) => !visibleCategories[value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Filter categories"
          title="Filter categories"
          className={cn("shrink-0", isFiltered && "border-primary/30 bg-brand-soft/40 text-primary", className)}
        >
          <FilterIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {CATEGORY_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={visibleCategories[value]}
            className="cursor-pointer"
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => onChange({ ...visibleCategories, [value]: checked === true })}
          >
            <Icon className="text-muted-foreground" />
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryFilter;

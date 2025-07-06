import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import SearchDialog from "../SearchDialog";

const filterTags = [
  "Departments",
  "Salary",
  "Commitment",
  "Experience",
  "Job Titles & Keywords",
  "Education",
  "Licenses & Certifications",
  "Security Clearance",
  "Languages",
  "Shifts & Schedules",
  "Travel Requirement",
  "Benefits & Perks",
  "Encouraged to Apply",
];

const companyTags = [
  "Company",
  "Industry",
  "Stage & Funding",
  "Size",
  "Founding Year",
];

export default function SearchFilters() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const handleClick = (e: React.MouseEvent, filterName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFilter(filterName);
    setDialogOpen(true);
  };

  return (
    <>
      <div
        className="flex flex-wrap gap-2"
        onClick={(e) => handleClick(e, "")}
        onMouseDown={(e) => handleClick(e, "")}
      >
        {filterTags.map((tag, index) => (
          <Badge
            className="cursor-pointer rounded-sm border-neutral-300 bg-white text-neutral-700 transition-all duration-300 hover:bg-neutral-100 lg:text-md 2xl:text-lg dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            key={index}
            onClick={(e) => handleClick(e, tag)}
            variant="outline"
          >
            {tag}
          </Badge>
        ))}
        {/* <span className="text-neutral-500/25 dark:text-neutral-400/25 text-2xl h-min leading-none">
          •
        </span> */}
        {companyTags.map((tag, index) => (
          <Badge
            className="cursor-pointer rounded-sm border-orange-300 bg-orange-100 text-orange-700 transition-all duration-300 hover:bg-orange-200 lg:text-md 2xl:text-lg dark:border-orange-700 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
            key={index}
            onClick={(e) => handleClick(e, tag)}
            variant="outline"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <SearchDialog
        from={selectedFilter}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}

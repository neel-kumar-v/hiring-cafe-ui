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
            key={index}
            variant="outline"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer rounded-sm 2xl:text-lg lg:text-md"
            onClick={(e) => handleClick(e, tag)}
          >
            {tag}
          </Badge>
        ))}
        {/* <span className="text-gray-500/25 dark:text-gray-400/25 text-2xl h-min leading-none">
          •
        </span> */}
        {companyTags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 transition-all duration-300 cursor-pointer rounded-sm 2xl:text-lg lg:text-md"
            onClick={(e) => handleClick(e, tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <SearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        from={selectedFilter}
      />
    </>
  );
}

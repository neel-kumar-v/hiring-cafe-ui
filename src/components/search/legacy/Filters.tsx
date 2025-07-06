import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import SearchDialog from "../../SearchDialog";

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

export default function Filters() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="border-neutral-200 border-b bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto max-w-full px-2 py-4 sm:px-4 lg:px-8 xl:px-12">
          <div className="flex flex-wrap gap-2">
            {filterTags.map((tag, index) => (
              <Badge
                className="cursor-pointer rounded-sm border-neutral-300 bg-white text-[14px] text-neutral-700 transition-all duration-300 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                key={index}
                onClick={() => handleFilterClick(tag)}
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
            <span className="h-min text-2xl text-neutral-500/25 leading-none dark:text-neutral-400/25">
              •
            </span>
            {companyTags.map((tag, index) => (
              <Badge
                className="cursor-pointer rounded-sm border-orange-300 bg-orange-100 text-[14px] text-orange-700 transition-all duration-300 hover:bg-orange-200 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
                key={index}
                onClick={() => handleFilterClick(tag)}
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <SearchDialog
        from={selectedFilter}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}

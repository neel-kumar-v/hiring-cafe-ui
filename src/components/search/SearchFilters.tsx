import { Badge } from "@/components/ui/badge";

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

interface SearchFiltersProps {
  onIconClick?: (category: string) => void;
}

export default function SearchFilters({ onIconClick }: SearchFiltersProps) {
  const handleFilterClick = (filterName: string) => {
    onIconClick?.(filterName);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filterTags.map((tag, index) => (
        <Badge
          className="cursor-pointer rounded-sm border-neutral-300 bg-white text-neutral-700 transition-all duration-300 hover:bg-neutral-100 lg:text-md 2xl:text-lg dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          key={index}
          onClick={() => handleFilterClick(tag)}
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
          onClick={() => handleFilterClick(tag)}
          variant="outline"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

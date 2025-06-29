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

export default function Filters() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">

        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer rounded-sm text-[14px]"
            >
              {tag}
            </Badge>
          ))}
          <span className="text-gray-500/25 dark:text-gray-400/25 text-2xl h-min leading-none">
            •
          </span>
          {companyTags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 transition-all duration-300 cursor-pointer rounded-sm text-[14px]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

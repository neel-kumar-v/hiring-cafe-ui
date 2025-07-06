import jobsData from "@/data/jobs_data.json" with { type: "json" };
import { jobTitles as fallbackJobTitles } from "@/data/jobTitles";
import {
  BookMarked,
  BriefcaseBusiness,
  DollarSign,
  type LucideIcon,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import UniversalTooltip from "../util/UniversalTooltip";
import Autocomplete from "./Autocomplete";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
}

interface SearchBarIconProps {
  icon: LucideIcon;
  tooltipContent: string;
  inputValue: string;
  delay?: string;
  onClick?: () => void;
}

// SearchBarIcon component
function SearchBarIcon({
  icon: Icon,
  tooltipContent,
  inputValue,
  delay = "delay-0",
  onClick,
}: SearchBarIconProps) {
  const isVisible =
    inputValue.trim() === ""
      ? "sm:opacity-100 opacity-0"
      : "sm:opacity-0 opacity-0 cursor-pointer pointer-events-none";

  return (
    <UniversalTooltip content={tooltipContent}>
      <Icon
        className={`h-4 w-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500 ${delay} ${isVisible}`}
        onClick={onClick}
      />
    </UniversalTooltip>
  );
}

// Minimal type for extracting job titles
interface JobTitleLike {
  v5_processed_job_data?: { core_job_title?: string };
  job_information?: { title?: string };
}

export default function SearchBar({
  placeholder = "Search",
  className = "",
  onSearch,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");

  // Try to extract job titles from jobsData, fallback to jobTitles.ts
  const jobTitles = useMemo(() => {
    if (jobsData && Array.isArray(jobsData.results)) {
      // Prefer core_job_title, fallback to job_information.title
      const titles = (jobsData.results as JobTitleLike[])
        .map(
          (job) =>
            job.v5_processed_job_data?.core_job_title ||
            job.job_information?.title
        )
        .filter((title): title is string => Boolean(title)); // filter to string only
      // Deduplicate
      return Array.from(new Set(titles));
    }
    return fallbackJobTitles;
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative flex-1">
      <Autocomplete
        className={className}
        maxTotal={20}
        onChange={handleInputChange}
        options={jobTitles}
        placeholder={placeholder}
        value={inputValue}
      />
      <div className="-translate-y-1/2 absolute top-1/2 right-3 z-10 flex justify-end gap-1.5">
        <SearchBarIcon
          delay="delay-0"
          icon={MapPin}
          inputValue={inputValue}
          tooltipContent="Location"
        />
        <SearchBarIcon
          delay="delay-100 hover:delay-0"
          icon={DollarSign}
          inputValue={inputValue}
          tooltipContent="Salary"
        />
        <SearchBarIcon
          delay="delay-200 hover:delay-0"
          icon={BriefcaseBusiness}
          inputValue={inputValue}
          tooltipContent="Job Type"
        />
        <SearchBarIcon
          delay="delay-300 hover:delay-0"
          icon={SlidersHorizontal}
          inputValue={inputValue}
          tooltipContent="Filters"
        />
        <SearchBarIcon
          delay="delay-400 hover:delay-0"
          icon={BookMarked}
          inputValue={inputValue}
          tooltipContent="Saved"
        />
        {inputValue && (
          <UniversalTooltip content="Delete Search">
            <X
              className={
                "h-4 w-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500"
              }
              onClick={() => setInputValue("")}
            />
          </UniversalTooltip>
        )}
      </div>
    </div>
  );
}

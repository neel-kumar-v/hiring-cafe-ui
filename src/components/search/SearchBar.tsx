import {
  BookMarked,
  BriefcaseBusiness,
  DollarSign,
  MapPin,
  SlidersHorizontal,
  LucideIcon,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import jobsData from "@/data/jobs_data.json";
import { jobTitles as fallbackJobTitles } from "@/data/jobTitles";
import Autocomplete from "./Autocomplete";
import UniversalTooltip from "../util/UniversalTooltip";

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
        className={`w-4 h-4 text-gray-400 cursor-pointer hover:text-pink-500 transition-all ${delay} ${isVisible}`}
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
        options={jobTitles}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        maxVisible={7}
        maxTotal={20}
      />
      <div className="flex gap-1.5 absolute justify-end right-3 top-1/2 -translate-y-1/2 z-10">
        <SearchBarIcon
          icon={MapPin}
          tooltipContent="Location"
          inputValue={inputValue}
          delay="delay-0"
        />
        <SearchBarIcon
          icon={DollarSign}
          tooltipContent="Salary"
          inputValue={inputValue}
          delay="delay-100 hover:delay-0"
        />
        <SearchBarIcon
          icon={BriefcaseBusiness}
          tooltipContent="Job Type"
          inputValue={inputValue}
          delay="delay-200 hover:delay-0"
        />
        <SearchBarIcon
          icon={SlidersHorizontal}
          tooltipContent="Filters"
          inputValue={inputValue}
          delay="delay-300 hover:delay-0"
        />
        <SearchBarIcon
          icon={BookMarked}
          tooltipContent="Saved"
          inputValue={inputValue}
          delay="delay-400 hover:delay-0"
        />
        {inputValue && (
          <UniversalTooltip content="Delete Search">
            <X
              className={`w-4 h-4 text-gray-400 cursor-pointer hover:text-pink-500 transition-all`}
              onClick={() => setInputValue("")}
            />
          </UniversalTooltip>
        )}
      </div>
    </div>
  );
}

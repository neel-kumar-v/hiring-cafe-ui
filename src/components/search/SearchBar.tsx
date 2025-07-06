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
  onIconClick?: (category: string) => void;
}

interface SearchBarIconProps {
  icon: LucideIcon;
  tooltipContent: string;
  delay?: string;
  onClick?: () => void;
  dataIconType?: string;
  clickable?: boolean;
}

// SearchBarIcon component
function SearchBarIcon({
  icon: Icon,
  tooltipContent,
  delay = "delay-0",
  onClick,
  dataIconType,
  clickable = true,
}: SearchBarIconProps) {
  return (
    <UniversalTooltip content={tooltipContent}>
      <Icon
        className={`h-4 w-4 text-neutral-400 transition-all hover:text-pink-500 ${delay} ${clickable ? "opacity-100" : "opacity-0"} cursor-pointer`}
        onClick={onClick}
        data-icon-type={dataIconType}
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
  onIconClick,
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

  const handleGeneralClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = e.currentTarget;
    const icons = Array.from(
      container.querySelectorAll("[data-icon-type]")
    ) as HTMLElement[];
    const clickX = e.clientX;
    const clickY = e.clientY;

    type Target = {
      el: HTMLElement;
      type: string;
    };
    const targets: Target[] = icons.map((icon) => ({
      el: icon,
      type: icon.dataset.iconType || "",
    }));

    const closest = targets.reduce(
      (min, target) => {
        const rect = target.el.getBoundingClientRect();
        const dist = Math.hypot(
          rect.left + rect.width / 2 - clickX,
          rect.top + rect.height / 2 - clickY
        );
        return dist < min.dist ? { target, dist } : min;
      },
      { target: null as Target | null, dist: Number.POSITIVE_INFINITY }
    );

    if (!closest.target) return;

    // Call the appropriate handler based on the icon type
    switch (closest.target.type) {
      case "location":
        onIconClick?.("location");
        break;
      case "salary":
        onIconClick?.("salary");
        break;
      case "commitment":
        onIconClick?.("commitment");
        break;
      case "filters":
        onIconClick?.("filters");
        break;
      case "saved":
        onIconClick?.("saved");
        break;
      case "clear":
        setInputValue("");
        break;
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
        onIconClick={onIconClick}
      />
      <div
        className="-translate-y-1/2 absolute top-1/2 right-3 z-10 flex justify-end gap-1.5"
        onClick={handleGeneralClick}
      >
        <SearchBarIcon
          delay="delay-0"
          icon={MapPin}
          tooltipContent="Location"
          onClick={() => onIconClick?.("location")}
          dataIconType="location"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-100 hover:delay-0"
          icon={DollarSign}
          tooltipContent="Salary"
          onClick={() => onIconClick?.("salary")}
          dataIconType="salary"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-200 hover:delay-0"
          icon={BriefcaseBusiness}
          tooltipContent="Job Type"
          onClick={() => onIconClick?.("commitment")}
          dataIconType="commitment"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-300 hover:delay-0"
          icon={SlidersHorizontal}
          tooltipContent="Filters"
          onClick={() => onIconClick?.("filters")}
          dataIconType="filters"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-400 hover:delay-0"
          icon={BookMarked}
          tooltipContent="Saved"
          onClick={() => onIconClick?.("saved")}
          dataIconType="saved"
          clickable={!inputValue}
        />
        {inputValue && (
          <UniversalTooltip content="Delete Search">
            <X
              className={
                "h-4 w-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500"
              }
              onClick={() => setInputValue("")}
              data-icon-type="clear"
            />
          </UniversalTooltip>
        )}
      </div>
    </div>
  );
}

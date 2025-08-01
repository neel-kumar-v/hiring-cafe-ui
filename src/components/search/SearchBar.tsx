import jobTitlesData from "@/data/job_titles.json" with { type: "json" };
import {
  Building2,
  CalendarClock,
  DollarSign,
  IdCard,
  type LucideIcon,
  MapPin,
  School,
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
    <UniversalTooltip content={tooltipContent} side="bottom">
      <Icon
        className={`sm:size-4 size-4 text-neutral-400 transition-all hover:text-pink-500 ${delay} ${clickable ? "opacity-100" : "opacity-0"} cursor-pointer`}
        onClick={onClick}
        data-icon-type={dataIconType}
      />
    </UniversalTooltip>
  );
}

export default function SearchBar({
  placeholder = "Search",
  className = "",
  onSearch,
  onIconClick,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");

  const jobTitles = useMemo(() => {
    return Array.from(new Set(jobTitlesData.suggestions)).map(title =>
      title.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
    ) as string[];
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
      case "availability":
        onIconClick?.("availability");
        break;
      case "role-department":
        onIconClick?.("role-department");
        break;
      case "qualifications":
        onIconClick?.("qualifications");
        break;
      case "company":
        onIconClick?.("company");
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
        className="-translate-y-1/2 absolute top-1/2 right-3 py-3 z-10 flex justify-end gap-1.5"
        onClick={handleGeneralClick}
      >
        <SearchBarIcon
          delay="delay-0"
          icon={SlidersHorizontal}
          tooltipContent="General Filters"
          onClick={() => onIconClick?.("filters")}
          dataIconType="filters"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-100 hover:delay-0 hidden sm:block"
          icon={DollarSign}
          tooltipContent="Compensation & Level"
          onClick={() => onIconClick?.("salary")}
          dataIconType="salary"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-200 hover:delay-0 hidden sm:block"
          icon={IdCard}
          tooltipContent="Role & Department"
          onClick={() => onIconClick?.("role-department")}
          dataIconType="role-department"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-400 hover:delay-0 hidden sm:block"
          icon={School}
          tooltipContent="Qualifications"
          onClick={() => onIconClick?.("qualifications")}
          dataIconType="qualifications"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-300 hover:delay-0 hidden sm:block"
          icon={CalendarClock}
          tooltipContent="Availability"
          onClick={() => onIconClick?.("availability")}
          dataIconType="availability"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-500 hover:delay-0 hidden sm:block"
          icon={MapPin}
          tooltipContent="Location"
          onClick={() => onIconClick?.("location")}
          dataIconType="location"
          clickable={!inputValue}
        />
        <SearchBarIcon
          delay="delay-600 hover:delay-0 hidden sm:block  "
          icon={Building2}
          tooltipContent="Company"
          onClick={() => onIconClick?.("company")}
          dataIconType="company"
          clickable={!inputValue}
        />
        {inputValue && (
          <UniversalTooltip content="Delete Search" side="bottom" >
            <X
              className={
                "size-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500"
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

"use client";

import {
  Building2,
  CalendarClock,
  ChevronDown,
  DollarSign,
  IdCard,
  type LucideIcon,
  MapPin,
  School,
  SlidersHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import Autocomplete from "./Autocomplete";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import type { AddressComponent, Location as SearchLocation, SearchState } from "@/types/search";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
  onIconClick?: (category: string) => void;
  value?: string;
}

const workplaceTypeOptions = ["Remote", "Hybrid", "Onsite"];
type LocationComponent = SearchLocation["address"]["components"][number];

function findAddressComponent(
  components: LocationComponent[] | undefined,
  type: string
) {
  return components?.find((component) =>
    component.types.includes(type as AddressComponent["types"][number])
  );
}

const getLocationLabel = (location: SearchLocation) => {
  if (!location) {
    return "";
  }
  let label = "";
  const { formatted, components } = location.address || {};
  label = formatted || "Unknown";
  
  if (!components) return label; // Fallback

  const city = findAddressComponent(components, "Locality")?.long_name;
  const state = findAddressComponent(components, "Admin Area")?.long_name;
  const country = findAddressComponent(components, "Country")?.long_name;
  const continent = findAddressComponent(components, "Continent")?.long_name;

  switch (location.types?.[0] || "") {
    case "Locality":
      if (city) label = city;
      break;
    case "Admin Area":
      if (state) label = state;
      break;
    case "Country":
      if (country) label = country;
      break;
    case "Continent":
      if (continent) label = continent;
      break;
  }
  return label;
};

const getLocationDisplayLabel = (locations: SearchLocation[]) => {
  if (locations?.length === 1 && locations[0].types?.includes("Locality")) {
    const loc = locations[0];
    const { formatted, components } = loc.address || {};
    let label = formatted || "Unknown";
    
    const city = findAddressComponent(components, "Locality")?.long_name;
    if (city) label = city;

    const options = loc.options ?? {
      ignore_radius: false,
      radius: 50,
      radius_unit: "Miles" as const,
      flexible_regions: [],
    };
    if (options.ignore_radius) {
      label = "Exactly in " + label;
    } else {
      label += " • " + (options.radius || 50) + ` ${options.radius_unit || "Miles"}`;
    }
    return label;
  }

  if ((locations || []).length > 2) {
    return `${locations.length} Places`;
  }
  
  return (
    (locations || []).map((loc) => getLocationLabel(loc)).join(" | ") ||
    "Anywhere in the world"
  );
};

const formatWorkplaceTypesLabel = (types?: string | string[]) => {
  if (!types || types === "All") return "All Environments";
  if (typeof types === "string") return `${types} only`;

  if (types.length === 1) {
    return `${types[0]} only`;
  }

  const effectiveTypes = types && types.length > 0 && types.length < 3 ? types : workplaceTypeOptions;
  return effectiveTypes.join(" · ");
};

interface IconButton {
  icon: LucideIcon;
  tooltipContent: string;
  delay?: string;
  onClick?: () => void;
  dataIconType?: string;
  clickable?: boolean;
}

function IconButton({
  icon: Icon,
  tooltipContent,
  delay = "delay-0",
  onClick,
  dataIconType,
  clickable = true,
}: IconButton) {
  const visibilityClass = clickable ? `${delay} opacity-100` : "hidden";
  return (
    <UniversalTooltip content={tooltipContent} side="bottom">
      <button
        type="button"
        className={visibilityClass}
        onClick={onClick}
        data-icon-type={dataIconType}
        aria-label={tooltipContent}
      >
        <Icon className="size-4 cursor-pointer text-neutral-400 transition-[transform,opacity] hover:text-pink-700 sm:size-4 dark:hover:text-pink-600" />
      </button>
    </UniversalTooltip>
  );
}

interface IconButtonsProps {
  showFilterControls: boolean;
  inputFocused: boolean;
  handleIconClick: (category: string) => void;
}

function IconButtons({ showFilterControls, inputFocused, handleIconClick }: IconButtonsProps) {
  if (!showFilterControls) return null;
  return (
    <>
      <IconButton icon={SlidersHorizontal} tooltipContent="General Filters" onClick={() => handleIconClick("filters")} dataIconType="filters" />
      <IconButton delay="hidden xs:block" icon={IdCard} tooltipContent="Role & Department" onClick={() => handleIconClick("role-department")} dataIconType="role-department" clickable={!inputFocused} />
      <IconButton delay="hidden xs:block" icon={School} tooltipContent="Qualifications" onClick={() => handleIconClick("qualifications")} dataIconType="qualifications" clickable={!inputFocused} />
      <IconButton delay="hidden xs:block" icon={CalendarClock} tooltipContent="Availability" onClick={() => handleIconClick("availability")} dataIconType="availability" clickable={!inputFocused} />
      <IconButton delay="hidden xs:block" icon={Building2} tooltipContent="Company" onClick={() => handleIconClick("company")} dataIconType="company" clickable={!inputFocused} />
    </>
  );
}

interface FilterButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  header: React.ReactNode;
  subtitle?: React.ReactNode;
  onClick: () => void;
  className?: string;
  showChevron?: boolean;
}

function FilterButton({
  icon: Icon,
  header,
  subtitle,
  onClick,
  className = "",
  showChevron = false,
}: FilterButtonProps) {
  return (
    <button onClick={onClick} className={`group/filter px-3 py-[8px] h-full flex items-center justify-between gap-2 ${className}`} type="button">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {Icon && <Icon className={`size-4 flex-none text-neutral-400 dark:text-neutral-500 ${header === "" ? "hidden md:block" : ""}`} />}
        <div className="flex flex-col text-xs text-left truncate min-w-0 translate-y-px">
          <span className={`font-bold truncate text-neutral-900 dark:text-white transition-[transform,opacity] duration-200 ease-in-out`}>{header}</span>
          {subtitle && <span className={`truncate text-[14px] font-medium text-neutral-600 dark:text-neutral-400`}>{subtitle}</span>}
        </div>
      </div>
      {showChevron && <ChevronDown className="size-4 flex-none text-neutral-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-[transform,opacity] duration-200 ease-in-out" />}
    </button>
  );
}

// LocationButton component
function LocationButton({
  showFilterControls,
  locationDisplay,
  handleIconClick,
}: {
  showFilterControls: boolean;
  locationDisplay: { location: string; workplaces: string };
  handleIconClick: (category: string) => void;
}) {
  if (!showFilterControls) return null;
  return (
    <FilterButton
      icon={MapPin}
      header={<>{locationDisplay.location}<span className="font-medium text-[12px] text-neutral-600 dark:text-neutral-400 ml-2 max-xs:hidden md:hidden lg:inline">{locationDisplay.workplaces}</span></>}
      onClick={() => handleIconClick("location")}
      className="min-w-[30%] w-full lg:min-w-[300px]"
    />
  );
}

// SalaryButton component
const frequencies: Record<string, string> = { Hourly: "hr", Daily: "day", Weekly: "wk", "Bi-Weekly": "bi-wk", Monthly: "mo", Yearly: "yr" };
function SalaryButton({ showFilterControls, currentSearchState, handleIconClick }: { showFilterControls: boolean, currentSearchState: SearchState, handleIconClick: (category: string) => void }) {
  if (!showFilterControls) return null;

  const salary = currentSearchState.salary;
  const minLow = salary.min_range.min;
  const minHigh = salary.min_range.max;
  const maxLow = salary.max_range.min;
  const maxHigh = salary.max_range.max;
  const calcFrequency = frequencies[salary.unit] || "yr";

  const currencyValue = salary.currency || "USD";
  
  let currencySymbol = "$";
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyValue }).formatToParts(0);
    const symb = parts.find(p => p.type === 'currency');
    if (symb) currencySymbol = symb.value;
  } catch {}

  const hasAnySalaryFilter = minLow > 0 || minHigh > 0 || maxLow > 0 || maxHigh > 0;

  const formatAmount = (amount: number, includeSymbol: boolean = true) => {
    if (amount <= 0) return "";
    const symbol = includeSymbol ? currencySymbol : "";
    const isShort = ["Hourly", "Daily", "Weekly", "Bi-Weekly"].includes(salary.unit);
    const baseAmount = isShort ? Math.round(amount) : Math.round(amount / 100) * 100;

    if (baseAmount >= 1000000) {
      const mil = baseAmount / 1000000;
      return `${symbol}${Number.isInteger(mil) ? mil : mil.toFixed(1)}M`;
    } else if (baseAmount >= 1000) {
      const k = baseAmount / 1000;
      return `${symbol}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
    }
    return `${symbol}${baseAmount}`;
  };

  const getDisplayMin = () => (minLow > 0 ? minLow : (maxLow > 0 && minLow <= 0 ? maxLow : null));
  const getDisplayMax = () => (maxHigh > 0 ? maxHigh : (minHigh > 0 && maxHigh <= 0 ? minHigh : null));

  let mainLabel = "Any";
  if (hasAnySalaryFilter) {
    const displayMin = getDisplayMin();
    const displayMax = getDisplayMax();

    if (!displayMin && !displayMax) mainLabel = "Any";
    else if (displayMin && !displayMax) mainLabel = formatAmount(displayMin);
    else if (!displayMin && displayMax) mainLabel = `Up to ${formatAmount(displayMax)}`;
    else if (displayMin && displayMax) mainLabel = `${formatAmount(displayMin)}–${formatAmount(displayMax, false)}`;
  }

  const header = mainLabel === "Any" ? "Any" : <>{mainLabel}<span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400"> / {calcFrequency}</span></>;
  return <FilterButton icon={DollarSign} header={header} onClick={() => handleIconClick("salary")} className="min-w-[max(80px, fit-content)] lg:min-w-[200px]" />;
}

export default function SearchBar({ placeholder = "Search", className = "", onSearch, onIconClick, value: controlledValue }: SearchBarProps) {
  const pathname = usePathname();
  const { searchOptions: currentSearchState } = useApp();
  const { handleSearchIconClick } = useSearchUI();
  
  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [inputFocused, setInputFocused] = useState(false);
  
  const convex = useConvex();
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  const handleIconClick = onIconClick || handleSearchIconClick;
  const showFilterControls = pathname === "/";

  useEffect(() => {
    if (controlledValue !== undefined) setInputValue(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      const q = inputValue.trim();
      if (!q) {
        setJobTitles([]);
        return;
      }
      void convex.query(api.jobs.distinctJobTitles, { query: q, limit: 50 }).then((titles) => {
        if (cancelled) return;
        setJobTitles((titles ?? []).map((t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1))));
      }).catch(() => {
        if (!cancelled) setJobTitles([]);
      });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, [convex, inputValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setInputValue("");
    if (onSearch) onSearch("");
  };

  const locationDisplay = useMemo(() => {
    const locations = currentSearchState.location.location || [];
    const locationStr = getLocationDisplayLabel(locations);
    const workplaces = formatWorkplaceTypesLabel(currentSearchState.location.workplace_type);
    
    // Simplification for UI consistency
    return {
      location: locationStr,
      workplaces,
    };
  }, [currentSearchState]);

  return (
    <div className="relative flex-1 sm:px-4">
      <Autocomplete
        className={className}
        options={jobTitles}
        iconButtons={<IconButtons showFilterControls={showFilterControls} inputFocused={inputFocused} handleIconClick={handleIconClick} />}
        locationButton={<LocationButton showFilterControls={showFilterControls} locationDisplay={locationDisplay} handleIconClick={handleIconClick} />}
        salaryButton={<SalaryButton showFilterControls={showFilterControls} currentSearchState={currentSearchState} handleIconClick={handleIconClick} />}
        onChange={handleInputChange}
        onClear={handleClear}
        onFocus={() => setInputFocused(true)}
        placeholder={placeholder}
        showClearButton={showFilterControls && !!inputValue}
        value={inputValue}
      />
    </div>
  );
}

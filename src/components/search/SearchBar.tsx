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
import type React from "react";

import Autocomplete from "./Autocomplete";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { Hitbox } from "@/components/ui/hitbox";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { AddressComponent, Location as SearchLocation, SearchState } from "@/types/search";
import { cn } from "@/lib/utils";
import jobTitlesJson from "@/data/job_titles.json";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
  onIconClick?: (category: string) => void;
  value?: string;
}

const workplaceTypeOptions = ["Remote", "Hybrid", "Onsite"];
type LocationComponent = SearchLocation["address"]["components"][number];

function findAddressComponent(components: LocationComponent[] | undefined, type: string) {
  return components?.find((component) => component.types.includes(type as AddressComponent["types"][number]));
}

const POPULAR_JOB_SEARCHES: string[] = (() => {
  const raw = (jobTitlesJson as { suggestions?: unknown })?.suggestions;
  const list = Array.isArray(raw) ? raw : [];
  const normalized = list
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .map((t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)));
  return Array.from(new Set(normalized)).slice(0, 20);
})();

const getLocationLabel = (location: SearchLocation) => {
  if (!location) {
    return "";
  }

  let label = "";
  const { formatted, components } = location.address || {};
  label = formatted || "Unknown";

  if (!components) return label;

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
      label += " - " + (options.radius || 50) + ` ${options.radius_unit || "Miles"}`;
    }
    return label;
  }

  if ((locations || []).length > 2) {
    return `${locations.length} Places`;
  }

  return (locations || []).map((loc) => getLocationLabel(loc)).join(" | ") || "Anywhere in the world";
};

const formatWorkplaceTypesLabel = (types?: string | string[]) => {
  if (!types || types === "All") return "";
  if (typeof types === "string") return `${types} only`;

  if (types.length === 1) {
    return `${types[0]} only`;
  }

  const effectiveTypes = types && types.length > 0 && types.length < 3 ? types : workplaceTypeOptions;
  return effectiveTypes.join(" · ");
};

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  className?: string;
  onClick?: () => void;
  dataIconType?: string;
  clickable?: boolean;
  buttonClassName?: string;
}

function IconButton({
  icon: Icon,
  label,
  className,
  onClick,
  dataIconType,
  buttonClassName,
  clickable = true,
}: IconButtonProps) {
  const visibilityClass = clickable ? "" : "hidden";

  return (
    <Hitbox
      size="sm"
      position="vertical"
      className={cn(visibilityClass, "h-full shrink-0", className)}
    >
      <button
        type="button"
        className={cn("group/icon inline-flex h-full items-center justify-center text-muted-foreground", buttonClassName)}
        onClick={onClick}
        data-icon-type={dataIconType}
        aria-label={label}
        title={label}
      >
        <Icon className="size-4 transition-colors group-hover/icon:text-primary" />
      </button>
    </Hitbox>
  );
}

interface IconButtonsProps {
  variant: "full" | "general";
  inputFocused: boolean;
  handleIconClick: (category: string) => void;
}

function IconButtons({ variant, inputFocused, handleIconClick }: IconButtonsProps) {
  if (variant === "general") {
    return (
      <IconButton
        icon={SlidersHorizontal}
        label="General Filters"
        onClick={() => handleIconClick("filters")}
        dataIconType="filters"
        buttonClassName="w-9"
      />
    );
  }

  return (
    <div className="flex flex-row gap-2 px-2">
      <IconButton
        className="hidden xs:block"
        icon={IdCard}
        label="Role & Department"
        onClick={() => handleIconClick("role-department")}
        dataIconType="role-department"
        clickable={!inputFocused}
      />
      <IconButton
        className="hidden xs:block"
        icon={School}
        label="Qualifications"
        onClick={() => handleIconClick("qualifications")}
        dataIconType="qualifications"
        clickable={!inputFocused}
      />
      <IconButton
        className="hidden xs:block"
        icon={CalendarClock}
        label="Availability"
        onClick={() => handleIconClick("availability")}
        dataIconType="availability"
        clickable={!inputFocused}
      />
      <IconButton
        className="hidden xs:block"
        icon={Building2}
        label="Company"
        onClick={() => handleIconClick("company")}
        dataIconType="company"
        clickable={!inputFocused}
      />
      <IconButton
        icon={SlidersHorizontal}
        label="General Filters"
        onClick={() => handleIconClick("filters")}
        dataIconType="filters"
      />
    </div>
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
    <Hitbox size="sm" radius="lg" className={cn("h-full w-full", className)}>
      <button
        onClick={onClick}
        className="group/filter flex h-full w-full items-center justify-between gap-2 px-3 py-2"
        type="button"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {Icon && (
            <Icon
              className={`size-4 flex-none text-muted-foreground ${
                header === "" ? "hidden md:block" : ""
              }`}
            />
          )}
          <div className="flex min-w-0 flex-col truncate text-left text-xs translate-y-px">
            <span className="truncate font-bold text-foreground transition-[transform,opacity] duration-200 ease-in-out">
              {header}
            </span>
            {subtitle && (
              <span className="truncate text-[14px] font-medium text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {showChevron && (
          <ChevronDown className="size-4 flex-none text-muted-foreground transition-[transform,opacity] duration-200 ease-in-out group-hover:text-primary" />
        )}
      </button>
    </Hitbox>
  );
}

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
      header={
        <>
          {locationDisplay.location}
          <span className="ml-2 text-[12px] font-medium text-muted-foreground max-xs:hidden md:hidden lg:inline">
            {locationDisplay.workplaces}
          </span>
        </>
      }
      onClick={() => handleIconClick("location")}
      className="min-w-[30%] w-full lg:min-w-[300px]"
    />
  );
}

const frequencies: Record<string, string> = {
  Hourly: "hr",
  Daily: "day",
  Weekly: "wk",
  "Bi-Weekly": "bi-wk",
  Monthly: "mo",
  Yearly: "yr",
};

function SalaryButton({
  showFilterControls,
  currentSearchState,
  handleIconClick,
}: {
  showFilterControls: boolean;
  currentSearchState: SearchState;
  handleIconClick: (category: string) => void;
}) {
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
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency: currencyValue }).formatToParts(0);
    const symb = parts.find((p) => p.type === "currency");
    if (symb) currencySymbol = symb.value;
  } catch {
    // fall back to $
  }

  const hasAnySalaryFilter = minLow > 0 || minHigh > 0 || maxLow > 0 || maxHigh > 0;

  const formatAmount = (amount: number, includeSymbol = true) => {
    if (amount <= 0) return "";
    const symbol = includeSymbol ? currencySymbol : "";
    const isShort = ["Hourly", "Daily", "Weekly", "Bi-Weekly"].includes(salary.unit);
    const baseAmount = isShort ? Math.round(amount) : Math.round(amount / 100) * 100;

    if (baseAmount >= 1000000) {
      const mil = baseAmount / 1000000;
      return `${symbol}${Number.isInteger(mil) ? mil : mil.toFixed(1)}M`;
    }

    if (baseAmount >= 1000) {
      const k = baseAmount / 1000;
      return `${symbol}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
    }

    return `${symbol}${baseAmount}`;
  };

  const getDisplayMin = () => (minLow > 0 ? minLow : maxLow > 0 && minLow <= 0 ? maxLow : null);
  const getDisplayMax = () => (maxHigh > 0 ? maxHigh : minHigh > 0 && maxHigh <= 0 ? minHigh : null);

  let mainLabel = "Any";
  if (hasAnySalaryFilter) {
    const displayMin = getDisplayMin();
    const displayMax = getDisplayMax();

    if (!displayMin && !displayMax) mainLabel = "Any";
    else if (displayMin && !displayMax) mainLabel = formatAmount(displayMin);
    else if (!displayMin && displayMax) mainLabel = `Up to ${formatAmount(displayMax)}`;
    else if (displayMin && displayMax) mainLabel = `${formatAmount(displayMin)}-${formatAmount(displayMax, false)}`;
  }

  const header =
    mainLabel === "Any" ? (
      "Any"
    ) : (
      <>
        {mainLabel}
        <span className="text-[12px] font-medium text-muted-foreground"> / {calcFrequency}</span>
      </>
    );

  return (
    <FilterButton
      icon={DollarSign}
      header={header}
      onClick={() => handleIconClick("salary")}
      className="min-w-[max(80px, fit-content)] lg:min-w-[200px]"
    />
  );
}

export default function SearchBar({
  placeholder = "Search",
  className = "",
  onSearch,
  onIconClick,
  value: controlledValue,
}: SearchBarProps) {
  const pathname = usePathname();
  const { searchOptions: currentSearchState } = useApp();
  const { handleSearchIconClick } = useSearchUI();

  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [inputFocused, setInputFocused] = useState(false);

  const convex = useConvex();
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  const isMobile = useIsMobile(768);
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");

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
        setJobTitles(POPULAR_JOB_SEARCHES);
        return;
      }

      void convex
        .query(api.jobs.distinctJobTitles, { query: q, limit: 50 })
        .then((titles) => {
          if (cancelled) return;
          setJobTitles((titles ?? []).map((t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1))));
        })
        .catch(() => {
          if (!cancelled) setJobTitles(POPULAR_JOB_SEARCHES);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [convex, inputValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setInputValue("");
    setInputFocused(false);
    if (onSearch) onSearch("");
  };

  const locationDisplay = useMemo(() => {
    const locations = currentSearchState.location.location || [];
    const locationStr = getLocationDisplayLabel(locations);
    const workplaces = formatWorkplaceTypesLabel(currentSearchState.location.workplace_type);

    return {
      location: locationStr,
      workplaces,
    };
  }, [currentSearchState]);

  const showFullIconGroup = showFilterControls && !isLg;
  const showGeneralIconOnly = showFilterControls && isLg;
  const showLocation = showFilterControls && (isMobile || isLg);
  const showSalary = showFilterControls && (isMobile || isXl);

  const iconButtons = showFullIconGroup ? (
    <IconButtons variant="full" inputFocused={inputFocused} handleIconClick={handleIconClick} />
  ) : showGeneralIconOnly ? (
    <IconButtons variant="general" inputFocused={inputFocused} handleIconClick={handleIconClick} />
  ) : null;

  const locationButton = showLocation ? (
    <LocationButton
      handleIconClick={handleIconClick}
      locationDisplay={locationDisplay}
      showFilterControls={showFilterControls}
    />
  ) : null;

  const salaryButton = showSalary ? (
    <SalaryButton
      currentSearchState={currentSearchState}
      handleIconClick={handleIconClick}
      showFilterControls={showFilterControls}
    />
  ) : null;

  return (
    <div className="relative flex-1 sm:px-4">
      <Autocomplete
        className={className}
        iconButtons={iconButtons}
        locationButton={locationButton}
        onBlur={() => setInputFocused(false)}
        onChange={handleInputChange}
        onClear={handleClear}
        onFocus={() => setInputFocused(true)}
        options={jobTitles}
        placeholder={placeholder}
        salaryButton={salaryButton}
        showClearButton={showFilterControls && !!inputValue}
        value={inputValue}
      />
    </div>
  );
}

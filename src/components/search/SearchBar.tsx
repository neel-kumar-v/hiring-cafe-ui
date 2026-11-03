"use client";

import { Building2, CalendarClock, ChevronDown, DollarSign, IdCard, type LucideIcon, MapPin, School, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";

import Autocomplete from "./Autocomplete";
import SearchModeToggle from "./SearchModeToggle";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI, type SearchMode } from "@/contexts/SearchContext";
import { Hitbox } from "@/components/ui/hitbox";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuantizedContainerWidth } from "@/hooks/useContainerWidth";
import type { AddressComponent, Location as SearchLocation, SearchState } from "@/types/search";
import { cn } from "@/lib/utils";
import { POPULAR_JOB_SEARCHES } from "@/lib/search/popular-job-searches";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  onSearch?: (value: string) => void;
  /** Called when the user explicitly submits (Enter or the search button), unlike `onSearch` which also fires while typing. */
  onSubmit?: (value: string) => void;
  onIconClick?: (category: string) => void;
  value?: string;
}

const workplaceTypeOptions = ["Remote", "Hybrid", "Onsite"];
// Progressive-collapse breakpoints for the bar's own measured width (<880
// salary, <680 location, <980 compact icons) — also the quantization steps.
const SEARCH_BAR_COLLAPSE_STEPS: readonly number[] = [680, 880, 980];
type LocationComponent = SearchLocation["address"]["components"][number];

function findAddressComponent(components: LocationComponent[] | undefined, type: string) {
  return components?.find((component) => component.types.includes(type as AddressComponent["types"][number]));
}

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

function IconButton({ icon: Icon, label, className, onClick, dataIconType, buttonClassName, clickable = true }: IconButtonProps) {
  const visibilityClass = clickable ? "" : "hidden";

  return (
    <Hitbox size="12px" position="all" radius="full" className={cn(visibilityClass, "h-full shrink-0", className)}>
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
    return <IconButton icon={SlidersHorizontal} label="General Filters" onClick={() => handleIconClick("filters")} dataIconType="filters" buttonClassName="size-9 p-0" />;
  }

  return (
    <div className="flex flex-row gap-2 px-3">
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
      <IconButton className="hidden xs:block" icon={Building2} label="Company" onClick={() => handleIconClick("company")} dataIconType="company" clickable={!inputFocused} />
      <IconButton icon={SlidersHorizontal} label="General Filters" onClick={() => handleIconClick("filters")} dataIconType="filters" />
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

function FilterButton({ icon: Icon, header, subtitle, onClick, className = "", showChevron = false }: FilterButtonProps) {
  return (
    <Hitbox size="sm" radius="lg" className={cn("h-full w-full", className)}>
      <button onClick={onClick} className="group/filter flex h-full w-full items-center justify-between gap-2 px-3 py-2" type="button">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {Icon && <Icon className={`size-4 flex-none text-muted-foreground ${header === "" ? "hidden md:block" : ""}`} />}
          <div className="flex min-w-0 flex-col truncate text-left text-xs translate-y-px">
            <span className="truncate font-bold text-foreground transition-[transform,opacity] duration-200 ease-in-out">{header}</span>
            {subtitle && <span className="truncate text-[14px] font-medium text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
        {showChevron && <ChevronDown className="size-4 flex-none text-muted-foreground transition-[transform,opacity] duration-200 ease-in-out group-hover:text-primary" />}
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
        <span className="inline-flex items-center gap-1.5 truncate">
          <span className="truncate">{locationDisplay.location}</span>
          {locationDisplay.workplaces ? <span className="text-[12px] font-medium text-muted-foreground truncate hidden 2xl:inline">{locationDisplay.workplaces}</span> : null}
        </span>
      }
      onClick={() => handleIconClick("location")}
      className="min-w-0 w-auto sm:max-w-[220px]"
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
    else if (displayMin && displayMax) {
      const minStr = formatAmount(displayMin);
      const maxStr = formatAmount(displayMax, false);
      if (formatAmount(displayMin, false) === maxStr) {
        mainLabel = minStr;
      } else {
        mainLabel = `${minStr}-${maxStr}`;
      }
    }
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

  return <FilterButton icon={DollarSign} header={header} onClick={() => handleIconClick("salary")} className="min-w-0 w-auto sm:max-w-[160px]" />;
}

function SearchButton({ mode, onClick }: { mode: SearchMode; onClick: () => void }) {
  const isAgent = mode === "talent-agent";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isAgent ? "Ask Talent Agent" : "Search jobs"}
      title={isAgent ? "Ask Talent Agent" : "Search jobs"}
      className="flex size-8 sm:size-8.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-neutral-800 dark:text-primary dark:hover:bg-neutral-700 shrink-0"
    >
      {isAgent ? <Sparkles className="size-4" /> : <Search className="size-4" />}
    </button>
  );
}

export default function SearchBar({ placeholder, className = "", containerClassName = "", onSearch, onSubmit, onIconClick, value: controlledValue }: SearchBarProps) {
  const pathname = usePathname();
  const { searchMode, handleSearchIconClick, setChatOpen } = useSearchUI();
  const { searchOptions: currentSearchState } = useApp();

  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [inputFocused, setInputFocused] = useState(false);

  const convex = useConvex();
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const isMobile = useIsMobile(768);

  // Collapse decisions follow the search bar's own width, not the viewport, so
  // they stay correct wherever the bar is embedded (header, mobile top bar, or navbar with chat open).
  // Quantized at the collapse breakpoints so drag-resizing the shell rails
  // doesn't re-render the whole bar per frame — state updates only at crossings.
  const barRef = useRef<HTMLDivElement>(null);
  const barWidth = useQuantizedContainerWidth(barRef, SEARCH_BAR_COLLAPSE_STEPS);

  const handleIconClick = onIconClick || handleSearchIconClick;
  // Full search chrome (mode toggle + location/salary/filter segments) is allowed
  // on browse routes and the tracker, so the sticky header search always shows the
  // whole search UI there, not a partial stub (Feedback: tracker search chrome).
  const isRouteAllowed = pathname === "/" || Boolean(pathname?.startsWith("/search/")) || Boolean(pathname?.startsWith("/tracker"));
  const isAgentMode = searchMode === "talent-agent";

  // In talent-agent mode: HIDE location segment, salary/filter cluster, and filter ribbon
  const showFilterControls = isRouteAllowed && !isAgentMode;

  useEffect(() => {
    if (controlledValue !== undefined) setInputValue(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    if (isAgentMode) {
      setJobTitles([]);
      return;
    }

    let cancelled = false;
    const id = window.setTimeout(() => {
      const q = inputValue.trim();
      if (!q) {
        setJobTitles([...POPULAR_JOB_SEARCHES]);
        return;
      }

      void convex
        .query(api.jobs.distinctJobTitles, { query: q, limit: 50 })
        .then((titles) => {
          if (cancelled) return;
          setJobTitles((titles ?? []).map((t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1))));
        })
        .catch(() => {
          if (!cancelled) setJobTitles([...POPULAR_JOB_SEARCHES]);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [convex, inputValue, isAgentMode]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setInputValue("");
    setInputFocused(false);
    if (onSearch) onSearch("");
  };

  const handleSubmit = () => {
    if (onSearch) onSearch(inputValue);
    onSubmit?.(inputValue);
    if (isAgentMode) {
      setChatOpen(true);
    }
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

  // Progressive segment collapse based on search bar container width:
  // When unmeasured (0, e.g. SSR / pre-mount), default to generous layout to prevent flash.
  // When space narrows (e.g. chat dock opens, taking ~400px via --shell-right):
  // 1. Salary collapses first (< 880px)
  // 2. Location collapses next (< 680px)
  // 3. Icon cluster uses the single compact general-filters icon ("SlidersHorizontal")
  //    whenever chips are shown or width is constrained (< 980px)
  const isMeasured = barWidth > 0;
  const showSalary = showFilterControls && (isMobile || !isMeasured || barWidth >= 880);
  const showLocation = showFilterControls && (isMobile || !isMeasured || barWidth >= 680);
  const showGeneralIconOnly = showFilterControls && (showLocation || !isMeasured || barWidth < 980);
  const showFullIconGroup = showFilterControls && !showGeneralIconOnly;

  const iconButtons = showFullIconGroup ? (
    <IconButtons variant="full" inputFocused={inputFocused} handleIconClick={handleIconClick} />
  ) : showGeneralIconOnly ? (
    <IconButtons variant="general" inputFocused={inputFocused} handleIconClick={handleIconClick} />
  ) : null;

  const locationButton = showLocation ? <LocationButton handleIconClick={handleIconClick} locationDisplay={locationDisplay} showFilterControls={showFilterControls} /> : null;

  const salaryButton = showSalary ? <SalaryButton currentSearchState={currentSearchState} handleIconClick={handleIconClick} showFilterControls={showFilterControls} /> : null;

  const effectivePlaceholder = placeholder ?? (isAgentMode ? "Describe what you're looking for, or ask the AI agent..." : "Search by role, company, or keyword...");

  const searchButton = <SearchButton mode={searchMode} onClick={handleSubmit} />;
  const modeToggle = <SearchModeToggle size="sm" />;

  return (
    <div ref={barRef} className={cn("relative flex-1 min-w-0 @container", containerClassName)}>
      <Autocomplete
        className={className}
        iconButtons={iconButtons}
        locationButton={locationButton}
        modeToggle={modeToggle}
        onBlur={() => setInputFocused(false)}
        onChange={handleInputChange}
        onClear={handleClear}
        onFocus={() => setInputFocused(true)}
        onSubmit={handleSubmit}
        options={isAgentMode ? [] : jobTitles}
        placeholder={effectivePlaceholder}
        salaryButton={salaryButton}
        searchButton={searchButton}
        showClearButton={!!inputValue}
        value={inputValue}
      />
    </div>
  );
}

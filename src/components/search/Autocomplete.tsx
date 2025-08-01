import { Eye, EyeOff, Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import UniversalTooltip from "../util/UniversalTooltip";
import SearchFilters from "./SearchFilters";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxTotal?: number;
  onIconClick?: (category: string) => void;
}

// Component for individual autocomplete option
interface AutocompleteOptionProps {
  option: string;
  index: number;
  highlightedIndex: number;
  onClick: (option: string) => void;
  isMobile?: boolean;
}

function AutocompleteOption({
  option,
  index,
  highlightedIndex,
  onClick,
  isMobile = false,
}: AutocompleteOptionProps) {
  const baseClasses = isMobile
    ? "px-4 py-3 cursor-pointer text-base transition-colors border-b border-neutral-100 dark:border-neutral-800"
    : "px-3 py-2 cursor-pointer text-sm transition-colors";

  const highlightClasses =
    index === highlightedIndex
      ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
      : isMobile
        ? "hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white"
        : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white";

  return (
    <div
      className={`${baseClasses} ${highlightClasses}`}
      onClick={(e) => {
        if (isMobile) {
          e.preventDefault();
          e.stopPropagation();
        }
        onClick(option);
      }}
    >
      {option}
    </div>
  );
}

// Component for no results state
interface NoResultsProps {
  isMobile?: boolean;
}

function NoResults({ isMobile = false }: NoResultsProps) {
  const iconSize = isMobile ? "w-12 h-12" : "w-8 h-8";
  const textSize = isMobile ? "text-lg" : "text-base";
  const containerClasses = isMobile
    ? "flex flex-col items-center justify-center h-full py-8 text-neutral-400 dark:text-neutral-500"
    : "flex-1 flex flex-col items-center justify-center py-8 text-neutral-400 dark:text-neutral-500";

  return (
    <div className={containerClasses}>
      <svg
        className={`${iconSize} mb-${isMobile ? "4" : "2"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span className={textSize}>No results found</span>
    </div>
  );
}

// Component for desktop dropdown
interface DesktopDropdownProps {
  isOpen: boolean;
  filteredOptions: string[];
  displayOptions: string[];
  highlightedIndex: number;
  showFilters: boolean;
  onOptionClick: (option: string) => void;
  onToggleFilters: () => void;
  onIconClick?: (category: string) => void;
}

function DesktopDropdown({
  isOpen,
  filteredOptions,
  displayOptions,
  highlightedIndex,
  showFilters,
  onOptionClick,
  onToggleFilters,
  onIconClick,
}: DesktopDropdownProps) {
  if (!isOpen) return null;

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleToggleFiltersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFilters();
  };

  return (
    <div
      className="absolute z-50 hidden h-[361px] w-full overflow-visible rounded-b-md border border-neutral-200 bg-white shadow-lg md:flex dark:border-neutral-600 dark:bg-neutral-800"
      data-dropdown="autocomplete"
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
    >
      {/* Autocomplete options */}
      <div className={`overflow-y-auto ${showFilters ? "flex-1" : "w-full"}`}>
        {filteredOptions.length > 0 ? (
          displayOptions
            .slice(0, 10)
            .map((option, index) => (
              <AutocompleteOption
                highlightedIndex={highlightedIndex}
                index={index}
                key={option}
                onClick={onOptionClick}
                option={option}
              />
            ))
        ) : (
          <NoResults />
        )}
      </div>

      {/* Filters section */}
      {showFilters && (
        <div className="relative w-1/2 overflow-y-hidden border-neutral-200 border-l dark:border-neutral-600">
          <div className="p-3">
            <SearchFilters onIconClick={onIconClick} />
          </div>
        </div>
      )}

      {/* Eye icons positioned relative to main container */}
      <UniversalTooltip content={showFilters ? "Hide filters" : "Show filters"}>
        {showFilters ? (
          <EyeOff
            className="absolute right-3 bottom-3 z-10 size-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500"
            onClick={handleToggleFiltersClick}
            onMouseDown={handleToggleFiltersClick}
          />
        ) : (
          <Eye
            className="absolute right-3 bottom-3 z-10 size-4 cursor-pointer text-neutral-400 transition-all hover:text-pink-500"
            onClick={handleToggleFiltersClick}
            onMouseDown={handleToggleFiltersClick}
          />
        )}
      </UniversalTooltip>
    </div>
  );
}

// Component for mobile overlay header
interface MobileHeaderProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBack: () => void;
}

function MobileHeader({
  value,
  placeholder,
  onChange,
  onBack,
}: MobileHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-neutral-200 border-b p-4 dark:border-neutral-700">
      <button
        className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={onBack}
      >
        <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </button>
      <div className="relative flex-1">
        <input
          autoFocus
          className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 pl-10 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-neutral-400" />
      </div>
    </div>
  );
}

// Component for mobile overlay content
interface MobileContentProps {
  displayOptions: string[];
  highlightedIndex: number;
  onOptionClick: (option: string) => void;
}

function MobileContent({
  displayOptions,
  highlightedIndex,
  onOptionClick,
}: MobileContentProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto overscroll-contain">
        {displayOptions.length > 0 ? (
          displayOptions.map((option, index) => (
            <AutocompleteOption
              highlightedIndex={highlightedIndex}
              index={index}
              isMobile={true}
              key={option}
              onClick={onOptionClick}
              option={option}
            />
          ))
        ) : (
          <NoResults isMobile={true} />
        )}
      </div>
    </div>
  );
}

// Component for mobile overlay
interface MobileOverlayProps {
  isOpen: boolean;
  value: string;
  placeholder: string;
  displayOptions: string[];
  highlightedIndex: number;
  onChange: (value: string) => void;
  onBack: () => void;
  onOptionClick: (option: string) => void;
}

function MobileOverlay({
  isOpen,
  value,
  placeholder,
  displayOptions,
  highlightedIndex,
  onChange,
  onBack,
  onOptionClick,
}: MobileOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white md:hidden dark:bg-neutral-900"
      onClick={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <MobileHeader
        onBack={onBack}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      <MobileContent
        displayOptions={displayOptions}
        highlightedIndex={highlightedIndex}
        onOptionClick={onOptionClick}
      />
    </div>
  );
}

export default function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Search",
  className = "",
  maxTotal = 20,
  onIconClick,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const filtered = options
        .filter((option) => option.toLowerCase().includes(value.toLowerCase()))
        .slice(0, maxTotal);
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options.slice(0, maxTotal));
    }
    setHighlightedIndex(-1);
  }, [value, options, maxTotal]);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (window.innerWidth >= 768) {
      const dropdownElement = document.querySelector(
        '[data-dropdown="autocomplete"]'
      );
      if (
        dropdownElement &&
        dropdownElement.contains(e.relatedTarget as Node)
      ) {
        return;
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
    if (window.innerWidth >= 768) {
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "Enter" || e.key === "ArrowDown")) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBack = () => {
    setIsOpen(false);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const displayOptions = filteredOptions;

  return (
    <>
      <div className="relative group">
        <input
          className={`w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 pt-[8px] sm:pl-10 pl-7 pb-[10px] text-neutral-900 transition-all duration-200 ease-in-out focus:rounded-b-none focus:border-neutral-200 focus:outline-none focus:ring-0 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-600 text-base ${className}`}
          onBlur={handleInputBlur}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={value}
        />

        {/* Search icon */}
        <Search className="-translate-y-1/2 absolute top-1/2 sm:left-3 left-[9px] sm:size-4 size-4  transform text-neutral-400 group-hover:text-pink-500 transition-all duration-500 ease-in-out" />

        {/* Desktop dropdown */}
        <DesktopDropdown
          displayOptions={displayOptions}
          filteredOptions={filteredOptions}
          highlightedIndex={highlightedIndex}
          isOpen={isOpen}
          onOptionClick={handleOptionClick}
          onToggleFilters={handleToggleFilters}
          showFilters={showFilters}
          onIconClick={onIconClick}
        />
      </div>

      {/* Mobile full-screen overlay */}
      <MobileOverlay
        displayOptions={displayOptions}
        highlightedIndex={highlightedIndex}
        isOpen={isOpen}
        onBack={handleBack}
        onChange={onChange}
        onOptionClick={handleOptionClick}
        placeholder={placeholder}
        value={value}
      />
    </>
  );
}

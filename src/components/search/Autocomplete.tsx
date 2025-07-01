import React, { useState, useRef, useEffect } from "react";
import { Search, X, Eye, EyeOff } from "lucide-react";
import SearchFilters from "./SearchFilters";
import UniversalTooltip from "../util/UniversalTooltip";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxVisible?: number;
  maxTotal?: number;
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
    ? "px-4 py-3 cursor-pointer text-base transition-colors border-b border-gray-100 dark:border-gray-800"
    : "px-3 py-2 cursor-pointer text-sm transition-colors";

  const highlightClasses =
    index === highlightedIndex
      ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
      : isMobile
      ? "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white";

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
    ? "flex flex-col items-center justify-center h-full py-8 text-gray-400 dark:text-gray-500"
    : "flex-1 flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500";

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
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35"
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
  maxVisible: number;
  showFilters: boolean;
  onOptionClick: (option: string) => void;
  onToggleFilters: () => void;
}

function DesktopDropdown({
  isOpen,
  filteredOptions,
  displayOptions,
  highlightedIndex,
  maxVisible,
  showFilters,
  onOptionClick,
  onToggleFilters,
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
      className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-b-md shadow-lg h-[253px] overflow-visible hidden md:flex"
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
      data-dropdown="autocomplete"
    >
      {/* Autocomplete options */}
      <div className={`overflow-y-auto ${showFilters ? "flex-1" : "w-full"}`}>
        {filteredOptions.length > 0 ? (
          displayOptions
            .slice(0, maxVisible)
            .map((option, index) => (
              <AutocompleteOption
                key={option}
                option={option}
                index={index}
                highlightedIndex={highlightedIndex}
                onClick={onOptionClick}
              />
            ))
        ) : (
          <NoResults />
        )}
      </div>

      {/* Filters section */}
      {showFilters && (
        <div className="w-1/2 border-l border-gray-200 dark:border-gray-600 overflow-y-hidden relative">
          <div className="p-3">
            <SearchFilters />
          </div>
        </div>
      )}

      {/* Eye icons positioned relative to main container */}
      <UniversalTooltip content={showFilters ? "Hide filters" : "Show filters"}>
        {showFilters ? (
          <EyeOff
            className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 hover:text-pink-500 transition-all cursor-pointer z-10"
            onClick={handleToggleFiltersClick}
            onMouseDown={handleToggleFiltersClick}
          />
        ) : (
          <Eye
            className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 hover:text-pink-500 transition-all cursor-pointer z-10"
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
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <button
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          autoFocus
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              key={option}
              option={option}
              index={index}
              highlightedIndex={highlightedIndex}
              onClick={onOptionClick}
              isMobile={true}
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
      className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <MobileHeader
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBack={onBack}
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
  maxVisible = 7,
  maxTotal = 20,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredOptions(options.slice(0, maxTotal));
    } else {
      const filtered = options
        .filter((option) => option.toLowerCase().includes(value.toLowerCase()))
        .slice(0, maxTotal);
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [value, options, maxTotal, maxVisible]);

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Only close on blur for desktop, not mobile
    if (window.innerWidth >= 768) {
      // Check if the new focus target is within our dropdown
      const dropdownElement = document.querySelector(
        '[data-dropdown="autocomplete"]'
      );
      if (
        dropdownElement &&
        dropdownElement.contains(e.relatedTarget as Node)
      ) {
        return; // Don't close if clicking within dropdown
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  // Handle option selection
  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
    // Only blur on desktop
    if (window.innerWidth >= 768) {
      inputRef.current?.blur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
        return;
      }
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

  // Handle back button
  const handleBack = () => {
    setIsOpen(false);
  };

  // Handle toggle filters
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Prevent body scroll when mobile overlay is open
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

  // Add "Filter Searches" option at the top when open
  const displayOptions = filteredOptions;

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 dark:hover:border-pink-500 transition-all ease-in-out duration-200 text-gray-900 dark:text-white rounded-md focus:rounded-b-none dark:focus:border-gray-600 focus:border-gray-200 focus:ring-0 focus:outline-none ${className}`}
        />

        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

        {/* Desktop dropdown */}
        <DesktopDropdown
          isOpen={isOpen}
          filteredOptions={filteredOptions}
          displayOptions={displayOptions}
          highlightedIndex={highlightedIndex}
          maxVisible={maxVisible}
          showFilters={showFilters}
          onOptionClick={handleOptionClick}
          onToggleFilters={handleToggleFilters}
        />
      </div>

      {/* Mobile full-screen overlay */}
      <MobileOverlay
        isOpen={isOpen}
        value={value}
        placeholder={placeholder}
        displayOptions={displayOptions}
        highlightedIndex={highlightedIndex}
        onChange={onChange}
        onBack={handleBack}
        onOptionClick={handleOptionClick}
      />
    </>
  );
}

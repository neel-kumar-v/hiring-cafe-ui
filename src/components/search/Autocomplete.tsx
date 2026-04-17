"use client";

import { Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  className?: string;
  maxTotal?: number;
  showClearButton?: boolean;
  onClear?: () => void;
  onFocus?: () => void;
  iconButtons?: React.ReactNode;
  locationButton?: React.ReactNode;
  salaryButton?: React.ReactNode;
}

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
    ? "px-4 py-3 cursor-pointer text-base border-b border-neutral-100 dark:border-neutral-800"
    : "px-3 py-2 cursor-pointer text-sm transition-colors duration-300 hover:transition-none hover:cursor-pointer";

  const highlightClasses =
    index === highlightedIndex
      ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
      : isMobile
        ? "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white"
        : "hover:bg-neutral-100 dark:hover:bg-neutral-700/25 text-neutral-900 dark:text-white";

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

function NoResults({ isMobile = false }: { isMobile?: boolean }) {
  const iconSize = isMobile ? "w-12 h-12" : "w-8 h-8";
  const textSize = isMobile ? "text-lg" : "text-base";
  const containerClasses = isMobile
    ? "flex flex-col items-center justify-center h-full py-8 text-neutral-400 dark:text-neutral-500"
    : "flex-1 flex flex-col items-center justify-center py-8 text-neutral-400 dark:text-neutral-500";

  return (
    <div className={containerClasses}>
      <svg className={`${iconSize} mb-${isMobile ? "4" : "2"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
      <span className={textSize}>No results found</span>
    </div>
  );
}

function DesktopDropdown({
  isOpen,
  filteredOptions,
  displayOptions,
  highlightedIndex,
  onOptionClick,
  maxTotal,
  containerRef,
}: {
  isOpen: boolean;
  filteredOptions: string[];
  displayOptions: string[];
  highlightedIndex: number;
  onOptionClick: (option: string) => void;
  maxTotal: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  if (!isOpen) return null;

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="absolute z-50 hidden max-h-[361px] w-full rounded-b-[24px] border border-t-0 border-neutral-200 bg-white shadow-lg md:flex dark:border-neutral-600 dark:bg-neutral-800 overflow-hidden"
      data-dropdown="autocomplete"
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
      style={{
        width: containerRef?.current?.offsetWidth || "100%",
        left: 0,
      }}
    >
      <div className="overflow-y-auto w-full max-h-[361px] min-h-[100px]">
        {filteredOptions.length > 0 ? (
          displayOptions.slice(0, maxTotal).map((option, index) => (
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
    </div>
  );
}

function MobileHeader({ value, placeholder, onChange, onBack }: { value: string, placeholder: string, onChange: (value: string) => void, onBack: () => void }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-neutral-200 border-b p-4 dark:border-neutral-700">
      <button className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={onBack}>
        <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </button>
      <div className="relative flex-1">
        <input
          autoFocus
          className="w-full rounded-[24px] border border-neutral-200 bg-neutral-50 px-3 py-2 pl-10 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
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

function MobileContent({ displayOptions, highlightedIndex, onOptionClick }: { displayOptions: string[], highlightedIndex: number, onOptionClick: (option: string) => void }) {
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
      <MobileHeader onBack={onBack} onChange={onChange} placeholder={placeholder} value={value} />
      <MobileContent displayOptions={displayOptions} highlightedIndex={highlightedIndex} onOptionClick={onOptionClick} />
    </div>
  );
}

// Ensure useMediaQuery doesn't break if not found, simplified version:
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
}

export default function Autocomplete({
  value,
  onChange,
  options = [],
  placeholder = "Search",
  className = "",
  maxTotal = 20,
  showClearButton = false,
  onClear,
  onFocus,
  iconButtons,
  locationButton,
  salaryButton,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (value.trim()) {
      const filtered = options
        .filter((option) => option.toLowerCase().includes(value.trim().toLowerCase()))
        .slice(0, maxTotal);
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options.slice(0, maxTotal));
    }
  }, [value, options, maxTotal]);

  const handleInputFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (window.innerWidth >= 768) {
      const dropdownElement = document.querySelector('[data-dropdown="autocomplete"]');
      if (dropdownElement && dropdownElement.contains(e.relatedTarget as Node)) {
        return;
      }
      setTimeout(() => setIsOpen(false), 150);
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
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (value.trim()) {
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBack = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const displayOptions = value.trim()
    ? Array.from(new Set([value.trim(), ...filteredOptions].filter((q) => q.trim())))
    : filteredOptions;

  const hasIcons = !!iconButtons || !!locationButton || !!salaryButton;
  const inputRoundedClasses = hasIcons
    ? isOpen ? " lg:pr-3 pl-10 rounded-l-[24px] rounded-r-none rounded-b-none border-r-0" : " lg:pr-3 pl-10 rounded-l-[24px] rounded-r-none border-r-0"
    : isOpen ? " lg:pr-3 pt-[8px] pl-10 pb-[10px] rounded-[24px] rounded-b-none" : "rounded-[24px]";

  const containerClasses = hasIcons
    ? `flex h-11 items-center w-full border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 ${isOpen ? "rounded-t-[24px] rounded-b-none" : "rounded-[24px]"}`
    : `flex h-11 items-center w-full ${isOpen ? "rounded-t-[24px]" : ""}`;

  const inputBorderClasses = hasIcons
    ? "border-0"
    : "border border-neutral-200 dark:border-neutral-600";

  return (
    <>
      <div className="relative group w-full" ref={containerRef}>
        {isMobile ? (
          <div className="flex flex-col w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-800">
            <div className="relative flex items-center">
              <input
                className={`w-full bg-white dark:bg-neutral-800 px-3 pl-10 text-[15px] text-neutral-900 transition-[box-shadow] duration-200 !ring-0 ease-in-out focus:outline-none focus:ring-0 dark:text-white ${className}`}
                onBlur={handleInputBlur}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                type="text"
                value={value}
              />
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-neutral-400" />
              {showClearButton && value && (
                <button onClick={onClear} className="px-3 py-3 flex items-center justify-center" type="button">
                  <X className="size-4 cursor-pointer text-neutral-400 transition-[transform,opacity] hover:text-pink-500" />
                </button>
              )}
              {iconButtons && <div className="pr-3 gap-1.5 py-3 flex items-center justify-center">{iconButtons}</div>}
            </div>
            {(salaryButton || locationButton) && (
              <div className="flex w-full border-t border-neutral-200 dark:border-neutral-600">
                {salaryButton && <div className={`basis-1/4 flex-shrink-0 ${locationButton ? "border-r border-neutral-200 dark:border-neutral-600" : ""}`}>{salaryButton}</div>}
                {locationButton && <div className="basis-3/4 flex-1">{locationButton}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className={containerClasses || "relative"}>
            <div className="relative flex-1 h-full">
              <input
                className={`w-full h-full bg-transparent lg:pr-3 pl-10 text-[15px] text-neutral-900 transition-[box-shadow] duration-200 !ring-0 ease-in-out focus:outline-none focus:ring-0 dark:text-white ${inputBorderClasses} ${inputRoundedClasses} ${className}`}
                onBlur={handleInputBlur}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                type="text"
                value={value}
              />
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-neutral-400 group-hover:text-pink-500 transition-[transform,opacity] duration-200 ease-in-out" />
            </div>
            {showClearButton && value && (
              <button onClick={onClear} className="px-2 h-full flex items-center justify-center" type="button">
                <X className="size-4 cursor-pointer text-neutral-400 transition-[transform,opacity] hover:text-pink-500" />
              </button>
            )}
            {salaryButton && (
              <div className="max-w-[20%] h-full border-x border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 duration-150 ease-in-out hover:transition-colors">
                {salaryButton}
              </div>
            )}
            {locationButton && (
              <div className={cn("max-w-[30%] h-full border-r border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 duration-150 ease-in-out hover:transition-colors", !salaryButton && "border-l")}>
                {locationButton}
              </div>
            )}
            {iconButtons && <div className="h-full px-3 flex items-center justify-end gap-1.5 rounded-r-[24px]">{iconButtons}</div>}
          </div>
        )}
        <DesktopDropdown
          containerRef={containerRef}
          displayOptions={displayOptions}
          filteredOptions={filteredOptions}
          highlightedIndex={highlightedIndex}
          isOpen={isOpen}
          onOptionClick={handleOptionClick}
          maxTotal={maxTotal}
        />
      </div>
      <MobileOverlay displayOptions={displayOptions} highlightedIndex={highlightedIndex} isOpen={isOpen} onBack={handleBack} onChange={onChange} onOptionClick={handleOptionClick} placeholder={placeholder} value={value} />
    </>
  );
}

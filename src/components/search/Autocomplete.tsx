"use client";

import { Hitbox } from "@/components/ui/hitbox";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

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
  onBlur?: () => void;
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
    ? "cursor-pointer border-b border-border/60 px-4 py-3 text-base"
    : "cursor-pointer px-3 py-2 text-sm transition-colors duration-300 hover:transition-none";

  const highlightClasses =
    index === highlightedIndex
      ? "bg-brand-soft text-brand-soft-foreground"
      : isMobile
        ? "text-foreground hover:bg-accent"
        : "text-foreground hover:bg-secondary";

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
    ? "flex h-full flex-col items-center justify-center py-8 text-muted-foreground"
    : "flex flex-1 flex-col items-center justify-center py-8 text-muted-foreground";

  return (
    <div className={containerClasses}>
      <svg className={cn(iconSize, isMobile ? "mb-4" : "mb-2")} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
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
      className="absolute z-50 hidden max-h-[361px] w-full overflow-hidden rounded-b-[24px] border border-t-0 border-border bg-card shadow-lg md:flex"
      data-dropdown="autocomplete"
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
      style={{
        width: containerRef?.current?.offsetWidth || "100%",
        left: 0,
      }}
    >
      <div className="w-full max-h-[361px] min-h-[100px] overflow-y-auto">
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

function MobileHeader({
  value,
  placeholder,
  onChange,
  onBack,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-b border-border p-4">
      <Hitbox size="sm" radius="full">
        <button
          aria-label="Close search"
          className="rounded-lg p-2 transition-colors hover:bg-secondary"
          onClick={onBack}
          type="button"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </Hitbox>
      <div className="relative flex-1">
        <input
          autoFocus
          className="w-full rounded-[24px] border border-border bg-secondary/60 px-3 py-2 pl-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-card"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground" />
      </div>
    </div>
  );
}

function MobileContent({
  displayOptions,
  highlightedIndex,
  onOptionClick,
}: {
  displayOptions: string[];
  highlightedIndex: number;
  onOptionClick: (option: string) => void;
}) {
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
      className="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
      onClick={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <MobileHeader onBack={onBack} onChange={onChange} placeholder={placeholder} value={value} />
      <MobileContent displayOptions={displayOptions} highlightedIndex={highlightedIndex} onOptionClick={onOptionClick} />
    </div>
  );
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
  onBlur,
  iconButtons,
  locationButton,
  salaryButton,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

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
    onBlur?.();

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

  const hasRightControls = Boolean(iconButtons || locationButton || salaryButton);
  const inputRoundedClasses = hasRightControls
    ? isOpen
      ? "pl-10 rounded-l-[24px] rounded-r-none rounded-b-none border-r-0"
      : "pl-10 rounded-l-[24px] rounded-r-none border-r-0"
    : isOpen
      ? "pl-10 rounded-[24px] rounded-b-none"
      : "rounded-[24px]";

  const containerClasses = hasRightControls
    ? `flex h-11 w-full items-center border border-border bg-card ${isOpen ? "rounded-t-[24px] rounded-b-none" : "rounded-[24px]"}`
    : `flex h-11 w-full items-center ${isOpen ? "rounded-t-[24px]" : ""}`;

  const inputBorderClasses = hasRightControls ? "border-0" : "border border-border";

  return (
    <>
      <div className="group relative w-full" ref={containerRef}>
        {isMobile ? (
          <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative flex h-11 items-center">
              <input
                className={`h-full w-full bg-card px-3 pl-10 text-[15px] text-foreground transition-[box-shadow] duration-200 !ring-0 ease-in-out focus:outline-none focus:ring-0 ${className}`}
                onBlur={handleInputBlur}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                type="text"
                value={value}
              />
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground" />
              {showClearButton && value && (
                <Hitbox size="sm" radius="full">
                  <button
                    aria-label="Clear search"
                    className="flex h-full items-center justify-center px-3"
                    onClick={() => onClear?.()}
                    type="button"
                  >
                    <X className="size-4 cursor-pointer text-muted-foreground transition-[transform,opacity] hover:text-primary" />
                  </button>
                </Hitbox>
              )}
              {iconButtons && <div className="flex h-full items-stretch justify-center">{iconButtons}</div>}
            </div>
            {(salaryButton || locationButton) && (
              <div className="flex w-full border-t border-border">
                {salaryButton && (
                  <div className={cn("basis-1/4 flex-shrink-0", locationButton && "border-r border-border")}>
                    {salaryButton}
                  </div>
                )}
                {locationButton && <div className="basis-3/4 flex-1">{locationButton}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className={containerClasses}>
            <div className="relative h-full flex-1">
              <input
                className={`h-full w-full bg-transparent pl-10 pr-3 text-[15px] text-foreground transition-[box-shadow] duration-200 !ring-0 ease-in-out focus:outline-none focus:ring-0 ${inputBorderClasses} ${inputRoundedClasses} ${className}`}
                onBlur={handleInputBlur}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                type="text"
                value={value}
              />
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground transition-[transform,opacity] duration-200 ease-in-out group-hover:text-primary" />
            </div>
            {showClearButton && value && (
              <Hitbox size="sm" radius="full">
                <button
                  aria-label="Clear search"
                  className="flex h-full items-center justify-center px-2"
                  onClick={() => onClear?.()}
                  type="button"
                >
                  <X className="size-4 cursor-pointer text-muted-foreground transition-[transform,opacity] hover:text-primary" />
                </button>
              </Hitbox>
            )}
            {locationButton && (
              <div
                className={cn(
                  "h-full max-w-[30%] border-l border-border",
                  !salaryButton && !iconButtons && "rounded-r-[24px]"
                )}
              >
                {locationButton}
              </div>
            )}
            {salaryButton && (
              <div
                className={cn(
                  "h-full max-w-[20%] border-l border-border",
                  !iconButtons && "rounded-r-[24px]"
                )}
              >
                {salaryButton}
              </div>
            )}
            {iconButtons && (
              <div className="flex h-full items-stretch justify-end rounded-r-[24px] border-l border-border">
                {iconButtons}
              </div>
            )}
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

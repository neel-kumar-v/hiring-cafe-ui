import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import Filters from "./Filters";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxVisible?: number;
  maxTotal?: number;
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
  const handleInputBlur = () => {
    // Only close on blur for desktop, not mobile
    if (window.innerWidth >= 768) {
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
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Desktop dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-b-md shadow-lg h-64 overflow-hidden hidden md:flex">
            {/* Autocomplete options */}
            <div className="flex-1 overflow-y-auto">
              {displayOptions.slice(0, maxVisible).map((option, index) => (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                    index === highlightedIndex
                      ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </div>
              ))}
            </div>

            {/* Filters section */}
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-600 overflow-y-auto">
              <div className="p-3">
                <Filters />
              </div>
            </div>
          </div>
        )}

        {/* No results for desktop */}
        {isOpen && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-b-md shadow-lg h-64 overflow-hidden hidden md:flex">
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <svg
                className="w-8 h-8 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35"
                />
              </svg>
              <span className="text-base">No results found</span>
            </div>
            <div className="w-64 border-l border-gray-200 dark:border-gray-600 overflow-y-auto">
              <div className="p-3">
                <Filters />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile full-screen overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={handleBack}
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
                onFocus={() => setIsOpen(true)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto overscroll-contain">
              {displayOptions.length > 0 ? (
                displayOptions.map((option, index) => (
                  <div
                    key={option}
                    className={`px-4 py-3 cursor-pointer text-base transition-colors border-b border-gray-100 dark:border-gray-800 ${
                      index === highlightedIndex
                        ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOptionClick(option);
                    }}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400 dark:text-gray-500">
                  <svg
                    className="w-12 h-12 mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35"
                    />
                  </svg>
                  <span className="text-lg">No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

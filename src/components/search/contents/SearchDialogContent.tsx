import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  AllFilters,
  ApplyFormFilters,
  DateRangeFilters,
  DefaultFilters,
  DepartmentsFilters,
  LocationFilters,
  SalaryFilters,
  SavedSearchesFilters,
  SortingFilters,
} from "../filters";
import { settingsCategories } from "../types";

interface SearchDialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

export default function SearchDialogContent({
  open,
  onOpenChange,
  from,
  isDarkMode = false,
}: SearchDialogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Set initial category based on what opened the dialog
    if (from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      return category?.id || settingsCategories[0].id;
    }
    return settingsCategories[0].id;
  });

  const selectedCategoryData = settingsCategories.find(
    (cat) => cat.id === selectedCategory
  );

  // Add this effect:
  useEffect(() => {
    if (open && from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      if (category && category.id !== selectedCategory) {
        setSelectedCategory(category.id);
      }
    }
  }, [from, open]);

  const renderContent = () => {
    switch (selectedCategory) {
      case "departments":
        return <DepartmentsFilters isDarkMode={isDarkMode} />;
      case "salary":
        return <SalaryFilters isDarkMode={isDarkMode} />;
      case "location":
        return <LocationFilters isDarkMode={isDarkMode} />;
      case "apply-form":
        return <ApplyFormFilters isDarkMode={isDarkMode} />;
      case "date-range":
        return <DateRangeFilters isDarkMode={isDarkMode} />;
      case "sorting":
        return <SortingFilters isDarkMode={isDarkMode} />;
      case "filters":
        return <AllFilters isDarkMode={isDarkMode} />;
      case "saved":
        return <SavedSearchesFilters isDarkMode={isDarkMode} />;
      default:
        return (
          <DefaultFilters
            categoryName={selectedCategoryData?.name || "Unknown"}
            isDarkMode={isDarkMode}
          />
        );
    }
  };

  const renderSidebar = () => {
    const filterCategories = settingsCategories.filter(
      (cat) => cat.type === "filter"
    );
    const companyCategories = settingsCategories.filter(
      (cat) => cat.type === "company"
    );
    const otherCategories = settingsCategories.filter(
      (cat) => cat.type === "other"
    );

    return (
      <div className="w-[200px] flex flex-col border-neutral-200 border-r bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="border-neutral-200 border-b bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="space-y-px p-2">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Options
            </h3>
            {otherCategories.map((category) => (
              <Button
                className={`h-auto w-full transition-all duration-500 ease-in-out justify-start p-2 text-left ${
                  selectedCategory === category.id
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "ghost"}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{category.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="overflow-y-auto">
          <div className="space-y-px p-2">
            {/* Job Filters */}
            <div className="mb-2">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Job Filters
              </h3>
              {filterCategories.map((category) => (
                <Button
                  className={`h-auto w-full transition-all duration-500 ease-in-out justify-start p-2 text-left ${
                    selectedCategory === category.id
                      ? "bg-pink-600 text-white hover:bg-pink-700"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={
                    selectedCategory === category.id ? "default" : "ghost"
                  }
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{category.name}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Company Filters */}
            <div className="mb-4">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Company Filters
              </h3>
              {companyCategories.map((category) => (
                <Button
                  className={`h-auto w-full transition-all duration-500 ease-in-out justify-start p-2 text-left ${
                    selectedCategory === category.id
                      ? "bg-pink-600 text-white hover:bg-pink-700"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={
                    selectedCategory === category.id ? "default" : "ghost"
                  }
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{category.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentArea = () => (
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto p-6 py-1">{renderContent()}</div>
      {/* Apply Settings button - positioned at bottom right of content area */}
      <div className="px-4">
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Apply Settings</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="-translate-y-[16px] flex h-[calc(90vh-100px)]">
      {renderSidebar()}
      {renderContentArea()}
    </div>
  );
}

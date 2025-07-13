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

interface SearchDrawerContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

export default function SearchDrawerContent({
  open,
  from,
  isDarkMode = false,
}: SearchDrawerContentProps) {
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

  return (
    <div className="flex h-full flex-col">
      {/* Mobile: Stack sidebar and content vertically */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="scrollbar-hide mb-2 flex flex-row flex-wrap gap-1 overflow-x-auto">
            {settingsCategories.map((category) => (
              <Button
                className={`h-auto w-fit rounded-md border-neutral-200 dark:border-neutral-700 border-1 justify-start px-2 py-1 text-left text-sm ${
                  selectedCategory === category.id
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "ghost"}
              >
                <span className="font-medium text-sm">{category.name}</span>
              </Button>
            ))}
          </div>

          <div className="border-neutral-200 border-t pt-4 dark:border-neutral-700">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

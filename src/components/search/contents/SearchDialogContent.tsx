import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { settingsCategories } from "@/data/search-filters";
import { useEffect, useState } from "react";
import {
  AvailabilityOptions,
  CompanyOptions,
  CompensationOptions,
  GeneralOptions,
  LocationOptions,
  QualificationsOptions,
  RoleDepartmentOptions,
} from "../filters";
import { CategoryId, CategoryType } from "@/types/search";

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
  const { hasUnsavedChanges, syncChanges } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => {
    if (from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      return (
        (category?.type as CategoryType) ||
        (settingsCategories[0].type as CategoryType)
      );
    }
    return settingsCategories[0].type as CategoryType;
  });

  const [scrollToSection, setScrollToSection] = useState<string | undefined>();

  const selectedCategoryData = settingsCategories.find(
    (cat) => cat.type === selectedCategory
  );

  useEffect(() => {
    if (open && from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      if (category && category.type !== selectedCategory) {
        setSelectedCategory(category.type as CategoryType);
      }
    }
  }, [from, open]);

  const handleCategoryClick = (categoryId: CategoryId) => {
    const category = settingsCategories.find((cat) => cat.id === categoryId);

    if (category?.type) {
      setSelectedCategory(category.type as CategoryType);
      setScrollToSection(categoryId);
    } else {
      setSelectedCategory(categoryId as CategoryType);
      setScrollToSection(undefined);
    }
  };

  const handleHeaderClick = (categoryType: CategoryType) => {
    setSelectedCategory(categoryType);
    setScrollToSection(undefined);
  };

  const handleApplySettings = () => {
    syncChanges();
    onOpenChange(false);
  };

  const renderContent = () => {
    switch (selectedCategory) {
      case "general":
        return (
          <GeneralOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
            handleCategoryClick={handleCategoryClick}
          />
        );
      case "compensation":
        return (
          <CompensationOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      case "role-department":
        return (
          <RoleDepartmentOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      case "qualifications":
        return (
          <QualificationsOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      case "availability":
        return (
          <AvailabilityOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      case "location":
        return (
          <LocationOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      case "company":
        return (
          <CompanyOptions
            isDarkMode={isDarkMode}
            scrollToSection={scrollToSection}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {selectedCategoryData?.name || "Unknown"}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Settings for {selectedCategoryData?.name.toLowerCase()} will be implemented here.
            </p>
            <div className="rounded-lg border-2 border-neutral-300 border-dashed p-8 text-center dark:border-neutral-600">
              <p className="text-neutral-500 dark:text-neutral-400">
                Content for {selectedCategoryData?.name} will be added later
              </p>
            </div>
          </div>
        );
    }
  };

  const renderSidebar = () => {
    const generalCategories = settingsCategories.filter((cat) => cat.type === "general");
    const compensationCategories = settingsCategories.filter((cat) => cat.type === "compensation");
    const roleDepartmentCategories = settingsCategories.filter((cat) => cat.type === "role-department");
    const qualificationsCategories = settingsCategories.filter((cat) => cat.type === "qualifications");
    const availabilityCategories = settingsCategories.filter((cat) => cat.type === "availability");
    const companyCategories = settingsCategories.filter((cat) => cat.type === "company");
    const locationCategories = settingsCategories.filter((cat) => cat.type === "location");

    const categories = [
      {
        name: "General",
        type: "general" as CategoryType,
        categories: generalCategories,
      },
      {
        name: "Compensation & Levels",
        type: "compensation" as CategoryType,
        categories: compensationCategories,
      },
      {
        name: "Role & Department",
        type: "role-department" as CategoryType,
        categories: roleDepartmentCategories,
      },
      {
        name: "Qualifications",
        type: "qualifications" as CategoryType,
        categories: qualificationsCategories,
      },
      {
        name: "Availability",
        type: "availability" as CategoryType,
        categories: availabilityCategories,
      },
      {
        name: "Location",
        type: "location" as CategoryType,
        categories: locationCategories,
      },
      {
        name: "Company",
        type: "company" as CategoryType,
        categories: companyCategories,
      },
    ];

    return (
      <div className="w-[200px] flex flex-col border-neutral-200 border-r bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 rounded-l-md">
        <div className="overflow-y-auto">
          <div className="space-y-px p-2 pt-0">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.type;
              return (
                <div className="" key={category.name}>
                  <Button
                    className={`h-auto w-full transition-all duration-500 ease-in-out justify-start p-2 text-left mt-2 ${
                      isSelected
                        ? "dark:bg-pink-700 bg-pink-400 text-black dark:text-white dark:hover:bg-pink-800 hover:bg-pink-500"
                        : ""
                    }`}
                    onClick={() => handleHeaderClick(category.type)}
                    variant={isSelected ? "default" : "ghost"}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide">
                      {category.name}
                    </h3>
                  </Button>
                  {category.categories.map((cat) => (
                    <Button
                      className={`h-auto w-full transition-all duration-500 ease-in-out justify-start px-2 py-1 text-left hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                        !isSelected ? "text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white" : ""
                      }`}
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      variant="ghost"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderContentArea = () => (
    <div className="flex-1 flex flex-col overflow-hidden w-full bg-neutral-100 dark:bg-neutral-800">
      <div className="flex-1 overflow-y-auto p-6 py-2 pr-10">{renderContent()}</div>
      <div className="px-4">
        <div className="flex justify-end">
          {hasUnsavedChanges && (
            <Button onClick={handleApplySettings}>Apply Settings</Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[90vh]">
      {renderSidebar()}
      {renderContentArea()}
    </div>
  );
}

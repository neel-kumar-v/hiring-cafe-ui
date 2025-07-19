import { Button } from "@/components/ui/button";
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

interface SearchDrawerContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

type CategoryType =
  | "general"
  | "compensation"
  | "role-department"
  | "qualifications"
  | "availability"
  | "location"
  | "company";

export default function SearchDrawerContent({
  open,
  from,
  isDarkMode = false,
}: SearchDrawerContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => {
    if (from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      return (category?.type as CategoryType) || "general";
    }
    return "general";
  });

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
  }, [from, open, selectedCategory]);

  const renderContent = () => {
    switch (selectedCategory) {
      case "general":
        return <GeneralOptions isDarkMode={isDarkMode} />;
      case "compensation":
        return <CompensationOptions isDarkMode={isDarkMode} />;
      case "role-department":
        return <RoleDepartmentOptions isDarkMode={isDarkMode} />;
      case "qualifications":
        return <QualificationsOptions isDarkMode={isDarkMode} />;
      case "availability":
        return <AvailabilityOptions isDarkMode={isDarkMode} />;
      case "location":
        return <LocationOptions isDarkMode={isDarkMode} />;
      case "company":
        return <CompanyOptions isDarkMode={isDarkMode} />;
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

  const categories: { type: CategoryType; name: string }[] = [
    { type: "general", name: "General" },
    { type: "compensation", name: "Compensation & Levels" },
    { type: "role-department", name: "Role & Department" },
    { type: "qualifications", name: "Qualifications" },
    { type: "availability", name: "Availability" },
    { type: "location", name: "Location" },
    { type: "company", name: "Company" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="scrollbar-hide mb-2 flex flex-row flex-wrap gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Button
                className={`h-auto w-fit rounded-md border-neutral-200 dark:border-neutral-700 border-1 justify-start px-2 py-1 text-left text-sm ${
                  selectedCategory === category.type
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
                key={category.type}
                onClick={() => setSelectedCategory(category.type)}
                variant={selectedCategory === category.type ? "default" : "ghost"}
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

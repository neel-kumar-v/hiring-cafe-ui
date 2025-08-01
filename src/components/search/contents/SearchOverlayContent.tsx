import { Button } from "@/components/ui/button";
import { settingsCategories } from "@/data/search-filters";
import { X } from "lucide-react";
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

interface SearchOverlayContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
}

type CategoryType =
  | "general"
  | "compensation"
  | "role-department"
  | "qualifications"
  | "availability"
  | "location"
  | "company";

function SearchOverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-neutral-200 border-b p-4 dark:border-neutral-700">
      <button
        className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={onClose}
      >
        <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </button>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Create your Job Search
        </h2>
      </div>
    </div>
  );
}

export default function SearchOverlayContent({
  open,
  onOpenChange,
  from,
}: SearchOverlayContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => {
    if (from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase()) ||
          cat.type.toLowerCase() === from.toLowerCase()
      );
      return (category?.type as CategoryType) || "general";
    }
    return "general";
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
          cat.id.toLowerCase().includes(from.toLowerCase()) ||
          cat.type.toLowerCase() === from.toLowerCase()
      );
      if (category && category.type !== selectedCategory) {
        setSelectedCategory(category.type as CategoryType);
      }
    }
  }, [from, open]);

  const handleCategoryClick = (categoryId: string) => {
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

  const handleClose = () => {
    onOpenChange(false);
  };

  const renderContent = () => {
    switch (selectedCategory) {
      case "general":
        return <GeneralOptions scrollToSection={scrollToSection} handleCategoryClick={handleCategoryClick} />;
      case "compensation":
        return <CompensationOptions scrollToSection={scrollToSection} />;
      case "role-department":
        return <RoleDepartmentOptions scrollToSection={scrollToSection} />;
      case "qualifications":
        return <QualificationsOptions scrollToSection={scrollToSection} />;
      case "availability":
        return <AvailabilityOptions scrollToSection={scrollToSection} />;
      case "location":
        return <LocationOptions scrollToSection={scrollToSection} />;
      case "company":
        return <CompanyOptions scrollToSection={scrollToSection} />;
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

  const renderOptions = () => {
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

    const selectedCategoryData = categories.find((cat) => cat.type === selectedCategory);

    return (
      <div className="flex flex-col gap-2">
        <div className="scrollbar-none flex scroll-auto gap-1 overflow-x-auto">
          {categories.map((category) => (
            <Button
              className={`h-auto w-fit rounded-md border-neutral-200 dark:border-neutral-700 border-1 justify-start px-2 py-1 text-left text-sm ${
                selectedCategory === category.type
                  ? "bg-pink-600 text-white hover:bg-pink-700 border-none outline-none ring-0"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
              key={category.type}
              onClick={() => handleHeaderClick(category.type)}
              variant={selectedCategory === category.type ? "default" : "ghost"}
            >
              <span className="text-sm">{category.name}</span>
            </Button>
          ))}
        </div>
        {selectedCategoryData && selectedCategoryData.categories.length > 0 && (
          <div className="mb-2 flex scrollbar-none gap-1 overflow-x-auto">
            {selectedCategoryData.categories.map((category) => (
              <Button
                className={`h-auto w-fit rounded-md border-neutral-200 dark:border-neutral-700 border-1 justify-start px-2 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700`}
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                variant="ghost"
              >
                <span className="text-sm">{category.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col">
      <SearchOverlayHeader onClose={handleClose} />
      <div className="sticky top-0 z-10 border-neutral-200 p-4 pb-0 max-sm:border-b dark:border-neutral-700 bg-white dark:bg-neutral-900/50">
        {renderOptions()}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

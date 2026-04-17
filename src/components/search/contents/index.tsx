"use client";

import { useEffect, useState } from "react";
import { filters } from "@/data/search-filters";
import type { CategoryId, CategoryType, SettingsCategory } from "@/types/search";
import {
  AvailabilityOptions,
  CompanyOptions,
  CompensationOptions,
  GeneralOptions,
  LocationOptions,
  QualificationsOptions,
  RoleDepartmentOptions,
} from "../filters";

export function findCategoryByFrom(from?: string): SettingsCategory | undefined {
  if (!from) return undefined;

  return filters.find(
    (category) =>
      category.name.toLowerCase().includes(from.toLowerCase()) ||
      category.id.toLowerCase().includes(from.toLowerCase()) ||
      category.type.toLowerCase() === from.toLowerCase()
  );
}

export function getInitialCategory(
  from?: string,
  defaultCategory: CategoryType = "general"
): CategoryType {
  if (!from) return defaultCategory;

  return (findCategoryByFrom(from)?.type as CategoryType) ?? defaultCategory;
}

export function useCategoryState(
  from?: string,
  open?: boolean,
  defaultCategory: CategoryType = "general"
) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() =>
    getInitialCategory(from, defaultCategory)
  );
  const [scrollToSection, setScrollToSection] = useState<string | undefined>();

  const selectedCategoryData = filters.find(
    (category) => category.type === selectedCategory
  );

  useEffect(() => {
    if (!open || !from) return;

    const category = findCategoryByFrom(from);
    if (!category) return;

    setSelectedCategory(category.type as CategoryType);
    setScrollToSection(category.id);
  }, [from, open]);

  const handleFilterSelectWithScroll = (categoryId: CategoryId | string) => {
    const category = filters.find((item) => item.id === categoryId);

    if (category?.type) {
      setSelectedCategory(category.type as CategoryType);
      setScrollToSection(categoryId);
      return;
    }

    setSelectedCategory(categoryId as CategoryType);
    setScrollToSection(undefined);
  };

  const handleFilterSelectNoScroll = (categoryId: CategoryId | string) => {
    const category = filters.find((item) => item.id === categoryId);

    if (category?.type) {
      setSelectedCategory(category.type as CategoryType);
      return;
    }

    setSelectedCategory(categoryId as CategoryType);
  };

  const handleHeaderClick = (categoryType: CategoryType) => {
    setSelectedCategory(categoryType);
    const firstId = filters.find((category) => category.type === categoryType)?.id;
    setScrollToSection(firstId ?? undefined);
  };

  return {
    selectedCategory,
    scrollToSection,
    setScrollToSection,
    selectedCategoryData,
    handleFilterSelectWithScroll,
    handleFilterSelectNoScroll,
    handleHeaderClick,
  };
}

export type FilteredGroup = {
  type: CategoryType;
  name: string;
  categories: Array<{ id: string; name: string }>;
};

type RenderOptions = {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
};

export function renderCategoryContent(
  selectedCategory: CategoryType,
  handleCategoryClick: (categoryId: CategoryId | string) => void,
  selectedCategoryData?: { name: string },
  options: RenderOptions = {}
) {
  const { scrollToSection, clearScrollToSection, filterIds } = options;

  switch (selectedCategory) {
    case "general":
      return (
        <GeneralOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
          handleCategoryClick={handleCategoryClick as (categoryType: CategoryId) => void}
        />
      );
    case "compensation":
      return (
        <CompensationOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    case "role-department":
      return (
        <RoleDepartmentOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    case "qualifications":
      return (
        <QualificationsOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    case "availability":
      return (
        <AvailabilityOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    case "location":
      return (
        <LocationOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    case "company":
      return (
        <CompanyOptions
          scrollToSection={scrollToSection}
          clearScrollToSection={clearScrollToSection}
          filterIds={filterIds}
        />
      );
    default:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedCategoryData?.name || "Unknown"}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Settings for {selectedCategoryData?.name.toLowerCase()} will be implemented here.
          </p>
          <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center dark:border-neutral-600">
            <p className="text-neutral-500 dark:text-neutral-400">
              Content for {selectedCategoryData?.name} will be added later
            </p>
          </div>
        </div>
      );
  }
}

export function renderAllCategoriesContent(
  scrollToSection: string | undefined,
  handleCategoryClick: (categoryId: CategoryId | string) => void,
  clearScrollToSection?: () => void
) {
  const grouped = getGroupedCategories();

  return renderFilteredCategoriesContent(
    grouped,
    scrollToSection,
    handleCategoryClick,
    clearScrollToSection
  );
}

export function renderFilteredCategoriesContent(
  filteredGroups: FilteredGroup[],
  scrollToSection: string | undefined,
  handleCategoryClick: (categoryId: CategoryId | string) => void,
  clearScrollToSection?: () => void
) {
  return (
    <div className="space-y-10">
      {filteredGroups.map((group) => {
        const header =
          group.categories.length === 1 ? group.categories[0].name : group.name;
        const filterIds = group.categories.map((category) => category.id);

        return (
          <section
            key={group.type}
            id={group.type}
            className="scroll-mt-4 max-md:max-w-screen"
          >
            <h2 className="mb-4 border-b border-neutral-200 pb-1 text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">
              {header}
            </h2>
            {renderCategoryContent(group.type, handleCategoryClick, { name: header }, {
              scrollToSection,
              clearScrollToSection,
              filterIds,
            })}
          </section>
        );
      })}
    </div>
  );
}

export function getGroupedCategories(): FilteredGroup[] {
  const groups: Array<{ name: string; type: CategoryType }> = [
    { name: "General", type: "general" },
    { name: "Compensation & Levels", type: "compensation" },
    { name: "Location", type: "location" },
    { name: "Role & Department", type: "role-department" },
    { name: "Qualifications", type: "qualifications" },
    { name: "Availability", type: "availability" },
    { name: "Company", type: "company" },
  ];

  return groups.map((group) => ({
    ...group,
    categories: filters.filter((category) => category.type === group.type),
  }));
}

export { default as SearchDialogContent } from "./SearchDialogContent";
export { default as SearchOverlayContent } from "./SearchOverlayContent";

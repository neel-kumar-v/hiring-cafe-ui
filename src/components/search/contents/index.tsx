"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  filterGroupOrder,
  filters,
  generalContentExcludedIds,
  generalStreamIds,
  groupAnchorFilterIds,
  qualificationsStreamIds,
  sidebarNavExcludedIds,
} from "@/data/search-filters";
import type { CategoryId, CategoryType, SettingsCategory } from "@/types/search";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, getInitialPatchForCategory, initialSearchState, isCategoryEdited } from "@/lib/edited-filters";
import { AvailabilityOptions, CompanyOptions, CompensationOptions, GeneralOptions, LocationOptions, QualificationsOptions, RoleDepartmentOptions } from "../filters";
import { FilterCategoryHeader } from "../filters/util/FilterSubsection";

/** Omitted from General content entirely (live elsewhere). */
export const GENERAL_CONTENT_EXCLUDED = generalContentExcludedIds;

/** Stream / nested filters + content-excluded — no dedicated sidebar nav rows. */
export const GENERAL_NAV_EXCLUDED = new Set([...generalContentExcludedIds, ...generalStreamIds, ...sidebarNavExcludedIds, ...qualificationsStreamIds]);

export function findCategoryByFrom(from?: string): SettingsCategory | undefined {
  if (!from) return undefined;

  return filters.find(
    (category) =>
      category.name.toLowerCase().includes(from.toLowerCase()) || category.id.toLowerCase().includes(from.toLowerCase()) || category.type.toLowerCase() === from.toLowerCase()
  );
}

export function getInitialCategory(from?: string, defaultCategory: CategoryType = "general"): CategoryType {
  if (!from) return defaultCategory;

  return (findCategoryByFrom(from)?.type as CategoryType) ?? defaultCategory;
}

export function useCategoryState(from?: string, open?: boolean, defaultCategory: CategoryType = "general") {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => getInitialCategory(from, defaultCategory));
  const [scrollToSection, setScrollToSection] = useState<string | undefined>();

  const selectedCategoryData = useMemo(() => filters.find((category) => category.type === selectedCategory), [selectedCategory]);

  useEffect(() => {
    if (!open || !from) return;

    const category = findCategoryByFrom(from);
    if (!category) return;

    setSelectedCategory(category.type as CategoryType);
    setScrollToSection(category.id);
  }, [from, open]);

  const handleFilterSelectWithScroll = useCallback((categoryId: CategoryId | string) => {
    const category = filters.find((item) => item.id === categoryId);

    if (category?.type) {
      setSelectedCategory(category.type as CategoryType);
      setScrollToSection(categoryId);
      return;
    }

    setSelectedCategory(categoryId as CategoryType);
    setScrollToSection(undefined);
  }, []);

  const handleFilterSelectNoScroll = useCallback((categoryId: CategoryId | string) => {
    const category = filters.find((item) => item.id === categoryId);

    if (category?.type) {
      setSelectedCategory(category.type as CategoryType);
      return;
    }

    setSelectedCategory(categoryId as CategoryType);
  }, []);

  const handleHeaderClick = useCallback((categoryType: CategoryType) => {
    setSelectedCategory(categoryType);
    // Prefer the filter that shares the group name (Location, Company) so the header lands on the section itself.
    const groupName = filterGroupOrder.find((group) => group.type === categoryType)?.name;
    const named = groupName
      ? filters.find((category) => category.type === categoryType && category.name.localeCompare(groupName, undefined, { sensitivity: "accent" }) === 0)
      : undefined;
    const firstId = named?.id ?? groupAnchorFilterIds[categoryType] ?? filters.find((category) => category.type === categoryType && !GENERAL_NAV_EXCLUDED.has(category.id))?.id;
    setScrollToSection(firstId ?? undefined);
  }, []);

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
      return <GeneralOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "compensation":
      return <CompensationOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "role-department":
      return <RoleDepartmentOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "qualifications":
      return <QualificationsOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "availability":
      return <AvailabilityOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "location":
      return <LocationOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    case "company":
      return <CompanyOptions scrollToSection={scrollToSection} clearScrollToSection={clearScrollToSection} filterIds={filterIds} />;
    default:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{selectedCategoryData?.name || "Unknown"}</h3>
          <p className="text-muted-foreground">Settings for {selectedCategoryData?.name.toLowerCase()} will be implemented here.</p>
          <div className="rounded-lg border-2 border-dashed border-border/70 p-8 text-center dark:border-border">
            <p className="text-muted-foreground">Content for {selectedCategoryData?.name} will be added later</p>
          </div>
        </div>
      );
  }
}

export function renderAllCategoriesContent(scrollToSection: string | undefined, handleCategoryClick: (categoryId: CategoryId | string) => void, clearScrollToSection?: () => void) {
  const grouped = getGroupedCategories();

  return renderFilteredCategoriesContent(grouped, scrollToSection, handleCategoryClick, clearScrollToSection);
}

function LazyCategorySection({ children, force }: { children: React.ReactNode; force?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(force ?? false);

  useEffect(() => {
    if (force) {
      setMounted(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
        }
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [force]);

  if (mounted) {
    return <div className="[content-visibility:auto] [contain-intrinsic-size:0_180px]">{children}</div>;
  }

  return <div ref={ref} aria-hidden="true" className="min-h-[180px] [content-visibility:auto] [contain-intrinsic-size:0_180px]" />;
}

export const FilteredCategoriesContent = memo(function FilteredCategoriesContent({
  filteredGroups,
  scrollToSection,
  handleCategoryClick,
  clearScrollToSection,
}: {
  filteredGroups: FilteredGroup[];
  scrollToSection: string | undefined;
  handleCategoryClick: (categoryId: CategoryId | string) => void;
  clearScrollToSection?: () => void;
}) {
  const { searchOptions, updateSearchOptions } = useApp();

  return (
    <div className="space-y-7">
      {filteredGroups.map((group) => {
        const header = group.name;
        const filterIds = group.categories.map((category) => category.id);
        const forceMount = Boolean(scrollToSection && filterIds.includes(scrollToSection));

        const isLocation = group.type === "location";
        const locationEdited = isLocation && isCategoryEdited(searchOptions, initialSearchState, "location");
        const locationEditCount = isLocation ? getCategoryEditCount(searchOptions, initialSearchState, "location") : 0;
        const handleLocationClear = isLocation ? () => updateSearchOptions(getInitialPatchForCategory("location", initialSearchState)) : undefined;

        return (
          <section key={group.type} id={group.type} className="scroll-mt-4 space-y-2 max-md:max-w-screen">
            <FilterCategoryHeader title={header} editCount={locationEditCount} onClear={locationEdited ? handleLocationClear : undefined} />
            <LazyCategorySection force={forceMount}>
              {renderCategoryContent(
                group.type,
                handleCategoryClick,
                { name: header },
                {
                  scrollToSection,
                  clearScrollToSection,
                  filterIds,
                }
              )}
            </LazyCategorySection>
          </section>
        );
      })}
    </div>
  );
});

export function renderFilteredCategoriesContent(
  filteredGroups: FilteredGroup[],
  scrollToSection: string | undefined,
  handleCategoryClick: (categoryId: CategoryId | string) => void,
  clearScrollToSection?: () => void
) {
  return (
    <FilteredCategoriesContent
      filteredGroups={filteredGroups}
      scrollToSection={scrollToSection}
      handleCategoryClick={handleCategoryClick}
      clearScrollToSection={clearScrollToSection}
    />
  );
}

let _cachedGroupedCategories: FilteredGroup[] | null = null;

export function getGroupedCategories(): FilteredGroup[] {
  if (_cachedGroupedCategories) return _cachedGroupedCategories;

  const groups = filterGroupOrder.map((group) => ({
    ...group,
    categories: filters.filter((category) => category.type === group.type),
  }));

  const quickIndex = groups.findIndex((group) => group.name === "Quick");
  const generalIndex = groups.findIndex((group) => group.type === "general");
  if (quickIndex >= 0 && generalIndex >= 0 && quickIndex !== generalIndex) {
    const quick = groups[quickIndex];
    groups[generalIndex] = {
      ...groups[generalIndex],
      categories: [...quick.categories, ...groups[generalIndex].categories],
    };
    groups.splice(quickIndex, 1);
  }

  _cachedGroupedCategories = groups.map((group) =>
    group.type === "general"
      ? {
          ...group,
          categories: group.categories.filter((category) => !GENERAL_CONTENT_EXCLUDED.has(category.id)),
        }
      : group
  );
  return _cachedGroupedCategories;
}

export { default as SearchContent } from "./SearchContent";

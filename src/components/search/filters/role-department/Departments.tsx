"use client";

import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Department, Select } from "@/types/search";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

type DepartmentSection = {
  title: string;
  items: Department[];
};

const departmentSections: DepartmentSection[] = [
  {
    title: "Technology",
    items: ["Engineering", "Software Development", "Information Technology", "Data and Analytics"],
  },
  {
    title: "Design",
    items: ["Design", "Creative and Art Services"],
  },
  {
    title: "Business Operations",
    items: [
      "Project and Program Management",
      "Product Management",
      "Business Operations",
      "Legal and Compliance",
      "Finance and Accounting",
      "Human Resources",
      "Administrative & Clerical Support",
    ],
  },
  {
    title: "Sales",
    items: ["Sales", "Marketing", "Communications and Public Affairs", "Business Development"],
  },
  {
    title: "Healthcare",
    items: ["Advanced Practice", "Allied Health", "Nursing", "Pharmacy", "Veterinary"],
  },
  {
    title: "Customer Service",
    items: ["Customer Service", "Social Services"],
  },
  {
    title: "Construction",
    items: ["Construction", "Mechanical and Electrical", "Manufacturing and Industrial", "Maintenance and Repair", "General Labor"],
  },
  {
    title: "Transportation",
    items: ["Transportation Services", "Supply Chain / Logistics / Procurement"],
  },
  {
    title: "Quality Assurance",
    items: ["Quality Assurance", "Environment, Health, and Safety"],
  },
  {
    title: "Miscellaneous",
    items: ["Education", "Research and Development (R&D)", "Food and Beverage Services", "Protective Services", "Custodial Services"],
  },
];

const allDepartments: Department[] = departmentSections.flatMap((section) => section.items);
const sectionValues = departmentSections.map((section) => section.title.toLowerCase().replace(/\s+/g, "-"));
const sectionCheckboxClassName =
  "accent-primary size-4 group-hover:scale-125 transition-all duration-300 ease-out data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary not-data-[state=checked]:dark:bg-muted";

function getSectionValue(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function getSectionValuesWithChecked(selectedDepartments: Select<Department>) {
  const selected = selectedDepartments === "All" ? allDepartments : selectedDepartments;
  const open = new Set<string>();

  for (const section of departmentSections) {
    if (selected.some((department) => section.items.includes(department))) {
      open.add(getSectionValue(section.title));
    }
  }

  return open;
}

type FilteredSection = {
  title: string;
  items: Department[];
};

function getFilteredSections(searchQuery: string): FilteredSection[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return departmentSections;

  return departmentSections
    .map((section) => {
      const titleMatch = section.title.toLowerCase().includes(query);
      if (titleMatch) {
        return section;
      }

      const matchingItems = section.items.filter((item) => item.toLowerCase().includes(query));
      if (matchingItems.length === 0) return null;

      return {
        title: section.title,
        items: matchingItems,
      };
    })
    .filter((section): section is FilteredSection => section !== null);
}

interface FilterSectionProps {
  title: string;
  items: Department[];
  handleCheckboxChange: (department: Department) => void;
  setDepartmentsForSection: (departments: Department[], checked: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FilterSection({ title, items, handleCheckboxChange, setDepartmentsForSection, open, onOpenChange }: FilterSectionProps) {
  const { searchOptions } = useApp();
  const itemValue = getSectionValue(title);

  const currentDepartments = Array.isArray(searchOptions.department) ? searchOptions.department : [];
  const selectedInSection =
    searchOptions.department === "All" ? items : currentDepartments.filter((item) => items.includes(item));

  const allChecked = selectedInSection.length === items.length;
  const someChecked = selectedInSection.length > 0 && selectedInSection.length < items.length;
  const checked: boolean | "indeterminate" = allChecked ? true : someChecked ? "indeterminate" : false;

  const handleTitleChange = () => {
    setDepartmentsForSection(items, !allChecked);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? itemValue : ""}
      onValueChange={(nextValue) => onOpenChange(nextValue === itemValue)}
      className="w-full last-of-type:border-b-0 border-b border-b-neutral-200 hover:border-b-neutral-300 dark:border-b-neutral-700 dark:hover:border-b-neutral-600 transition-all duration-700 ease-in-out"
    >
      <AccordionItem value={itemValue}>
        <AccordionPrimitive.Header className="flex w-full items-start gap-2">
          <Checkbox
            className={cn(sectionCheckboxClassName, "mt-1 shrink-0")}
            checked={checked}
            onCheckedChange={() => handleTitleChange()}
          />
          <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
              "focus-visible:border-ring focus-visible:ring-ring/50 group flex flex-1 items-start justify-between gap-4 rounded-md py-0 text-left text-sm font-medium transition-all duration-300 ease-out outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 cursor-pointer",
              "text-md font-[600] pt-0 pb-1",
            )}
          >
            <span className="text-base select-none">{title}</span>
            <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-all duration-300 ease-out" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionContent className="p-2">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <LabelCheckbox
                key={item}
                label={item}
                checked={searchOptions.department === "All" || selectedInSection.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function Departments() {
  const { searchOptions, updateSearchOptions } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => getFilteredSections(searchQuery), [searchQuery]);
  const isSearchActive = searchQuery.trim().length > 0;
  const [openSections, setOpenSections] = useState<Set<string>>(() => getSectionValuesWithChecked(searchOptions.department));

  const handleCheckboxChange = (department: Department) => {
    let currentDepartments: Department[] = [];

    if (searchOptions.department === "All") {
      currentDepartments = allDepartments.filter((item) => item !== department);
    } else if (Array.isArray(searchOptions.department)) {
      currentDepartments = [...searchOptions.department];
    }

    let newDepartments: Select<Department>;

    if (searchOptions.department === "All") {
      newDepartments = currentDepartments;
    } else if (currentDepartments.includes(department)) {
      const filtered = currentDepartments.filter((item: Department) => item !== department);
      newDepartments = filtered.length === 0 ? [] : filtered;
    } else {
      const added = [...currentDepartments, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }

    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }

    updateSearchOptions({
      department: newDepartments,
    });
  };

  const setDepartmentsForSection = (sectionItems: Department[], checked: boolean) => {
    let currentDepartments: Department[] = [];

    if (searchOptions.department === "All") {
      currentDepartments = [...allDepartments];
    } else if (Array.isArray(searchOptions.department)) {
      currentDepartments = [...searchOptions.department];
    }

    let newDepartments: Select<Department>;

    if (checked) {
      const added = Array.from(new Set([...currentDepartments, ...sectionItems]));
      newDepartments = added.length === allDepartments.length ? "All" : added;
    } else {
      const filtered = currentDepartments.filter((item: Department) => !sectionItems.includes(item));
      newDepartments = filtered.length === 0 ? [] : filtered;
    }

    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }

    updateSearchOptions({ department: newDepartments });
  };

  return (
    <FilterContainer
      categoryId="departments"
      title="Departments"
      actions={
        <>
          <div className="relative flex-1 grow min-w-0 md:max-w-[240px]">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search departments"
              className="h-9 grow pl-8"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search departments..."
              type="search"
              value={searchQuery}
            />
          </div>
          <Button
            aria-label="Open all sections"
            onClick={() => setOpenSections(new Set(sectionValues))}
            title="Open all"
            type="button"
            variant="outline"
            disabled={!!searchQuery}
          >
            <span className="hidden lg:block">Expand All</span>
            <ChevronDownIcon className="size-4" />
          </Button>
          <Button
            aria-label="Collapse all sections"
            onClick={() => setOpenSections(new Set())}
            title="Collapse all"
            type="button"
            variant="outline"
            disabled={!!searchQuery}
          >
            <span className="hidden lg:block">Collapse All</span>
            <ChevronUpIcon className="size-4" />
          </Button>
    
        </>
      }
    >
      {filteredSections.map((section) => {
        const sectionValue = getSectionValue(section.title);
        return (
          <FilterSection
            key={section.title}
            title={section.title}
            items={section.items}
            handleCheckboxChange={handleCheckboxChange}
            setDepartmentsForSection={setDepartmentsForSection}
            open={isSearchActive ? true : openSections.has(sectionValue)}
            onOpenChange={(nextOpen) => {
              setOpenSections((prev) => {
                const next = new Set(prev);
                if (nextOpen) {
                  next.add(sectionValue);
                } else {
                  next.delete(sectionValue);
                }
                return next;
              });
            }}
          />
        );
      })}
    </FilterContainer>
  );
}

import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { decodeKeywords, decodeRangeString, decodeSearchExpression, decodeSelectString } from "@/lib/search";
import { CategoryId, DegreePreferencesOptions, SalaryOptions } from "@/types/search";
import { useState } from "react";

interface CurrentFiltersProps {
  isDarkMode?: boolean;
  handleCategoryClick: (categoryType: CategoryId) => void;
}

interface FilterItemProps {
  label: string;
  value: string | null;
  categoryId: CategoryId;
  isExtended: boolean;
  isImportant?: boolean;
  handleCategoryClick: (categoryType: CategoryId) => void;
}

function FilterItem({ label, value, categoryId, isExtended, isImportant = false, handleCategoryClick }: FilterItemProps) {
  const exclude = ["All", "None", ""];
  const shouldShow = isImportant || isExtended || !exclude.includes(value || "");
  
  if (!shouldShow) return null;

  return (
    <p>
      {label}: <span 
        onClick={() => handleCategoryClick(categoryId)} 
        className="cursor-pointer font-semibold dark:hover:text-pink-400 hover:text-pink-600 transition-all duration-300 ease-in-out"
      >
        {value || "None"}
      </span>
    </p>
  );
}

export default function CurrentFilters({ handleCategoryClick }: CurrentFiltersProps) {
  const { searchOptions } = useSearch();
  const [extended, setExtended] = useState(false);

  const decodeSalary = (salary: SalaryOptions) => {
    const range = decodeRangeString(salary.range);
    if (range === "All") return range;
    return range + " " + salary.unit;
  }

  const decodeDegreePreferences = (degree: DegreePreferencesOptions) => {
    const associate = degree.associate.preferences === null ? "None" : decodeKeywords(degree.associate.keywords);
    const bachelor = degree.bachelor.preferences === null ? "None" : decodeKeywords(degree.bachelor.keywords);
    const master = degree.master.preferences === null ? "None" : decodeKeywords(degree.master.keywords);
    const doctorate = degree.doctorate.preferences === null ? "None" : decodeKeywords(degree.doctorate.keywords);
    return { associate, bachelor, master, doctorate };
  }

  const decodedState = {
    date_range: `${searchOptions.date_range.magnitude} ${searchOptions.date_range.unit}`,
    sort: `${searchOptions.sort.order} ${searchOptions.sort.by}`,
    apply_form: searchOptions.apply_form,
    exclusion: searchOptions.exclusion.length > 0 ? "Jobs you have" + searchOptions.exclusion.join(", ") : "None",
    encouraged: searchOptions.encouraged && searchOptions.encouraged.length > 0 ? searchOptions.encouraged.join(", ") : "None",
    departments: decodeSelectString(searchOptions.department),
    salary: decodeSalary(searchOptions.salary) + (searchOptions.salary.undisclosed ? " (hide undisclosed salaries)" : ""),
    commitment: decodeSelectString(searchOptions.commitment),
    experience: decodeSelectString(searchOptions.experience.level),
    job_titles: decodeSearchExpression(searchOptions.job_titles.title),
    job_keywords: decodeSearchExpression(searchOptions.job_titles.technical),
    job_description: decodeSearchExpression(searchOptions.job_titles.description),
    job_requirements: decodeSearchExpression(searchOptions.job_titles.requirements),
    benefits: decodeSelectString(searchOptions.benefits),
    education: decodeDegreePreferences(searchOptions.education),
    license: decodeKeywords(searchOptions.license_certification.keywords) + (searchOptions.license_certification.hide_required ? " (hide required licenses)" : ""),
  }
  
  return (
    <div className="flex flex-col gap-2 relative">
      <FilterItem
        label="Jobs from the past"
        value={decodedState.date_range}
        categoryId="date-range"
        isExtended={extended}
        isImportant={true}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Sort by"
        value={decodedState.sort}
        categoryId="sorting"
        isExtended={extended}
        isImportant={true}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Apply Form Type"
        value={decodedState.apply_form}
        categoryId="apply-form"
        isExtended={true}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Excluding"
        value={decodedState.exclusion}
        categoryId="exclusion"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Encouraged to Apply"
        value={decodedState.encouraged}
        categoryId="encouraged"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Departments"
        value={decodedState.departments}
        categoryId="departments"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Salary"
        value={decodedState.salary}
        categoryId="salary"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Commitment"
        value={decodedState.commitment}
        categoryId="commitment"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Experience"
        value={decodedState.experience}
        categoryId="experience"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Benefits & Perks"
        value={decodedState.benefits || "None"}
        categoryId="benefits"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Job Title Keywords"
        value={decodedState.job_titles || "None"}
        categoryId="job-titles"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Job Technical Keywords"
        value={decodedState.job_keywords || "None"}
        categoryId="job-titles"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Job Description Keywords"
        value={decodedState.job_description || "None"}
        categoryId="job-titles"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Job Requirements Keywords"
        value={decodedState.job_requirements || "None"}
        categoryId="job-titles"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Associate Degree"
        value={decodedState.education.associate}
        categoryId="education"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Bachelor Degree"
        value={decodedState.education.bachelor}
        categoryId="education"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Master Degree"
        value={decodedState.education.master}
        categoryId="education"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <FilterItem
        label="Doctorate Degree"
        value={decodedState.education.doctorate}
        categoryId="education"
        isExtended={extended}
        handleCategoryClick={handleCategoryClick}
      />
      <div className="sticky bottom-4 right-4 flex justify-end z-20">
        <Button
          onClick={() => setExtended(!extended)}
          className="w-fit"
          variant="outline"
        >
          {extended ? "Hide unchanged filters" : "Show unchanged filters"}
        </Button>
      </div>
    </div>
  );
} 
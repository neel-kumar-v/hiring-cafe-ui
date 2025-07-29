import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { decodeKeywords, decodeRangeString, decodeSearchExpression, decodeSelectString } from "@/lib/search";
import { CategoryId, DegreePreferencesOptions, FundingOptions, IndustryOptions, InfiniteRange, SalaryOptions, SearchState, Select, ShiftPreferencesOptions } from "@/types/search";
import { useState } from "react";


interface FilterItemProps {
  label: string;
  value: string | null;
  categoryId: CategoryId;
  isExtended: boolean;
  isImportant?: boolean;
  handleCategoryClick: (categoryType: CategoryId) => void;
}

function shouldShowFilterItem(value: string | null, isExtended: boolean, isImportant: boolean = false): boolean {
  const exclude = ["All", "None", "", " No", "1800 - 2025"];
  return isImportant || isExtended || !exclude.includes(value || "");
}

function FilterItem({ label, value, categoryId, isExtended, isImportant = false, handleCategoryClick }: FilterItemProps) {
  if (!shouldShowFilterItem(value, isExtended, isImportant)) return null;

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

interface FilterSectionProps {
  title: string;
  items: FilterItemProps[];
  isExtended: boolean;
}

export function FilterSection({ title, items, isExtended }: FilterSectionProps) {
  const visibleItems = items.filter(item => 
    shouldShowFilterItem(item.value, isExtended, item.isImportant)
  );
  
  if (visibleItems.length === 0) return null;

  const itemValue = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out"
    >
      <AccordionItem value={itemValue}>
        <AccordionTrigger className="text-md font-[600] pt-0 pb-1 ">
          {title}
        </AccordionTrigger>
        <AccordionContent className="p-2">
          <div className="flex flex-col gap-2">
            {visibleItems.map((item, index) => (
              <FilterItem key={index} {...item} isExtended={isExtended} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}


export interface AllFiltersProps {
  handleCategoryClick: (categoryType: CategoryId) => void;
  searchOptions: SearchState;
  showButton?: boolean;
}
export const AllFilter = ({handleCategoryClick, searchOptions, showButton = true}: AllFiltersProps) => {
  const [extended, setExtended] = useState(false);

  const decodeSalary = (salary: SalaryOptions) => {
    if (!salary) return "All";
    const minRange = decodeRangeString(salary.min_range);
    const maxRange = decodeRangeString(salary.max_range);
    if (minRange === "All" && maxRange === "All") return "All";
    if (minRange === "All") return `Max: $${maxRange} ${salary.unit}`;
    if (maxRange === "All") return `Min: $${minRange} ${salary.unit}`;
    if (!minRange.includes('-') && !maxRange.includes('-')) return `$${minRange} - $${maxRange} ${salary.unit}`;
    return `Min: $${minRange}, Max: $${maxRange} ${salary.unit}`;
  }

  const decodeDegreePreferences = (degree: DegreePreferencesOptions) => {
    if (!degree) return { associate: { preferences: "None", include: "None", exclude: "None" }, bachelor: { preferences: "None", include: "None", exclude: "None" }, master: { preferences: "None", include: "None", exclude: "None" }, doctorate: { preferences: "None", include: "None", exclude: "None" } };
    const associate = {
      preferences: degree.associate?.preferences === null ? "None" : Array.isArray(degree.associate?.preferences) ? degree.associate.preferences.join(", ") : degree.associate?.preferences || "None",
      include: decodeKeywords(degree.associate?.keywords || { include: [], exclude: "None" }).include,
      exclude: decodeKeywords(degree.associate?.keywords || { include: [], exclude: "None" }).exclude
    };
    const bachelor = {
      preferences: degree.bachelor?.preferences === null ? "None" : Array.isArray(degree.bachelor?.preferences) ? degree.bachelor.preferences.join(", ") : degree.bachelor?.preferences || "None",
      include: decodeKeywords(degree.bachelor?.keywords || { include: [], exclude: "None" }).include,
      exclude: decodeKeywords(degree.bachelor?.keywords || { include: [], exclude: "None" }).exclude
    };
    const master = {
      preferences: degree.master?.preferences === null ? "None" : Array.isArray(degree.master?.preferences) ? degree.master.preferences.join(", ") : degree.master?.preferences || "None",
      include: decodeKeywords(degree.master?.keywords || { include: [], exclude: "None" }).include,
      exclude: decodeKeywords(degree.master?.keywords || { include: [], exclude: "None" }).exclude
    };
    const doctorate = {
      preferences: degree.doctorate?.preferences === null ? "None" : Array.isArray(degree.doctorate?.preferences) ? degree.doctorate.preferences.join(", ") : degree.doctorate?.preferences || "None",
      include: decodeKeywords(degree.doctorate?.keywords || { include: [], exclude: "None" }).include,
      exclude: decodeKeywords(degree.doctorate?.keywords || { include: [], exclude: "None" }).exclude
    };
    return { associate, bachelor, master, doctorate };
  }

  const decodeShiftPreferences = (shifts: ShiftPreferencesOptions) => {
    if (!shifts) return { morning: "None", afternoon: "None", night: "None", weekend: "None", holiday: "None", overtime: "None", oncall: "None" };
    const morning = shifts.morning === null ? "None" : decodeSelectString(shifts.morning);
    const afternoon = shifts.afternoon === null ? "None" : decodeSelectString(shifts.afternoon);
    const night = shifts.night === null ? "None" : decodeSelectString(shifts.night);
    const weekend = shifts.weekend === null ? "None" : decodeSelectString(shifts.weekend);
    const holiday = shifts.holiday === null ? "None" : decodeSelectString(shifts.holiday);
    const overtime = shifts.overtime === null ? "None" : decodeSelectString(shifts.overtime);
    const oncall = shifts.oncall === null ? "None" : decodeSelectString(shifts.oncall);
    return { morning, afternoon, night, weekend, holiday, overtime, oncall };
  }

  const decodeIndustryOptions = (industry: IndustryOptions) => {
    if (!industry) return { profit: "All", activities: { include: "None", exclude: "None" }, decoded_industry: { include: "None", exclude: "None" }, usa_jobs: "All" };
    const profit = industry.profit === "All" ? "All" : decodeSelectString(industry.profit);
    const activities = decodeKeywords(industry.activities || { include: [], exclude: "None" });
    const decoded_industry = decodeKeywords(industry.industry || { include: [], exclude: "None" });
    const usa_jobs = industry.usa_jobs === "All" ? "All" : decodeSelectString(industry.usa_jobs);
    return { profit, activities, decoded_industry, usa_jobs };
  }

  const decodeFundingOptions = (funding: FundingOptions) => {
    if (!funding) return { current: "All", investors: { include: "None", exclude: "None" }, latest_round: "All", latest_round_type: { include: "None", exclude: "None" }, latest_round_amount: "All" };
    const current = funding.current === "All" ? "All" : decodeSelectString(funding.current);
    const investors = decodeKeywords(funding.investors || { include: [], exclude: "None" });
    const latest_round = decodeRangeString(funding.latest_round || { min: 0, max: 0 }, false);
    const latest_round_type = decodeKeywords(funding.latest_round_type || { include: [], exclude: "None" });
    const latest_round_amount = decodeRangeString(funding.latest_round_amount || { min: 0, max: 0 });
    return { current, investors, latest_round, latest_round_type, latest_round_amount };
  }

  const decodeSizeOptions = (size: Select<InfiniteRange, "All">) => {
    if (size === "All") return "All";
    if (Array.isArray(size)) {
      if (size.length === 0) return "All";
      if (size.length === 1) {
        const range = size[0];
        if (range.max === null) {
          return `${range.min}+ employees`;
        }
        return `${range.min}-${range.max} employees`;
      }
      return `${size.length} ranges selected`;
    }
    return "All";
  }

  const decodedState = {
    date_range: searchOptions?.date_range ? `${searchOptions.date_range.magnitude} ${searchOptions.date_range.unit}` : "All",
    sort: searchOptions?.sort ? `${searchOptions.sort.order} ${searchOptions.sort.by}` : "Most Relevance",
    apply_form: searchOptions?.apply_form || "All",
    exclusion: searchOptions?.exclusion && searchOptions.exclusion.length > 0 ? searchOptions.exclusion.join(", ") : "None",
    encouraged: searchOptions?.encouraged && searchOptions.encouraged.length > 0 ? searchOptions.encouraged.join(", ") : "None",
    departments: decodeSelectString(searchOptions?.department || "All"),
    salary: searchOptions?.salary ? decodeSalary(searchOptions.salary) + (searchOptions.salary.undisclosed ? " (hide undisclosed salaries)" : "") : "All",
    commitment: decodeSelectString(searchOptions?.commitment || "All"),
    experience: decodeSelectString(searchOptions?.experience?.level || "All"),
    job_titles: searchOptions?.job_titles?.title ? decodeSearchExpression(searchOptions.job_titles.title) : "None",
    job_keywords: searchOptions?.job_titles?.technical ? decodeSearchExpression(searchOptions.job_titles.technical) : "None",
    job_description: searchOptions?.job_titles?.description ? decodeSearchExpression(searchOptions.job_titles.description) : "None",
    job_requirements: searchOptions?.job_titles?.requirements ? decodeSearchExpression(searchOptions.job_titles.requirements) : "None",
    benefits: decodeSelectString(searchOptions?.benefits || "All"),
    education: decodeDegreePreferences(searchOptions?.education),
    license: decodeKeywords(searchOptions?.license_certification?.keywords || { include: [], exclude: "None" }),
    language: decodeKeywords(searchOptions?.language || { include: [], exclude: "None" }),
    hide_required: (searchOptions?.license_certification?.hide_required ? " Yes" : " No"),
    security: decodeSelectString(searchOptions?.security_clearance || "All"),
    shifts: decodeShiftPreferences(searchOptions?.shift_preferences),
    air_travel: decodeSelectString(searchOptions?.travel_requirements?.air || "All"),
    land_travel: decodeSelectString(searchOptions?.travel_requirements?.land || "All"),
    location: searchOptions?.location?.userLocation?.address?.formatted || "None",
    workplace_type: decodeSelectString(searchOptions?.location?.workplace_type || "All"),
    environment: decodeSelectString(searchOptions?.location?.workplace_activity?.environment || "All"),
    mobility: decodeSelectString(searchOptions?.location?.workplace_activity?.mobility || "All"),
    physical_intensity: decodeSelectString(searchOptions?.location?.workplace_activity?.physical_intensity || "All"),
    cognitive_intensity: decodeSelectString(searchOptions?.location?.workplace_activity?.cognitive_intensity || "All"),
    computer_usage: decodeSelectString(searchOptions?.location?.workplace_activity?.computer_usage || "All"),
    oral_communication: decodeSelectString(searchOptions?.location?.workplace_activity?.oral_communication || "All"),
    company: decodeKeywords(searchOptions?.company || { include: [], exclude: "None" }),
    industry: decodeIndustryOptions(searchOptions?.industry),
    stage_funding: decodeFundingOptions(searchOptions?.stage_funding),
    size: decodeSizeOptions(searchOptions?.size),
    founding_year: decodeRangeString(searchOptions?.founding_year || { min: 0, max: 0 }, false),
  }
  
  const generalItems: FilterItemProps[] = [
    {
      label: "Jobs from the past",
      value: decodedState.date_range,
      categoryId: "date-range",
      isExtended: extended,
      isImportant: true,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Sort by",
      value: decodedState.sort,
      categoryId: "sorting",
      isExtended: extended,
      isImportant: true,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Apply Form Type",
      value: decodedState.apply_form,
      categoryId: "apply-form",
      isExtended: extended,
      isImportant: true,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluding",
      value: decodedState.exclusion,
      categoryId: "exclusion",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Encouraged to Apply",
      value: decodedState.encouraged,
      categoryId: "encouraged",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const compensationItems: FilterItemProps[] = [
    {
      label: "Salary",
      value: decodedState.salary,
      categoryId: "salary",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Commitment",
      value: decodedState.commitment,
      categoryId: "commitment",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Experience",
      value: decodedState.experience,
      categoryId: "experience",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Benefits & Perks",
      value: decodedState.benefits || "None",
      categoryId: "benefits",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const roleDepartmentItems: FilterItemProps[] = [
    {
      label: "Departments",
      value: decodedState.departments,
      categoryId: "departments",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Job Title Keywords",
      value: decodedState.job_titles || "None",
      categoryId: "job-titles",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Job Technical Keywords",
      value: decodedState.job_keywords || "None",
      categoryId: "job-titles",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Job Description Keywords",
      value: decodedState.job_description || "None",
      categoryId: "job-titles",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Job Requirements Keywords",
      value: decodedState.job_requirements || "None",
      categoryId: "job-titles",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const qualificationsItems: FilterItemProps[] = [
    {
      label: "Associate Degree Preferences",
      value: decodedState.education.associate.preferences,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Associate Degree Keywords",
      value: decodedState.education.associate.include,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Associate Degree Keywords",
      value: decodedState.education.associate.exclude,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Bachelor Degree Preferences",
      value: decodedState.education.bachelor.preferences,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Bachelor Degree Keywords",
      value: decodedState.education.bachelor.include,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Bachelor Degree Keywords",
      value: decodedState.education.bachelor.exclude,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Master Degree Preferences",
      value: decodedState.education.master.preferences,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Master Degree Keywords",
      value: decodedState.education.master.include,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Master Degree Keywords",
      value: decodedState.education.master.exclude,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Doctorate Degree Preferences",
      value: decodedState.education.doctorate.preferences,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Doctorate Degree Keywords",
      value: decodedState.education.doctorate.include,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Doctorate Degree Keywords",
      value: decodedState.education.doctorate.exclude,
      categoryId: "education",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included License Keywords",
      value: decodedState.license.include,
      categoryId: "licenses",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded License Keywords",
      value: decodedState.license.exclude,
      categoryId: "licenses",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Hide Required Licenses",
      value: decodedState.hide_required,
      categoryId: "licenses",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Security Clearance",
      value: decodedState.security,
      categoryId: "security",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Language Keywords",
      value: decodedState.language.include,
      categoryId: "languages",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Language Keywords",
      value: decodedState.language.exclude,
      categoryId: "languages",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const availabilityItems: FilterItemProps[] = [
    {
      label: "Morning Shift Preferences",
      value: decodedState.shifts.morning,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Afternoon Shift Preferences",
      value: decodedState.shifts.afternoon,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Evening Shift Preferences",
      value: decodedState.shifts.night,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Weekend Shift Preferences",
      value: decodedState.shifts.weekend,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Holiday Shift Preferences",
      value: decodedState.shifts.holiday,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Overtime Shift Preferences",
      value: decodedState.shifts.overtime,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "On-Call Shift Preferences",
      value: decodedState.shifts.oncall,
      categoryId: "shifts",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Air Travel Preferences",
      value: decodedState.air_travel,
      categoryId: "travel",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Land Travel Preferences",
      value: decodedState.land_travel,
      categoryId: "travel",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const locationItems: FilterItemProps[] = [
    {
      label: "Location",
      value: decodedState.location,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Workplace Type",
      value: decodedState.workplace_type,
      categoryId: "workplace-activity",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Workplace Environment",
      value: decodedState.environment,
      categoryId: "workplace-activity",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Mobility Requirements",
      value: decodedState.mobility,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Physical Intensity Requirements",
      value: decodedState.physical_intensity,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Cognitive Intensity Requirements",
      value: decodedState.cognitive_intensity,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Computer Usage Requirements",
      value: decodedState.computer_usage,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Oral Communication Requirements",
      value: decodedState.oral_communication,
      categoryId: "location",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const companyItems: FilterItemProps[] = [
    {
      label: "Included Company Keywords",
      value: decodedState.company.include,
      categoryId: "company",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Company Keywords",
      value: decodedState.company.exclude,
      categoryId: "company",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Industry Keywords",
      value: decodedState.industry.decoded_industry.include,
      categoryId: "industry",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Industry Keywords",
      value: decodedState.industry.decoded_industry.exclude,
      categoryId: "industry",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Industry Activities",
      value: decodedState.industry.activities.include,
      categoryId: "industry",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Industry Activities",
      value: decodedState.industry.activities.exclude,
      categoryId: "industry",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Show USA Jobs",
      value: decodedState.industry.usa_jobs,
      categoryId: "industry",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Current Stage",
      value: decodedState.stage_funding.current,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Investors",
      value: decodedState.stage_funding.investors.include,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Investors",
      value: decodedState.stage_funding.investors.exclude,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Latest Round",
      value: decodedState.stage_funding.latest_round,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Included Latest Round Type",
      value: decodedState.stage_funding.latest_round_type.include,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Excluded Latest Round Type",
      value: decodedState.stage_funding.latest_round_type.exclude,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Latest Round Amount",
      value: decodedState.stage_funding.latest_round_amount,
      categoryId: "stage",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },
    {
      label: "Size",
      value: decodedState.size,
      categoryId: "size",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    },  
    {
      label: "Founding Year",
      value: decodedState.founding_year,
      categoryId: "founding",
      isExtended: extended,
      handleCategoryClick: handleCategoryClick
    }
  ];

  const sections = [
    { title: "General", items: generalItems, isExtended: extended },
    { title: "Compensation & Levels", items: compensationItems, isExtended: extended },
    { title: "Role & Department", items: roleDepartmentItems, isExtended: extended },
    { title: "Qualifications", items: qualificationsItems, isExtended: extended },
    { title: "Availability", items: availabilityItems, isExtended: extended },
    { title: "Location", items: locationItems, isExtended: extended },
    { title: "Company", items: companyItems, isExtended: extended }
  ];

  const visibleSections = sections.filter(section => {
    const visibleItems = section.items.filter(item => 
      shouldShowFilterItem(item.value, section.isExtended, item.isImportant)
    );
    return visibleItems.length > 0;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 relative rounded-md ">
      
        {visibleSections.map(section => (
          <FilterSection key={section.title} title={section.title} items={section.items} isExtended={section.isExtended} />
        ))}
      
      </div>
      {showButton && (
        <>
          <div className="sticky bottom-4 right-4 flex justify-end z-20">
            <Button
              onClick={() => setExtended(!extended)}
              className="w-fit"
              variant="outline"
            >
              {extended ? "Hide unchanged filters" : "Show unchanged filters"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
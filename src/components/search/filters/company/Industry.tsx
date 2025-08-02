import { useApp } from "@/contexts/AppContext";
import { createIndustryKeywordsHandler, createIndustryProfitHandler, createIndustryUsaJobsHandler, getCompanyActivityOptions, getIndustryOptions } from "@/lib/search";
import { Profit } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

export default function Industry() {
  const { searchOptions, updateSearchOptions } = useApp();
  const profitOptions: Profit[] = ["For-Profit", "Non-Profit"];

  const isProfitSelected = (profit: Profit): boolean => {
    if (searchOptions.industry.profit === "All") return true;
    if (Array.isArray(searchOptions.industry.profit)) {
      return searchOptions.industry.profit.includes(profit);
    }
    return false;
  };

  const handleProfitChange = createIndustryProfitHandler(
    searchOptions.industry,
    updateSearchOptions
  );

  const activities = getCompanyActivityOptions();
  const industries = getIndustryOptions();

  const handleKeywordsChange = createIndustryKeywordsHandler(
    searchOptions.industry,
    updateSearchOptions
  );

  const handleUsaJobsChange = createIndustryUsaJobsHandler(
    searchOptions.industry,
    updateSearchOptions
  );

  return (
    <FilterContainer title="Industry">
      <LabelInputContainer title="Profit" midColCount={2} lgColCount={2}>
        {profitOptions.map((profit) => (
          <LabelCheckbox
            key={profit}
            label={profit}
            checked={isProfitSelected(profit)}
            onChange={() => handleProfitChange(profit)}
          />
        ))}
      </LabelInputContainer>
      <KeywordsMultiSelect
        value={searchOptions.industry.activities}
        onChange={(keywords) => handleKeywordsChange(keywords, "activities")}
        includeOptions={activities}
        excludeOptions={activities}
        includePlaceholder="Include Company Activities"
        excludePlaceholder="Exclude Company Activities"
      />
      <KeywordsMultiSelect
        value={searchOptions.industry.industry}
        onChange={(keywords) => handleKeywordsChange(keywords, "industry")}
        includeOptions={industries}
        excludeOptions={industries}
        includePlaceholder="Include Company Industries"
        excludePlaceholder="Exclude Company Industries"
      />
      <LabelInputContainer title="USA Jobs" midColCount={1} lgColCount={1}>
        <LabelRadio
          label="OK to include jobs from USAJobs.gov"
          checked={searchOptions.industry.usa_jobs === "All"}
          onChange={() => handleUsaJobsChange("All")}
        />
        <LabelRadio
          label="Include only jobs from USAJobs.gov"
          checked={searchOptions.industry.usa_jobs === "Only"}
          onChange={() => handleUsaJobsChange("Only")}
        />
        <LabelRadio
          label="Do not include any jobs from USAJobs.gov"
          checked={searchOptions.industry.usa_jobs === "No"}
          onChange={() => handleUsaJobsChange("No")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
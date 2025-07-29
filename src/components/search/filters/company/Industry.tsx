import { useApp } from "@/contexts/AppContext";
import { Keywords, Profit, Select, USAJobs } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import { getCompanyActivitiesFromData, getIndustriesFromData } from "@/lib/search";
import { useMemo } from "react";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
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

  const handleProfitChange = (profit: Profit) => {
    const currentProfit = searchOptions.industry.profit;
    let newProfit: Select<Profit, "All">;
    
    if (currentProfit === "All") {
      const allExceptSelected = profitOptions.filter(item => item !== profit);
      newProfit = allExceptSelected;
    } else if (Array.isArray(currentProfit)) {
      if (currentProfit.includes(profit)) {
        const filtered = currentProfit.filter(item => item !== profit);
        newProfit = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentProfit, profit];
        newProfit = added.length === profitOptions.length ? "All" : added;
      }
    } else {
      newProfit = [profit];
    }
    
    updateSearchOptions({ 
      industry: { 
        ...searchOptions.industry, 
        profit: newProfit 
      } 
    });
  };

  const activities = useMemo(() => {
    return getCompanyActivitiesFromData().map(activity => ({
      label: activity,
      value: activity
    }));
  }, []);

  const industries = useMemo(() => {
    return getIndustriesFromData().map(industry => ({
      label: industry,
      value: industry
    }));
  }, []);

  const handleKeywordsChange = (keywords: Keywords, id: "activities" | "industry") => {
    updateSearchOptions({
      [id]: keywords,
    });
  };

  const handleUsaJobsChange = (usaJobs: USAJobs) => {
    updateSearchOptions({
      industry: {
        ...searchOptions.industry,
        usa_jobs: usaJobs
      }
    });
  };

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
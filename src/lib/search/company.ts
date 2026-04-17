import { CurrentStage, FundingOptions, IndustryOptions, InfiniteRange, Keywords, Profit, SearchState, Select, USAJobs } from '../../types/search';
import { createRadioHandler, createSelectHandler } from './handlers';
import { createRangeHandler } from './index';

export function createCompanyHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (companies: Keywords) => {
    updateSearchOptions({
      company: companies,
    });
  };
}

export const getCurrentYear = () => {
  return new Date().getFullYear();
}

export function createFoundingYearHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return createRangeHandler(updateSearchOptions, "founding_year");
}

// Size handlers

export function getSizeRanges(): Array<{ label: string; range: InfiniteRange }> {
  return [
    { label: "1-10", range: { min: 1, max: 10 } },
    { label: "11-50", range: { min: 11, max: 50 } },
    { label: "51-200", range: { min: 51, max: 200 } },
    { label: "201-500", range: { min: 201, max: 500 } },
    { label: "501-1000", range: { min: 501, max: 1000 } },
    { label: "1001-2000", range: { min: 1001, max: 2000 } },
    { label: "2001-5000", range: { min: 2001, max: 5000 } },
    { label: "5001-10000", range: { min: 5001, max: 10000 } },
    { label: "10000+", range: { min: 10001, max: null } },
  ];
}

export function createSizeHandler(
  currentSize: Select<InfiniteRange, "All">,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (range: InfiniteRange) => {
    let newSize: Select<InfiniteRange, "All">;
    
    const allRanges: InfiniteRange[] = getSizeRanges().map(item => item.range);
    
    if (currentSize === "All") {
      const allExceptSelected = allRanges.filter(item => 
        !(item.min === range.min && item.max === range.max)
      );
      newSize = allExceptSelected;
    } else if (Array.isArray(currentSize)) {
      if (currentSize.some(selectedRange => 
        selectedRange.min === range.min && selectedRange.max === range.max
      )) {
        const filtered = currentSize.filter(selectedRange => 
          !(selectedRange.min === range.min && selectedRange.max === range.max)
        );
        newSize = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentSize, range];
        newSize = added.length === allRanges.length ? "All" : added;
      }
    } else {
      newSize = [range];
    }
    
    updateSearchOptions({ size: newSize });
  };
}

export function createIndustryHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords, field: 'activities' | 'industry') => {
    updateSearchOptions({
      industry: {
        ...currentIndustry,
        [field]: keywords
      }
    });
  };
}

export function createIndustryProfitHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (profit: Profit) => {
    const profitOptions: Profit[] = ["For-Profit", "Non-Profit"];
    let newProfit: Select<Profit, "All">;
    
    if (currentIndustry.profit === "All") {
      const allExceptSelected = profitOptions.filter(item => item !== profit);
      newProfit = allExceptSelected;
    } else if (Array.isArray(currentIndustry.profit)) {
      if (currentIndustry.profit.includes(profit)) {
        const filtered = currentIndustry.profit.filter(item => item !== profit);
        newProfit = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentIndustry.profit, profit];
        newProfit = added.length === profitOptions.length ? "All" : added;
      }
    } else {
      newProfit = [profit];
    }
    
    updateSearchOptions({ 
      industry: { 
        ...currentIndustry, 
        profit: newProfit 
      } 
    });
  };
}

export function createIndustryKeywordsHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords, field: 'activities' | 'industry') => {
    updateSearchOptions({
      industry: {
        ...currentIndustry,
        [field]: keywords
      }
    });
  };
}

export function createIndustryUsaJobsHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return createRadioHandler<USAJobs>(updateSearchOptions, "industry.usa_jobs");
}

export function createStageFundingHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords, field: 'investors' | 'latest_round_type') => {
    updateSearchOptions({
      stage_funding: {
        ...currentStageFunding,
        [field]: keywords
      }
    });
  };
}

export function createStageFundingCurrentHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  const stagesOptions: CurrentStage[] = ["Public", "Private"];
  return createSelectHandler(currentStageFunding.current, stagesOptions, updateSearchOptions, "stage_funding.current");
}

export function createStageFundingRangeHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (field: 'latest_round' | 'latest_round_amount', [min, max]: [number, number]) => {
    return createRangeHandler(updateSearchOptions, `stage_funding.${field}`)([min, max]);
  };
}
import { Benefits, BenefitsOptions, Encouraged, EncouragedOptions, SearchState } from '../../types/search';

export function createBenefitsHandler(
  currentBenefits: BenefitsOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  // const allBenefits: Benefits[] = ["PTO", "4 Days", "401k", "Parental Leave", "Retirement", "Tuition", "Visa", "Relocation"];
  return (benefit: Benefits) => {
    const newBenefits = currentBenefits?.includes(benefit)
      ? currentBenefits.filter(item => item !== benefit)
      : [...(currentBenefits || []), benefit];
    
    updateSearchOptions({ benefits: newBenefits });
  };
}

export function createEncouragedHandler(
  currentEncouraged: EncouragedOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  // const allEncouraged: Encouraged[] = ["Veteran", "Fair Chance"];
  return (encouraged: Encouraged) => {
    const newEncouraged = currentEncouraged?.includes(encouraged)
      ? currentEncouraged.filter(item => item !== encouraged)
      : [...(currentEncouraged || []), encouraged];
    
    updateSearchOptions({ encouraged: newEncouraged });
  };
}



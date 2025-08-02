import { Benefits, BenefitsOptions, Department, DepartmentOptions, Encouraged, EncouragedOptions, SearchState } from '../../types/search';

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

export function createDepartmentHandler(
  currentDepartments: DepartmentOptions,
  allDepartments: Department[],
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (department: Department) => {
    let currentDepartmentsArray: Department[] = [];
    
    if (currentDepartments === "All") {
      currentDepartmentsArray = allDepartments.filter(item => item !== department);
    } else if (Array.isArray(currentDepartments)) {
      currentDepartmentsArray = [...currentDepartments];
    }
    
    let newDepartments: DepartmentOptions;
    
    if (currentDepartments === "All") {
      newDepartments = currentDepartmentsArray;
    } else if (currentDepartmentsArray.includes(department)) {
      const filtered = currentDepartmentsArray.filter(item => item !== department);
      newDepartments = filtered.length === 0 ? [] : filtered;
    } else {
      const added = [...currentDepartmentsArray, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }
    
    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }
    
    updateSearchOptions({ department: newDepartments });
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



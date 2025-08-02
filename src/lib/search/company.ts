import { Keywords, SearchState } from '../../types/search';
import { getCompaniesFromData } from './index';

export function createCompanyHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (companies: Keywords) => {
    updateSearchOptions({
      company: companies,
    });
  };
}

export function getCompanyOptions() {
  return getCompaniesFromData().map(company => ({
    label: company,
    value: company,
  }));
}

import { Keywords, LicenseCertificationOptions, SearchState } from "@/types/search";

export function createKeywordsHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (keywords: Keywords) => {
    updateSearchOptions({ [path]: keywords } as Partial<SearchState>);
  };
}

export function createLicenseCertificationHandler(
  currentLicenseCertification: LicenseCertificationOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords) => {
    updateSearchOptions({
      license_certification: {
        keywords,
        hide_required: currentLicenseCertification.hide_required
      }
    });
  };
}

export function createLicenseCertificationHideRequiredHandler(
  currentLicenseCertification: LicenseCertificationOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (checked: boolean | "indeterminate") => {
    updateSearchOptions({
      license_certification: {
        keywords: currentLicenseCertification.keywords,
        hide_required: Boolean(checked)
      }
    });
  };
}

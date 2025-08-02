import { DegreePreferences, DegreePreferencesOptions, Keywords, SearchState, Select } from '../../types/search';

export function createEducationPreferenceHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentPreferences = currentEducation[degreeType].preferences;
    
    let newPreferences: Select<DegreePreferences, null>;
    
    if (Array.isArray(currentPreferences)) {
      if (currentPreferences.includes(preference)) {
        const filtered = currentPreferences.filter(p => p !== preference);
        newPreferences = filtered.length > 0 ? filtered : null;
      } else {
        newPreferences = [...currentPreferences, preference];
      }
    } else {
      newPreferences = [preference];
    }
    
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          preferences: newPreferences
        }
      }
    });
  };
}

export function createEducationKeywordsHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', keywords: Keywords) => {
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          keywords
        }
      }
    });
  };
}

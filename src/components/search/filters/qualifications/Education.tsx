import { useApp } from "@/contexts/AppContext";
import { getDegreeTitlesFromData } from "@/lib/search";
import { DegreePreferences, Keywords, Select } from "@/types/search";
import { useMemo } from "react";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox, { LabelCheckboxContainer } from "../util/LabelCheckbox";

export default function Education() {
  const { searchOptions, updateSearchOptions } = useApp();

  const degreeTitles = useMemo(() => {
    const titles = getDegreeTitlesFromData();
    return titles.map(title => ({
      label: title,
      value: title
    }));
  }, []);

  const handlePreferenceChange = (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentEducation = searchOptions.education;
    const currentPreferences = currentEducation[degreeType].preferences;
    
    let newPreferences: Select<DegreePreferences, null>;
    
    if (Array.isArray(currentPreferences)) {
      if (currentPreferences.includes(preference)) {
        // Remove preference if already selected
        const filtered = currentPreferences.filter(p => p !== preference);
        newPreferences = filtered.length > 0 ? filtered : null;
      } else {
        // Add preference if not selected
        newPreferences = [...currentPreferences, preference];
      }
    } else {
      // If null, start with just this preference
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

  const handleKeywordsChange = (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', keywords: Keywords) => {
    const currentEducation = searchOptions.education;
    
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

  const isPreferenceSelected = (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentPreferences = searchOptions.education[degreeType].preferences;
    return Array.isArray(currentPreferences) && currentPreferences.includes(preference);
  };

  return (
    <FilterContainer title="Education">
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Associate&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={2} lgColCount={2}>
        <LabelCheckbox 
          label="Required" 
          checked={isPreferenceSelected('associate', "Required")} 
          onChange={() => handlePreferenceChange('associate', "Required")} 
        />
        <LabelCheckbox 
          label="Preferred" 
          checked={isPreferenceSelected('associate', "Preferred")} 
          onChange={() => handlePreferenceChange('associate', "Preferred")} 
        />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect 
        value={searchOptions.education.associate.keywords} 
        onChange={(keywords) => handleKeywordsChange('associate', keywords)} 
        includeOptions={degreeTitles} 
        excludeOptions={degreeTitles} 
      />
      
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Bachelor&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={2} lgColCount={2}>
        <LabelCheckbox 
          label="Required" 
          checked={isPreferenceSelected('bachelor', "Required")} 
          onChange={() => handlePreferenceChange('bachelor', "Required")} 
        />
        <LabelCheckbox 
          label="Preferred" 
          checked={isPreferenceSelected('bachelor', "Preferred")} 
          onChange={() => handlePreferenceChange('bachelor', "Preferred")} 
        />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect 
        value={searchOptions.education.bachelor.keywords} 
        onChange={(keywords) => handleKeywordsChange('bachelor', keywords)} 
        includeOptions={degreeTitles} 
        excludeOptions={degreeTitles} 
      />
      
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Master&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={2} lgColCount={2}>
        <LabelCheckbox 
          label="Required" 
          checked={isPreferenceSelected('master', "Required")} 
          onChange={() => handlePreferenceChange('master', "Required")} 
        />
        <LabelCheckbox 
          label="Preferred" 
          checked={isPreferenceSelected('master', "Preferred")} 
          onChange={() => handlePreferenceChange('master', "Preferred")} 
        />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect 
        value={searchOptions.education.master.keywords} 
        onChange={(keywords) => handleKeywordsChange('master', keywords)} 
        includeOptions={degreeTitles} 
        excludeOptions={degreeTitles} 
      />
      
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        PhD
      </p>
      <LabelCheckboxContainer midColCount={2} lgColCount={2}>
        <LabelCheckbox 
          label="Required" 
          checked={isPreferenceSelected('doctorate', "Required")} 
          onChange={() => handlePreferenceChange('doctorate', "Required")} 
        />
        <LabelCheckbox 
          label="Preferred" 
          checked={isPreferenceSelected('doctorate', "Preferred")} 
          onChange={() => handlePreferenceChange('doctorate', "Preferred")} 
        />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect 
        value={searchOptions.education.doctorate.keywords} 
        onChange={(keywords) => handleKeywordsChange('doctorate', keywords)} 
        includeOptions={degreeTitles} 
        excludeOptions={degreeTitles} 
      />
    </FilterContainer>
  );
} 
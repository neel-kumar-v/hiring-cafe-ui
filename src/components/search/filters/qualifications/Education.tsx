import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/contexts/AppContext";
import { createEducationKeywordsHandler, createEducationPreferenceHandler } from "@/lib/search";
import { DegreePreferences } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import { useSearchData } from "@/hooks/useSearchData";

export default function Education() {
  const { searchOptions, updateSearchOptions } = useApp();

  const { options: degreeTitles, loading } = useSearchData("bachelors_degree_titles", true);

  const handlePreferenceChange = createEducationPreferenceHandler(
    searchOptions.education,
    updateSearchOptions
  );

  const handleKeywordsChange = createEducationKeywordsHandler(
    searchOptions.education,
    updateSearchOptions
  );

  const isPreferenceSelected = (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentPreferences = searchOptions.education[degreeType].preferences;
    return Array.isArray(currentPreferences) && currentPreferences.includes(preference);
  };

  return (
    <FilterContainer categoryId="education" title="Education">
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading degree titles...</div>
      ) : (
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="associate" className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out">
          <AccordionTrigger className="text-base font-medium">
            Associate&apos;s Degree
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2 pb-4">
            <LabelInputContainer midColCount={4} lgColCount={4}>
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
              <LabelCheckbox 
                label="Not Mentioned" 
                checked={isPreferenceSelected('associate', "Not Mentioned")} 
                onChange={() => handlePreferenceChange('associate', "Not Mentioned")} 
                className="md:col-span-2"
              />
            </LabelInputContainer>
            <KeywordsMultiSelect 
              value={searchOptions.education.associate.keywords} 
              onChange={(keywords) => handleKeywordsChange('associate', keywords)} 
              includeOptions={degreeTitles} 
              excludeOptions={degreeTitles} 
              includePlaceholder="Include Degree Titles"
              excludePlaceholder="Exclude Degree Titles"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bachelor" className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out">
          <AccordionTrigger className="text-base font-medium">
            Bachelor&apos;s Degree
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2 pb-4">
            <LabelInputContainer midColCount={4} lgColCount={4}>
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
              <LabelCheckbox 
                label="Not Mentioned" 
                checked={isPreferenceSelected('bachelor', "Not Mentioned")} 
                onChange={() => handlePreferenceChange('bachelor', "Not Mentioned")} 
                className="md:col-span-2"
              />
            </LabelInputContainer>
            <KeywordsMultiSelect 
              value={searchOptions.education.bachelor.keywords} 
              onChange={(keywords) => handleKeywordsChange('bachelor', keywords)} 
              includeOptions={degreeTitles} 
              excludeOptions={degreeTitles}
              includePlaceholder="Include Degree Titles"
              excludePlaceholder="Exclude Degree Titles"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="master" className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out">
          <AccordionTrigger className="text-base font-medium">
            Master&apos;s Degree
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2 pb-4">
            <LabelInputContainer midColCount={4} lgColCount={4}>
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
              <LabelCheckbox 
                label="Not Mentioned" 
                checked={isPreferenceSelected('master', "Not Mentioned")} 
                onChange={() => handlePreferenceChange('master', "Not Mentioned")} 
                className="md:col-span-2"
              />
            </LabelInputContainer>
            <KeywordsMultiSelect 
              value={searchOptions.education.master.keywords} 
              onChange={(keywords) => handleKeywordsChange('master', keywords)} 
              includeOptions={degreeTitles} 
              excludeOptions={degreeTitles} 
              includePlaceholder="Include Degree Titles"
              excludePlaceholder="Exclude Degree Titles"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="doctorate" className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out">
          <AccordionTrigger className="text-base font-medium">
            PhD
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2 pb-4">
            <LabelInputContainer midColCount={4} lgColCount={4}>
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
              <LabelCheckbox 
                label="Not Mentioned" 
                checked={isPreferenceSelected('doctorate', "Not Mentioned")} 
                onChange={() => handlePreferenceChange('doctorate', "Not Mentioned")} 
                className="md:col-span-2"
              />
            </LabelInputContainer>
            <KeywordsMultiSelect 
              value={searchOptions.education.doctorate.keywords} 
              onChange={(keywords) => handleKeywordsChange('doctorate', keywords)} 
              includeOptions={degreeTitles} 
              excludeOptions={degreeTitles} 
              includePlaceholder="Include Degree Titles"
              excludePlaceholder="Exclude Degree Titles"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      )}
    </FilterContainer>
  );
} 

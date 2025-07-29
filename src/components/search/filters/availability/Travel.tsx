import { useApp } from "@/contexts/AppContext";
import { createNestedSelectHandler } from "@/lib/search";
import { TravelRequirements } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Travel() {
  const { searchOptions, updateSearchOptions } = useApp();

  const allTravelRequirements: TravelRequirements[] = ["None", "Minimum", "Moderate", "Extensive"];

  const handleAirTravelCheckboxChange = createNestedSelectHandler(
    searchOptions.travel_requirements,
    allTravelRequirements,
    updateSearchOptions,
    "travel_requirements",
    "air"
  );

  const handleLandTravelCheckboxChange = createNestedSelectHandler(
    searchOptions.travel_requirements,
    allTravelRequirements,
    updateSearchOptions,
    "travel_requirements",
    "land"
  );

  return (
    <FilterContainer title="Travel Requirements">
      <LabelInputContainer title="Air Travel" midColCount={2} lgColCount={2}>
        {allTravelRequirements.map((requirement) => (
          <LabelCheckbox
            key={requirement}
            label={requirement}
            checked={searchOptions.travel_requirements.air.includes(requirement) || searchOptions.travel_requirements.air === "All"}
            onChange={() => handleAirTravelCheckboxChange(requirement)}
          />
        ))}
      </LabelInputContainer>
      <LabelInputContainer title="Land Travel" midColCount={2} lgColCount={2}>
        {allTravelRequirements.map((requirement) => (
          <LabelCheckbox
            key={requirement}
            label={requirement}
            checked={searchOptions.travel_requirements.land.includes(requirement) || searchOptions.travel_requirements.land === "All"}
            onChange={() => handleLandTravelCheckboxChange(requirement)}
          />
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
} 
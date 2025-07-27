import { useApp } from "@/contexts/AppContext";
import { Select, type TravelRequirements } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Travel() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleTravelCheckboxChange = (travelType: 'air' | 'land', requirement: TravelRequirements) => {
    const currentTravel = searchOptions.travel_requirements[travelType];
    let newTravel: Select<TravelRequirements>;

    const allTravelRequirements: TravelRequirements[] = ["None", "Minimum", "Moderate", "Extensive"];

    if (!Array.isArray(currentTravel)) {
      const allExceptSelected = allTravelRequirements.filter(item => item !== requirement);
      newTravel = allExceptSelected;
    } else if (currentTravel.includes(requirement)) {
      const filtered = currentTravel.filter(item => item !== requirement);
      newTravel = filtered.length === 0 ? "All" : filtered;
    } else {
      newTravel = [...currentTravel, requirement];
      if (newTravel.length === allTravelRequirements.length) newTravel = "All";
    }

    updateSearchOptions({
      travel_requirements: {
        ...searchOptions.travel_requirements,
        [travelType]: newTravel
      }
    });
  };

  return (
    <FilterContainer title="Travel Requirement">
      <LabelInputContainer title="Air">
        <LabelCheckbox 
          label="None" 
          checked={Array.isArray(searchOptions.travel_requirements.air) ? searchOptions.travel_requirements.air.includes("None") : searchOptions.travel_requirements.air === "All"} 
          onChange={() => handleTravelCheckboxChange("air", "None")}
        />
        <LabelCheckbox 
          label="Minimum" 
          checked={Array.isArray(searchOptions.travel_requirements.air) ? searchOptions.travel_requirements.air.includes("Minimum") : searchOptions.travel_requirements.air === "All"} 
          onChange={() => handleTravelCheckboxChange("air", "Minimum")}
        />
        <LabelCheckbox 
          label="Moderate" 
          checked={Array.isArray(searchOptions.travel_requirements.air) ? searchOptions.travel_requirements.air.includes("Moderate") : searchOptions.travel_requirements.air === "All"} 
          onChange={() => handleTravelCheckboxChange("air", "Moderate")}
        />
        <LabelCheckbox 
          label="Extensive" 
          checked={Array.isArray(searchOptions.travel_requirements.air) ? searchOptions.travel_requirements.air.includes("Extensive") : searchOptions.travel_requirements.air === "All"} 
          onChange={() => handleTravelCheckboxChange("air", "Extensive")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Land">
        <LabelCheckbox 
          label="None" 
          checked={Array.isArray(searchOptions.travel_requirements.land) ? searchOptions.travel_requirements.land.includes("None") : searchOptions.travel_requirements.land === "All"} 
          onChange={() => handleTravelCheckboxChange("land", "None")}
        />
        <LabelCheckbox 
          label="Minimum" 
          checked={Array.isArray(searchOptions.travel_requirements.land) ? searchOptions.travel_requirements.land.includes("Minimum") : searchOptions.travel_requirements.land === "All"} 
          onChange={() => handleTravelCheckboxChange("land", "Minimum")}
        />
        <LabelCheckbox 
          label="Moderate" 
          checked={Array.isArray(searchOptions.travel_requirements.land) ? searchOptions.travel_requirements.land.includes("Moderate") : searchOptions.travel_requirements.land === "All"} 
          onChange={() => handleTravelCheckboxChange("land", "Moderate")}
        />
        <LabelCheckbox 
          label="Extensive" 
          checked={Array.isArray(searchOptions.travel_requirements.land) ? searchOptions.travel_requirements.land.includes("Extensive") : searchOptions.travel_requirements.land === "All"} 
          onChange={() => handleTravelCheckboxChange("land", "Extensive")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
import { useApp } from "@/contexts/AppContext";
import { createWorkplaceActivityHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function WorkplaceActivity() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleWorkplaceActivityChange = createWorkplaceActivityHandler(
    searchOptions.location,
    updateSearchOptions
  );

  return (
    <FilterContainer categoryId="workplace-activity" title="Workplace Activity">
      <LabelInputContainer title="Physical Position">
        <LabelCheckbox 
          label="Sitting / Desk Jobs" 
          checked={Array.isArray(searchOptions.location.workplace_activity.mobility) ? searchOptions.location.workplace_activity.mobility.includes("Sitting") : searchOptions.location.workplace_activity.mobility === "All"} 
          onChange={() => handleWorkplaceActivityChange("mobility", "Sitting")}
        />
        <LabelCheckbox 
          label="Active" 
          checked={Array.isArray(searchOptions.location.workplace_activity.mobility) ? searchOptions.location.workplace_activity.mobility.includes("Active") : searchOptions.location.workplace_activity.mobility === "All"} 
          onChange={() => handleWorkplaceActivityChange("mobility", "Active")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Environment" midColCount={4}>
        <LabelCheckbox 
          label="Office" 
          checked={Array.isArray(searchOptions.location.workplace_activity.environment) ? searchOptions.location.workplace_activity.environment.includes("Office") : searchOptions.location.workplace_activity.environment === "All"} 
          onChange={() => handleWorkplaceActivityChange("environment", "Office")}
        />
        <LabelCheckbox 
          label="Outdoor" 
          checked={Array.isArray(searchOptions.location.workplace_activity.environment) ? searchOptions.location.workplace_activity.environment.includes("Outdoor") : searchOptions.location.workplace_activity.environment === "All"} 
          onChange={() => handleWorkplaceActivityChange("environment", "Outdoor")}
        />  
        <LabelCheckbox 
          label="Vehicle" 
          checked={Array.isArray(searchOptions.location.workplace_activity.environment) ? searchOptions.location.workplace_activity.environment.includes("Vehicle") : searchOptions.location.workplace_activity.environment === "All"} 
          onChange={() => handleWorkplaceActivityChange("environment", "Vehicle")}
        />
        <LabelCheckbox 
          label="Industrial" 
          checked={Array.isArray(searchOptions.location.workplace_activity.environment) ? searchOptions.location.workplace_activity.environment.includes("Industrial") : searchOptions.location.workplace_activity.environment === "All"} 
          onChange={() => handleWorkplaceActivityChange("environment", "Industrial")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Physical Intensity" midColCount={3}>
        <LabelCheckbox 
          label="Low" 
          checked={Array.isArray(searchOptions.location.workplace_activity.physical_intensity) ? searchOptions.location.workplace_activity.physical_intensity.includes("Low") : searchOptions.location.workplace_activity.physical_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("physical_intensity", "Low")}
        />
        <LabelCheckbox 
          label="Medium" 
          checked={Array.isArray(searchOptions.location.workplace_activity.physical_intensity) ? searchOptions.location.workplace_activity.physical_intensity.includes("Medium") : searchOptions.location.workplace_activity.physical_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("physical_intensity", "Medium")}
        />
        <LabelCheckbox 
          label="High" 
          checked={Array.isArray(searchOptions.location.workplace_activity.physical_intensity) ? searchOptions.location.workplace_activity.physical_intensity.includes("High") : searchOptions.location.workplace_activity.physical_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("physical_intensity", "High")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Cognitive Intensity" midColCount={3}>
        <LabelCheckbox 
          label="Low" 
          checked={Array.isArray(searchOptions.location.workplace_activity.cognitive_intensity) ? searchOptions.location.workplace_activity.cognitive_intensity.includes("Low") : searchOptions.location.workplace_activity.cognitive_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("cognitive_intensity", "Low")}
        />
        <LabelCheckbox 
          label="Medium" 
          checked={Array.isArray(searchOptions.location.workplace_activity.cognitive_intensity) ? searchOptions.location.workplace_activity.cognitive_intensity.includes("Medium") : searchOptions.location.workplace_activity.cognitive_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("cognitive_intensity", "Medium")}
        />
        <LabelCheckbox 
          label="High" 
          checked={Array.isArray(searchOptions.location.workplace_activity.cognitive_intensity) ? searchOptions.location.workplace_activity.cognitive_intensity.includes("High") : searchOptions.location.workplace_activity.cognitive_intensity === "All"} 
          onChange={() => handleWorkplaceActivityChange("cognitive_intensity", "High")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Computer Usage" midColCount={3}>
        <LabelCheckbox 
          label="Low" 
          checked={Array.isArray(searchOptions.location.workplace_activity.computer_usage) ? searchOptions.location.workplace_activity.computer_usage.includes("Low") : searchOptions.location.workplace_activity.computer_usage === "All"} 
          onChange={() => handleWorkplaceActivityChange("computer_usage", "Low")}
        />
        <LabelCheckbox 
          label="Medium" 
          checked={Array.isArray(searchOptions.location.workplace_activity.computer_usage) ? searchOptions.location.workplace_activity.computer_usage.includes("Medium") : searchOptions.location.workplace_activity.computer_usage === "All"} 
          onChange={() => handleWorkplaceActivityChange("computer_usage", "Medium")}
        />
        <LabelCheckbox 
          label="High" 
          checked={Array.isArray(searchOptions.location.workplace_activity.computer_usage) ? searchOptions.location.workplace_activity.computer_usage.includes("High") : searchOptions.location.workplace_activity.computer_usage === "All"} 
          onChange={() => handleWorkplaceActivityChange("computer_usage", "High")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Oral Communication" midColCount={3}>
        <LabelCheckbox 
          label="Low" 
          checked={Array.isArray(searchOptions.location.workplace_activity.oral_communication) ? searchOptions.location.workplace_activity.oral_communication.includes("Low") : searchOptions.location.workplace_activity.oral_communication === "All"} 
          onChange={() => handleWorkplaceActivityChange("oral_communication", "Low")}
        />
        <LabelCheckbox 
          label="Medium" 
          checked={Array.isArray(searchOptions.location.workplace_activity.oral_communication) ? searchOptions.location.workplace_activity.oral_communication.includes("Medium") : searchOptions.location.workplace_activity.oral_communication === "All"} 
          onChange={() => handleWorkplaceActivityChange("oral_communication", "Medium")}
        />
        <LabelCheckbox 
          label="High" 
          checked={Array.isArray(searchOptions.location.workplace_activity.oral_communication) ? searchOptions.location.workplace_activity.oral_communication.includes("High") : searchOptions.location.workplace_activity.oral_communication === "All"} 
          onChange={() => handleWorkplaceActivityChange("oral_communication", "High")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 

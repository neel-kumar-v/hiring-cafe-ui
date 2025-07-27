import { useApp } from "@/contexts/AppContext";
import { Select, type Intensity, type Mobility } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function WorkplaceActivity() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleWorkplaceActivityChange = (activityType: 'mobility' | 'physical_intensity' | 'cognitive_intensity' | 'computer_usage' | 'oral_communication', value: Intensity | Mobility) => {
    const currentActivity = searchOptions.location.workplace_activity[activityType];
    let newActivity: Select<Intensity | Mobility>;

    if (activityType === 'mobility') {
      const allMobilityValues: Mobility[] = ["Sitting", "Active"];
      if (!Array.isArray(currentActivity)) {
        const allExceptSelected = allMobilityValues.filter(item => item !== value);
        newActivity = allExceptSelected;
      } else {
        const currentArray = currentActivity as Mobility[];
        if (currentArray.includes(value as Mobility)) {
          const filtered = currentArray.filter(item => item !== value);
          newActivity = filtered.length === 0 ? "All" : filtered;
        } else {
          newActivity = [...currentArray, value as Mobility];
          if (newActivity.length === allMobilityValues.length) newActivity = "All";
        }
      }
    } else {
      const allIntensityValues: Intensity[] = ["Low", "Medium", "High"];
      if (!Array.isArray(currentActivity)) {
        const allExceptSelected = allIntensityValues.filter(item => item !== value);
        newActivity = allExceptSelected;
      } else {
        const currentArray = currentActivity as Intensity[];
        if (currentArray.includes(value as Intensity)) {
          const filtered = currentArray.filter(item => item !== value);
          newActivity = filtered.length === 0 ? "All" : filtered;
        } else {
          newActivity = [...currentArray, value as Intensity];
          if (newActivity.length === allIntensityValues.length) newActivity = "All";
        }
      }
    }

    updateSearchOptions({
      location: {
        ...searchOptions.location,
        workplace_activity: {
          ...searchOptions.location.workplace_activity,
          [activityType]: newActivity
        }
      }
    });
  };

  return (
    <FilterContainer title="Workplace Activity">
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
      <LabelInputContainer title="Physical Intensity">
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
      <LabelInputContainer title="Cognitive Intensity">
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
      <LabelInputContainer title="Computer Usage">
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
      <LabelInputContainer title="Oral Communication">
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
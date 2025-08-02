import { useApp } from "@/contexts/AppContext";
import { createAvailabilityRadioHandler, createOncallCheckboxHandler, createShiftCheckboxHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

export default function Shifts() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleShiftCheckboxChange = createShiftCheckboxHandler(
    searchOptions.shift_preferences,
    updateSearchOptions
  );

  const handleAvailabilityRadioChange = createAvailabilityRadioHandler(
    searchOptions.shift_preferences,
    updateSearchOptions
  );

  const handleOncallCheckboxChange = createOncallCheckboxHandler(
    searchOptions.shift_preferences,
    updateSearchOptions
  );

  return (
    <FilterContainer title="Shifts & Schedules">
      <LabelInputContainer title="Morning / Day / First Shift" midColCount={3}>
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Required") : true} 
          onChange={() => handleShiftCheckboxChange("morning", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Optional") : true} 
          onChange={() => handleShiftCheckboxChange("morning", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Not Indicated") : true} 
          onChange={() => handleShiftCheckboxChange("morning", "Not Indicated")}
          className="lg:col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Afternoon / Evening / Second Shift" midColCount={3}>
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Required") : true} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Optional") : true} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Not Indicated") : true} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Not Indicated")}
          className="lg:col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Overnight / Graveyard / Third Shift" midColCount={3}>
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.night) ? searchOptions.shift_preferences.night.includes("Required") : true} 
          onChange={() => handleShiftCheckboxChange("night", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.night) ? searchOptions.shift_preferences.night.includes("Optional") : true} 
          onChange={() => handleShiftCheckboxChange("night", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.night) ? searchOptions.shift_preferences.night.includes("Not Indicated") : true} 
          onChange={() => handleShiftCheckboxChange("night", "Not Indicated")}
          className="lg:col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Weekend" midColCount={3}>
        <LabelRadio 
          label="Required" 
          checked={searchOptions.shift_preferences.weekend === "Required"} 
          onChange={() => handleAvailabilityRadioChange("weekend", "Required")}
        />
        <LabelRadio 
          label="Not Indicated" 
          checked={searchOptions.shift_preferences.weekend === "Not Indicated"} 
          onChange={() => handleAvailabilityRadioChange("weekend", "Not Indicated")}
        />
        <LabelRadio 
          label="None" 
          checked={searchOptions.shift_preferences.weekend === "None"} 
          onChange={() => handleAvailabilityRadioChange("weekend", "None")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Holiday" midColCount={3}>
        <LabelRadio 
          label="Required" 
          checked={searchOptions.shift_preferences.holiday === "Required"} 
          onChange={() => handleAvailabilityRadioChange("holiday", "Required")}
        />
        <LabelRadio 
          label="Not Indicated" 
          checked={searchOptions.shift_preferences.holiday === "Not Indicated"} 
          onChange={() => handleAvailabilityRadioChange("holiday", "Not Indicated")}
        />
        <LabelRadio 
          label="None" 
          checked={searchOptions.shift_preferences.holiday === "None"} 
          onChange={() => handleAvailabilityRadioChange("holiday", "None")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Overtime" midColCount={3}>
        <LabelRadio 
          label="Required" 
          checked={searchOptions.shift_preferences.overtime === "Required"} 
          onChange={() => handleAvailabilityRadioChange("overtime", "Required")}
        />
        <LabelRadio 
          label="Not Indicated" 
          checked={searchOptions.shift_preferences.overtime === "Not Indicated"} 
          onChange={() => handleAvailabilityRadioChange("overtime", "Not Indicated")}
        />
        <LabelRadio 
          label="None" 
          checked={searchOptions.shift_preferences.overtime === "None"} 
          onChange={() => handleAvailabilityRadioChange("overtime", "None")}
        />
      </LabelInputContainer>
      <LabelInputContainer title="Oncall" midColCount={3}>
        <LabelCheckbox 
          label="Regular" 
          checked={Array.isArray(searchOptions.shift_preferences.oncall) ? searchOptions.shift_preferences.oncall.includes("Regular") : searchOptions.shift_preferences.oncall === "All"} 
          onChange={() => handleOncallCheckboxChange("Regular")}
        />
        <LabelCheckbox 
          label="Occasional" 
          checked={Array.isArray(searchOptions.shift_preferences.oncall) ? searchOptions.shift_preferences.oncall.includes("Occasional") : searchOptions.shift_preferences.oncall === "All"} 
          onChange={() => handleOncallCheckboxChange("Occasional")}
        />
        <LabelCheckbox 
          label="None" 
          checked={Array.isArray(searchOptions.shift_preferences.oncall) ? searchOptions.shift_preferences.oncall.includes("None") : searchOptions.shift_preferences.oncall === "All"} 
          onChange={() => handleOncallCheckboxChange("None")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
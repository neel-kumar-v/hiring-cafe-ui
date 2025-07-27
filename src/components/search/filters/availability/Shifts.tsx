import { useApp } from "@/contexts/AppContext";
import { type AvailabilityPreferences, type OncallPreferences, type ShiftPreferences } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

export default function Shifts() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleShiftCheckboxChange = (shiftType: 'morning' | 'afternoon' | 'evening', preference: ShiftPreferences) => {
    const currentShifts = searchOptions.shift_preferences[shiftType];
    let newShifts: ShiftPreferences[] | null;

    if (!Array.isArray(currentShifts)) {
      const allShiftPreferences: ShiftPreferences[] = ["Required", "Optional", "Not Indicated"];
      const allExceptSelected = allShiftPreferences.filter(item => item !== preference);
      newShifts = allExceptSelected;
    } else if (currentShifts.includes(preference)) {
      const filtered = currentShifts.filter(item => item !== preference);
      newShifts = filtered.length === 0 ? null : filtered;
    } else {
      newShifts = [...currentShifts, preference];
      if (newShifts.length === 3) newShifts = null;
    }

    updateSearchOptions({
      shift_preferences: {
        ...searchOptions.shift_preferences,
        [shiftType]: newShifts
      }
    });
  };

  const handleAvailabilityRadioChange = (availabilityType: 'weekend' | 'holiday' | 'overtime', preference: AvailabilityPreferences) => {
    updateSearchOptions({
      shift_preferences: {
        ...searchOptions.shift_preferences,
        [availabilityType]: preference
      }
    });
  };

  const handleOncallCheckboxChange = (preference: OncallPreferences) => {
    const currentOncall = searchOptions.shift_preferences.oncall;
    let newOncall: OncallPreferences[] | "All";

    const allOncallPreferences: OncallPreferences[] = ["Regular", "Occasional", "None"];

    if (!Array.isArray(currentOncall)) {
      const allExceptSelected = allOncallPreferences.filter(item => item !== preference);
      newOncall = allExceptSelected;
    } else if (currentOncall.includes(preference)) {
      const filtered = currentOncall.filter(item => item !== preference);
      newOncall = filtered.length === 0 ? "All" : filtered;
    } else {
      newOncall = [...currentOncall, preference];
      if (newOncall.length === allOncallPreferences.length) newOncall = "All";
    }

    updateSearchOptions({
      shift_preferences: {
        ...searchOptions.shift_preferences,
        oncall: newOncall
      }
    });
  };

  return (
    <FilterContainer title="Shifts & Schedules">
      <LabelInputContainer title="Morning">
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Required") : false} 
          onChange={() => handleShiftCheckboxChange("morning", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Optional") : false} 
          onChange={() => handleShiftCheckboxChange("morning", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.morning) ? searchOptions.shift_preferences.morning.includes("Not Indicated") : false} 
          onChange={() => handleShiftCheckboxChange("morning", "Not Indicated")}
          className="col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Afternoon">
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Required") : false} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Optional") : false} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.afternoon) ? searchOptions.shift_preferences.afternoon.includes("Not Indicated") : false} 
          onChange={() => handleShiftCheckboxChange("afternoon", "Not Indicated")}
          className="col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Evening">
        <LabelCheckbox 
          label="Required" 
          checked={Array.isArray(searchOptions.shift_preferences.evening) ? searchOptions.shift_preferences.evening.includes("Required") : false} 
          onChange={() => handleShiftCheckboxChange("evening", "Required")}
        />
        <LabelCheckbox 
          label="Optional" 
          checked={Array.isArray(searchOptions.shift_preferences.evening) ? searchOptions.shift_preferences.evening.includes("Optional") : false} 
          onChange={() => handleShiftCheckboxChange("evening", "Optional")}
        />
        <LabelCheckbox 
          label="Not Indicated" 
          checked={Array.isArray(searchOptions.shift_preferences.evening) ? searchOptions.shift_preferences.evening.includes("Not Indicated") : false} 
          onChange={() => handleShiftCheckboxChange("evening", "Not Indicated")}
          className="col-span-2"
        />
      </LabelInputContainer>
      <LabelInputContainer title="Weekend">
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
      <LabelInputContainer title="Holiday">
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
      <LabelInputContainer title="Overtime">
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
      <LabelInputContainer title="Oncall">
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
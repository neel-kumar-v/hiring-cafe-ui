import { AvailabilityPreferences, OncallPreferences, SearchState, ShiftPreferences, ShiftPreferencesOptions, Select } from '../../types/search';

export function createNestedSelectHandler<T>(
  currentValue: { [key: string]: Select<T> },
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (item: T) => {
    let newValue: Select<T>;
    
    const currentSelectValue = currentValue[nestedPath];
    
    if (currentSelectValue === "All") {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (Array.isArray(currentSelectValue)) {
      if (currentSelectValue.includes(item)) {
        const filtered = currentSelectValue.filter(option => option !== item);
        newValue = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentSelectValue, item];
        newValue = added.length === allOptions.length ? "All" : added;
      }
    } else {
      newValue = [item];
    }
    
    const nestedUpdate = { [nestedPath]: newValue };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

export function createShiftCheckboxHandler(
  currentShiftPreferences: ShiftPreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (shiftType: 'morning' | 'afternoon' | 'night', preference: ShiftPreferences) => {
    const currentShifts = currentShiftPreferences[shiftType];
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
        ...currentShiftPreferences,
        [shiftType]: newShifts
      }
    });
  };
}

export function createAvailabilityRadioHandler(
  currentShiftPreferences: ShiftPreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (availabilityType: 'weekend' | 'holiday' | 'overtime', preference: AvailabilityPreferences) => {
    updateSearchOptions({
      shift_preferences: {
        ...currentShiftPreferences,
        [availabilityType]: preference
      }
    });
  };
}

export function createOncallCheckboxHandler(
  currentShiftPreferences: ShiftPreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (preference: OncallPreferences) => {
    const currentOncall = currentShiftPreferences.oncall;
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
        ...currentShiftPreferences,
        oncall: newOncall
      }
    });
  };
}

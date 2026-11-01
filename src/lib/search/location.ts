import { AddressComponent, Environment, Intensity, Location, LocationOptions, LocationType, Mobility, SearchState, Select, Workplace } from "../../types/search";

export function isWorkplaceTypeSelected(location: Location, workplaceType: Workplace): boolean {
  if (location.workplace_type === "All") return false;
  if (Array.isArray(location.workplace_type)) {
    return location.workplace_type.includes(workplaceType);
  }
  return location.workplace_type === workplaceType;
}

export function isFlexibleRegionSelected(location: Location, region: LocationType): boolean {
  return location.options?.flexible_regions?.includes(region) || false;
}

export function getCurrentRadius(location: Location): number {
  return location.options?.ignore_radius ? 0 : location.options?.radius || 25;
}

export function getRadiusUnit(location: Location): "Miles" | "Kilometers" {
  return location.options?.radius_unit || "Miles";
}

export function formatRadiusLabel(value: number | undefined, location: Location): string {
  const radius = value ?? getCurrentRadius(location);
  const radiusUnit = getRadiusUnit(location);
  return radius === 0 ? "Exact" : `${radius} ${radiusUnit === "Miles" ? "miles" : "km"}`;
}

export function getLocationLabels(location: Location): { city: string; state: string; country: string; continent: string } {
  const address = location.address;
  const components = address.components || [];

  let city = "";
  let state = "";
  let country = "";
  let continent = "";

  components.forEach((component: AddressComponent) => {
    if (component.types.includes("Locality" as LocationType)) {
      city = component.long_name;
    } else if (component.types.includes("Administrative Area Level 1" as LocationType)) {
      state = component.long_name;
    } else if (component.types.includes("Country" as LocationType)) {
      country = component.long_name;
    } else if (component.types.includes("Continent" as LocationType)) {
      continent = component.long_name;
    }
  });

  // Fallback to parsing from formatted address if components not available
  if (!city && !state && !country) {
    const parts = address.formatted.split(", ");
    if (parts.length >= 2) {
      city = parts[0];
      state = parts[1];
      if (parts.length >= 3) {
        country = parts[2];
      }
    }
  }

  // If we still don't have a city, try to get it from the formatted address
  if (!city) {
    const parts = address.formatted.split(", ");
    // Look for the first part that's not a state or country
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      // Skip if it looks like a state abbreviation or country
      if (part.length <= 3 || part.includes("United States") || part.includes("USA")) {
        continue;
      }
      // Skip if it contains numbers (like zip codes)
      if (/\d/.test(part)) {
        continue;
      }
      city = part;
      break;
    }
  }

  // Set continent based on country if not found
  if (!continent && country) {
    if (country === "United States" || country === "Canada" || country === "Mexico") {
      continent = "North America";
    } else if (country === "United Kingdom" || country === "Germany" || country === "France") {
      continent = "Europe";
    } else if (country === "China" || country === "Japan" || country === "India") {
      continent = "Asia";
    }
    // Add more continent mappings as needed
  }

  return { city, state, country, continent };
}

const ALL_MOBILITY: Mobility[] = ["Sitting", "Active"];
const ALL_ENVIRONMENTS: Environment[] = ["Office", "Outdoor", "Vehicle", "Industrial"];
const ALL_INTENSITIES: Intensity[] = ["Low", "Medium", "High"];

function toggleSelectValue<T extends string>(current: Select<T>, value: T, allValues: readonly T[]): Select<T> {
  if (!Array.isArray(current)) {
    const remaining = allValues.filter((item) => item !== value);
    return remaining.length === 0 || remaining.length === allValues.length ? "All" : remaining;
  }

  if (current.includes(value)) {
    const filtered = current.filter((item) => item !== value);
    return filtered.length === 0 ? "All" : filtered;
  }

  const next = [...current, value];
  return next.length === allValues.length ? "All" : next;
}

export function createWorkplaceActivityHandler(currentLocation: LocationOptions, updateSearchOptions: (updates: Partial<SearchState>) => void) {
  return (
    activityType: "mobility" | "physical_intensity" | "cognitive_intensity" | "computer_usage" | "oral_communication" | "environment",
    value: Mobility | Intensity | Environment
  ) => {
    const currentActivity = currentLocation.workplace_activity[activityType];
    let newActivity: Select<Mobility | Intensity | Environment>;

    if (activityType === "mobility") {
      newActivity = toggleSelectValue(currentActivity as Select<Mobility>, value as Mobility, ALL_MOBILITY);
    } else if (activityType === "environment") {
      newActivity = toggleSelectValue(currentActivity as Select<Environment>, value as Environment, ALL_ENVIRONMENTS);
    } else {
      newActivity = toggleSelectValue(currentActivity as Select<Intensity>, value as Intensity, ALL_INTENSITIES);
    }

    updateSearchOptions({
      location: {
        ...currentLocation,
        workplace_activity: {
          ...currentLocation.workplace_activity,
          [activityType]: newActivity,
        },
      },
    });
  };
}

export function createLocationRadiusHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (radius: number) => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: radius,
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: radius === 0,
        flexible_regions: currentLocation.options?.flexible_regions || [],
      },
    };

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => (index === locationIndex ? updatedLocation : loc)),
      },
    });
  };
}

export function createLocationRadiusUnitHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (unit: "Miles" | "Kilometers") => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: currentLocation.options?.radius || 25,
        radius_unit: unit,
        ignore_radius: currentLocation.options?.ignore_radius || false,
        flexible_regions: currentLocation.options?.flexible_regions || [],
      },
    };

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => (index === locationIndex ? updatedLocation : loc)),
      },
    });
  };
}

export function createLocationIgnoreRadiusHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (ignore: boolean) => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: ignore ? 0 : currentLocation.options?.radius || 25,
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: ignore,
        flexible_regions: currentLocation.options?.flexible_regions || [],
      },
    };

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => (index === locationIndex ? updatedLocation : loc)),
      },
    });
  };
}

export function createLocationWorkplaceTypeHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (workplaceType: Workplace) => {
    let newWorkplaceType: Workplace[] | "All";

    const currentTypes = Array.isArray(currentLocation.workplace_type)
      ? currentLocation.workplace_type
      : currentLocation.workplace_type === "All"
        ? []
        : currentLocation.workplace_type
          ? [currentLocation.workplace_type as Workplace]
          : [];

    if (currentTypes.includes(workplaceType)) {
      const filtered = currentTypes.filter((type) => type !== workplaceType);
      newWorkplaceType = filtered.length > 0 ? filtered : "All";
    } else {
      newWorkplaceType = [...currentTypes, workplaceType];
    }

    const updatedLocation = {
      ...currentLocation,
      workplace_type: newWorkplaceType,
    };

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => (index === locationIndex ? updatedLocation : loc)),
      },
    });
  };
}

export function createLocationFlexibleRegionsHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (region: LocationType) => {
    const currentRegions = currentLocation.options?.flexible_regions || [];
    let newRegions: LocationType[];

    if (currentRegions.includes(region)) {
      newRegions = currentRegions.filter((r) => r !== region);
    } else {
      newRegions = [...currentRegions, region];
    }

    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: currentLocation.options?.radius || 25,
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: currentLocation.options?.ignore_radius || false,
        flexible_regions: newRegions,
      },
    };

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => (index === locationIndex ? updatedLocation : loc)),
      },
    });
  };
}

export function createLocationRemoveHandler(searchState: SearchState, updateSearchOptions: (updates: Partial<SearchState>) => void, locationIndex: number) {
  return () => {
    const updatedLocations = searchState.location.location.filter((_, index) => index !== locationIndex);

    updateSearchOptions({
      location: {
        ...searchState.location,
        location: updatedLocations,
      },
    });
  };
}

export function createLocationsChangeHandler(searchState: SearchState, updateSearchOptions: (updates: Partial<SearchState>) => void) {
  return (locations: Location[]) => {
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: locations,
      },
    });
  };
}

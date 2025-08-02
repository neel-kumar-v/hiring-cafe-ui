import { AddressComponent, Environment, Intensity, Location, LocationOptions, LocationType, Mobility, SearchState, Select, Workplace } from '../../types/search';

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
  return location.options?.ignore_radius ? 0 : (location.options?.radius || 25);
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
  
  let city = '';
  let state = '';
  let country = '';
  let continent = '';
  
  components.forEach((component: AddressComponent) => {
    if (component.types.includes('Locality' as LocationType)) {
      city = component.long_name;
    } else if (component.types.includes('Administrative Area Level 1' as LocationType)) {
      state = component.long_name;
    } else if (component.types.includes('Country' as LocationType)) {
      country = component.long_name;
    } else if (component.types.includes('Continent' as LocationType)) {
      continent = component.long_name;
    }
  });

  // Fallback to parsing from formatted address if components not available
  if (!city && !state && !country) {
    const parts = address.formatted.split(', ');
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
    const parts = address.formatted.split(', ');
    // Look for the first part that's not a state or country
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      // Skip if it looks like a state abbreviation or country
      if (part.length <= 3 || part.includes('United States') || part.includes('USA')) {
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
    if (country === 'United States' || country === 'Canada' || country === 'Mexico') {
      continent = 'North America';
    } else if (country === 'United Kingdom' || country === 'Germany' || country === 'France') {
      continent = 'Europe';
    } else if (country === 'China' || country === 'Japan' || country === 'India') {
      continent = 'Asia';
    }
    // Add more continent mappings as needed
  }

  return { city, state, country, continent };
}

export function createWorkplaceActivityHandler(
  currentLocation: LocationOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (activityType: 'mobility' | 'physical_intensity' | 'cognitive_intensity' | 'computer_usage' | 'oral_communication' | 'environment', value: Mobility | Intensity | Environment) => {
    const currentActivity = currentLocation.workplace_activity[activityType];
    let newActivity: Select<Mobility | Intensity | Environment>;

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
          newActivity = [...currentArray, value];
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
          newActivity = [...currentArray, value];
          if (newActivity.length === allIntensityValues.length) newActivity = "All";
        }
      }
    }

    updateSearchOptions({
      location: {
        ...currentLocation,
        workplace_activity: {
          ...currentLocation.workplace_activity,
          [activityType]: newActivity
        }
      }
    });
  };
}

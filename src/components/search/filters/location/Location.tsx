import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { MultiLocationPicker } from "@/components/ui/multi-location-picker";
import { useApp } from "@/contexts/AppContext";
import { LocationType, Workplace, type AddressComponent, type Location } from "@/types/search";
import { MapPin } from "lucide-react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

interface LocationAccordionProps {
  location: Location;
  onLocationUpdate: (updatedLocation: Location) => void;
  onLocationRemove: (locationId: string) => void;
}

export function LocationAccordion({ location, onLocationUpdate }: LocationAccordionProps) {

  const handleRadiusChange = (radius: number) => {
    onLocationUpdate({
      ...location,
      options: {
        ...location.options,
        radius: radius,
        radius_unit: location.options?.radius_unit || "Miles",
        ignore_radius: radius === 0,
        flexible_regions: location.options?.flexible_regions || []
      }
    });
  };

  const handleRadiusUnitChange = (unit: "Miles" | "Kilometers") => {
    onLocationUpdate({
      ...location,
      options: {
        ...location.options,
        radius: location.options?.radius || 25,
        radius_unit: unit,
        ignore_radius: location.options?.ignore_radius || false,
        flexible_regions: location.options?.flexible_regions || []
      }
    });
  };

  const handleIgnoreRadiusChange = (ignore: boolean) => {
    onLocationUpdate({
      ...location,
      options: {
        ...location.options,
        radius: ignore ? 0 : (location.options?.radius || 25),
        radius_unit: location.options?.radius_unit || "Miles",
        ignore_radius: ignore,
        flexible_regions: location.options?.flexible_regions || []
      }
    });
  };

  const handleWorkplaceTypeChange = (workplaceType: Workplace) => {
    let newWorkplaceType: Workplace[] | "All";
    
    const currentTypes = Array.isArray(location.workplace_type) ? location.workplace_type : 
      (location.workplace_type === "All" ? [] : (location.workplace_type ? [location.workplace_type as Workplace] : []));
    
    if (currentTypes.includes(workplaceType)) {
      const filtered = currentTypes.filter(type => type !== workplaceType);
      newWorkplaceType = filtered.length > 0 ? filtered : "All";
    } else {
      newWorkplaceType = [...currentTypes, workplaceType];
    }
    
    onLocationUpdate({
      ...location,
      workplace_type: newWorkplaceType
    });
  };

  const handleFlexibleRegionsChange = (region: LocationType) => {
    const currentRegions = location.options?.flexible_regions || [];
    let newRegions: LocationType[];
    
    if (currentRegions.includes(region)) {
      newRegions = currentRegions.filter(r => r !== region);
    } else {
      newRegions = [...currentRegions, region];
    }

    onLocationUpdate({
      ...location,
      options: {
        ...location.options,
        radius: location.options?.radius || 25,
        radius_unit: location.options?.radius_unit || "Miles",
        ignore_radius: location.options?.ignore_radius || false,
        flexible_regions: newRegions
      }
    });
  };

  const isWorkplaceTypeSelected = (workplaceType: Workplace) => {
    if (location.workplace_type === "All") return false;
    if (Array.isArray(location.workplace_type)) {
      return location.workplace_type.includes(workplaceType);
    }
    return location.workplace_type === workplaceType;
  };

  const isFlexibleRegionSelected = (region: LocationType) => {
    return location.options?.flexible_regions?.includes(region) || false;
  };

  const currentRadius = location.options?.ignore_radius ? 0 : (location.options?.radius || 25);
  const radiusUnit = location.options?.radius_unit || "Miles";

  const formatRadiusLabel = (value: number | undefined) => {
    const radius = value ?? currentRadius;
    const label = radius === 0 ? "Exact" : `${radius} ${radiusUnit === "Miles" ? "miles" : "km"}`;
    
    return (
      <span className="inline-flex items-center justify-center text-center text-foreground  min-w-24">
        {label}
      </span>
    );
  };

  // Extract location-specific names for labels
  const getLocationLabels = () => {
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
  };

  const locationLabels = getLocationLabels();

  return (
    <Accordion type="multiple" className="last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out" >
      <AccordionItem value={location.id} className="w-full">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex items-center gap-2 w-full">
            <MapPin size={16} className="text-primary" />
            <span className="truncate">{location.address.formatted.split(',')[0]}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4 pt-0">
          <div className="space-y-4">
            <div>
              <div className="space-y-2 mt-2">
                <div className="flex flex-col  gap-2">
                  <LabelInputContainer title="Search Radius">
                    <LabelRadio
                      label="Miles"
                      checked={radiusUnit === "Miles"}
                      onChange={() => handleRadiusUnitChange("Miles")}
                    />
                    <LabelRadio
                      label="Kilometers"
                      checked={radiusUnit === "Kilometers"}
                      onChange={() => handleRadiusUnitChange("Kilometers")}
                    />
                  </LabelInputContainer>
                </div>

                <DualRangeSlider
                  value={[currentRadius]}
                  onValueChange={(values) => handleRadiusChange(values[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full mt-8"
                  label={formatRadiusLabel}
                  labelPosition="top"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exact</span>
                  <span>100 {radiusUnit === "Miles" ? "miles" : "km"}</span>
                </div>

                <LabelCheckbox
                  label={`Search Exactly in ${locationLabels.city || 'this location'}`}
                  checked={location.options?.ignore_radius || false}
                  onChange={(checked) => handleIgnoreRadiusChange(checked === true)}
                />
              </div>
            </div>

            <LabelInputContainer title="Workplace Type">
              <LabelCheckbox
                label="On-site"
                checked={isWorkplaceTypeSelected("Onsite")}
                onChange={() => handleWorkplaceTypeChange("Onsite")}
              />
              <LabelCheckbox
                label="Remote"
                checked={isWorkplaceTypeSelected("Remote")}
                onChange={() => handleWorkplaceTypeChange("Remote")}
              />
              <LabelCheckbox
                label="Hybrid"
                checked={isWorkplaceTypeSelected("Hybrid")}
                onChange={() => handleWorkplaceTypeChange("Hybrid")}
              />
            </LabelInputContainer>

            <LabelInputContainer title="Include Remote Jobs From">
              <LabelCheckbox
                label={`Anywhere in ${locationLabels.state || 'this state'}`}
                checked={isFlexibleRegionSelected("Admin Area")}
                onChange={() => handleFlexibleRegionsChange("Admin Area")}
              />
              <LabelCheckbox
                label={`Anywhere in ${locationLabels.country || 'this country'}`}
                checked={isFlexibleRegionSelected("Country")}
                onChange={() => handleFlexibleRegionsChange("Country")}
              />
              <LabelCheckbox
                label={`Anywhere in ${locationLabels.continent || 'this continent'}`}
                checked={isFlexibleRegionSelected("Continent")}
                onChange={() => handleFlexibleRegionsChange("Continent")}
              />
            </LabelInputContainer>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function Location() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLocationsChange = (locations: Location[]) => {
    updateSearchOptions({
      location: {
        ...searchOptions.location,
        location: locations
      }
    });
  };

  const handleLocationUpdate = (updatedLocation: Location) => {
    const updatedLocations = searchOptions.location.location.map(loc =>
      loc.id === updatedLocation.id ? updatedLocation : loc
    );
    
    updateSearchOptions({
      location: {
        ...searchOptions.location,
        location: updatedLocations
      }
    });
  };

  const handleLocationRemove = (locationId: string) => {
    const updatedLocations = searchOptions.location.location.filter(loc => loc.id !== locationId);
    
    updateSearchOptions({
      location: {
        ...searchOptions.location,
        location: updatedLocations
      }
    });
  };

  return (
    <FilterContainer title="Location">
      <div className="space-y-4">
        <MultiLocationPicker
          locations={searchOptions.location.location}
          onLocationsChange={handleLocationsChange}
        />
        
        {searchOptions.location.location.length > 0 && (
          <div className="space-y-2">
            {/* <h4 className="text-sm font-medium text-foreground">Location Settings</h4> */}
            {searchOptions.location.location.map((location) => (
              <LocationAccordion
                key={location.id}
                location={location}
                onLocationUpdate={handleLocationUpdate}
                onLocationRemove={handleLocationRemove}
              />
            ))}
        </div>
      )}
      </div>
    </FilterContainer>
  );
} 
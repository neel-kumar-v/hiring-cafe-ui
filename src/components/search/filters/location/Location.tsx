import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { MultiLocationPicker } from "@/components/ui/multi-location-picker";
import { useApp } from "@/contexts/AppContext";
import {
  createLocationFlexibleRegionsHandler,
  createLocationIgnoreRadiusHandler,
  createLocationRadiusHandler,
  createLocationRadiusUnitHandler,
  createLocationsChangeHandler,
  createLocationWorkplaceTypeHandler,
  formatRadiusLabel,
  getCurrentRadius,
  getLocationLabels,
  getRadiusUnit,
  isFlexibleRegionSelected,
  isWorkplaceTypeSelected
} from "@/lib/search";
import { LocationType, Workplace, type Location } from "@/types/search";
import { MapPin } from "lucide-react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

interface LocationAccordionProps {
  location: Location;
  locationIndex: number;
}

export function LocationAccordion({ location, locationIndex }: LocationAccordionProps) {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleRadiusChange = createLocationRadiusHandler(location, searchOptions, updateSearchOptions, locationIndex);
  const handleRadiusUnitChange = createLocationRadiusUnitHandler(location, searchOptions, updateSearchOptions, locationIndex);
  const handleIgnoreRadiusChange = createLocationIgnoreRadiusHandler(location, searchOptions, updateSearchOptions, locationIndex);
  const handleWorkplaceTypeChange = createLocationWorkplaceTypeHandler(location, searchOptions, updateSearchOptions, locationIndex);
  const handleFlexibleRegionsChange = createLocationFlexibleRegionsHandler(location, searchOptions, updateSearchOptions, locationIndex);

  const isWorkplaceTypeSelectedForLocation = (workplaceType: Workplace) => {
    return isWorkplaceTypeSelected(location, workplaceType);
  };

  const isFlexibleRegionSelectedForLocation = (region: LocationType) => {
    return isFlexibleRegionSelected(location, region);
  };

  const currentRadius = getCurrentRadius(location);
  const radiusUnit = getRadiusUnit(location);

  const formatRadiusLabelForLocation = (value: number | undefined) => {
    const label = formatRadiusLabel(value, location);
    
    return (
      <span className="inline-flex items-center justify-center text-center text-foreground  min-w-24">
        {label}
      </span>
    );
  };

  const locationLabels = getLocationLabels(location);

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
                  label={formatRadiusLabelForLocation}
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
                checked={isWorkplaceTypeSelectedForLocation("Onsite")}
                onChange={() => handleWorkplaceTypeChange("Onsite")}
              />
              <LabelCheckbox
                label="Remote"
                checked={isWorkplaceTypeSelectedForLocation("Remote")}
                onChange={() => handleWorkplaceTypeChange("Remote")}
              />
              <LabelCheckbox
                label="Hybrid"
                checked={isWorkplaceTypeSelectedForLocation("Hybrid")}
                onChange={() => handleWorkplaceTypeChange("Hybrid")}
              />
            </LabelInputContainer>

            <LabelInputContainer title="Include Remote Jobs From">
              <LabelCheckbox
                label={`${locationLabels.state || 'This state'}`}
                checked={isFlexibleRegionSelectedForLocation("Admin Area")}
                onChange={() => handleFlexibleRegionsChange("Admin Area")}
              />
              <LabelCheckbox
                label={`${locationLabels.country || 'This country'}`}
                checked={isFlexibleRegionSelectedForLocation("Country")}
                onChange={() => handleFlexibleRegionsChange("Country")}
              />
              <LabelCheckbox
                label={`${locationLabels.continent || 'This continent'}`}
                checked={isFlexibleRegionSelectedForLocation("Continent")}
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

  const handleLocationsChange = createLocationsChangeHandler(searchOptions, updateSearchOptions);

  return (
    <FilterContainer title="Location">
      <div className="space-y-4">
        <MultiLocationPicker
          locations={searchOptions.location.location}
          onLocationsChange={handleLocationsChange}
        />
        
        {searchOptions.location.location.length > 0 && (
          <div className="space-y-2">
            {searchOptions.location.location.map((location, index) => (
              <LocationAccordion
                key={location.id}
                location={location}
                locationIndex={index}
              />
            ))}
        </div>
      )}
      </div>
    </FilterContainer>
  );
} 
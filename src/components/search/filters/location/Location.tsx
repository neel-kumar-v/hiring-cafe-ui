"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { MultiLocationPicker } from "@/components/ui/multi-location-picker";
import { useApp } from "@/contexts/AppContext";
import {
  createLocationFlexibleRegionsHandler,
  createLocationRadiusHandler,
  createLocationWorkplaceTypeHandler,
  formatRadiusLabel,
  getCurrentRadius,
  getLocationLabels,
  isFlexibleRegionSelected,
  isWorkplaceTypeSelected,
} from "@/lib/search";
import type { AddressComponent, Location, LocationType, Workplace } from "@/types/search";
import { MapPin, Plus, Trash2 } from "lucide-react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

const MAX_SUGGESTIONS_INLINE = 3;

type SuggestedLocation = Location;

function createAddressComponent(longName: string, type: LocationType): AddressComponent {
  return {
    long_name: longName,
    short_name: longName,
    types: [type],
  };
}

function getComponent(
  components: AddressComponent[] | undefined,
  type: LocationType
) {
  return components?.find((component) => component.types.includes(type));
}

function buildSuggestedLocation(
  baseLocation: Location,
  label: string,
  type: LocationType
): SuggestedLocation {
  const existingComponents = baseLocation.address.components ?? [];
  const country = getComponent(existingComponents, "Country");
  const continent = getComponent(existingComponents, "Continent");
  const adminArea = getComponent(existingComponents, "Admin Area");

  const nextComponents: AddressComponent[] = [];

  if (type === "Admin Area") {
    nextComponents.push(adminArea ?? createAddressComponent(label, "Admin Area"));
    if (country) nextComponents.push(country);
    if (continent) nextComponents.push(continent);
  }

  if (type === "Country") {
    nextComponents.push(country ?? createAddressComponent(label, "Country"));
    if (continent) nextComponents.push(continent);
  }

  if (type === "Continent") {
    nextComponents.push(continent ?? createAddressComponent(label, "Continent"));
  }

  return {
    ...baseLocation,
    id: `suggested-${type}-${label}`,
    types: [type],
    address: {
      formatted: label,
      components: nextComponents,
    },
    workplace_type: ["Remote"],
    options: {
      radius: 0,
      radius_unit: "Miles",
      ignore_radius: true,
      flexible_regions: [],
    },
  };
}

function generateLocationSuggestions(location: Location): SuggestedLocation[] {
  const labels = getLocationLabels(location);
  const suggestions: SuggestedLocation[] = [];

  if (location.types.includes("Locality")) {
    if (labels.state) {
      suggestions.push(buildSuggestedLocation(location, labels.state, "Admin Area"));
    }
    if (labels.country) {
      suggestions.push(buildSuggestedLocation(location, labels.country, "Country"));
    }
    if (labels.continent) {
      suggestions.push(buildSuggestedLocation(location, labels.continent, "Continent"));
    }
    return suggestions;
  }

  if (location.types.includes("Admin Area")) {
    if (labels.country) {
      suggestions.push(buildSuggestedLocation(location, labels.country, "Country"));
    }
    if (labels.continent) {
      suggestions.push(buildSuggestedLocation(location, labels.continent, "Continent"));
    }
    return suggestions;
  }

  if (location.types.includes("Country") && labels.continent) {
    suggestions.push(buildSuggestedLocation(location, labels.continent, "Continent"));
  }

  return suggestions;
}

type Expansion = {
  label: string;
  value: "Admin Area" | "Country" | "Continent";
};

function computeLocationExpansions(location: Location): Expansion[] {
  const labels = getLocationLabels(location);
  const expansions: Expansion[] = [];

  if (location.types.includes("Locality")) {
    if (labels.state) expansions.push({ label: labels.state, value: "Admin Area" });
    if (labels.country) expansions.push({ label: labels.country, value: "Country" });
    if (labels.continent) expansions.push({ label: labels.continent, value: "Continent" });
    return expansions;
  }

  if (location.types.includes("Admin Area")) {
    if (labels.country) expansions.push({ label: labels.country, value: "Country" });
    if (labels.continent) expansions.push({ label: labels.continent, value: "Continent" });
    return expansions;
  }

  if (location.types.includes("Country")) {
    if (labels.continent) expansions.push({ label: labels.continent, value: "Continent" });
  }

  return expansions;
}

interface LocationAccordionProps {
  location: Location;
  locationIndex: number;
}

function LocationAccordion({ location, locationIndex }: LocationAccordionProps) {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleRadiusChange = createLocationRadiusHandler(
    location,
    searchOptions,
    updateSearchOptions,
    locationIndex
  );
  const handleWorkplaceTypeChange = createLocationWorkplaceTypeHandler(
    location,
    searchOptions,
    updateSearchOptions,
    locationIndex
  );
  const handleFlexibleRegionsChange = createLocationFlexibleRegionsHandler(
    location,
    searchOptions,
    updateSearchOptions,
    locationIndex
  );
  const currentRadius = getCurrentRadius(location);
  const expansions = computeLocationExpansions(location);

  return (
    <Accordion type="multiple" defaultValue={[location.id]} className="mx-2 border-b border-b-foreground/15 transition-all duration-700 ease-in-out hover:border-b-foreground/45">
      <AccordionItem value={location.id} className="w-full">
        <AccordionTrigger className="text-base font-medium">
          <div className="flex w-full items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="flex-1 truncate">{location.address.formatted.split(",")[0]}</span>
            <button
              type="button"
              aria-label="Delete location"
              className="rounded p-1 transition-colors hover:bg-destructive/10"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                updateSearchOptions({
                  location: {
                    ...searchOptions.location,
                    location: searchOptions.location.location.filter((_, index) => index !== locationIndex),
                  },
                });
              }}
            >
              <Trash2 size={16} className="text-destructive" />
            </button>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4 pt-0">
          {location.types.includes("Locality") ? (
            <div className="space-y-2">
              <DualRangeSlider
                value={[currentRadius]}
                onValueChange={(values) => handleRadiusChange(values[0])}
                min={0}
                max={100}
                step={1}
                className="mt-8 w-full"
                label={(value) => (
                  <span className="inline-flex min-w-24 items-center justify-center text-center text-foreground">
                    {formatRadiusLabel(value, location).replace("km", "miles")}
                  </span>
                )}
                labelPosition="top"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exact</span>
                <span>100 miles</span>
              </div>
            </div>
          ) : null}

          <LabelInputContainer title="Workplace Type" midColCount={3} lgColCount={3}>
            {[
              { label: "On-site", value: "Onsite" },
              { label: "Remote", value: "Remote" },
              { label: "Hybrid", value: "Hybrid" },
            ].map((workplaceType) => (
              <LabelCheckbox
                key={workplaceType.value}
                label={workplaceType.label}
                checked={isWorkplaceTypeSelected(location, workplaceType.value as Workplace)}
                onChange={() => handleWorkplaceTypeChange(workplaceType.value as Workplace)}
              />
            ))}
          </LabelInputContainer>

          {expansions.length > 0 ? (
            <LabelInputContainer title="Include unrestricted remote jobs from" midColCount={2} lgColCount={4}>
              {expansions.map((expansion) => (
                <LabelCheckbox
                  key={expansion.value}
                  label={expansion.label}
                  checked={isFlexibleRegionSelected(location, expansion.value)}
                  onChange={() => handleFlexibleRegionsChange(expansion.value)}
                />
              ))}
            </LabelInputContainer>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function LocationFilter() {
  const { searchOptions, updateSearchOptions } = useApp();
  const locations = searchOptions.location.location;
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const initialRender = useRef(true);

  const suggestedLocations = useMemo(() => {
    const allSuggestions = locations.flatMap((location) => generateLocationSuggestions(location));
    const deduped = allSuggestions.filter(
      (suggestion, index, array) =>
        array.findIndex(
          (item) =>
            item.address.formatted === suggestion.address.formatted &&
            item.types[0] === suggestion.types[0]
        ) === index
    );

    return deduped.filter(
      (suggestion) =>
        !locations.some(
          (location) =>
            location.address.formatted === suggestion.address.formatted &&
            location.types[0] === suggestion.types[0]
        )
    );
  }, [locations]);

  useEffect(() => {
    if (!initialRender.current) return;
    setShowAllSuggestions(suggestedLocations.length <= MAX_SUGGESTIONS_INLINE);
    initialRender.current = false;
  }, [suggestedLocations.length]);

  const visibleSuggestions = showAllSuggestions
    ? suggestedLocations
    : suggestedLocations.slice(0, MAX_SUGGESTIONS_INLINE);

  return (
    <FilterContainer categoryId="location" title="Location">
      <div className="space-y-4">
        <MultiLocationPicker
          locations={locations}
          onLocationsChange={(nextLocations) =>
            updateSearchOptions({
              location: {
                ...searchOptions.location,
                location: nextLocations,
              },
            })
          }
        />

        {locations.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-muted-foreground/30 p-3 text-center text-muted-foreground/75 transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground">
            <Plus size={20} className="mx-auto mb-2 rounded" />
            <p className="text-xs">
              Currently searching {searchOptions.location.defaultUserLocation ? "in your general location" : "anywhere in the world"}.
            </p>
          </div>
        ) : null}

        {suggestedLocations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() =>
                  updateSearchOptions({
                    location: {
                      ...searchOptions.location,
                      location: [...locations, suggestion],
                    },
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/50 bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground opacity-80 transition hover:bg-muted/50 hover:opacity-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add remote jobs from {suggestion.address.formatted}
              </button>
            ))}
            {suggestedLocations.length > MAX_SUGGESTIONS_INLINE ? (
              <button
                type="button"
                onClick={() => setShowAllSuggestions((value) => !value)}
                className="text-xs font-bold text-primary underline hover:no-underline"
              >
                {showAllSuggestions
                  ? "Show fewer suggested regions"
                  : `Show ${suggestedLocations.length} suggested regions`}
              </button>
            ) : null}
          </div>
        ) : null}

        {locations.length > 0 ? (
          <>
            <div className="space-y-2">
              {locations.map((location, index) => (
                <LocationAccordion key={location.id} location={location} locationIndex={index} />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSearchOptions({
                  location: {
                    ...searchOptions.location,
                    location: [],
                  },
                })
              }
              className="w-full"
            >
              Remove All Locations
            </Button>
          </>
        ) : null}

        {locations.length === 0 && searchOptions.location.defaultUserLocation ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateSearchOptions({
                location: {
                  ...searchOptions.location,
                  defaultUserLocation: false,
                  location: [],
                },
              })
            }
            className="w-full"
          >
            Search Anywhere in the World
          </Button>
        ) : null}
      </div>
    </FilterContainer>
  );
}

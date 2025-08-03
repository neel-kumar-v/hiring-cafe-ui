"use client"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils"
import { Location, LocationType } from '@/types/search'
import { LoaderCircle, Locate, MapPinned, Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type LocationSuggestion = {
  display_name: string;
  place_id: number;
  address: {
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

export interface MultiLocationPickerTheme {
  container?: string;
  input?: string;
  searchButton?: string;
  locateButton?: string;
  suggestionsContainer?: string;
  suggestionItem?: string;
  suggestionIcon?: string;
  suggestionLocation?: string;
  suggestionAddress?: string;
  errorContainer?: string;
  loadingContainer?: string;
  popoverContent?: string;
  popoverTrigger?: string;
  locationList?: string;
  locationItem?: string;
  addButton?: string;
}

interface MultiLocationPickerProps {
  className?: string;
  locations: Location[];
  onLocationsChange: (locations: Location[]) => void;
  placeholder?: string;
  theme?: MultiLocationPickerTheme;
}

export function MultiLocationPicker({
  className,
  locations,
  onLocationsChange,
  placeholder = "Enter city, district, or area",
  theme,
}: MultiLocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = "https://nominatim.openstreetmap.org"

  const defaultTheme: MultiLocationPickerTheme = {
    container: "space-y-4",
    input: "border-input !ring-0 bg-transparent text-foreground",
    searchButton: "rounded-md size-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground",
    locateButton: "rounded-md size-10 p-0 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    suggestionsContainer: "w-full bg-transparent rounded-md border border-input shadow-lg max-h-60 overflow-y-auto",
    suggestionItem: "px-4 py-2 hover:bg-muted cursor-pointer border-b border-input last:border-0 transition-colors",
    suggestionLocation: "text-sm font-medium text-foreground",
    suggestionAddress: "text-xs text-muted-foreground truncate",
    suggestionIcon: "text-primary",
    errorContainer: "w-full bg-destructive/10 rounded-md border border-destructive/20 p-3 text-center",
    loadingContainer: "w-full bg-transparent rounded-md border border-input shadow-md p-4 text-center",
    popoverContent: "w-[var(--radix-popover-trigger-width)] p-0 shadow-lg dark:bg-transparent",
    popoverTrigger: "flex items-center gap-2 text-muted-foreground hover:text-foreground border border-input hover:border-primary/50 cursor-pointer px-3 py-2 rounded-md transition-colors",
    locationList: "space-y-2",
    locationItem: "flex items-center justify-between p-2 bg-muted rounded-md",
    addButton: "w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors rounded-md p-3 text-center text-muted-foreground hover:text-foreground"
  }

  const appliedTheme = { ...defaultTheme, ...theme }

  const convertSuggestionToLocation = (suggestion: LocationSuggestion): Location => {
    const addressComponents = [];
    
    if (suggestion.address.city) {
      addressComponents.push({
        long_name: suggestion.address.city,
        short_name: suggestion.address.city,
        types: ["Locality" as LocationType]
      });
    }
    if (suggestion.address.state) {
      addressComponents.push({
        long_name: suggestion.address.state,
        short_name: suggestion.address.state,
        types: ["Admin Area" as LocationType]
      });
    }
    if (suggestion.address.country) {
      addressComponents.push({
        long_name: suggestion.address.country,
        short_name: suggestion.address.country,
        types: ["Country" as LocationType]
      });
    }

    return {
      searched: false,
      id: `location_${Date.now()}_${Math.random()}`,
      types: ["Locality" as LocationType],
      address: {
        formatted: suggestion.display_name,
        components: addressComponents
      },
      geographical: {
        latitude: 0, // Would need to get from API
        longitude: 0
      }
    };
  };

  const addLocation = (location: Location) => {
    const newLocations = [...locations, location];
    onLocationsChange(newLocations);
    setLocationSearch('');
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const getLocation = async (lat: number, long: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/reverse?lat=${lat}&lon=${long}&format=json`)
      const data = await res.json()
      const city = data.address?.county || data.address?.city || data.address?.state || ''

      if (city) {
        const location = convertSuggestionToLocation({
          display_name: data.display_name || city,
          place_id: Date.now(),
          address: data.address || {}
        });
        addLocation(location);
      }
    } catch (error) {
      console.error("Error fetching location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchLocation = async () => {
    if (!locationSearch.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(locationSearch)}&format=json&addressdetails=1`
      )
      const data = await res.json()

      if (data && data.length > 0) {
        const place = data[0]
        const location = convertSuggestionToLocation(place);
        addLocation(location);
      } else {
        console.log("No location found")
      }
    } catch (error) {
      console.error("Error searching location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = useCallback(() => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        getLocation(latitude, longitude)
      },
      (error) => {
        let errorMessage = "Unable to retrieve location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setError(errorMessage)
        setIsLoading(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    const location = convertSuggestionToLocation(suggestion);
    addLocation(location);
  };

  const formatLocationName = (suggestion: LocationSuggestion) => {
    console.log(suggestion);
    const mainName = suggestion.address.village || suggestion.address?.city || suggestion.address?.state || '';
    const region = suggestion.address?.state || suggestion.address?.country || '';

    if (mainName && region && mainName !== region) {
      return `${mainName}, ${region}`;
    }
    return mainName || suggestion.display_name.split(',')[0];
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(locationSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [locationSearch]);

  useEffect(() => {
    if (!isPopoverOpen) {
      setSuggestions([]);
    }
  }, [isPopoverOpen]);

  return (
    <div className={cn(appliedTheme.container, className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={placeholder}
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && suggestions.length === 0 && searchLocation()}
              aria-label="Search for location"
              aria-describedby={suggestions.length > 0 ? "suggestions-list" : undefined}
              className={appliedTheme.input}
            />
          </div>

          <Button
            className={appliedTheme.searchButton}
            variant="outline"
            onClick={searchLocation}
            disabled={isLoading || !locationSearch.trim()}
            title="Search Location"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={getCurrentLocation}
            className={appliedTheme.locateButton}
            title="Use Current Location"
          >
            <Locate className="h-4 w-4" />
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div
            id="suggestions-list"
            role="listbox"
            aria-label="Location suggestions"
            className={appliedTheme.suggestionsContainer}
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                role="option"
                aria-selected={false}
                tabIndex={0}
                className={appliedTheme.suggestionItem}
                onClick={() => selectSuggestion(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectSuggestion(suggestion)
                  }
                }}
              >
                <div className="flex items-start">
                  <MapPinned size={16} className={cn("mt-0.5 mr-2 shrink-0", appliedTheme.suggestionIcon)} />
                  <div>
                    <p className={appliedTheme.suggestionLocation}>
                      {formatLocationName(suggestion)}
                    </p>
                    <p className={appliedTheme.suggestionAddress}>
                      {suggestion.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFetchingSuggestions && locationSearch.length >= 2 && suggestions.length === 0 && (
          <div className={appliedTheme.loadingContainer}>
            <LoaderCircle size={20} className={cn("animate-spin mx-auto", appliedTheme.suggestionIcon)} />
            <p className="text-sm text-muted-foreground mt-1">Searching locations...</p>
          </div>
        )}

        {locationSearch.length >= 2 && !isFetchingSuggestions && suggestions.length === 0 && (
          <div className={appliedTheme.loadingContainer}>
            <p className="text-sm text-muted-foreground">No locations found for &quot;{locationSearch}&quot;</p>
          </div>
        )}

        {error && (
          <div className={appliedTheme.errorContainer}>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* {locations.length > 0 && (
        <div className={appliedTheme.locationList}>
          <h4 className="text-sm font-medium text-foreground mb-2">Selected Locations</h4>
          {locations.map((location) => (
            <div key={location.id} className={appliedTheme.locationItem}>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-sm">{location.address.formatted}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLocation(location.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )} */}

      {locations.length === 0 && (
        <div className={appliedTheme.addButton}>
          <Plus size={20} className="mx-auto mb-1" />
          <p className="text-xs">Add a location to get started</p>
        </div>
      )}
    </div>
  );
} 
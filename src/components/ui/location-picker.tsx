"use client"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { LoaderCircle, Locate, MapPin, MapPinned, Search } from 'lucide-react'
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

export interface LocationPickerTheme {
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
}

interface LocationPickerProps {
  className?: string;
  autoDetectOnLoad?: boolean;
  defaultLocation?: string;
  onChange?: (location: string) => void;
  variant?: 'popover' | 'inline';
  placeholder?: string;
  theme?: LocationPickerTheme;
}

export function LocationPicker({
  className,
  autoDetectOnLoad = false,
  defaultLocation = "",
  onChange,
  variant = 'popover',
  placeholder = "Enter city, district, or area",
  theme,
}: LocationPickerProps) {
  const [activeLocation, setActiveLocation] = useState(defaultLocation)
  const [isLoading, setIsLoading] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = "https://nominatim.openstreetmap.org"

  const defaultTheme: LocationPickerTheme = {
    container: "space-y-4",
    input: "border-input !ring-0 bg-transparent text-foreground",
    searchButton: "rounded-md size-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground",
    locateButton: "rounded-md size-10 p-0 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    suggestionsContainer: "w-full bg-background rounded-md border border-input shadow-lg max-h-60 overflow-y-auto",
    suggestionItem: "px-4 py-2 hover:bg-muted cursor-pointer border-b border-input last:border-0 transition-colors",
    suggestionLocation: "text-sm font-medium text-foreground",
    suggestionAddress: "text-xs text-muted-foreground truncate max-w-[250px]",
    suggestionIcon: "text-primary",
    errorContainer: "w-full bg-destructive/10 rounded-md border border-destructive/20 p-3 text-center",
    loadingContainer: "w-full bg-background rounded-md border border-input shadow-md p-4 text-center",
    popoverContent: "w-[var(--radix-popover-trigger-width)] p-0 shadow-lg dark:bg-background",
    popoverTrigger: "flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
  }

  const appliedTheme = { ...defaultTheme, ...theme }

  const getLocation = async (lat: number, long: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/reverse?lat=${lat}&lon=${long}&format=json`)
      const data = await res.json()
      console.log(data)
      const city = data.address?.county || data.address?.city || data.address?.state || ''

      if (city) {
        setActiveLocation(data.display_name || city)
      }
    } catch (error) {
      console.log("Error fetching location:", error)
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
        const city = place.address?.city || place.address?.county || place.address?.state || ''

        setActiveLocation(place.display_name || city)
        setLocationSearch('')
        setSuggestions([])
        setIsPopoverOpen(false)
      } else {
        console.log("No location found")
      }
    } catch (error) {
      console.log("Error searching location:", error)
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
      console.log("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setActiveLocation(suggestion.display_name);
    setLocationSearch("");
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const formatLocationName = (suggestion: LocationSuggestion) => {
    const mainName = suggestion.address?.city || suggestion.address?.county || suggestion.address?.state || '';
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

  useEffect(() => {
    if (autoDetectOnLoad && !activeLocation) {
      getCurrentLocation();
    }
  }, [autoDetectOnLoad, activeLocation, getCurrentLocation]);

  useEffect(() => {
    if (onChange && activeLocation) {
      onChange(activeLocation);
    }
  }, [activeLocation, onChange]);

  if (variant === 'inline') {
    return (
      <div className={cn(appliedTheme.container, className)}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={placeholder}
                value={activeLocation || locationSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocationSearch(value);
                  if (activeLocation && value !== activeLocation) {
                    setActiveLocation('');
                  }
                }}
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
      </div>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className={cn(appliedTheme.popoverTrigger, className)}>
          <MapPin size={16} className={cn("text-primary", appliedTheme.suggestionIcon)} />
          {isLoading ? (
            <div className="flex items-center gap-1">
              <LoaderCircle size={14} className="animate-spin" />
              <span className="text-sm">Locating...</span>
            </div>
          ) : (
            <span className="text-sm font-medium">
              {activeLocation.length > 30 ? activeLocation.slice(0, 30) + '...' : activeLocation || 'Select Location'}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className={appliedTheme.popoverContent} side="bottom" align="start" sideOffset={4}>
        <div className="p-4">
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
            <div className={cn("z-50 mt-1 mb-4", appliedTheme.suggestionsContainer)}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className={appliedTheme.suggestionItem}
                  onClick={() => selectSuggestion(suggestion)}
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
            <div className={cn("z-50 mt-1 mb-4", appliedTheme.loadingContainer)}>
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
      </PopoverContent>
    </Popover>
  );
}
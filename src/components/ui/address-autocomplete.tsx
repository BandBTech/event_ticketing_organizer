"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { MapPinAreaIcon, SpinnerGap, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const libraries: ("places")[] = ["places"];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter venue address",
  className,
  disabled = false,
  error = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries,
  });

  // Sync external value with internal state
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const handlePlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        onChange(place.formatted_address);
        onPlaceSelect?.(place);
      }
    }
  }, [onChange, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    inputRef.current?.focus();
  };

  // Show loading state while Google Maps is loading
  if (!isLoaded) {
    return (
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 pr-10 rounded-md border border-input bg-background text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/20",
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <SpinnerGap className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  // Handle loading error - fallback to regular input
  if (loadError || !googleMapsApiKey) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 pr-10 rounded-md border border-input bg-background text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/20",
            className
          )}
        />
        <MapPinAreaIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative">
      <Autocomplete
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
        options={{
          types: ["address"],
          fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 pr-16 rounded-md border border-input bg-background text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/20",
            className
          )}
        />
      </Autocomplete>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear address"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <MapPinAreaIcon className="text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPinIcon, MapPinAreaIcon, SpinnerGap, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface GeoapifyFeature {
  properties: {
    formatted: string;
    place_id: string;
    lon: number;
    lat: number;
    address_line1?: string;
    address_line2?: string;
    country?: string;
    city?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: GeoapifyFeature) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  maxLength?: number;
  country?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter venue address",
  className,
  disabled = false,
  error = false,
  maxLength,
  country,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef(value || "");

  // Sync external value with internal state only when it differs from local value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
      lastSelectedRef.current = value || "";
    }
  }, [value, inputValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (!inputValue || inputValue.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Don't query if inputValue matches the last selected/confirmed address
    if (inputValue === lastSelectedRef.current) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
          "b507bd018dd549f69a62d7a41da9446f";
        let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          inputValue
        )}&apiKey=${apiKey}`;
        if (country) {
          url += `&filter=countrycode:${country.toLowerCase()}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch autocomplete suggestions");
        }
        const data = await response.json();
        if (data && data.features) {
          setSuggestions(data.features);
          setIsOpen(data.features.length > 0);
          setHighlightedIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Geoapify Autocomplete error:", err);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue, country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelect = (suggestion: GeoapifyFeature) => {
    const formattedAddress = suggestion.properties.formatted;
    lastSelectedRef.current = formattedAddress;
    setInputValue(formattedAddress);
    onChange(formattedAddress);
    setIsOpen(false);
    setSuggestions([]);
    onPlaceSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    lastSelectedRef.current = "";
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            "w-full px-3 pr-16 h-13 rounded-md border border-input bg-background text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/20",
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Clear address"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading ? (
            <SpinnerGap className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <MapPinAreaIcon className="text-gray-400 w-5 h-5" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          className={cn(
            "absolute z-50 w-full mt-1.5 max-h-60 overflow-y-auto rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-md outline-none",
            "bg-white/95 backdrop-blur-md shadow-lg"
          )}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={suggestion.properties.place_id || index}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2.5 py-2 text-sm outline-none transition-colors",
                  isHighlighted ? "bg-accent text-accent-foreground font-medium" : "text-gray-700 hover:bg-accent/50 hover:text-accent-foreground",
                  "cursor-pointer"
                )}
                role="option"
                aria-selected={isHighlighted}
              >
                <MapPinIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">
                    {suggestion.properties.address_line1 || suggestion.properties.formatted}
                  </span>
                  {suggestion.properties.address_line2 && (
                    <span className="text-xs text-muted-foreground truncate">
                      {suggestion.properties.address_line2}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

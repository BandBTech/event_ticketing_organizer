"use client";

import { useEffect, useMemo } from "react";
import { CalendarBlankIcon, XIcon } from "@phosphor-icons/react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventListAll } from "@/hooks/useOrganizerEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

/** Base event shape for the select component */
export interface EventOption {
  id: string;
  title: string;
}

interface EventSelectProps {
  /** Selected event ID (controlled) */
  value?: string;
  /** Callback when event selection changes */
  onValueChange?: (eventId: string) => void;
  /** Disable the select */
  disabled?: boolean;
  /** Custom class name for the trigger */
  className?: string;
  /** Placeholder text when no event is selected */
  placeholder?: string;
  /** Loading text to show while fetching events */
  loadingText?: string;
  /** Empty text to show when no events are available */
  emptyText?: string;
  /** Label text (optional, if not provided no label is shown) */
  label?: string;
  /** Show as form field with label */
  showLabel?: boolean;
  /** Max height of the dropdown content */
  maxHeight?: string;
  /** Trigger width (e.g., "w-64", "w-full", "max-w-100") */
  triggerWidth?: string;
  /** Custom events array (if not provided, uses hook to fetch events) */
  events?: EventOption[];
  /** Loading state for custom events */
  isLoading?: boolean;
  /** Custom ID for the select trigger */
  id?: string;
  /** Auto-select the first event when loaded */
  autoSelectFirst?: boolean;
  /** Callback when auto-selection happens */
  onAutoSelect?: (eventId: string) => void;
  /** Show an "All events" option at the top that clears the selection (calls onValueChange("")) */
  showAllOption?: boolean;
  /** Label for the "all events" option */
  allOptionLabel?: string;
}

export function EventSelect({
  value,
  onValueChange,
  disabled = false,
  className,
  placeholder,
  loadingText,
  emptyText,
  label,
  showLabel = false,
  maxHeight = "max-h-[400px]",
  triggerWidth = "w-64",
  events: customEvents,
  isLoading: customLoading,
  id,
  autoSelectFirst = false,
  onAutoSelect,
  showAllOption = false,
  allOptionLabel,
}: EventSelectProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { events: hookEvents, isLoading: hookLoading } = useEventListAll();

  // Use custom events if provided, otherwise use hook events
  const events = customEvents ?? hookEvents;
  const isLoading = customLoading !== undefined ? customLoading : hookLoading;

  // Sort events by title in ascending order
  const sortedEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) return [];
    return [...events].sort((a, b) => {
      const titleA = a.title?.toLowerCase() || '';
      const titleB = b.title?.toLowerCase() || '';
      return titleA.localeCompare(titleB);
    });
  }, [events]);

  // Auto-select the first event when loaded and autoSelectFirst is true
  useEffect(() => {
    if (autoSelectFirst && !isLoading && sortedEvents.length > 0 && !value) {
      const firstEvent = sortedEvents[0];
      onAutoSelect?.(firstEvent.id);
    }
  }, [autoSelectFirst, isLoading, sortedEvents, value, onAutoSelect]);

  const ALL_SENTINEL = "__all__";

  // Map empty/undefined → sentinel so Radix never sees value=""
  const selectValue = !value ? (showAllOption ? ALL_SENTINEL : undefined) : value;

  // Translate Radix value back: sentinel → "" (clear signal for parent)
  const handleChange = (v: string) => {
    onValueChange?.(v === ALL_SENTINEL ? "" : v);
  };

  const selectedEvent = sortedEvents.find((e) => e.id === value);
  const allLabel = allOptionLabel ?? t("events.select.allEvents", "All events");

  const defaultPlaceholder = placeholder ?? t("events.select.placeholder", "Select event");
  const defaultLoadingText = loadingText ?? t("events.select.loading", "Loading events...");
  const defaultEmptyText = emptyText ?? t("event.noEventsFound", "No events found");

  const triggerLabel = isLoading
    ? defaultLoadingText
    : selectedEvent?.title ?? defaultPlaceholder;

  const content = (
    <>
      <SelectTrigger
        id={id}
        hideIcon
        className={`${triggerWidth} text-sm bg-white ${className ?? ""}`}
        title={selectedEvent?.title}
        disabled={disabled || isLoading}
      >
        <SelectValue placeholder={isLoading ? defaultLoadingText : defaultPlaceholder} className="line-clamp-1 truncate flex-1 min-w-0">
          {triggerLabel}
        </SelectValue>
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          {selectedEvent && !disabled && (
            <span
              role="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onValueChange?.("");
              }}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </SelectTrigger>
      <SelectContent className={maxHeight}>
        {showAllOption && (
          <SelectItem value={ALL_SENTINEL} className="cursor-pointer text-muted-foreground">
            {allLabel}
          </SelectItem>
        )}
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
            <CalendarBlankIcon className="h-5 w-5" />
            <span>{isLoading ? defaultLoadingText : defaultEmptyText}</span>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <SelectItem
              key={event.id}
              value={event.id}
              title={event.title}
              className="max-w-[390px] truncate line-clamp-1 cursor-pointer"
            >
              {event.title}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </>
  );

  if (showLabel && label) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500">{label}</label>
        <Select value={selectValue} onValueChange={handleChange} disabled={disabled || isLoading}>
          {content}
        </Select>
      </div>
    );
  }

  return (
    <Select value={selectValue} onValueChange={handleChange} disabled={disabled || isLoading}>
      {content}
    </Select>
  );
}

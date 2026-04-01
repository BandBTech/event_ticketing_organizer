"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
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
}: EventSelectProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { events: hookEvents, isLoading: hookLoading } = useEventListAll();

  // Use custom events if provided, otherwise use hook events
  const events = customEvents ?? hookEvents;
  const isLoading = customLoading !== undefined ? customLoading : hookLoading;

  const selectedEvent = events.find((e) => e.id === value);

  const defaultPlaceholder = placeholder ?? t("events.select.placeholder", "Select an event");
  const defaultLoadingText = loadingText ?? t("events.select.loading", "Loading events...");
  const defaultEmptyText = emptyText ?? t("event.noEventsFound", "No events found");

  const content = (
    <>
      <SelectTrigger
        id={id}
        className={`${triggerWidth} text-sm bg-white ${className ?? ""}`}
        title={selectedEvent?.title}
        disabled={disabled || isLoading}
      >
        <SelectValue
          placeholder={isLoading ? defaultLoadingText : defaultPlaceholder}
          className="line-clamp-1 truncate"
        >
          {selectedEvent?.title ?? (isLoading ? defaultLoadingText : defaultPlaceholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={maxHeight}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
            <CalendarBlankIcon className="h-5 w-5" />
            <span>{isLoading ? defaultLoadingText : defaultEmptyText}</span>
          </div>
        ) : (
          events.map((event) => (
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
        <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
          {content}
        </Select>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      {content}
    </Select>
  );
}

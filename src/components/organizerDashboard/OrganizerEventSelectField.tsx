"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventListAll } from "@/hooks/useOrganizerEvents";
import { CalendarBlankIcon, CircleNotchIcon } from "@phosphor-icons/react";

interface OrganizerEventSelectFieldProps {
  /** Current value (event id) */
  value: string | undefined;
  /** Called when the user picks an event */
  onChange: (eventId: string) => void;
  /** Whether the select is locked (e.g. pre-filled from parent context) */
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

/**
 * Reusable select field that loads the full flat list of organizer events
 * from GET /organizer/list-all?type=events.
 *
 * Wraps itself in FormItem / FormLabel / FormMessage so it can be dropped
 * directly inside a <FormField render> block.
 */
export function OrganizerEventSelectField({
  value,
  onChange,
  disabled = false,
  label = "Event",
  placeholder = "Select an event",
}: OrganizerEventSelectFieldProps) {
  const { events, isLoading, isError } = useEventListAll();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        onValueChange={onChange}
        value={value ?? ""}
        disabled={disabled || isLoading}
      >
        <FormControl>
          <SelectTrigger>
            {isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground text-sm">
                <CircleNotchIcon className="animate-spin h-4 w-4" />
                Loading events…
              </span>
            ) : isError ? (
              <span className="text-destructive text-sm">
                Failed to load events
              </span>
            ) : (
              <SelectValue placeholder={placeholder}>
                {value
                  ? (events.find((e) => e.id === value)?.title ?? placeholder)
                  : undefined}
              </SelectValue>
            )}
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {events.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
              <CalendarBlankIcon className="h-5 w-5" />
              <span>No events found</span>
            </div>
          ) : (
            events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

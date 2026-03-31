"use client";

import { CalendarIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventListAll } from "@/hooks/useOrganizerEvents";
import { ReportType } from "@/types/report";

type DateRangePreset = "today" | "yesterday" | "last-7-days" | "last-month" | "last-3-months" | "last-6-months" | "last-year";

interface ReportFiltersProps {
  dateRangePreset: DateRangePreset;
  onDateRangePresetChange: (preset: DateRangePreset) => void;
  activeTab: ReportType;
  selectedEventId: string;
  onEventChange: (eventId: string) => void;
}

export function ReportFilters({
  dateRangePreset,
  onDateRangePresetChange,
  activeTab,
  selectedEventId,
  onEventChange,
}: ReportFiltersProps) {
  const { events, isLoading: eventsLoading } = useEventListAll();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-gray-500">Date Range</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Select value={dateRangePreset} onValueChange={onDateRangePresetChange}>
              <SelectTrigger className="w-48 text-sm pl-9">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeTab === "event-performance" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-gray-500">Select Event</Label>
            <Select
              value={selectedEventId}
              onValueChange={onEventChange}
              disabled={eventsLoading}
            >
              <SelectTrigger className="w-64 text-sm">
                <SelectValue placeholder={eventsLoading ? "Loading events..." : "Choose an event"} />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

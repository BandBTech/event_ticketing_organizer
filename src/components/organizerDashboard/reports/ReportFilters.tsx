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
import { EventSelect } from "@/components/ui/EventSelect";
import { ReportType } from "@/types/report";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-gray-500">{t("reports.dateRange.label", "Date Range")}</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Select value={dateRangePreset} onValueChange={onDateRangePresetChange}>
            <SelectTrigger className="w-48 text-sm pl-9 bg-white">
              <SelectValue placeholder={t("reports.dateRange.placeholder", "Select date range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("reports.dateRange.today", "Today")}</SelectItem>
              <SelectItem value="yesterday">{t("reports.dateRange.yesterday", "Yesterday")}</SelectItem>
              <SelectItem value="last-7-days">{t("reports.dateRange.last7Days", "Last 7 Days")}</SelectItem>
              <SelectItem value="last-month">{t("reports.dateRange.lastMonth", "Last Month")}</SelectItem>
              <SelectItem value="last-3-months">{t("reports.dateRange.last3Months", "Last 3 Months")}</SelectItem>
              <SelectItem value="last-6-months">{t("reports.dateRange.last6Months", "Last 6 Months")}</SelectItem>
              <SelectItem value="last-year">{t("reports.dateRange.lastYear", "Last Year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTab === "event-performance" && (
        <EventSelect
          value={selectedEventId}
          onValueChange={onEventChange}
          triggerWidth="w-64"
          placeholder={t("reports.selectEvent.placeholder", "Choose an event")}
          loadingText={t("reports.selectEvent.loading", "Loading events...")}
        />
      )}
    </div>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

export interface EventStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EVENT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "live", label: "Live" },
  { value: "hold", label: "On Hold" },
  { value: "on_sale", label: "On Sale" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "sales_upcoming", label: "Sales Upcoming" },
  { value: "scheduled", label: "Scheduled" },
] as const;

export function EventStatusSelect({
  value,
  onChange,
  placeholder = "Filter by Status",
  className,
}: EventStatusSelectProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full bg-white ${className || ""}`}>
        <SelectValue placeholder={t(placeholder)} />
      </SelectTrigger>
      <SelectContent>
        {EVENT_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {t(status.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

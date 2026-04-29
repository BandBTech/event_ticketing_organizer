"use client";

import { format } from "date-fns";
import React from "react";
import { DateTimeInput } from "@/components/ui/datetime-input";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

interface ShadcnDateTimePickerProps {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  className?: string;
  disabled?: boolean;
  format?: string;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
}

export function ShadcnDateTimePicker({
  value,
  onChange,
  className,
  disabled,
  clearable = true,
  format: formatStr,
  error = false,
  minDate,
  maxDate,
}: ShadcnDateTimePickerProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isOpen, setIsOpen] = React.useState(false);

  // Default to disabling dates before today (or specific minDate if provided)
  const disabledDays = (date: Date) => {
    const limit = minDate || new Date();
    const limitDay = new Date(limit);
    limitDay.setHours(0, 0, 0, 0);
    if (date < limitDay) return true;
    if (maxDate) {
      const maxDay = new Date(maxDate);
      maxDay.setHours(23, 59, 59, 999);
      if (date > maxDay) return true;
    }
    return false;
  };

  /**
   * When user selects a date from the Calendar
   */
  function handleDateSelect(date: Date | undefined) {
    if (date) {
      const newDate = new Date(date);
      // Preserve time from current value or default to current time
      const currentTime = value || new Date();
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());

      if (minDate && newDate.toDateString() === minDate.toDateString()) {
        if (newDate < minDate) {
          // If preserved time makes it less than minDate, set it to minDate
          newDate.setHours(minDate.getHours());
          newDate.setMinutes(minDate.getMinutes());
        }
      }

      onChange?.(newDate);
    }
  }

  /**
   * When user changes time using the scroll areas
   */
  function handleTimeChange(type: "hour" | "minute" | "ampm", val: string) {
    const currentDate = value || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(val, 10);
      const currentHours = newDate.getHours();
      const isPM = currentHours >= 12;

      // If setting hour to 12
      if (hour === 12) {
        newDate.setHours(isPM ? 12 : 0);
      } else {
        newDate.setHours(isPM ? hour + 12 : hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(val, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (val === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (val === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    // After time change, ensure the value stays within minDate/maxDate bounds
    if (minDate && newDate < minDate) {
      onChange?.(minDate);
    } else if (maxDate && newDate > maxDate) {
      onChange?.(maxDate);
    } else {
      onChange?.(newDate);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <DateTimeInput
            value={value || undefined}
            onChange={(date) => onChange?.(date || null)}
            format={formatStr}
            disabled={disabled}
            clearable={clearable}
            error={error}
            onCalendarClick={() => setIsOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-md border-r-0 sm:border-r"
            captionLayout="dropdown"
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 5}
            disabled={disabledDays}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .reverse()
                  .map((hour) => (
                    <Button
                      type="button"
                      key={hour}
                      size="icon"
                      variant={
                        value &&
                        (value.getHours() % 12 === 0
                          ? 12
                          : value.getHours() % 12) === hour
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    type="button"
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => (
                  <Button
                    type="button"
                    key={ampm}
                    size="icon"
                    variant={
                      value &&
                      ((ampm === "AM" && value.getHours() < 12) ||
                        (ampm === "PM" && value.getHours() >= 12))
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("ampm", ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="p-3 border-t">
          <Button className="w-full" onClick={() => setIsOpen(false)}>
            {t("common.done", "Done")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

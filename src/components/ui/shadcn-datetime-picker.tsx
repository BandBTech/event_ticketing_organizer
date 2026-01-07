"use client";

import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import React, { useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
}: ShadcnDateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      const newDate = new Date(date);
      // Preserve time from current value or default to 12:00 PM if no value
      const currentTime = value || new Date();
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      onChange?.(newDate);
    }
  }

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

    onChange?.(newDate);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Button
            type="button"
            variant={"outline"}
            className={cn(
              "w-full h-13 pl-3 text-left font-normal border-input bg-background md:text-md",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2", // Add focus styles
              error && "border-red-500 focus-visible:ring-red-500", // Add error styles
              !value && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(true)}
          >
            {value ? (
              format(value, formatStr || "yyyy-MM-dd hh:mm aa")
            ) : (
              <span>{formatStr || "yyyy-MM-dd hh:mm aa"}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
          {clearable && value && !disabled && (
            <div
              className="absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(null);
              }}
            >
              <X className="h-4 w-4 opacity-50" />
            </div>
          )}
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
            fromYear={1960}
            toYear={2030}
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
                          ((value.getHours() % 12 === 0 ? 12 : value.getHours() % 12) === hour)
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("hour", hour.toString())
                      }
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map(
                  (minute) => (
                    <Button
                      type="button"
                      key={minute}
                      size="icon"
                      variant={
                        value &&
                          value.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  )
                )}
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
                        ((ampm === "AM" &&
                          value.getHours() < 12) ||
                          (ampm === "PM" &&
                            value.getHours() >= 12))
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
      </PopoverContent>
    </Popover>
  );
}

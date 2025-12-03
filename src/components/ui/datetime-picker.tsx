"use client"

import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const dateValue = value ? new Date(value) : undefined;
  const timeValue = value && !isNaN(new Date(value).getTime()) ? format(new Date(value), "HH:mm") : "00:00";

  const combineDateAndTime = (date: Date | undefined, timeString: string) => {
    if (!date) return "";
    const d = new Date(date);
    const [hours, minutes] = timeString.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      d.setHours(hours);
      d.setMinutes(minutes);
      d.setSeconds(0);
      d.setMilliseconds(0);
    }
    return d.toISOString();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(combineDateAndTime(date, timeValue));
      setOpen(false);
    } else {
      onChange("");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (dateValue && !isNaN(dateValue.getTime())) {
      onChange(combineDateAndTime(dateValue, e.target.value));
    } else {
      // If no date is picked, use today's date with the selected time
      onChange(combineDateAndTime(new Date(), e.target.value));
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className={cn(
                "w-64 justify-between font-normal",
                !dateValue && "text-muted-foreground"
              )}
            >
              {dateValue && !isNaN(dateValue.getTime()) ? format(dateValue, "PPP") : <span>Pick a date</span>}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={timeValue}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}

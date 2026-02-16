"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimezoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

const TIMEZONES = [
  // Americas
  { value: "America/New_York", label: "(UTC-05:00) Eastern Time - New York" },
  { value: "America/Chicago", label: "(UTC-06:00) Central Time - Chicago" },
  { value: "America/Denver", label: "(UTC-07:00) Mountain Time - Denver" },
  { value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time - Los Angeles" },
  { value: "America/Anchorage", label: "(UTC-09:00) Alaska Time" },
  { value: "Pacific/Honolulu", label: "(UTC-10:00) Hawaii Time" },
  { value: "America/Toronto", label: "(UTC-05:00) Eastern Time - Toronto" },
  { value: "America/Vancouver", label: "(UTC-08:00) Pacific Time - Vancouver" },
  { value: "America/Mexico_City", label: "(UTC-06:00) Central Time - Mexico City" },
  { value: "America/Sao_Paulo", label: "(UTC-03:00) Brasilia Time" },
  { value: "America/Buenos_Aires", label: "(UTC-03:00) Argentina Time" },

  // Europe
  { value: "Europe/London", label: "(UTC+00:00) London - GMT/BST" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris - CET" },
  { value: "Europe/Berlin", label: "(UTC+01:00) Berlin - CET" },
  { value: "Europe/Amsterdam", label: "(UTC+01:00) Amsterdam - CET" },
  { value: "Europe/Madrid", label: "(UTC+01:00) Madrid - CET" },
  { value: "Europe/Rome", label: "(UTC+01:00) Rome - CET" },
  { value: "Europe/Zurich", label: "(UTC+01:00) Zurich - CET" },
  { value: "Europe/Moscow", label: "(UTC+03:00) Moscow - MSK" },
  { value: "Europe/Istanbul", label: "(UTC+03:00) Istanbul - TRT" },

  // Asia
  { value: "Asia/Kathmandu", label: "(UTC+05:45) Nepal Time - Kathmandu" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time" },
  { value: "Asia/Dubai", label: "(UTC+04:00) Gulf Standard Time - Dubai" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore Time" },
  { value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong Time" },
  { value: "Asia/Shanghai", label: "(UTC+08:00) China Standard Time" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Japan Standard Time" },
  { value: "Asia/Seoul", label: "(UTC+09:00) Korea Standard Time" },
  { value: "Asia/Bangkok", label: "(UTC+07:00) Indochina Time - Bangkok" },
  { value: "Asia/Jakarta", label: "(UTC+07:00) Western Indonesia Time" },

  // Pacific
  { value: "Australia/Sydney", label: "(UTC+10:00) Australian Eastern Time - Sydney" },
  { value: "Australia/Melbourne", label: "(UTC+10:00) Australian Eastern Time - Melbourne" },
  { value: "Australia/Perth", label: "(UTC+08:00) Australian Western Time - Perth" },
  { value: "Pacific/Auckland", label: "(UTC+12:00) New Zealand Time" },
  { value: "Pacific/Fiji", label: "(UTC+12:00) Fiji Time" },

  // Africa & Middle East
  { value: "Africa/Cairo", label: "(UTC+02:00) Eastern European Time - Cairo" },
  { value: "Africa/Johannesburg", label: "(UTC+02:00) South Africa Time" },
  { value: "Africa/Lagos", label: "(UTC+01:00) West Africa Time - Lagos" },
  { value: "Asia/Jerusalem", label: "(UTC+02:00) Israel Time" },
  { value: "Asia/Riyadh", label: "(UTC+03:00) Arabia Standard Time" },
];

const TimezoneSelector = ({
  value,
  onChange,
  placeholder = "Select Timezone",
  className,
  disabled = false,
  error = false,
}: TimezoneSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-13 justify-between font-normal md:text-md hover:bg-transparent",
            error && "border-red-500 focus:ring-red-500/20",
            className
          )}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {selectedTimezone?.label || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {TIMEZONES.map((tz) => (
                <CommandItem
                  key={tz.value}
                  value={tz.label}
                  onSelect={() => {
                    onChange(tz.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tz.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tz.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TimezoneSelector;
export { TIMEZONES };

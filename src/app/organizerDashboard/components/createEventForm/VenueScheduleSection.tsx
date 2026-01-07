"use client";

import { Control } from "react-hook-form";
import { EventFormData } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShadcnDateTimePicker } from "@/components/ui/shadcn-datetime-picker";
import TimezoneSelector from "../TimezoneSelector";

interface VenueScheduleSectionProps {
  control: Control<EventFormData>;
}

export function VenueScheduleSection({ control }: VenueScheduleSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.section.venueSchedule", "Venue & Schedule")}
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <FormField
            control={control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.venueName", "Venue Name")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-13 md:text-md"
                    placeholder={t("event.placeholder.venueName", "Enter venue name")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="venueAddress"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.venueAddress", "Venue Address")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <AddressAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t(
                      "event.placeholder.venueAddress",
                      "Search for venue address"
                    )}
                    className="h-13 md:text-md"
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.capacity", "Capacity")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-13 md:text-md"
                    type="number"
                    placeholder={t("event.placeholder.capacity", "e.g 5000")}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="timezone"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.timezone", "Timezone")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <TimezoneSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    placeholder={t("event.placeholder.timezone", "Select timezone")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.startDateTime", "Event Start Date")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ShadcnDateTimePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      if (!date) field.onChange("");
                      else field.onChange(date.toISOString());
                    }}
                    format="yyyy-mm-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="inline-block">
                  {t("event.field.endDateTime", "Event End Date")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ShadcnDateTimePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      if (!date) field.onChange("");
                      else field.onChange(date.toISOString());
                    }}
                    format="yyyy-mm-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

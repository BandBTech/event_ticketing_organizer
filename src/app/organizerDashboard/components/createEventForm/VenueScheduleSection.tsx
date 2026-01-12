"use client";

import { Control } from "react-hook-form";
import { EventFormData, VENUE_NAME_MAX, VENUE_ADDRESS_MAX } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
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
    <div className="mb-6 @container">
      <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.section.venueSchedule", "Venue & Schedule")}
        </h2>
        <div className="grid @2xl:grid-cols-2 @4xl:grid-cols-3 gap-5">
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
                  <div className="relative">
                    <Input
                      className="h-13 md:text-md"
                      placeholder={t("event.placeholder.venueName", "Enter venue name")}
                      maxLength={VENUE_NAME_MAX}
                      {...field}
                    />
                    <div className="flex justify-between items-center mt-1 min-h-[20px]">
                      <TranslatedFormMessage t={t} className="mt-0" />
                      <div className="text-xs text-muted-foreground ml-auto">
                        {field.value?.length || 0}/{VENUE_NAME_MAX} characters
                      </div>
                    </div>
                  </div>
                </FormControl>
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
                  <div className="relative">
                    <AddressAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t(
                        "event.placeholder.venueAddress",
                        "Search for venue address"
                      )}
                      className="h-13 md:text-md"
                      maxLength={VENUE_ADDRESS_MAX}
                      error={!!fieldState.error}
                    />
                    <div className="flex justify-between items-center mt-1 min-h-[20px]">
                      <TranslatedFormMessage t={t} className="mt-0" />
                      <div className="text-xs text-muted-foreground ml-auto">
                        {field.value?.length || 0}/{VENUE_ADDRESS_MAX} characters
                      </div>
                    </div>
                  </div>
                </FormControl>
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
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.onChange("");
                        return;
                      }
                      const num = Number(val);
                      if (isNaN(num)) return;
                      field.onChange(num);
                    }}
                  />
                </FormControl>
                <div className="flex justify-between items-center -mt-1">
                  <TranslatedFormMessage t={t} className="mt-0" />
                </div>
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
                <TranslatedFormMessage t={t} />
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
                    format="yyyy-MM-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                  />
                </FormControl>
                <TranslatedFormMessage t={t} />
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
                    format="yyyy-MM-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                  />
                </FormControl>
                <TranslatedFormMessage t={t} />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

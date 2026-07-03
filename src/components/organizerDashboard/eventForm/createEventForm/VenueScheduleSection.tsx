"use client";

import { Control, useFormContext } from "react-hook-form";
import {
  EventFormData,
  VENUE_NAME_MAX,
  VENUE_ADDRESS_MAX,
  MAX_CAPACITY,
  CAPACITY_MAX_CHARS,
} from "@/lib/validation";
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
import TimezoneSelector from "../../TimezoneSelector";
import { utcToLocalMirror, localMirrorToUtc } from "@/lib/utils";

interface VenueScheduleSectionProps {
  control: Control<EventFormData>;
  registerFieldRef?: (name: string, element: HTMLElement | null) => void;
}

export function VenueScheduleSection({
  control,
  registerFieldRef,
}: VenueScheduleSectionProps) {
  const { t } = useTranslation();
  const { watch } = useFormContext<EventFormData>();

  const startDate = watch("startDate");
  const country = watch("country");
  const timezone = watch("timezone");

  return (
    <div className="mb-6 @container relative z-10">
      <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.section.venueSchedule", "Venue & Schedule")}
        </h2>
        <div className="grid @2xl:grid-cols-2 @4xl:grid-cols-3 gap-5">
          <FormField
            control={control}
            name="venue"
            render={({ field }) => (
              <FormItem ref={(el) => registerFieldRef?.("venue", el)}>
                <FormLabel className="inline-block">
                  {t("event.field.venueName", "Venue Name")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      className="h-13 md:text-md"
                      placeholder={t(
                        "event.placeholder.venueName",
                        "Enter venue name",
                      )}
                      maxLength={VENUE_NAME_MAX}
                      {...field}
                    />
                    <div className="flex justify-between items-center mt-1 min-h-[20px]">
                      <TranslatedFormMessage t={t} className="mt-0" />
                      <div className="text-xs text-muted-foreground ml-auto">
                        {field.value?.length || 0}/{VENUE_NAME_MAX}{" "}
                        {t("common.characters", "characters")}
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
              <FormItem ref={(el) => registerFieldRef?.("venueAddress", el)}>
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
                        "Search for venue address",
                      )}
                      className="h-13 md:text-md"
                      maxLength={VENUE_ADDRESS_MAX}
                      error={!!fieldState.error}
                      country={country}
                    />
                    <div className="flex justify-between items-center mt-1 min-h-[20px]">
                      <TranslatedFormMessage t={t} className="mt-0" />
                      <div className="text-xs text-muted-foreground ml-auto">
                        {field.value?.length || 0}/{VENUE_ADDRESS_MAX}{" "}
                        {t("common.characters", "characters")}
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
              <FormItem ref={(el) => registerFieldRef?.("capacity", el)}>
                <FormLabel className="inline-block">
                  {t("event.field.capacity", "Capacity")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-13 md:text-md"
                    type="number"
                    placeholder={t("event.placeholder.capacity", "e.g 5000")}
                    max={MAX_CAPACITY}
                    inputMode="numeric"
                    {...field}
                    onKeyDown={(e) => {
                      if (
                        e.key === "." ||
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Prevent entering more than max characters
                      if (val.length > CAPACITY_MAX_CHARS) {
                        return;
                      }
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
                <div className="flex justify-between items-center min-h-5 -mt-1">
                  <TranslatedFormMessage t={t} className="mt-0" />
                  <div className="text-xs text-muted-foreground ml-auto">
                    {t("common.max", "Max")} {MAX_CAPACITY.toLocaleString()}
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="timezone"
            render={({ field, fieldState }) => (
              <FormItem ref={(el) => registerFieldRef?.("timezone", el)}>
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
              <FormItem ref={(el) => registerFieldRef?.("startDate", el)}>
                <FormLabel className="inline-block">
                  {t("event.field.startDateTime", "Event Start Date")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ShadcnDateTimePicker
                    value={utcToLocalMirror(field.value, timezone)}
                    onChange={(date) => {
                      if (!date) field.onChange("");
                      else field.onChange(localMirrorToUtc(date, timezone));
                    }}
                    format="yyyy-MM-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                    minDate={utcToLocalMirror(new Date().toISOString(), timezone) || undefined}
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
              <FormItem ref={(el) => registerFieldRef?.("endDate", el)}>
                <FormLabel className="inline-block">
                  {t("event.field.endDateTime", "Event End Date")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <ShadcnDateTimePicker
                    value={utcToLocalMirror(field.value, timezone)}
                    onChange={(date) => {
                      if (!date) field.onChange("");
                      else field.onChange(localMirrorToUtc(date, timezone));
                    }}
                    format="yyyy-MM-dd hh:mm aa"
                    clearable
                    error={!!fieldState.error}
                    minDate={startDate ? utcToLocalMirror(startDate, timezone) || undefined : undefined}
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

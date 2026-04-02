"use client";

import { useState, useEffect } from "react";
import { Control, FieldError, useFormContext } from "react-hook-form";
import {
  EventFormData,
  VENUE_NAME_MAX,
  VENUE_ADDRESS_MAX,
  LAT_MAX_CHARS,
  LNG_MAX_CHARS,
  MAX_CAPACITY,
  CAPACITY_MAX_CHARS,
} from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShadcnDateTimePicker } from "@/components/ui/shadcn-datetime-picker";
import TimezoneSelector from "../../TimezoneSelector";

interface VenueScheduleSectionProps {
  control: Control<EventFormData>;
  registerFieldRef?: (name: string, element: HTMLElement | null) => void;
}

export function VenueScheduleSection({
  control,
  registerFieldRef,
}: VenueScheduleSectionProps) {
  const { t } = useTranslation();
  const { setValue, watch, clearErrors, formState } =
    useFormContext<EventFormData>();
  const [isCoordMode, setIsCoordMode] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [latTouched, setLatTouched] = useState(false);
  const [lngTouched, setLngTouched] = useState(false);

  const venueAddress = watch("venueAddress");
  const startDate = watch("startDate");

  const getCoordErrors = (error?: FieldError) => {
    const messages: string[] = [];
    if (error?.message) messages.push(error.message);
    if (error?.types) {
      Object.values(error.types).forEach((errs) => {
        if (Array.isArray(errs)) messages.push(...errs);
        else if (typeof errs === "string") messages.push(errs);
      });
    }
    // Remove duplicates
    return Array.from(new Set(messages));
  };

  useEffect(() => {
    // Initial check: if address looks like coords, switch to coord mode
    if (
      venueAddress &&
      /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/.test(venueAddress)
    ) {
      setIsCoordMode(true);
      const [l1, l2] = venueAddress.split(",").map((s) => s.trim());
      setLat(l1 || "");
      setLng(l2 || "");
    }
  }, []);

  const handleLatChange = (val: string) => {
    if (val.length > LAT_MAX_CHARS) return;
    setLat(val);
    setLatTouched(true);
    setValue("venueAddress", `${val},${lng}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleLngChange = (val: string) => {
    if (val.length > LNG_MAX_CHARS) return;
    setLng(val);
    setLngTouched(true);
    setValue("venueAddress", `${lat},${val}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const toggleCoordMode = () => {
    const nextMode = !isCoordMode;
    setIsCoordMode(nextMode);
    clearErrors("venueAddress");
    setLatTouched(false);
    setLngTouched(false);

    if (nextMode) {
      // If switching to coord mode, try to parse current value or clear it
      const match = (venueAddress || "").match(
        /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/,
      );
      if (match) {
        setLat(match[1]);
        setLng(match[3]);
      } else {
        setLat("");
        setLng("");
        setValue("venueAddress", ",", { shouldDirty: true });
      }
    } else {
      // Switching back to address mode — reset address
      setValue("venueAddress", "", { shouldDirty: true });
    }
  };

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
                <div className="inline-flex w-full justify-between items-center mb-2">
                  <FormLabel className="m-0!">
                    {t("event.field.venueAddress", "Venue Address")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-normal"
                    onClick={toggleCoordMode}
                  >
                    {isCoordMode
                      ? t("event.action.enterAddress", "Enter address")
                      : t("event.action.enterCoordinates", "Enter coordinates")}
                  </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    {isCoordMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          {(() => {
                            const errors = getCoordErrors(fieldState.error);
                            const latError = errors.find((m) =>
                              m.toLowerCase().includes("latitude"),
                            );
                            const shouldShowError =
                              latError &&
                              (!latError.toLowerCase().includes("required") ||
                                latTouched ||
                                formState.isSubmitted);
                            return (
                              <>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder={t(
                                    "event.placeholder.latitude",
                                    "Latitude",
                                  )}
                                  value={lat}
                                  onChange={(e) =>
                                    handleLatChange(e.target.value)
                                  }
                                  onBlur={() => setLatTouched(true)}
                                  className={cn(
                                    "h-13 md:text-md",
                                    shouldShowError &&
                                      "border-destructive focus-visible:ring-destructive/20",
                                  )}
                                />
                                {shouldShowError && (
                                  <TranslatedFormMessage t={t} className="mt-0">
                                    {latError}
                                  </TranslatedFormMessage>
                                )}
                                <div className="text-xs text-muted-foreground text-right">
                                  {lat.length}/{LAT_MAX_CHARS}{" "}
                                  {t("common.characters", "characters")}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const errors = getCoordErrors(fieldState.error);
                            const lngError = errors.find((m) =>
                              m.toLowerCase().includes("longitude"),
                            );
                            const shouldShowError =
                              lngError &&
                              (!lngError.toLowerCase().includes("required") ||
                                lngTouched ||
                                formState.isSubmitted);
                            return (
                              <>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder={t(
                                    "event.placeholder.longitude",
                                    "Longitude",
                                  )}
                                  value={lng}
                                  onChange={(e) =>
                                    handleLngChange(e.target.value)
                                  }
                                  onBlur={() => setLngTouched(true)}
                                  className={cn(
                                    "h-13 md:text-md",
                                    shouldShowError &&
                                      "border-destructive focus-visible:ring-destructive/20",
                                  )}
                                />
                                {shouldShowError && (
                                  <TranslatedFormMessage t={t} className="mt-0">
                                    {lngError}
                                  </TranslatedFormMessage>
                                )}
                                <div className="text-xs text-muted-foreground text-right">
                                  {lng.length}/{LNG_MAX_CHARS}{" "}
                                  {t("common.characters", "characters")}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
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
                      />
                    )}
                    <div className="flex justify-between items-center mt-1 min-h-[20px]">
                      {!isCoordMode && (
                        <TranslatedFormMessage t={t} className="mt-0" />
                      )}
                      {!isCoordMode && (
                        <div className="text-xs text-muted-foreground ml-auto">
                          {field.value?.length || 0}/{VENUE_ADDRESS_MAX}{" "}
                          {t("common.characters", "characters")}
                        </div>
                      )}
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
                <div className="-mt-1">
                  <TranslatedFormMessage t={t} className="mt-0" />
                </div>
              </FormItem>
            )}
          />

          {/* <FormField
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
          /> */}

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
              <FormItem ref={(el) => registerFieldRef?.("endDate", el)}>
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
                    minDate={startDate ? new Date(startDate) : undefined}
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

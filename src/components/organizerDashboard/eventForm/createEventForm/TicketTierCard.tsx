"use client";

import { Control, useFormContext, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { ShadcnDateTimePicker } from "@/components/ui/shadcn-datetime-picker";
import TierNameSelector from "../../TierNameSelector";
import { TierTemplate } from "@/types/event";
import {
  EventFormData,
  MAX_QUANTITY,
  QUANTITY_MAX_CHARS,
  MAX_PRICE,
  PRICE_MAX_CHARS,
} from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";

interface TicketTierCardProps {
  index: number;
  control: Control<EventFormData>;
  tierTemplates: TierTemplate[];
  showDelete: boolean;
  onDelete: () => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  eventStartDate?: Date;
  registerFieldRef?: (name: string, element: HTMLElement | null) => void;
}

const TicketTierCard = ({
  index,
  control,
  tierTemplates,
  showDelete,
  onDelete,
  onCreateNew,
  isLoading = false,
  usedTierNames = [],
  eventStartDate,
  registerFieldRef,
}: TicketTierCardProps & { usedTierNames?: string[] }) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext<EventFormData>();

  const minDate = new Date();
  const salesStartValue = useWatch({
    control,
    name: `tickets.${index}.salesStart`,
  });
  const salesEndValue = useWatch({
    control,
    name: `tickets.${index}.salesEnd`,
  });
  const salesStartDate = salesStartValue
    ? new Date(salesStartValue)
    : undefined;

  return (
    <div className="border border-gray-200 rounded-lg p-4 relative">
      <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 gap-5">
        <FormField
          control={control}
          name={`tickets.${index}.name`}
          render={({ field, fieldState }) => (
            <FormItem
              ref={(el) => registerFieldRef?.(`tickets[${index}].name`, el)}
            >
              <FormLabel className="inline-block">
                {t("event.field.tierName", "Tier Name")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <TierNameSelector
                  value={field.value}
                  onChange={field.onChange}
                  templates={tierTemplates}
                  error={!!fieldState.error}
                  onCreateNew={onCreateNew}
                  isLoading={isLoading}
                  usedTierNames={usedTierNames}
                />
              </FormControl>
              <TranslatedFormMessage t={t} />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`tickets.${index}.price`}
          render={({ field }) => (
            <FormItem
              ref={(el) => registerFieldRef?.(`tickets[${index}].price`, el)}
            >
              <FormLabel className="inline-block">
                {t("event.field.ticketPrice", "Price")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  type="number"
                  placeholder="e.g. 100"
                  max={MAX_PRICE}
                  inputMode="decimal"
                  step="0.01"
                  {...field}
                  onKeyDown={(e) => {
                    // Allow decimal point for price
                    if (
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
                    if (val.length > PRICE_MAX_CHARS) {
                      return;
                    }
                    if (val === "") {
                      field.onChange("");
                      return;
                    }
                    // Allow trailing decimal point (e.g., "100.")
                    if (val.endsWith(".")) {
                      field.onChange(val);
                      return;
                    }
                    // Allow only one decimal point
                    const parts = val.split(".");
                    if (parts.length > 2) {
                      return;
                    }
                    // Allow only 2 decimal places
                    if (parts[1] && parts[1].length > 2) {
                      return;
                    }
                    const num = Number(val);
                    if (isNaN(num)) return;
                    field.onChange(num);
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-center -mt-1 min-h-5">
                <TranslatedFormMessage t={t} className="mt-0" />
                <div className="text-xs text-muted-foreground ml-auto">
                  {t("common.max", "Max")} {MAX_PRICE.toLocaleString()}
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`tickets.${index}.quantity`}
          render={({ field }) => (
            <FormItem
              ref={(el) => registerFieldRef?.(`tickets[${index}].quantity`, el)}
            >
              <FormLabel className="inline-block">
                {t("event.field.ticketQuantity", "Quantity")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  type="number"
                  placeholder={t(
                    "event.placeholder.quantity",
                    "Enter number of quantity",
                  )}
                  max={MAX_QUANTITY}
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
                    if (val.length > QUANTITY_MAX_CHARS) {
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
              <div className="flex justify-between items-center -mt-1 min-h-5">
                <TranslatedFormMessage t={t} className="mt-0" />
                <div className="text-xs text-muted-foreground ml-auto">
                  {t("common.max", "Max")} {MAX_QUANTITY.toLocaleString()}
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* <FormField
          control={control}
          name={`tickets.${index}.gst`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-block">
                {t("event.field.gst", "GST (%)")}
              </FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  type="number"
                  placeholder={t(
                    "event.placeholder.gst",
                    "Enter GST in percentage",
                  )}
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
              <div className="flex justify-between items-center">
                <TranslatedFormMessage t={t} className="mt-0" />
              </div>
            </FormItem>
          )}
        /> */}

        <FormField
          control={control}
          name={`tickets.${index}.salesStart`}
          render={({ field, fieldState }) => (
            <FormItem
              ref={(el) =>
                registerFieldRef?.(`tickets[${index}].salesStart`, el)
              }
            >
              <FormLabel className="inline-block">
                {t("event.field.salesStart", "Sales Start Date")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ShadcnDateTimePicker
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => {
                    if (!date) {
                      field.onChange("");
                    } else {
                      field.onChange(date.toISOString());
                      // Clear salesEnd if it's now before the new salesStart
                      if (salesEndValue && new Date(salesEndValue) <= date) {
                        setValue(`tickets.${index}.salesEnd`, "");
                      }
                    }
                  }}
                  format="yyyy-MM-dd hh:mm aa"
                  clearable
                  error={!!fieldState.error}
                  minDate={minDate}
                  maxDate={eventStartDate}
                />
              </FormControl>
              <TranslatedFormMessage t={t} />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`tickets.${index}.salesEnd`}
          render={({ field, fieldState }) => (
            <FormItem
              ref={(el) => registerFieldRef?.(`tickets[${index}].salesEnd`, el)}
            >
              <FormLabel className="inline-block">
                {t("event.field.salesEnd", "Sales End Date")}{" "}
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
                  minDate={salesStartDate ?? minDate}
                  maxDate={eventStartDate}
                />
              </FormControl>
              <TranslatedFormMessage t={t} />
            </FormItem>
          )}
        />
      </div>

      {showDelete && (
        <Trash2
          onClick={onDelete}
          className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
        />
      )}
    </div>
  );
};

export default TicketTierCard;

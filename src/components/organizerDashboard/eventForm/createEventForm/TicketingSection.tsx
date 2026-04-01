"use client";

import { Plus } from "lucide-react";
import {
  Control,
  useFieldArray,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { EventFormData } from "@/lib/validation";
import { TierTemplate } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TicketTierCard from "./TicketTierCard";

const SUPPORTED_CURRENCIES = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "gbp", label: "GBP (£)" },
  { value: "aud", label: "AUD ($)" },
  { value: "cad", label: "CAD ($)" },
  { value: "jpy", label: "JPY (¥)" },
  { value: "nzd", label: "NZD ($)" },
  { value: "chf", label: "CHF" },
  { value: "sgd", label: "SGD ($)" },
  { value: "hkd", label: "HKD ($)" },
  { value: "sek", label: "SEK (kr)" },
  { value: "mxn", label: "MXN ($)" },
  { value: "inr", label: "INR (₹)" },
  { value: "brl", label: "BRL (R$)" },
];

interface TicketingSectionProps {
  control: Control<EventFormData>;
  tierTemplates: TierTemplate[];
  onCreateNewTier: (index: number) => void;
  registerFieldRef?: (name: string, element: HTMLElement | null) => void;
}

export function TicketingSection({
  control,
  tierTemplates,
  onCreateNewTier,
  registerFieldRef,
}: TicketingSectionProps) {
  const { t } = useTranslation();
  const { watch } = useFormContext<EventFormData>();
  const startDate = watch("startDate");
  const eventStartDate = startDate ? new Date(startDate) : undefined;

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control,
    name: "tickets",
  });

  return (
    <div className="mb-6 @container">
      <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <h2 className="text-md font-semibold text-primary">
            {t("event.section.ticketing", "Ticketing")}
          </h2>

          <div className="md:w-64">
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem
                  ref={(el) => registerFieldRef?.("currency", el)}
                  className="flex items-center gap-3 space-y-0"
                >
                  <FormLabel className="whitespace-nowrap font-medium">
                    {t("event.field.currency", "Currency")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue
                          placeholder={t(
                            "event.placeholder.currency",
                            "Select currency",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TranslatedFormMessage t={t} className="mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {ticketFields.map((field, index) => (
          <TicketTierCard
            key={field.id}
            index={index}
            control={control}
            tierTemplates={tierTemplates}
            showDelete={ticketFields.length > 1}
            onDelete={() => removeTicket(index)}
            onCreateNew={() => onCreateNewTier(index)}
            eventStartDate={eventStartDate}
            registerFieldRef={registerFieldRef}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendTicket({
              name: "",
              price: 0,
              quantity: 0,
              gst: 0,
              salesStart: "",
              salesEnd: "",
            })
          }
          className="flex items-center gap-2 text-primary border-primary hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" />
          {t("event.button.addTicketTier", "Add ticket tier")}
        </Button>
      </div>
    </div>
  );
}

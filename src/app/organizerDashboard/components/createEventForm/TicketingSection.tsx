"use client";

import { Plus } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/lib/validation";
import { TierTemplate } from "@/types/event";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import TicketTierCard from "../TicketTierCard";

interface TicketingSectionProps {
  control: Control<EventFormData>;
  tierTemplates: TierTemplate[];
  onCreateNewTier: (index: number) => void;
}

export function TicketingSection({
  control,
  tierTemplates,
  onCreateNewTier,
}: TicketingSectionProps) {
  const { t } = useTranslation();

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
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.section.ticketing", "Ticketing")}
        </h2>

        {ticketFields.map((field, index) => (
          <TicketTierCard
            key={field.id}
            index={index}
            control={control}
            tierTemplates={tierTemplates}
            showDelete={ticketFields.length > 1}
            onDelete={() => removeTicket(index)}
            onCreateNew={() => onCreateNewTier(index)}
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
              gst: 13,
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

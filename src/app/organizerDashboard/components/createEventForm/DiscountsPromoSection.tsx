"use client";

import { Plus } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { EventFormData } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import PromoCodeCard from "../PromoCodeCard";

interface DiscountsPromoSectionProps {
  control: Control<EventFormData>;
}

export function DiscountsPromoSection({ control }: DiscountsPromoSectionProps) {
  const { t } = useTranslation();

  const {
    fields: promoFields,
    append: appendPromo,
    remove: removePromo,
  } = useFieldArray({
    control,
    name: "promoCodes",
  });

  return (
    <div className="mb-6">
      <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.section.discountsPromo", "Discounts & Promo Codes")}
        </h2>

        {promoFields.map((field, index) => (
          <PromoCodeCard
            key={field.id}
            index={index}
            control={control}
            onDelete={() => removePromo(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendPromo({
              code: "",
              discountType: "",
              amount: 0,
              quantity: 0,
            })
          }
          className="flex items-center gap-2 text-primary border-primary hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" />
          {t("event.button.addPromoCode", "Add promo code")}
        </Button>
      </div>
    </div>
  );
}

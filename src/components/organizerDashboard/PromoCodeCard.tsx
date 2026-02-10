"use client";

import { Control, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useTranslation } from "@/hooks/useTranslation";
import { EventFormData, PROMO_CODE_NAME_MAX } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface PromoCodeCardProps {
  index: number;
  control: Control<EventFormData>;
  onDelete: () => void;
}

const PromoCodeCard = ({ index, control, onDelete }: PromoCodeCardProps) => {
  const { t } = useTranslation();

  const discountType = useWatch({
    control,
    name: `promoCodes.${index}.discountType`,
  });

  const isPercentage = discountType === "percentage";

  return (
    <div className="border border-gray-200 rounded-lg p-4 relative">
      <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-4 gap-5">
        <FormField
          control={control}
          name={`promoCodes.${index}.code`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-block">{t("event.field.promoCode", "Promo Code")} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  placeholder="e.g EARLYBIRD"
                  maxLength={PROMO_CODE_NAME_MAX}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                  }}
                />
              </FormControl>
              <div className="flex justify-between items-center -mt-1 min-h-[20px]">
                <TranslatedFormMessage t={t} className="mt-0" />
                <div className="text-xs text-muted-foreground ml-auto">
                  {field.value?.length || 0}/{PROMO_CODE_NAME_MAX} {t("common.characters", "characters")}
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`promoCodes.${index}.discountType`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="inline-block">{t("event.field.discountType", "Discount Type")} <span className="text-red-500">*</span></FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={cn("h-13 md:text-md", !!fieldState.error && "border-red-500 focus:ring-red-500/20")}>
                    <SelectValue placeholder={t("event.placeholder.discountType", "Select discount type")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="amount">{t("event.option.amountFixed", "Amount (Fixed)")}</SelectItem>
                  <SelectItem value="percentage">{t("event.option.percentage", "Percentage (%)")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between items-center -mt-1">
                <TranslatedFormMessage t={t} className="mt-0" />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`promoCodes.${index}.amount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-block">
                {isPercentage
                  ? t("event.field.discountPercentage", "Percentage (%)")
                  : t("event.field.discountAmount", "Discount Amount")
                } <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  type="number"
                  placeholder={isPercentage
                    ? t("event.placeholder.discountPercentage", "Enter discount percentage")
                    : t("event.placeholder.discountAmount", "Enter discount amount")
                  }
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
          name={`promoCodes.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-block">{t("event.field.discountQuantity", "Quantity")} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  className="h-13 md:text-md"
                  type="number"
                  placeholder={t("event.placeholder.quantity", "Enter quantity")}
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
      </div>

      <Trash2
        onClick={onDelete}
        className="absolute right-4 top-4 text-red-400 w-5 h-5 p-1 rounded-md hover:bg-red-200 cursor-pointer"
      />
    </div>
  );
};

export default PromoCodeCard;

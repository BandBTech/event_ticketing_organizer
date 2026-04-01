"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

interface FormActionButtonsProps {
  isEditing: boolean;
  isPending: boolean;
  onCancel: () => void;
  isDirty?: boolean;
  hasImageChange?: boolean;
}

export function FormActionButtons({
  isEditing,
  isPending,
  onCancel,
  isDirty = false,
  hasImageChange = false,
}: FormActionButtonsProps) {
  const { t } = useTranslation();

  const hasChanges = isDirty || hasImageChange;
  const isSubmitDisabled = isPending || (isEditing && !hasChanges);

  return (
    <div className="flex justify-between items-center gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        {t("common.button.cancel", "Cancel")}
      </Button>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isPending
            ? t("common.saving", "Saving...")
            : isEditing
              ? t("event.button.updateEvent", "Update Event")
              : t("event.button.createEvent", "Create Event")}
        </Button>
      </div>
    </div>
  );
}

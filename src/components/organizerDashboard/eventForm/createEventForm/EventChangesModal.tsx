"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Event, UpdateEventRequest, TierTemplate } from "@/types/event";
import { EventChangesViewer } from "./EventChangesViewer";
import { EventFormData } from "@/lib/validation";

interface EventChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  initialData?: Event;
  currentValues: EventFormData;
  changedFields: UpdateEventRequest;
  tierTemplates: TierTemplate[];
  imagePreview: string;
}

export function EventChangesModal({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  initialData,
  currentValues,
  changedFields,
  tierTemplates,
  imagePreview,
}: EventChangesModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (!initialData) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-6 rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <AlertDialogHeader className="pb-4 border-b border-gray-100 shrink-0">
          <AlertDialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <PencilSimpleIcon weight="duotone" className="w-5 h-5" />
            </div>
            {t("event.confirm.updateTitle", "Confirm Changes")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500 mt-1.5">
            {t(
              "event.confirm.updateDescription",
              "Please review the changes you made to the event details before saving.",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-hidden my-4">
          <ScrollArea className="h-[55vh] w-full pr-3">
            <EventChangesViewer
              initialData={initialData}
              currentValues={currentValues}
              changedFields={changedFields}
              tierTemplates={tierTemplates}
              imagePreview={imagePreview}
            />
          </ScrollArea>
        </div>

        <AlertDialogFooter className="pt-4 border-t border-gray-100 mt-auto shrink-0 flex items-center justify-end gap-3">
          <AlertDialogCancel
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
          >
            {t("common.cancelButton", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {t("common.saveChanges", "Save Changes")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

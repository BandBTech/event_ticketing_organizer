"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { OrganizerProfileForm } from "@/components/organizer/OrganizerProfileForm";
import { OrganizerProfileFormValues } from "@/lib/validation";

export function CompleteProfileDialog() {
  const { isOrganizerComplete, isAuthenticated, updateOrganizerProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if authenticated and profile is incomplete
    if (isAuthenticated && isOrganizerComplete === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isOrganizerComplete, isAuthenticated]);

  const mutation = useMutation({
    mutationFn: async ({ data, logo }: { data: OrganizerProfileFormValues; logo: File | null | undefined }) => {
      await updateOrganizerProfile({
        business_name: data.business_name,
        business_description: data.business_description,
        business_logo: logo || undefined,
      });
    },
    onSuccess: () => {
      toast.success("profile.toast.updateSuccess", "Profile updated successfully!");
      setIsOpen(false);
    },
    onError: (error: unknown) => {
      console.error("Failed to update profile", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile.";
      toast.error("profile.toast.updateError", errorMessage);
    },
  });

  const handleSubmit = (data: OrganizerProfileFormValues, logo: File | null | undefined) => {
    mutation.mutate({ data, logo });
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {t("completeProfile.title", "Complete Your Organizer Profile")}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t("completeProfile.description", "Please provide your business details to start creating events.")}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <OrganizerProfileForm
            isEditing={true}
            isPending={mutation.isPending}
            onSubmit={handleSubmit}
            showActions={false}
            showLogoUploader={true}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={mutation.isPending}
              className="w-full sm:w-auto h-12"
            >
              {t("completeProfile.skipButton", "Skip for now")}
            </Button>
            <Button
              type="submit"
              form="organizer-profile-form"
              disabled={mutation.isPending}
              className={cn(
                "w-full sm:flex-1 h-12 rounded-lg font-medium transition-all duration-200",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                mutation.isPending && "animate-pulse"
              )}
              onClick={() => {
                // Trigger form submission programmatically
                const form = document.querySelector('form');
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              {mutation.isPending
                ? t("profile.saving", "Saving...")
                : t("completeProfile.saveButton", "Save & Continue")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

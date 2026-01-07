"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { BuildingOfficeIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/image-uploader";

const profileSchema = z.object({
  business_name: z.string().min(3, "Business name must be at least 3 characters."),
  business_description: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function CompleteProfileDialog() {
  const { isOrganizerComplete, isAuthenticated, updateOrganizerProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  useEffect(() => {
    // Only show if authenticated and profile is incomplete
    if (isAuthenticated && isOrganizerComplete === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isOrganizerComplete, isAuthenticated]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await updateOrganizerProfile({
        business_name: data.business_name,
        business_description: data.business_description,
        business_logo: selectedFile || undefined,
      });
    },
    onSuccess: () => {
      toast.success("profile.updateSuccess", "Profile updated successfully!");
      setIsOpen(false);
    },
    onError: (error: unknown) => {
      console.error("Failed to update profile", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error("profile.updateError", errorMessage);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("profile.fileTooLarge", "File size must be less than 2MB");
        return;
      }

      setSelectedFile(file);
    }
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
            Complete Your Organizer Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please provide your business details to start creating events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Business Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="business_name"
              className="text-sm font-medium text-gray-900 block"
            >
              Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                aria-hidden="true"
              >
                <BuildingOfficeIcon
                  weight="duotone"
                  size={24}
                  className="text-gray-600"
                />
              </div>
              <Input
                id="business_name"
                placeholder="Enter your business name"
                className={cn(
                  "h-12 pl-16 pr-4",
                  errors.business_name && "border-destructive"
                )}
                {...register("business_name")}
              />
            </div>
            {errors.business_name && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {errors.business_name.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label
              htmlFor="business_description"
              className="text-sm font-medium text-gray-900 block"
            >
              Description
            </label>
            <div className="relative">
              {/* <div
                className="absolute left-3 top-4 flex items-center justify-center w-10 h-6 rounded-full"
                aria-hidden="true"
              >
                <FileTextIcon
                  weight="duotone"
                  size={24}
                  className="text-gray-600"
                />
              </div> */}
              <Textarea
                id="business_description"
                className="min-h-[100px] pl-4 pr-4 py-3"
                placeholder="Tell us about your business"
                {...register("business_description")}
              />
            </div>
            {errors.business_description && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {errors.business_description.message}
              </p>
            )}
          </div>

          {/* Logo Upload Field */}
          <div className="space-y-2">
            <ImageUploader
              label="Logo"
              value={selectedFile ? URL.createObjectURL(selectedFile) : ""}
              onChange={(file) => {
                if (file) {
                  setSelectedFile(file);
                } else {
                  setSelectedFile(null);
                }
              }}
              onRemove={() => setSelectedFile(null)}
              maxSizeMB={2}
              helperText="Recommended size: 500x500px."
              helperTextSize="Max size: 2MB."
            />
          </div>

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "w-full sm:flex-1 h-12 rounded-lg font-medium transition-all duration-200",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                mutation.isPending && "animate-pulse"
              )}
            >
              {mutation.isPending ? "Saving..." : "Save & Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

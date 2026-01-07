"use client";

import { useCallback } from "react";
import { Control } from "react-hook-form";
import { EventFormData } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Editor } from "@/components/blocks/rte/editor";
import CategoryTagsSelector from "../CategoryTagsSelector";
import { cn } from "@/lib/utils";

interface EventDetailsSectionProps {
  control: Control<EventFormData>;
  // Image state
  imagePreview: string;
  imageError: string;
  imageRemoved: boolean;
  initialBannerImage?: string;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
  // Form errors for description (since Editor is not a FormField)
  descriptionError?: string;
  onDescriptionChange: (html: string) => void;
  onDescriptionClearError: () => void;
  // For editor key (edit mode)
  isEditing?: boolean;
  eventId?: string;
  initialDescription?: string;
}

export function EventDetailsSection({
  control,
  imagePreview,
  imageError,
  imageRemoved,
  initialBannerImage,
  onImageChange,
  onImageRemove,
  descriptionError,
  onDescriptionChange,
  onDescriptionClearError,
  isEditing = false,
  eventId,
  initialDescription = "",
}: EventDetailsSectionProps) {
  const { t } = useTranslation();

  const handleHtmlChange = useCallback(
    (html: string) => {
      onDescriptionChange(html);
      if (html && html.trim()) {
        onDescriptionClearError();
      }
    },
    [onDescriptionChange, onDescriptionClearError]
  );

  return (
    <div className="mb-6">
      <div className="p-6 space-y-5 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.eventDetails", "Event Details")}
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          <ImageUploader
            label={t("event.field.uploadBanner", "Upload Banner")}
            helperText={t("event.helperText.bannerImage", "Upload banner image or drag & drop")}
            helperTextSize={t(
              "event.helperText.bannerImageSize",
              "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB"
            )}
            value={imageRemoved ? "" : imagePreview || initialBannerImage || ""}
            onChange={(file) => {
              if (file) onImageChange(file);
            }}
            onRemove={onImageRemove}
            error={imageError}
            browseButtonText={t("event.helperText.bannerImageBrowse", "Browse File")}
            required
          />

          <div className="flex flex-col gap-5">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="inline-block">
                    {t("event.field.eventTitle", "Event Title")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-13 md:text-md"
                      placeholder={t("event.placeholder.eventTitle", "Enter event title")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="inline-block">
                    {t("event.field.categoryTags", "Category Tags")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <CategoryTagsSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select or type categories..."
                      maxTags={5}
                      className="h-13 md:text-md"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Description Editor */}
        <div className="space-y-2">
          <Label
            className={cn("inline-block", descriptionError && "text-red-500")}
          >
            {t("event.field.eventDescription", "Event Description")}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div
            className={cn(
              "rounded-lg border transition-colors",
              descriptionError
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-gray-300"
            )}
          >
            <Editor
              key={isEditing ? `editor-${eventId}` : "editor-new"}
              initialHtml={isEditing ? initialDescription : ""}
              onHtmlChange={handleHtmlChange}
              placeholder={t(
                "event.placeholder.eventDescription",
                "Write about your event..."
              )}
            />
          </div>
          {descriptionError && (
            <p className="text-red-500 text-[0.8rem] mt-1 flex items-center gap-1">
              {descriptionError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

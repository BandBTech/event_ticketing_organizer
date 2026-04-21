"use client";

import { useCallback, useState } from "react";
import { Control, useFormContext } from "react-hook-form";
import {
  EventFormData,
  EVENT_TITLE_MAX,
  EVENT_DESC_MAX,
} from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Editor } from "@/components/editor/editor";
import CategoryTagsSelector from "@/components/organizerDashboard/CategoryTagsSelector";
import { cn } from "@/lib/utils";

interface EventDetailsSectionProps {
  control: Control<EventFormData>;
  imagePreview: string;
  imageError: string;
  imageErrorParams?: Record<string, string | number>;
  imageRemoved: boolean;
  initialBannerImage?: string;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
  descriptionError?: string;
  onDescriptionChange: (html: string) => void;
  onDescriptionClearError: () => void;
  isEditing?: boolean;
  eventId?: string;
  initialDescription?: string;
  onTagsChange?: (tags: string[]) => void;
  registerFieldRef?: (name: string, element: HTMLElement | null) => void;
}

export function EventDetailsSection({
  control,
  imagePreview,
  imageError,
  imageErrorParams,
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
  onTagsChange,
  registerFieldRef,
}: EventDetailsSectionProps) {
  const { t } = useTranslation();
  const { setError, clearErrors } = useFormContext<EventFormData>();

  // Initialise from the initial HTML using DOM parsing so the counter is
  // accurate before the first keystroke (avoids HTML-entity counting errors).
  const [descriptionTextLength, setDescriptionTextLength] = useState(() => {
    if (!initialDescription) return 0;
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = initialDescription;
      return (div.textContent || "").replace(/\n/g, "").length;
    }
    return initialDescription.replace(/<[^>]*>/g, "").length;
  });

  const handleHtmlChange = useCallback(
    (html: string) => {
      const textContent = html.replace(/<[^>]*>/g, "").trim();
      const hasImage = /<img\s/i.test(html);
      const valueToSet = textContent || hasImage ? html : "";
      onDescriptionChange(valueToSet);
      if (valueToSet) {
        onDescriptionClearError();
      }
    },
    [onDescriptionChange, onDescriptionClearError],
  );

  return (
    <div className="mb-6 @container">
      <div className="p-6 space-y-5 shadow-blur-subtle-md bg-white/60 rounded-xl">
        <h2 className="text-md font-semibold text-primary mb-2!">
          {t("event.eventDetails", "Event Details")}
        </h2>
        <div className="grid @2xl:grid-cols-2 gap-5">
          <div ref={(el) => registerFieldRef?.("image", el)}>
            <ImageUploader
              label={t("event.field.uploadBanner", "Upload Banner")}
              helperText={t(
                "event.helperText.bannerImage",
                "Upload banner image or drag & drop",
              )}
              helperTextSize={t(
                "event.helperText.bannerImageSize",
                "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB",
              )}
              value={
                imageRemoved ? "" : imagePreview || initialBannerImage || ""
              }
              onChange={(file) => {
                if (file) onImageChange(file);
              }}
              onRemove={onImageRemove}
              error={imageError}
              errorParams={imageErrorParams}
              browseButtonText={t(
                "event.helperText.bannerImageBrowse",
                "Browse File",
              )}
              required
            />
          </div>

          <div className="flex flex-col gap-5">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem ref={(el) => registerFieldRef?.("name", el)}>
                  <FormLabel className="inline-block">
                    {t("event.field.eventTitle", "Event Title")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="h-13 md:text-md"
                        placeholder={t(
                          "event.placeholder.eventTitle",
                          "Enter event title",
                        )}
                        maxLength={EVENT_TITLE_MAX}
                        {...field}
                      />
                      <div className="flex justify-between items-center mt-1 min-h-[20px]">
                        <TranslatedFormMessage t={t} className="mt-0" />
                        <div className="text-xs text-muted-foreground ml-auto">
                          {field.value?.length || 0}/{EVENT_TITLE_MAX}{" "}
                          {t("common.characters", "characters")}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <FormItem ref={(el) => registerFieldRef?.("tags", el)}>
                  <FormLabel className="inline-block">
                    {t("event.field.categoryTags", "Category Tags")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <CategoryTagsSelector
                      value={field.value}
                      onChange={(newValue) => {
                        clearErrors("tags");
                        field.onChange(newValue);
                        onTagsChange?.(newValue);
                      }}
                      onDuplicate={() => {
                        setError("tags", {
                          type: "manual",
                          message:
                            "event.validation.tagAdded|Tag already added.",
                        });
                      }}
                      placeholder={t(
                        "event.placeholder.categoryTags",
                        "Enter category tags separated by commas",
                      )}
                      maxTags={5}
                      maxChars={50}
                      className="min-h-13 md:text-md"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <div className="flex justify-between items-start -mt-1 min-h-[20px]">
                    <TranslatedFormMessage t={t} className="mt-0" />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/5 {t("common.tags", "tags")} |{" "}
                      {t("common.max", "Max")} 50{" "}
                      {t("common.characters", "characters")}/
                      {t("common.tag", "tag")}
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            className={cn("inline-block", descriptionError && "text-red-500")}
          >
            {t("event.field.eventDescription", "Event Description")}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div
            ref={(el) => registerFieldRef?.("description", el)}
            className={cn(
              "rounded-lg border transition-colors",
              descriptionError
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-gray-300",
            )}
          >
            <Editor
              key={isEditing ? `editor-${eventId}` : "editor-new"}
              initialHtml={isEditing ? initialDescription : ""}
              onHtmlChange={handleHtmlChange}
              onLengthChange={setDescriptionTextLength}
              placeholder={t(
                "event.placeholder.eventDescription",
                "Write about your event...",
              )}
              maxLength={EVENT_DESC_MAX}
            />
          </div>
          <div className="flex justify-between items-center mt-1 min-h-[20px]">
            {descriptionError ? (
              <p className="text-xs font-medium text-destructive mt-0 flex items-center gap-1">
                {(() => {
                  const pipeIndex = descriptionError.indexOf("|");
                  if (pipeIndex === -1) return t(descriptionError);
                  const key = descriptionError.substring(0, pipeIndex);
                  const params: Record<string, string> = {};
                  descriptionError
                    .substring(pipeIndex + 1)
                    .split(",")
                    .forEach((pair) => {
                      const colonIdx = pair.indexOf(":");
                      if (colonIdx !== -1)
                        params[pair.substring(0, colonIdx).trim()] = pair
                          .substring(colonIdx + 1)
                          .trim();
                    });
                  return t(key, undefined, params);
                })()}
              </p>
            ) : (
              <div />
            )}
            <div className="text-xs text-muted-foreground ml-auto">
              {descriptionTextLength}/{EVENT_DESC_MAX}{" "}
              {t("common.characters", "characters")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

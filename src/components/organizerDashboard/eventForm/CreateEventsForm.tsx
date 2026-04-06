"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { EventFormData, createEventSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { eventService } from "@/services/eventService";
import {
  Event,
  TierTemplate,
  UpdateEventRequest,
  CreateEventData,
} from "@/types/event";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Form } from "@/components/ui/form";
import { queryKeys } from "@/lib/queryKeys";
import { CreateTierTemplateDialog } from "../settings/CreateTierTemplateDialog";
import {
  getEventFormDefaults,
  getChangedFields,
  prepareCreateEventData,
  getTierName,
} from "@/lib/eventFormUtils";
import {
  EventDetailsSection,
  VenueScheduleSection,
  TicketingSection,
  // DiscountsPromoSection,
  FormActionButtons,
  UnsavedChangesDialog,
} from "./createEventForm";

interface CreateEventFormProps {
  initialData?: Event;
  isEditing?: boolean;
}

export default function CreateEventsForm({
  initialData,
  isEditing = false,
}: CreateEventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { locale } = useLanguageStore();

  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState<number | null>(
    null,
  );

  const lastInitializedEventId = React.useRef<string | null>(null);
  const lastInitializedWithTemplates = React.useRef<boolean>(false);

  // Refs for form fields to enable scrolling to errors
  const fieldRefs = React.useRef<Record<string, HTMLElement | null>>({});

  const registerFieldRef = React.useCallback(
    (name: string, element: HTMLElement | null) => {
      if (name) {
        fieldRefs.current[name] = element;
      }
    },
    [],
  );

  const {
    imageFile,
    imagePreview,
    imageError,
    imageErrorParams,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
    resetImage,
    setImagePreview,
  } = useImageUpload({
    initialPreview: initialData?.banner_image || "",
  });

  const { data: tierTemplates = [] } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => eventService.getTierTemplates(),
  });

  const eventSchema = useMemo(
    () =>
      createEventSchema((key, fallback, params) => {
        if (!params || Object.keys(params).length === 0) return key;
        const strParams = Object.entries(params)
          .map(([k, v]) => `${k}:${v}`)
          .join(",");
        return `${key}|${strParams}`;
      }),
    [],
  );

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: getEventFormDefaults(initialData, tierTemplates, locale),
    mode: "onChange",
    criteriaMode: "all",
  });

  const { isDirty } = form.formState;

  const hasUnsavedChanges = useCallback(() => {
    // Check both form dirty state and image changes
    return isDirty || (imageFile !== null && !imageRemoved);
  }, [isDirty, imageFile, imageRemoved]);

  const {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
  } = useNavigationGuard({
    hasUnsavedChanges,
    onBeforeLeave: () => {
      form.reset(form.getValues());
    },
  });

  useEffect(() => {
    if (initialData && isEditing) {
      const sameEvent = lastInitializedEventId.current === initialData.id;
      const templatesNowAvailable = tierTemplates.length > 0;

      if (
        sameEvent &&
        (lastInitializedWithTemplates.current || !templatesNowAvailable)
      ) {
        return;
      }

      const isReInitWithTemplates =
        sameEvent && !lastInitializedWithTemplates.current && templatesNowAvailable;

      lastInitializedEventId.current = initialData.id;
      lastInitializedWithTemplates.current = templatesNowAvailable;

      if (isReInitWithTemplates) {
        // Templates just loaded — only update ticket tier names (which depend on
        // template lookup) without resetting user-edited fields like capacity.
        const tiers = initialData.tiers || [];
        tiers.forEach((tier, index) => {
          const resolvedName = getTierName(tier, tierTemplates);
          const currentName = form.getValues(`tickets.${index}.name`);
          if (!currentName && resolvedName) {
            form.setValue(`tickets.${index}.name`, resolvedName);
          }
        });
      } else {
        // First initialisation — full reset is safe since user hasn't edited yet.
        form.reset(getEventFormDefaults(initialData, tierTemplates));

        if (
          initialData.banner_image &&
          typeof initialData.banner_image === "string"
        ) {
          setImagePreview(initialData.banner_image);
        }
      }
    }
  }, [initialData, isEditing, form, tierTemplates, setImagePreview]);

  const saveEventMutation = useMutation({
    mutationFn: async (data: {
      eventData: CreateEventData | UpdateEventRequest;
      isUpdate: boolean;
      id?: string;
    }) => {
      if (data.isUpdate && data.id) {
        return eventService.updateEvent(
          data.id,
          data.eventData as UpdateEventRequest,
        );
      } else {
        return eventService.createEvent(data.eventData as CreateEventData);
      }
    },
    onSuccess: async () => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
      ];

      if (isEditing && initialData?.id) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.events.detail(initialData.id),
          }),
        );
      }

      await Promise.all(invalidations);

      toast.success(
        isEditing ? "Event Updated" : "Event Created",
        `Event has been successfully ${isEditing ? "updated" : "created"}.`,
      );

      // Reset ALL form dirty state before navigation to prevent unsaved changes dialog
      form.reset(undefined, { keepValues: false });
      // Reset image state completely
      resetImage("");
      // Wait a tick for state to settle before navigating
      setTimeout(() => {
        router.push("/organizerDashboard/event");
      }, 50);
    },
  });

  // Scroll to the first error field on form submission
  const scrollToFirstError = useCallback(async () => {
    const errors = form.formState.errors;
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) return;

    // Helper to get the first error field name (handles nested errors like tickets[0].name)
    const getFirstErrorField = (
      obj: Record<string, unknown>,
      prefix = "",
    ): string | null => {
      // Priority order for top-level fields
      const priorityOrder = [
        "name",
        "image",
        "tags",
        "description",
        "venue",
        "venueAddress",
        "capacity",
        "startDate",
        "endDate",
        "currency",
        "tickets",
      ];

      // Sort keys by priority
      const sortedKeys = Object.keys(obj).sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a);
        const bIndex = priorityOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
      });

      for (const key of sortedKeys) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const error = obj[key] as Record<string, unknown> | undefined;

        // If this is a field error (has message) or we found an error, return it
        if (error?.message || !error?.types) {
          // Check if it's a nested object (like tickets array)
          if (
            error &&
            typeof error === "object" &&
            error.message === undefined
          ) {
            const nestedResult = getFirstErrorField(error, fullPath);
            if (nestedResult) return nestedResult;
          }
          return fullPath;
        }
      }
      return null;
    };

    const firstErrorField = getFirstErrorField(errors);

    if (firstErrorField) {
      // Wait a bit for the DOM to update with error states
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Try to find the field element
      let fieldElement: HTMLElement | null = null;

      // For array fields like tickets[0].name, try different variations
      const possibleNames = [
        firstErrorField,
        firstErrorField.replace(/\[(\d+)\]/, ".$1"), // tickets[0].name -> tickets.0.name
      ];

      for (const name of possibleNames) {
        if (fieldRefs.current[name]) {
          fieldElement = fieldRefs.current[name];
          break;
        }
      }

      // Fallback: try to find by various selectors
      if (!fieldElement) {
        // Try to find by name attribute
        fieldElement =
          document.querySelector(`[name="${firstErrorField}"]`) ||
          document.querySelector(`[name^="${firstErrorField}."]`) ||
          document.querySelector(
            `[name^="${firstErrorField.replace(/\[(\d+)\]/, ".$1")}"]`,
          ) ||
          document.querySelector(
            `[aria-describedby*="${firstErrorField.replace(/\[(\d+)\]/, ".$1")}"]`,
          );
      }

      // For tickets array, try to find the specific card
      if (!fieldElement && firstErrorField.startsWith("tickets")) {
        const match = firstErrorField.match(/tickets\[(\d+)\]\.(\w+)/);
        if (match) {
          const [, index] = match;
          // Try to find the ticket card by index
          const ticketCards = document.querySelectorAll("[data-ticket-index]");
          const targetCard = ticketCards[parseInt(index)];
          if (targetCard) {
            fieldElement = targetCard as HTMLElement;
          }
        }
      }

      // For date fields, try to find the input within the picker
      if (
        !fieldElement &&
        (firstErrorField === "startDate" ||
          firstErrorField === "endDate" ||
          firstErrorField.includes("salesStart") ||
          firstErrorField.includes("salesEnd"))
      ) {
        const dateInputs = document.querySelectorAll(
          'input[type="text"][aria-invalid="true"], input[type="text"][class*="destructive"]',
        );
        if (dateInputs.length > 0) {
          fieldElement = dateInputs[0] as HTMLElement;
        }
      }

      // For venue address, look for the address autocomplete input
      if (!fieldElement && firstErrorField === "venueAddress") {
        fieldElement = document.querySelector(
          'input[placeholder*="venue address"], input[placeholder*="Search for venue"]',
        );
      }

      // For description, look for the editor container
      if (!fieldElement && firstErrorField === "description") {
        fieldElement = document.querySelector(
          '[class*="description"] [contenteditable], .ProseMirror, [data-placeholder*="Write about your event"]',
        );
      }

      // For image, look for the image uploader container
      if (!fieldElement && firstErrorField === "image") {
        fieldElement = document.querySelector(
          '[class*="image-uploader"], [class*="dropzone"]',
        );
      }

      if (fieldElement) {
        // Scroll the element into view
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [form.formState.errors]);

  // Scroll to first error when form is submitted with errors
  const { isSubmitted, errors } = form.formState;
  React.useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      scrollToFirstError();
    }
  }, [isSubmitted, errors, scrollToFirstError]);

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      const tiersData = [];
      for (let i = 0; i < data.tickets.length; i++) {
        const ticket = data.tickets[i];
        let tierId = "";

        const existingTemplate = tierTemplates.find(
          (t) => t.template_name.toLowerCase() === ticket.name.toLowerCase(),
        );

        if (existingTemplate) {
          tierId = existingTemplate.id;
        } else {
          toast.error(
            "Error",
            `Tier template '${ticket.name}' not found. Please select a valid tier.`,
          );
          return;
        }

        tiersData.push({
          tier_template_id: tierId,
          price: ticket.price || 0,
          quantity: ticket.quantity || 0,
          gst: isNaN(ticket.gst) ? 0 : ticket.gst || 0,
          sales_start: ticket.salesStart || undefined,
          sales_end: ticket.salesEnd || undefined,
          sort_order: i,
        });
      }

      if (isEditing && initialData) {
        const changedFields = getChangedFields(
          data,
          tiersData,
          initialData,
          imageFile,
        );

        if (changedFields && Object.keys(changedFields).length === 0) {
          toast.info("No Changes", "No changes detected to update.");
          return;
        }

        if (changedFields) {
          saveEventMutation.mutate({
            eventData: changedFields,
            isUpdate: true,
            id: initialData.id,
          });
        }
      } else {
        const eventData = prepareCreateEventData(data, tiersData, imageFile);
        saveEventMutation.mutate({ eventData, isUpdate: false });
      }
    } catch (error) {
      console.error("Error preparing event data:", error);
    }
  };

  const handleDescriptionChange = useCallback(
    (html: string) => {
      form.setValue("description", html, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const handleDescriptionClearError = useCallback(() => {
    form.clearErrors("description");
  }, [form]);

  const handleImageChange = useCallback(
    (file: File) => {
      validateAndProcessImage(file);
      form.setValue("image", "pending", { shouldDirty: true });
      form.clearErrors("image");
    },
    [validateAndProcessImage, form],
  );

  const handleImageRemove = useCallback(() => {
    handleRemoveImage();
    form.setValue("image", "", { shouldDirty: true, shouldValidate: true });
  }, [handleRemoveImage, form]);

  const handleCreateNewTier = useCallback((index: number) => {
    setActiveTicketIndex(index);
    setOpenTemplateDialog(true);
  }, []);

  const handleCancel = useCallback(() => {
    handleNavigateAway(() => router.push("/organizerDashboard/event"));
  }, [handleNavigateAway, router]);

  return (
    <div className="p-6 space-y-6 container mx-auto max-w-7xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <EventDetailsSection
            control={form.control}
            imagePreview={imagePreview}
            imageError={
              imageError || form.formState.errors.image?.message || ""
            }
            imageErrorParams={imageError ? imageErrorParams : {}}
            imageRemoved={imageRemoved}
            initialBannerImage={initialData?.banner_image}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            descriptionError={form.formState.errors.description?.message}
            onDescriptionChange={handleDescriptionChange}
            onDescriptionClearError={handleDescriptionClearError}
            isEditing={isEditing}
            eventId={initialData?.id}
            initialDescription={initialData?.description || ""}
            onTagsChange={() => {
              // Trigger validation for tags explicitly
              setTimeout(() => {
                form.trigger("tags");
              }, 0);
            }}
            registerFieldRef={registerFieldRef}
          />

          <VenueScheduleSection
            control={form.control}
            registerFieldRef={registerFieldRef}
          />

          <TicketingSection
            control={form.control}
            tierTemplates={tierTemplates}
            onCreateNewTier={handleCreateNewTier}
            registerFieldRef={registerFieldRef}
          />

          {/* <DiscountsPromoSection control={form.control} /> */}

          <FormActionButtons
            isEditing={isEditing}
            isPending={saveEventMutation.isPending}
            onCancel={handleCancel}
            isDirty={isDirty}
            hasImageChange={imageFile !== null}
          />
        </form>
      </Form>

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />

      <CreateTierTemplateDialog
        open={openTemplateDialog}
        onOpenChange={(open) => {
          setOpenTemplateDialog(open);
          if (!open) setActiveTicketIndex(null);
        }}
        onSuccess={(newTemplate) => {
          queryClient.setQueryData(
            queryKeys.tierTemplates.all,
            (old: TierTemplate[] | undefined) =>
              old ? [newTemplate, ...old] : [newTemplate],
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.tierTemplates.all,
          });

          if (activeTicketIndex !== null) {
            const templateName =
              newTemplate.template_name ||
              (newTemplate as { name?: string }).name ||
              "";
            setTimeout(() => {
              form.setValue(`tickets.${activeTicketIndex}.name`, templateName, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }, 0);
          }
        }}
        initialData={null}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { EventFormData, createEventSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { eventService } from "@/services/eventService";
import { Event, TierTemplate, UpdateEventRequest, CreateEventData } from "@/types/event";
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
  const [activeTicketIndex, setActiveTicketIndex] = useState<number | null>(null);

  const lastInitializedEventId = React.useRef<string | null>(null);
  const lastInitializedWithTemplates = React.useRef<boolean>(false);

  const {
    imageFile,
    imagePreview,
    imageError,
    imageErrorParams,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
    setImagePreview,
  } = useImageUpload({
    initialPreview: initialData?.banner_image || "",
  });

  const { data: tierTemplates = [] } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => eventService.getTierTemplates(),
  });

  const eventSchema = useMemo(() => createEventSchema((key, fallback, params) => {
    if (!params || Object.keys(params).length === 0) return key;
    const strParams = Object.entries(params).map(([k, v]) => `${k}:${v}`).join(',');
    return `${key}|${strParams}`;
  }), []);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: getEventFormDefaults(initialData, tierTemplates, locale),
    mode: "onChange",
    criteriaMode: "all",
  });

  const { isDirty } = form.formState;

  const hasUnsavedChanges = useCallback(() => {
    return isDirty || imageFile !== null;
  }, [isDirty, imageFile]);

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

      if (sameEvent && (lastInitializedWithTemplates.current || !templatesNowAvailable)) {
        return;
      }

      lastInitializedEventId.current = initialData.id;
      lastInitializedWithTemplates.current = templatesNowAvailable;

      form.reset(getEventFormDefaults(initialData, tierTemplates));

      if (initialData.banner_image && typeof initialData.banner_image === "string") {
        setImagePreview(initialData.banner_image);
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
        return eventService.updateEvent(data.id, data.eventData as UpdateEventRequest);
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
          })
        );
      }

      await Promise.all(invalidations);

      toast.success(
        isEditing ? "Event Updated" : "Event Created",
        `Event has been successfully ${isEditing ? "updated" : "created"}.`
      );
      router.push("/organizerDashboard/event");
    },
  });

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      const tiersData = [];
      for (let i = 0; i < data.tickets.length; i++) {
        const ticket = data.tickets[i];
        let tierId = "";

        const existingTemplate = tierTemplates.find(
          (t) => t.template_name.toLowerCase() === ticket.name.toLowerCase()
        );

        if (existingTemplate) {
          tierId = existingTemplate.id;
        } else {
          toast.error("Error", `Tier template '${ticket.name}' not found. Please select a valid tier.`);
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
        const changedFields = getChangedFields(data, tiersData, initialData, imageFile);

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
      form.setValue("description", html, { shouldDirty: true, shouldValidate: true });
    },
    [form]
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
    [validateAndProcessImage, form]
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
            imageError={imageError || form.formState.errors.image?.message || ""}
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
          />

          <VenueScheduleSection control={form.control} />

          <TicketingSection
            control={form.control}
            tierTemplates={tierTemplates}
            onCreateNewTier={handleCreateNewTier}
          />

          {/* <DiscountsPromoSection control={form.control} /> */}

          <FormActionButtons
            isEditing={isEditing}
            isPending={saveEventMutation.isPending}
            onCancel={handleCancel}
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
            (old: TierTemplate[] | undefined) => (old ? [newTemplate, ...old] : [newTemplate])
          );

          queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });

          if (activeTicketIndex !== null) {
            const templateName = newTemplate.template_name || (newTemplate as { name?: string }).name || "";
            setTimeout(() => {
              form.setValue(`tickets.${activeTicketIndex}.name`, templateName, { shouldDirty: true, shouldValidate: true });
            }, 0);
          }
        }}
        initialData={null}
      />
    </div>
  );
}

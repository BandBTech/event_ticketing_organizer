"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EventFormData, createEventSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { eventService } from "@/services/eventService";
import { Event, TierTemplate, UpdateEventRequest, CreateEventData } from "@/types/event";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Form } from "@/components/ui/form";
import { queryKeys } from "@/lib/queryKeys";
import { CreateTierTemplateDialog } from "./CreateTierTemplateDialog";
import {
  getEventFormDefaults,
  getChangedFields,
  prepareCreateEventData,
} from "@/lib/eventFormUtils";
import {
  EventDetailsSection,
  VenueScheduleSection,
  TicketingSection,
  DiscountsPromoSection,
  FormActionButtons,
  UnsavedChangesDialog,
} from "./createEventForm";

interface CreateEventFormProps {
  initialData?: Event;
  isEditing?: boolean;
}

export default function CreateEventPage({
  initialData,
  isEditing = false,
}: CreateEventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Tier template dialog state
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState<number | null>(null);

  // Tracking for form initialization
  const lastInitializedEventId = React.useRef<string | null>(null);
  const lastInitializedWithTemplates = React.useRef<boolean>(false);

  // Image upload hook
  const {
    imageFile,
    imagePreview,
    imageError,
    imageRemoved,
    validateAndProcessImage,
    handleRemoveImage,
    setImagePreview,
  } = useImageUpload({
    initialPreview: initialData?.banner_image || "",
  });

  // Fetch tier templates
  const { data: tierTemplates = [] } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => eventService.getTierTemplates(),
  });

  // Create event schema with translations
  const eventSchema = useMemo(() => createEventSchema(t), [t]);

  // Form setup
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: getEventFormDefaults(initialData, tierTemplates),
    mode: "onChange",
  });

  // Use isDirty from form state to track unsaved changes
  const { isDirty } = form.formState;

  // Check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return isDirty || imageFile !== null;
  }, [isDirty, imageFile]);

  // Navigation guard hook
  const {
    showLeaveDialog,
    setShowLeaveDialog,
    confirmLeave,
    cancelLeave,
    handleNavigateAway,
  } = useNavigationGuard({
    hasUnsavedChanges,
    onBeforeLeave: () => {
      // Reset form to prevent popstate handler from blocking navigation
      form.reset(form.getValues());
    },
  });

  // Reset form when initialData or tierTemplates change (for edit mode)
  useEffect(() => {
    if (initialData && isEditing) {
      const sameEvent = lastInitializedEventId.current === initialData.id;
      const templatesNowAvailable = tierTemplates.length > 0;

      // Skip if: same event AND (we had templates before OR templates still not available)
      if (sameEvent && (lastInitializedWithTemplates.current || !templatesNowAvailable)) {
        return;
      }

      lastInitializedEventId.current = initialData.id;
      lastInitializedWithTemplates.current = templatesNowAvailable;

      form.reset(getEventFormDefaults(initialData, tierTemplates));

      // Update image preview
      if (initialData.banner_image && typeof initialData.banner_image === "string") {
        setImagePreview(initialData.banner_image);
      }
    }
  }, [initialData, isEditing, form, tierTemplates, setImagePreview]);

  // Create Tier Template Mutation
  const createTierTemplateMutation = useMutation({
    mutationFn: eventService.createTierTemplate,
    onSuccess: (newTemplate) => {
      queryClient.setQueryData(
        queryKeys.tierTemplates.all,
        (old: TierTemplate[] | undefined) => (old ? [...old, newTemplate] : [newTemplate])
      );
    },
  });

  // Create/Update Event Mutation
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
      // Pre-fetch events to update cache before navigation
      try {
        await queryClient.fetchQuery({
          queryKey: ["events"],
          queryFn: () => eventService.getEvents(),
          staleTime: 0,
        });
      } catch (error) {
        console.error("Failed to pre-fetch events:", error);
        await queryClient.invalidateQueries({ queryKey: ["events"] });
      }

      // If updating, also invalidate the specific event cache so re-editing fetches fresh data
      if (isEditing && initialData?.id) {
        await queryClient.invalidateQueries({ queryKey: ["event", initialData.id] });
      }

      toast.success(
        isEditing ? "Event Updated" : "Event Created",
        `Event has been successfully ${isEditing ? "updated" : "created"}.`
      );
      router.push("/organizerDashboard/pages/events");
    },
  });

  // Form submission handler
  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      // Prepare tiers data
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
          try {
            const newTemplate = await createTierTemplateMutation.mutateAsync({
              template_name: ticket.name,
              description: `Template for ${ticket.name}`,
            });
            tierId = newTemplate.id;
          } catch {
            toast.error("Error", `Failed to create tier template for ${ticket.name}`);
            return;
          }
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
        // Only send changed fields for update
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
        // Create new event
        const eventData = prepareCreateEventData(data, tiersData, imageFile);
        saveEventMutation.mutate({ eventData, isUpdate: false });
      }
    } catch (error) {
      console.error("Error preparing event data:", error);
    }
  };

  // Handlers for EventDetailsSection
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

  // Handler for creating new tier
  const handleCreateNewTier = useCallback((index: number) => {
    setActiveTicketIndex(index);
    setOpenTemplateDialog(true);
  }, []);

  // Handler for cancel button
  const handleCancel = useCallback(() => {
    handleNavigateAway(() => router.push("/organizerDashboard/pages/events"));
  }, [handleNavigateAway, router]);

  return (
    <div className="p-5 pt-3 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <EventDetailsSection
            control={form.control}
            imagePreview={imagePreview}
            imageError={imageError || form.formState.errors.image?.message || ""}
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
          />

          <VenueScheduleSection control={form.control} />

          <TicketingSection
            control={form.control}
            tierTemplates={tierTemplates}
            onCreateNewTier={handleCreateNewTier}
          />

          <DiscountsPromoSection control={form.control} />

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
        onSuccess={async (newTemplate) => {
          queryClient.setQueryData(
            ["tierTemplates"],
            (old: TierTemplate[] | undefined) => (old ? [...old, newTemplate] : [newTemplate])
          );

          await queryClient.invalidateQueries({ queryKey: ["tierTemplates"] });

          if (activeTicketIndex !== null) {
            const templateName = newTemplate.template_name || (newTemplate as { name?: string }).name || "";
            form.setValue(`tickets.${activeTicketIndex}.name`, templateName, { shouldDirty: true, shouldValidate: true });
          }
        }}
        initialData={null}
      />
    </div>
  );
}
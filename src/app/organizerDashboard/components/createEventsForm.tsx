"use client";

import { Plus } from "lucide-react";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useRouter } from "next/navigation";
import {
  EventFormData,
  createEventSchema,
  EVENT_TITLE_MAX,
  VENUE_NAME_MAX,
  EVENT_DESC_MAX,
  MAX_CAPACITY,
  VENUE_ADDRESS_MAX
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { eventService } from "@/services/eventService";
import { Event, TierTemplate } from "@/types/event";
import { Editor } from "@/components/blocks/rte/editor";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { ShadcnDateTimePicker } from "@/components/ui/shadcn-datetime-picker";
import CategoryTagsSelector from "./CategoryTagsSelector";
import TimezoneSelector from "./TimezoneSelector";
import { ImageUploader } from "@/components/ui/image-uploader";
import TicketTierCard from "./TicketTierCard";
import PromoCodeCard from "./PromoCodeCard";
import { CreateTierTemplateDialog } from "./CreateTierTemplateDialog";
import { cn } from "@/lib/utils";
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

interface CreateEventFormProps {
  initialData?: Event;
  isEditing?: boolean;
}

export default function CreateEventPage({ initialData, isEditing = false }: CreateEventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string>(initialData?.banner_image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const [imageRemoved, setImageRemoved] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState<number | null>(null);
  const lastInitializedEventId = React.useRef<string | null>(null);

  // Helper to parse category which might be a comma-separated string from backend despite type definition
  // Helper to parse category which might be a comma-separated string from backend despite type definition
  const parseCategory = useCallback((category: string | string[] | undefined): string[] => {
    if (!category) return [];
    if (Array.isArray(category)) {
      return category.map((c) => c.trim().replace(/^[{"]+|[}"]+$/g, ""));
    }
    if (typeof category === "string") {
      return (category as string)
        .split(",")
        .map((c) => c.trim().replace(/^[{"]+|[}"]+$/g, ""))
        .filter(Boolean);
    }
    return [];
  }, []);

  // Fetch tier templates using TanStack Query
  // Fetch tier templates using TanStack Query
  const { data: tierTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["tierTemplates"],
    queryFn: () => eventService.getTierTemplates(),
  });

  const eventSchema = useMemo(() => createEventSchema(t), [t]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: {
      name: initialData?.title || "",
      description: initialData?.description || "",
      tags: parseCategory(initialData?.category),
      image: initialData?.banner_image || "",
      venue: initialData?.venue_name || "",
      venueAddress: initialData?.address || "",
      capacity: initialData?.capacity || 0,
      timezone: initialData?.timezone || "",
      startDate: initialData?.start_date || "",
      endDate: initialData?.end_date || "",
      tickets: initialData?.tiers?.map((t) => ({
        id: t.id,
        name: t.tier_name,
        price: t.price,
        quantity: t.quantity,
        gst: t.gst || 0,
        salesStart: t.sales_start || "",
        salesEnd: t.sales_end || "",
      })) || [
          {
            name: "",
            price: 0,
            quantity: 0,
            gst: 13,
            salesStart: "",
            salesEnd: "",
          },
        ],
      promoCodes: [],
    },
    mode: "onChange",
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  const {
    fields: promoFields,
    append: appendPromo,
    remove: removePromo,
  } = useFieldArray({
    control: form.control,
    name: "promoCodes",
  });

  const { isDirty } = form.formState;

  const hasUnsavedChanges = useCallback(() => {
    return isDirty || imageFile !== null;
  }, [isDirty, imageFile]);

  // Track if we initialized with tierTemplates available
  const lastInitializedWithTemplates = React.useRef<boolean>(false);

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEditing) {
      // Check if we should skip initialization
      const sameEvent = lastInitializedEventId.current === initialData.id;
      const templatesNowAvailable = tierTemplates.length > 0;

      // Skip if: same event AND (we had templates before OR templates still not available)
      if (sameEvent && (lastInitializedWithTemplates.current || !templatesNowAvailable)) {
        return;
      }

      lastInitializedEventId.current = initialData.id;
      lastInitializedWithTemplates.current = templatesNowAvailable;

      // Helper function to get tier name from template if tier_name is empty
      const getTierName = (tier: typeof initialData.tiers[0]) => {
        if (tier.tier_name) return tier.tier_name;
        // Look up from tier templates if tier_name is empty
        if (tier.tier_template_id && tierTemplates.length > 0) {
          const template = tierTemplates.find(t => t.id === tier.tier_template_id);
          return template?.template_name || "";
        }
        return "";
      };

      form.reset({
        name: initialData.title || "",
        description: initialData.description || "",
        tags: parseCategory(initialData.category),
        image: initialData.banner_image || "",
        venue: initialData.venue_name || "",
        venueAddress: initialData.address || "",
        capacity: initialData.capacity || 0,
        timezone: initialData.timezone || "",
        startDate: initialData.start_date || "",
        endDate: initialData.end_date || "",
        tickets: initialData.tiers?.map((t) => ({
          id: t.id,
          name: getTierName(t),
          price: t.price,
          quantity: t.quantity,
          gst: t.gst || 0,
          salesStart: t.sales_start || "",
          salesEnd: t.sales_end || "",
        })) || [
            {
              name: "",
              price: 0,
              quantity: 0,
              gst: 13,
              salesStart: "",
              salesEnd: "",
            },
          ],
        promoCodes: [],
      });
      // Also update image preview
      if (initialData.banner_image) {
        // Only set preview if it's a string URL (not when we have a file upload which shouldn't happen on init usually)
        if (typeof initialData.banner_image === 'string') {
          setImagePreview(initialData.banner_image);
        }
      }
    }
  }, [initialData, isEditing, form, tierTemplates]);



  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Track if we've already pushed history state
  const historyStatePushed = React.useRef(false);

  // Handle browser back/forward buttons
  useEffect(() => {
    // Push a dummy state ONCE to detect back navigation
    if (typeof window !== "undefined" && !historyStatePushed.current) {
      window.history.pushState({ formPage: true }, "");
      historyStatePushed.current = true;
    }

    const handlePopState = () => {
      if (hasUnsavedChanges()) {
        // Push state back to prevent navigation
        window.history.pushState({ formPage: true }, "");
        // Show our custom dialog
        setPendingNavigation(() => () => {
          // Allow the back navigation by going back twice (our pushed state + actual back)
          window.history.go(-2);
        });
        setShowLeaveDialog(true);
      } else {
        // No unsaved changes - allow normal back navigation
        // Go back one more time since we consumed the popstate event
        window.history.go(-1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Handle sidebar/route navigation clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges()) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        // Build the URL to check if it's a navigation
        const href = anchor.getAttribute("href");

        // Ignore non-navigation links
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          anchor.target === "_blank"
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        setPendingNavigation(() => () => {
          router.push(href);
        });
        setShowLeaveDialog(true);
      }
    };

    window.addEventListener("click", handleClick, true); // Capture phase to intervene early
    return () => window.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges, router]);

  const handleNavigateAway = useCallback(
    (navigationAction: () => void) => {
      if (hasUnsavedChanges()) {
        setPendingNavigation(() => navigationAction);
        setShowLeaveDialog(true);
      } else {
        navigationAction();
      }
    },
    [hasUnsavedChanges]
  );

  const confirmLeave = () => {
    // Reset form state to prevent popstate handler from blocking navigation
    form.reset(form.getValues());
    setImageFile(null);
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const cancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  };

  // Create Tier Template Mutation
  const createTierTemplateMutation = useMutation({
    mutationFn: eventService.createTierTemplate,
    onSuccess: (newTemplate) => {
      queryClient.setQueryData(["tierTemplates"], (old: TierTemplate[] | undefined) =>
        old ? [...old, newTemplate] : [newTemplate]
      );
    },
  });

  // Create/Update Event Mutation
  const saveEventMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: { eventData: any; isUpdate: boolean; id?: string }) => {
      if (data.isUpdate && data.id) {
        return eventService.updateEvent(data.id, data.eventData);
      } else {
        return eventService.createEvent(data.eventData);
      }
    },
    onSuccess: async () => {
      // Force fetch the latest events data to update cache before navigation
      // This ensures we don't show stale data (old name) on the list page
      try {
        await queryClient.fetchQuery({
          queryKey: ["events"],
          queryFn: () => eventService.getEvents(),
          staleTime: 0,
        });
      } catch (error) {
        console.error("Failed to pre-fetch events:", error);
        // Fallback to invalidation/reset if fetch fails, so at least we try to get fresh data on mount
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

      // setFormModified(false); // No need to manually set false, navigation will unmount or form.reset in initialData effect handles it
      // lastInitializedEventId.current = null; // Clear tracking to prevent re-initializing
      router.push("/organizerDashboard/pages/events");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_error: any) => {
      // Error toast is already shown by apiClient (showErrorToast=true by default)
    },
  });

  // Helper function to get only changed fields for update
  const getChangedFields = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (currentData: EventFormData, tiersData: any[]) => {
      if (!initialData) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changedFields: Record<string, any> = {};

      // Compare simple fields
      if (currentData.name !== initialData.title) {
        changedFields.title = currentData.name;
      }
      if (currentData.description !== initialData.description) {
        changedFields.description = currentData.description;
      }
      if (JSON.stringify(currentData.tags) !== JSON.stringify(parseCategory(initialData.category))) {
        changedFields.category = currentData.tags;
      }
      if (currentData.venue !== initialData.venue_name) {
        changedFields.venue_name = currentData.venue;
      }
      if (currentData.venueAddress !== initialData.address) {
        changedFields.address = currentData.venueAddress;
      }
      if (currentData.capacity !== initialData.capacity) {
        changedFields.capacity = currentData.capacity;
      }
      if (currentData.timezone !== initialData.timezone) {
        changedFields.timezone = currentData.timezone;
      }
      if (currentData.startDate !== initialData.start_date) {
        changedFields.start_date = currentData.startDate || undefined;
      }
      if (currentData.endDate !== initialData.end_date) {
        changedFields.end_date = currentData.endDate || undefined;
      }

      // Compare tiers - check if anything changed
      const initialTiers = initialData.tiers || [];
      const tiersChanged =
        tiersData.length !== initialTiers.length ||
        tiersData.some((tier, index) => {
          const initialTier = initialTiers[index];
          if (!initialTier) return true;
          return (
            tier.price !== initialTier.price ||
            tier.quantity !== initialTier.quantity ||
            tier.gst !== (initialTier.gst || 0) ||
            tier.sales_start !== (initialTier.sales_start || "") ||
            tier.sales_end !== (initialTier.sales_end || "") ||
            tier.tier_template_id !== initialTier.tier_template_id
          );
        });

      if (tiersChanged) {
        changedFields.tiers = tiersData;
      }

      // Check for new banner image
      if (imageFile) {
        changedFields.banner_image = imageFile;
      }

      // Update price if first tier price changed
      if (currentData.tickets[0]?.price !== initialTiers[0]?.price) {
        changedFields.price = currentData.tickets[0]?.price ?? 0;
      }

      return changedFields;
    },
    [initialData, imageFile]
  );

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
          try {
            const newTemplate = await createTierTemplateMutation.mutateAsync({
              template_name: ticket.name,
              description: `Template for ${ticket.name}`,
            });
            tierId = newTemplate.id;
          } catch (err) {
            toast.error("Error", `Failed to create tier template for ${ticket.name}`);
            return;
          }
        }

        tiersData.push({
          tier_template_id: tierId,
          price: ticket.price || 0,
          quantity: ticket.quantity || 0,
          gst: isNaN(ticket.gst) ? 0 : (ticket.gst || 0),
          sales_start: ticket.salesStart || undefined,
          sales_end: ticket.salesEnd || undefined,
          sort_order: i,
        });
      }

      if (isEditing && initialData) {
        // Only send changed fields for update
        const changedFields = getChangedFields(data, tiersData);

        if (changedFields && Object.keys(changedFields).length === 0) {
          toast.info("No Changes", "No changes detected to update.");
          return;
        }

        saveEventMutation.mutate({ eventData: changedFields, isUpdate: true, id: initialData.id });
      } else {
        // For new events, send all data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eventData: any = {
          title: data.name,
          description: data.description,
          category: data.tags,
          venue_name: data.venue,
          address: data.venueAddress,
          start_date: data.startDate || undefined,
          end_date: data.endDate || undefined,
          timezone: data.timezone,
          capacity: data.capacity,
          price: data.tickets[0]?.price ?? 0,
          tiers: JSON.stringify(tiersData),
        };

        if (imageFile) {
          eventData.banner_image = imageFile;
        }

        saveEventMutation.mutate({ eventData, isUpdate: false });
      }
    } catch (error) {
      console.error("Error preparing event data:", error);
    }
  };

  const validateAndProcessImage = (file: File) => {
    setImageError("");

    // Helper to clear image state
    const clearImageState = () => {
      setImageFile(null);
      setImagePreview("");
      form.setValue("image", "", { shouldDirty: true, shouldValidate: true });
      setImageRemoved(true);
    };

    if (!file.type.startsWith("image/")) {
      clearImageState();
      setImageError(t("event.error.invalidImageType", "Invalid file type. Please upload an image (PNG/JPG)."));
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      clearImageState();
      setImageError("File size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.width;
      const height = img.height;
      const maxWidth = 1920;
      const maxHeight = 1200;
      // const aspectRatio = 1920 / 1200;

      if (width > maxWidth || height > maxHeight) {
        // Optional: We can relax this to just a warning or remove it if "recommended" means no max limit.
        // For now, assuming we still want to prevent massive images but maybe the user just cares about aspect ratio.
        // Let's keep max dimensions for performance/storage reasons as it was existing logic, unless user complains.
        clearImageState();
        setImageError(
          t(
            "event.error.invalidImageSize",
            `Image dimensions exceed the maximum allowed (${maxWidth}x${maxHeight}px).`,
            { maxWidth, maxHeight }
          )
        );
        return;
      }

      // Aspect ratio check removed as per requirement.

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue("image", result, { shouldDirty: true, shouldValidate: true });
        form.clearErrors("image");
        setImageError("");
        setImageRemoved(false);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      clearImageState();
      setImageError("Failed to load image. Please try another file.");
    };

    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    form.setValue("image", "", { shouldDirty: true, shouldValidate: true });
    setImageError("");
    setImageRemoved(true);
  };

  return (
    <div className="p-5 pt-3 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Event Details Section */}
          <div className="@container mb-6">
            <div className="p-6 space-y-5 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-md font-semibold text-primary mb-2!">
                {t("event.eventDetails", "Event Details")}
              </h2>
              <div className="grid @2xl:grid-cols-2 gap-5">
                <ImageUploader
                  label={t("event.field.uploadBanner", "Upload Banner")}
                  helperText={t("event.helperText.bannerImage", "Upload banner image or drag & drop")}
                  helperTextSize={t("event.helperText.bannerImageSize", "Recommended: PNG/JPG file of 1920x1200px with size up to 5MB")}
                  value={imageRemoved ? "" : (imagePreview || initialData?.banner_image || "")}
                  onChange={(file) => {
                    if (file) validateAndProcessImage(file);
                  }}
                  onRemove={handleRemoveImage}
                  error={imageError || form.formState.errors.image?.message}
                  browseButtonText={t("event.helperText.bannerImageBrowse", "Browse File")}
                  required
                />

                <div className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="inline-block">
                          {t("event.field.eventTitle", "Event Title")} <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="h-13 md:text-md"
                              placeholder={t("event.placeholder.eventTitle", "Enter event title")}
                              maxLength={EVENT_TITLE_MAX}
                              {...field}
                            />
                            <div className="flex justify-between items-center mt-1 min-h-[20px]">
                              <FormMessage className="mt-0" />
                              <div className="text-xs text-muted-foreground ml-auto">
                                {field.value?.length || 0}/{EVENT_TITLE_MAX} characters
                              </div>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="inline-block">{t("event.field.categoryTags", "Category Tags")} <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <CategoryTagsSelector
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select or type categories..."
                            maxTags={5}
                            maxChars={50}
                            className="min-h-13 md:text-md"
                            error={!!fieldState.error}
                          />
                        </FormControl>
                        {/* 
                          CategoryTagsSelector has internal helper text for limits. 
                          We just need to ensure FormMessage aligns with our new pattern if needed.
                          But since the selector has its own footer, maybe we just put FormMessage below it.
                          Standardizing:
                        */}
                        <div className="flex justify-between items-start -mt-1 min-h-[20px]">
                          <FormMessage className="mt-0" />
                          <div className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0}/5 tags | Max 50 chars/tag
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description Editor */}
              <div className="space-y-2">
                <Label
                  className={cn(
                    "inline-block",
                    form.formState.errors.description && "text-red-500"
                  )}
                >
                  {t("event.field.eventDescription", "Event Description")} <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "rounded-lg border transition-colors",
                    form.formState.errors.description
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-gray-300"
                  )}
                >
                  <Editor
                    key={isEditing ? `editor-${initialData?.id}` : "editor-new"}
                    initialHtml={isEditing ? initialData?.description || "" : ""}
                    onHtmlChange={useCallback((html: string) => {
                      // Strip HTML tags to check for real content
                      const textContent = html.replace(/<[^>]*>/g, '').trim();
                      const valueToSet = textContent ? html : "";

                      form.setValue("description", valueToSet, { shouldDirty: true, shouldValidate: true });
                    }, [form])}
                    placeholder={t("event.placeholder.eventDescription", "Write about your event...")}
                  />
                </div>
                <div className="flex justify-between items-center -mt-1 min-h-[20px]">
                  {form.formState.errors.description ? (
                    <p className="text-xs font-medium text-destructive mt-0 flex items-center gap-1">
                      {form.formState.errors.description.message}
                    </p>
                  ) : <div />}
                  {/* Note: Character count for HTML content is tricky. We'll estimate based on text content if needed, 
                      but for now user just asked for limit display. We can strip tags for count. 
                  */}
                  <div className="text-xs text-muted-foreground ml-auto">
                    {(() => {
                      const desc = form.getValues("description") || "";
                      const textLen = desc.replace(/<[^>]*>/g, '').length;
                      return `${textLen}/${EVENT_DESC_MAX} characters`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Venue & Schedule Section */}
          <div className="@container mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-md font-semibold text-primary mb-2!">{t("event.section.venueSchedule", "Venue & Schedule")}</h2>
              <div className="grid @2xl:grid-cols-2 @4xl:grid-cols-3 gap-5">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.venueName", "Venue Name")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="h-13 md:text-md"
                            placeholder={t("event.placeholder.venue", "Enter venue name")}
                            maxLength={VENUE_NAME_MAX}
                            {...field}
                          />
                          <div className="flex justify-between items-center mt-1 min-h-[20px]">
                            <FormMessage className="mt-0" />
                            <div className="text-xs text-muted-foreground ml-auto">
                              {field.value?.length || 0}/{VENUE_NAME_MAX} characters
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueAddress"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.venueAddress", "Venue Address")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AddressAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            className="h-13 md:text-md"
                            placeholder={t("event.placeholder.venueAddress", "Enter venue address")}
                            maxLength={VENUE_ADDRESS_MAX}
                          />
                          <div className="flex justify-between items-center mt-1 min-h-[20px]">
                            <FormMessage className="mt-0" />
                            <div className="text-xs text-muted-foreground ml-auto">
                              {field.value?.length || 0}/{VENUE_ADDRESS_MAX} characters
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.capacity", "Capacity")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          className="h-13 md:text-md"
                          type="number"
                          placeholder={t("event.placeholder.capacity", "Enter maximum capacity")}
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
                        <FormMessage className="mt-0" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.timezone", "Timezone")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <TimezoneSelector
                          value={field.value}
                          onChange={field.onChange}
                          error={!!fieldState.error}
                          placeholder={t("event.placeholder.timezone", "Select timezone")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.startDateTime", "Event Start Date")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <ShadcnDateTimePicker
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            if (!date) field.onChange("");
                            else field.onChange(date.toISOString());
                          }}
                          format="yyyy-MM-dd hh:mm aa"
                          clearable
                          error={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="inline-block">{t("event.field.endDateTime", "Event End Date")} <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <ShadcnDateTimePicker
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            if (!date) field.onChange("");
                            else field.onChange(date.toISOString());
                          }}
                          format="yyyy-MM-dd hh:mm aa"
                          clearable
                          error={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Ticketing Section */}
          <div className="@container mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-md font-semibold text-primary mb-2!">{t("event.section.ticketing", "Ticketing")}</h2>

              {ticketFields.map((field, index) => (
                <TicketTierCard
                  key={field.id}
                  index={index}
                  control={form.control}
                  tierTemplates={tierTemplates}
                  isLoading={isLoadingTemplates}
                  showDelete={ticketFields.length > 1}
                  onDelete={() => removeTicket(index)}
                  onCreateNew={() => {
                    setActiveTicketIndex(index);
                    setOpenTemplateDialog(true);
                  }}
                  usedTierNames={form.watch("tickets").map((t) => t.name).filter(Boolean)}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendTicket({
                    name: "",
                    price: 0,
                    quantity: 0,
                    gst: 13,
                    salesStart: "",
                    salesEnd: "",
                  })
                }
                className="flex items-center gap-2 text-primary border-primary hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                {t("event.button.addTicketTier", "Add ticket tier")}
              </Button>
            </div>
          </div>

          {/* Discounts & Promo Codes Section */}
          <div className="@container mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-md font-semibold text-primary mb-2!">{t("event.section.discountsPromo", "Discounts & Promo Codes")}</h2>

              {promoFields.map((field, index) => (
                <PromoCodeCard
                  key={field.id}
                  index={index}
                  control={form.control}
                  onDelete={() => removePromo(index)}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendPromo({
                    code: "",
                    discountType: "",
                    amount: 0,
                    quantity: 0,
                  })
                }
                className="flex items-center gap-2 text-primary border-primary hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                {t("event.button.addPromoCode", "Add promo code")}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleNavigateAway(() => router.push('/organizerDashboard/pages/events'))}
            >
              {t("common.button.cancel", "Cancel")}
            </Button>
            <div className="flex gap-3">
              {/* <Button
                type="button"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Save as draft
              </Button> */}
              <Button
                type="submit"
                disabled={saveEventMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                {saveEventMutation.isPending
                  ? t("common.status.saving", "Saving...")
                  : isEditing
                    ? t("event.button.updateEvent", "Update Event")
                    : t("event.button.createEvent", "Create Event")}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.dialog.unsavedChanges.title", "Unsaved Changes")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.dialog.unsavedChanges.description", "You have unsaved changes. Are you sure you want to leave? All your progress will be lost.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>{t("common.button.stay", "Stay on Page")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-red-600 hover:bg-red-700">
              {t("common.button.leave", "Leave Page")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateTierTemplateDialog
        open={openTemplateDialog}
        onOpenChange={(open) => {
          setOpenTemplateDialog(open);
          if (!open) setActiveTicketIndex(null);
        }}
        onSuccess={async (newTemplate) => {
          // Add new template to cache immediately for optimistic UI
          queryClient.setQueryData(["tierTemplates"], (old: TierTemplate[] | undefined) =>
            old ? [...old, newTemplate] : [newTemplate]
          );

          // Invalidate to ensure consistency with backend
          await queryClient.invalidateQueries({ queryKey: ["tierTemplates"] });

          // If we have an active ticket index, select the new template
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
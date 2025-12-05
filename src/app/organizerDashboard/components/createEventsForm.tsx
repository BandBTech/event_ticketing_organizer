"use client";

import { Plus } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MapPinAreaIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { EventFormData, createEventSchema } from "@/lib/validation";
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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { DateTimeInput } from "@/components/ui/datetime-input";
import CategoryTagsSelector from "./CategoryTagsSelector";
import TimezoneSelector from "./TimezoneSelector";
import BannerImageUploader from "./BannerImageUploader";
import TicketTierCard from "./TicketTierCard";
import PromoCodeCard from "./PromoCodeCard";
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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [formModified, setFormModified] = useState(false);

  // Fetch tier templates using TanStack Query
  const { data: tierTemplates = [] } = useQuery({
    queryKey: ["tierTemplates"],
    queryFn: () => eventService.getTierTemplates(),
  });

  const eventSchema = useMemo(() => createEventSchema(t), [t]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: {
      name: initialData?.title || "",
      description: initialData?.description || "",
      tags: initialData?.category || [],
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

  const hasUnsavedChanges = useCallback(() => {
    return formModified || imageFile !== null;
  }, [formModified, imageFile]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isDirty) {
        setFormModified(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  // Handle browser back/forward buttons
  useEffect(() => {
    // Push a dummy state to detect back navigation
    if (typeof window !== "undefined") {
      window.history.pushState({ formPage: true }, "");
    }

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges()) {
        // Push state back to prevent navigation
        window.history.pushState({ formPage: true }, "");
        // Show our custom dialog
        setPendingNavigation(() => () => {
          // Allow the back navigation by going back twice (our pushed state + actual back)
          window.history.go(-2);
        });
        setShowLeaveDialog(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

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
    onSuccess: () => {
      toast.success("Success", isEditing ? "Event updated successfully" : "Event created successfully");
      setFormModified(false);
      router.push("/organizerDashboard/pages/events");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Error saving event:", error);
      toast.error("Error", "Failed to save event");
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
          try {
            const newTemplate = await createTierTemplateMutation.mutateAsync({
              template_name: ticket.name,
              description: `Template for ${ticket.name}`,
            });
            tierId = newTemplate.id;
          } catch (err) {
            console.error("Failed to create tier template", err);
            toast.error("Error", `Failed to create tier template for ${ticket.name}`);
            return;
          }
        }

        tiersData.push({
          tier_template_id: tierId,
          price: ticket.price,
          quantity: ticket.quantity,
          gst: ticket.gst,
          sales_start: ticket.salesStart || undefined,
          sales_end: ticket.salesEnd || undefined,
          sort_order: i,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventData: any = {
        title: data.name,
        description: data.description,
        category: data.tags.join(","),
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

      if (isEditing && initialData) {
        const updateData = {
          ...eventData,
          tiers: tiersData,
          banner_image: undefined,
        };
        saveEventMutation.mutate({ eventData: updateData, isUpdate: true, id: initialData.id });
      } else {
        saveEventMutation.mutate({ eventData, isUpdate: false });
      }
    } catch (error) {
      console.error("Error preparing event data:", error);
    }
  };

  const validateAndProcessImage = (file: File) => {
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Invalid file type. Please upload an image (PNG/JPG).");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
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
      const aspectRatio = 1920 / 1200;

      if (width > maxWidth || height > maxHeight) {
        setImageError(`Image dimensions exceed the maximum allowed (${maxWidth}x${maxHeight}px).`);
        return;
      }

      const imageAspectRatio = width / height;
      const tolerance = 0.1;
      const minAspectRatio = aspectRatio - tolerance;
      const maxAspectRatio = aspectRatio + tolerance;

      if (imageAspectRatio < minAspectRatio || imageAspectRatio > maxAspectRatio) {
        setImageError(`Image aspect ratio must be approximately ${aspectRatio.toFixed(2)} (16:10).`);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue("image", result);
        form.clearErrors("image");
        setImageError("");
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImageError("Failed to load image. Please try another file.");
    };

    img.src = objectUrl;
  };

  return (
    <div className="p-5 pt-3 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Event Details Section */}
          <div className="mb-6">
            <div className="p-6 space-y-2 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-md font-semibold text-primary">
                {t("event.eventDetails", "Event Details")}
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <BannerImageUploader
                  imagePreview={imagePreview}
                  imageError={imageError}
                  formError={form.formState.errors.image?.message}
                  onImageSelect={validateAndProcessImage}
                  onError={setImageError}
                  label={t("event.field.bannerImage", "Banner Image")}
                  helperText={t("event.helperText.bannerImage", "Upload banner image or drag & drop")}
                  helperTextSize={t(
                    "event.helperText.bannerImageSize",
                    "PNG/JPG file of 1920x1200px with size up to 5MB"
                  )}
                  browseButtonText={t("event.helperText.bannerImageBrowse", "Browse File")}
                />

                <div className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="inline-block">
                          {t("event.field.eventTitle", "Event Title")}
                        </FormLabel>
                        <FormControl>
                          <Input className="h-13 md:text-md" placeholder="Enter Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="inline-block">Category Tags</FormLabel>
                        <FormControl>
                          <CategoryTagsSelector
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select or type categories..."
                            maxTags={5}
                            className="h-13 md:text-md"
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
                  className={cn(
                    "inline-block",
                    form.formState.errors.description && "text-red-500"
                  )}
                >
                  Event Description <span className="text-red-500">*</span>
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
                    initialHtml={form.getValues("description")}
                    onHtmlChange={(html) => {
                      form.setValue("description", html);
                      if (html && html.trim()) {
                        form.clearErrors("description");
                      }
                    }}
                    placeholder={t("event.field.eventDescription", "Write about your event")}
                  />
                </div>
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Venue & Schedule Section */}
          <div className="mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-lg font-semibold text-blue-600">Venue & Schedule</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">Venue Name</FormLabel>
                      <FormControl>
                        <Input className="h-13 md:text-md" placeholder="Venue name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">Venue Address</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className="h-13 md:text-md"
                            placeholder="Enter venue address"
                            {...field}
                          />
                        </FormControl>
                        <MapPinAreaIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">Capacity</FormLabel>
                      <FormControl>
                        <Input
                          className="h-13 md:text-md"
                          type="number"
                          placeholder="e.g 5000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="inline-block">Timezone</FormLabel>
                      <FormControl>
                        <TimezoneSelector value={field.value} onChange={field.onChange} />
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
                      <FormLabel className="inline-block">Start Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          classNames={{
                            trigger: "h-13 md:text-md",
                          }}
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => {
                            if (!date) field.onChange("");
                            else if (typeof date === "string") field.onChange(date);
                            else field.onChange(date.toISOString());
                          }}
                          use12HourFormat
                          timePicker={{
                            hour: true,
                            minute: true,
                          }}
                          renderTrigger={({ open, value, setOpen }) => (
                            <DateTimeInput
                              value={value}
                              onChange={(x) => !open && field.onChange(x ? x.toISOString() : "")}
                              format="dd/MM/yyyy hh:mm aa"
                              disabled={open}
                              onCalendarClick={() => setOpen(!open)}
                              error={!!fieldState.error}
                              className="h-13 md:text-md placeholder:text-gray-300"
                            />
                          )}
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
                      <FormLabel className="inline-block">End Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => {
                            if (!date) field.onChange("");
                            else if (typeof date === "string") field.onChange(date);
                            else field.onChange(date.toISOString());
                          }}
                          use12HourFormat
                          timePicker={{
                            hour: true,
                            minute: true,
                          }}
                          renderTrigger={({ open, value, setOpen }) => (
                            <DateTimeInput
                              value={value}
                              onChange={(x) => !open && field.onChange(x ? x.toISOString() : "")}
                              format="dd/MM/yyyy hh:mm aa"
                              disabled={open}
                              onCalendarClick={() => setOpen(!open)}
                              error={!!fieldState.error}
                              className="h-13 md:text-md"
                            />
                          )}
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
          <div className="mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-lg font-semibold text-blue-600">Ticketing</h2>

              {ticketFields.map((field, index) => (
                <TicketTierCard
                  key={field.id}
                  index={index}
                  control={form.control}
                  tierTemplates={tierTemplates}
                  showDelete={ticketFields.length > 1}
                  onDelete={() => removeTicket(index)}
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
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                Add ticket tier
              </Button>
            </div>
          </div>

          {/* Discounts & Promo Codes Section */}
          <div className="mb-6">
            <div className="p-6 space-y-4 shadow-blur-subtle-md bg-white/60 rounded-xl">
              <h2 className="text-lg font-semibold text-blue-600">Discounts & Promo Codes</h2>

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
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                Add promo code
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleNavigateAway(() => router.back())}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Save as draft
              </Button>
              <Button
                type="submit"
                disabled={saveEventMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                {saveEventMutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? All your progress will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-red-600 hover:bg-red-700">
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
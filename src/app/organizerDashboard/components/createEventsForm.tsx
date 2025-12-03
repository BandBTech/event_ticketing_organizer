"use client";

import { Image as ImageIcon, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import TierNameSelector from "./TierNameSelector";


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

  // Fetch tier templates using TanStack Query
  const { data: tierTemplates = [] } = useQuery({
    queryKey: ['tierTemplates'],
    queryFn: eventService.getTierTemplates,
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
      tickets: initialData?.tiers?.map(t => ({
        id: t.id,
        name: t.tier_name,
        price: t.price,
        quantity: t.quantity,
        gst: t.gst || 0,
        salesStart: t.sales_start || "",
        salesEnd: t.sales_end || "",
      })) || [
          {
            name: "General Admission",
            price: 0,
            quantity: 0,
            gst: 13,
            salesStart: "",
            salesEnd: "",
          },
        ],
      promoCodes: [],
    },
    mode: "onChange"
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

  // Create Tier Template Mutation
  const createTierTemplateMutation = useMutation({
    mutationFn: eventService.createTierTemplate,
    onSuccess: (newTemplate) => {
      queryClient.setQueryData(['tierTemplates'], (old: TierTemplate[] | undefined) =>
        old ? [...old, newTemplate] : [newTemplate]
      );
    },
  });

  // Create/Update Event Mutation
  const saveEventMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: { eventData: any, isUpdate: boolean, id?: string }) => {
      if (data.isUpdate && data.id) {
        return eventService.updateEvent(data.id, data.eventData);
      } else {
        return eventService.createEvent(data.eventData);
      }
    },
    onSuccess: () => {
      toast.success("Success", isEditing ? "Event updated successfully" : "Event created successfully");
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
      // 1. Handle Tiers
      const tiersData = [];
      for (let i = 0; i < data.tickets.length; i++) {
        const ticket = data.tickets[i];
        let tierId = "";

        // Find existing template
        const existingTemplate = tierTemplates.find(t => t.template_name.toLowerCase() === ticket.name.toLowerCase());

        if (existingTemplate) {
          tierId = existingTemplate.id;
        } else {
          // Create new template
          try {
            const newTemplate = await createTierTemplateMutation.mutateAsync({
              template_name: ticket.name,
              description: `Template for ${ticket.name}`
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
          sales_start: ticket.salesStart || undefined, // Already ISO string or empty
          sales_end: ticket.salesEnd || undefined,     // Already ISO string or empty
          sort_order: i
        });
      }

      // 2. Prepare Event Data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventData: any = {
        title: data.name,
        description: data.description,
        category: data.tags.join(","),
        venue_name: data.venue,
        address: data.venueAddress,
        start_date: data.startDate || undefined, // Already ISO string or empty
        end_date: data.endDate || undefined,     // Already ISO string or empty
        timezone: data.timezone,
        capacity: data.capacity,
        price: data.tickets[0]?.price ?? 0,
        tiers: JSON.stringify(tiersData)
      };

      if (imageFile) {
        eventData.banner_image = imageFile;
      }

      // 3. Call API
      if (isEditing && initialData) {
        const updateData = {
          ...eventData,
          tiers: tiersData,
          banner_image: undefined
        };
        saveEventMutation.mutate({ eventData: updateData, isUpdate: true, id: initialData.id });
      } else {
        saveEventMutation.mutate({ eventData, isUpdate: false });
      }

    } catch (error) {
      console.error("Error preparing event data:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validation
      if (!file.type.startsWith("image/")) {
        toast.error("Error", "Invalid file type. Please upload an image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Error", "File size exceeds 5MB.");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue("image", result);
        form.clearErrors("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    form.setValue("tags", tags);
  };



  return (
    <div className="p-5 pt-3 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Event details */}
          <div className="mb-6 rounded-xl border border-gray-200 text-gray-700 bg-white shadow-sm">
            <div className="p-6 space-y-2">
              <h2 className="text-md font-semibold text-primary">{t("event.eventDetails", "Event Details")}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t("event.field.bannerImage", "Banner Image")}</Label>
                  <div className="border-2 border-dashed border-gray-300 flex flex-col items-center rounded-lg p-4 text-center text-gray-500 cursor-pointer">
                    <ImageIcon />
                    {t("event.helperText.bannerImage", "Upload banner image or drag & drop")}
                    <span className="text-xs">{t("event.helperText.bannerImageSize", "PNG/JPG file of 1920x1200px with size up to 5MB")}</span>
                    <br />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="border rounded-lg px-3 py-1 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      {t("event.helperText.bannerImageBrowse", "Browse File")}
                    </label>
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="preview" className="max-h-32 rounded" />
                      </div>
                    )}
                    {form.formState.errors.image && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.image.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("event.field.eventTitle", "Event Title")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Title" {...field} />
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
                        <FormLabel>Category Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Music, Concert, Festival"
                            value={field.value.join(", ")}
                            onChange={handleTagsChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label>Event Description</Label>
                <Editor
                  initialHtml={form.getValues("description")}
                  onHtmlChange={(html) => form.setValue("description", html)}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Venue & Schedule */}
          <div className="rounded-xl mb-6 border border-gray-200 bg-white shadow-sm">
            <div className="p-6 space-y-4 text-gray-700">
              <h2 className="text-lg font-semibold text-blue-600">Venue & Schedule</h2>
              <div className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Venue name" {...field} />
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
                      <FormLabel>Venue Address</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="Enter venue address" {...field} />
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
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g 5000"
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
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
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Asia/Kathmandu">Nepal Time (NPT)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Ticketing */}
          <div className="rounded-xl mb-6 border border-gray-200 text-gray-700 bg-white shadow-sm">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-blue-600">Ticketing</h2>

              {ticketFields.map((field, index) => (
                <div key={field.id} className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 relative">
                  <FormField
                    control={form.control}
                    name={`tickets.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tier Name</FormLabel>
                        <FormControl>
                          <TierNameSelector
                            value={field.value}
                            onChange={field.onChange}
                            templates={tierTemplates}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 100"
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter number of quantity"
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.gst`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST(%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter GST in percentage"
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.salesStart`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales start</FormLabel>
                        <FormControl>
                          <DateTimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.salesEnd`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales ends</FormLabel>
                        <FormControl>
                          <DateTimePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {ticketFields.length > 1 && (
                    <Trash2
                      onClick={() => removeTicket(index)}
                      className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
                    />
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendTicket({
                  name: "",
                  price: 0,
                  quantity: 0,
                  gst: 13,
                  salesStart: "",
                  salesEnd: "",
                })}
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                Add ticket tier
              </Button>
            </div>
          </div>

          {/* Discounts & Promo Codes */}
          <div className="rounded-xl mb-6 border border-gray-200 text-gray-700 bg-white shadow-sm">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-blue-600">Discounts & Promo Codes</h2>

              {promoFields.map((field, index) => (
                <div key={field.id} className="grid md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 relative">
                  <FormField
                    control={form.control}
                    name={`promoCodes.${index}.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g EARLYBIRD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`promoCodes.${index}.discountType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Select Types" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`promoCodes.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500"
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`promoCodes.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500"
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Trash2
                    onClick={() => removePromo(index)}
                    className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendPromo({
                  code: "",
                  discountType: "",
                  amount: 0,
                  quantity: 0,
                })}
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                Add promo code
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                Save as draft
              </Button>
              <Button
                type="submit"
                disabled={saveEventMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                {saveEventMutation.isPending ? "Saving..." : (isEditing ? "Update Event" : "Create Event")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
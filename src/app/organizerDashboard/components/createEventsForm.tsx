"use client";

import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { MapPinAreaIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { EventFormData, eventSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { addEvent, Event } from "./events";
import { BtnBold, BtnBulletList, BtnItalic, BtnLink, BtnNumberedList, BtnUnderline, Editor, EditorProvider, Separator, Toolbar } from "react-simple-wysiwyg";


export default function CreateEventPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
    defaultValues: {
      name: "",
      description: "",
      tags: [],
      image: "",
      venue: "",
      venueAddress: "",
      capacity: 0,
      timezone: "",
      startDate: "",
      endDate: "",
      tickets: [
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
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control,
    name: "tickets",
  });

  const {
    fields: promoFields,
    append: appendPromo,
    remove: removePromo,
  } = useFieldArray({
    control,
    name: "promoCodes",
  });

  const onSubmit: SubmitHandler<EventFormData> = (data) => {
    try {
      const eventDate = new Date(data.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const eventTime = new Date(data.startDate).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const newEvent: Omit<Event, "id"> = {
        name: data.name,
        description: data.description,
        tags: data.tags,
        image: data.image || "/default-event.jpg",
        venue: data.venue,
        venueAddress: data.venueAddress,
        capacity: data.capacity,
        timezone: data.timezone,
        startDate: data.startDate,
        endDate: data.endDate,
        date: eventDate,
        time: eventTime,
        status: "ON SALE",
        tickets: data.tickets.map((ticket, index) => ({
          id: (index + 1).toString(),
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          gst: ticket.gst,
          salesStart: ticket.salesStart,
          salesEnd: ticket.salesEnd,
        })),
      };

      addEvent(newEvent);
      router.push("/dashboard/pages/events");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setValue("tags", tags);
  };

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Event details */}
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-600">Event details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Banner Image</label>
                <div className="border-2 border-dashed border-gray-300 flex flex-col items-center rounded-lg p-4 text-center text-gray-500 cursor-pointer">
                  <ImageIcon />
                  Upload banner image or drag & drop
                  <span className="text-xs">PNG/JPG file of 1820x1200px size up to 5MB</span>
                  <br />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="border rounded-lg px-3 py-1 text-sm cursor-pointer"
                  >
                    Browse File
                  </label>
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="preview" className="max-h-32 rounded"/>
                    </div>
                  )}
                      {errors.image && (
                    <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div>
                  <label className="text-sm font-medium">Event title</label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Enter title"
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Category Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. Music, Concert, Festival"
                    onChange={handleTagsChange}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                      {errors.tags && (
                    <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>
                  )}
                </div>
              </div>
            </div>

       <div>
  <label className="text-sm font-medium">Event description</label>

  <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
    <EditorProvider>
      <Editor
        value={watch("description") || ""}
        onChange={(e) => setValue("description", e.target.value)}
        placeholder="Tell what makes your event special"
        className="min-h-[150px] w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
      >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <Separator />
          <BtnNumberedList />
          <BtnBulletList />
          <Separator />
          <BtnLink />
        </Toolbar>
      </Editor>
    </EditorProvider>
  </div>

  {errors.description && (
    <p className="text-red-500 text-xs mt-1">
      {errors.description.message}
    </p>
  )}
</div>
          </div>
        </div>

        {/* Venue & Schedule */}
        <div className="rounded-xl mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-600">Venue & Schedule</h2>
            <div className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Venue name</label>
                <input
                  {...register("venue")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Venue name"
                />
                {errors.venue && (
                  <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>
                )}
              </div>

              <div className="flex relative flex-col">
                <label className="text-sm font-medium">Venue address</label>
                <input
                  {...register("venueAddress")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter venue location"
                />
                <MapPinAreaIcon className="absolute right-3 top-1/2 text-gray-400 w-5 h-5" />
                {errors.venueAddress && (
                  <p className="text-red-500 text-xs mt-1">{errors.venueAddress.message}</p>
                )}
              </div>

              {/* <div className="flex flex-col">
                <label className="text-sm font-medium">Location</label>
                <input
                  {...register("location")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div> */}

              <div className="flex flex-col">
                <label className="text-sm font-medium">Capacity</label>
                <input
                  {...register("capacity", { valueAsNumber: true })}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g 5000"
                  type="number"
                />
                    {errors.capacity && (
                    <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>
                  )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">Timezone</label>
                <select
                  {...register("timezone")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select timezone</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
                {errors.timezone && (
                  <p className="text-red-500 text-xs mt-1">{errors.timezone.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">Start date & time</label>
                <input
                  {...register("startDate")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  type="datetime-local"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium">End date & time</label>
                <input
                  {...register("endDate")}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  type="datetime-local"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ticketing */}
        <div className="rounded-xl mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-600">Ticketing</h2>
            
            {ticketFields.map((field, index) => (
              <div key={field.id} className="grid md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Tier Name</label>
                  <input
                    {...register(`tickets.${index}.name`)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="General Admission"
                  />
                  {errors.tickets?.[index]?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.name?.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Price</label>
                  <input
                    {...register(`tickets.${index}.price`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 100"
                    type="number"
                  />
                  {errors.tickets?.[index]?.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.price?.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Quantity</label>
                  <input
                    {...register(`tickets.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter number of quantity"
                    type="number"
                  />
                  {errors.tickets?.[index]?.quantity && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.quantity?.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">GST(%)</label>
                  <input
                    {...register(`tickets.${index}.gst`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter GST in percentage"
                    type="number"
                  />
                  {errors.tickets?.[index]?.gst && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.gst?.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Sales start</label>
                  <input
                    {...register(`tickets.${index}.salesStart`)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    type="datetime-local"
                  />
                  {errors.tickets?.[index]?.salesStart && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.salesStart?.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Sales ends</label>
                  <input
                    {...register(`tickets.${index}.salesEnd`)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    type="datetime-local"
                  />
                  {errors.tickets?.[index]?.salesEnd && (
                    <p className="text-red-500 text-xs mt-1">{errors.tickets[index]?.salesEnd?.message}</p>
                  )}
                </div>

                {ticketFields.length > 1 && (
                  <Trash2
                    onClick={() => removeTicket(index)}
                    className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendTicket({
                name: "",
                price: 0,
                quantity: 0,
                gst: 13,
                salesStart: "",
                salesEnd: "",
              })}
              className="flex items-center px-3 py-1 text-sm border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Add ticket tier
            </button>
          </div>
        </div>

        {/* Discounts & Promo Codes */}
        <div className="rounded-xl mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-600">Discounts & Promo Codes</h2>
            
            {promoFields.map((field, index) => (
              <div key={field.id} className="grid md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 relative">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Promo code</label>
                  <input
                    {...register(`promoCodes.${index}.code`)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g EARLYBIRD"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Discount Type</label>
                  <input
                    {...register(`promoCodes.${index}.discountType`)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Select Types"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Amount</label>
                  <input
                    {...register(`promoCodes.${index}.amount`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                    type="number"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">Quantity</label>
                  <input
                    {...register(`promoCodes.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                    type="number"
                  />
                </div>

                <Trash2
                  onClick={() => removePromo(index)}
                  className="absolute right-4 top-4 text-red-400 w-5 h-5 hover:bg-red-200 cursor-pointer"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendPromo({
                code: "",
                discountType: "",
                amount: 0,
                quantity: 0,
              })}
              className="flex items-center px-3 py-1 text-sm border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Add promo code
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border hover:bg-gray-500 border-gray-300"
            onClick={() => router.back()}
          >
            Cancel
          </button>
             <div className="flex gap-3">
         <button className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-700">
            Save as draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 gap-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}
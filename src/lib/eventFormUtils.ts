import {
  Event,
  TierTemplate,
  CreateEventData,
  UpdateEventRequest,
  CreateEventTierRequest,
} from "@/types/event";
import { EventFormData } from "@/lib/validation";

/**
 * Parse category which might be a comma-separated string from backend
 */
export function parseCategory(
  category: string | string[] | undefined,
): string[] {
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
}

/**
 * Get tier name from template if tier_name is empty
 */
export function getTierName(
  tier: { tier_name?: string; tier_template_id?: string },
  tierTemplates: TierTemplate[],
): string {
  if (tier.tier_name) return tier.tier_name;
  // Look up from tier templates if tier_name is empty
  if (tier.tier_template_id && tierTemplates.length > 0) {
    const template = tierTemplates.find((t) => t.id === tier.tier_template_id);
    return template?.template_name || "";
  }
  return "";
}

/**
 * Generate default form values from initial data
 */
export function getEventFormDefaults(
  initialData?: Event,
  tierTemplates: TierTemplate[] = [],
  _locale?: string,
): EventFormData {
  if (!initialData) {
    return {
      name: "",
      description: "",
      event_type: "",
      country: "",
      currency: "",
      tags: [],
      image: "",
      venue: "",
      venueAddress: "",
      capacity: 0,
      timezone: "",
      is_refundable: false,
      startDate: "",
      endDate: "",
      tickets: [
        {
          name: "",
          price: 0,
          quantity: 0,
          gst: 0,
          salesStart: "",
          salesEnd: "",
        },
      ],
      promoCodes: [],
    };
  }

  return {
    name: initialData.title || "",
    description: initialData.description || "",
    event_type: initialData.event_type || "",
    country: initialData.country || "",
    currency: initialData.currency?.toUpperCase() || "",
    tags: parseCategory(initialData.category),
    image: initialData.banner_image || "",
    venue: initialData.venue_name || "",
    venueAddress: initialData.address || "",
    capacity: initialData.capacity || 0,
    timezone: initialData.timezone || "",
    is_refundable: initialData.is_refundable ?? false,
    startDate: initialData.start_date || "",
    endDate: initialData.end_date || "",
    tickets: initialData.tiers?.map((t) => ({
      id: t.id,
      name: getTierName(t, tierTemplates),
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
        gst: 0,
        salesStart: "",
        salesEnd: "",
      },
    ],
    promoCodes: [],
  };
}

interface TierData {
  tier_template_id: string;
  price: number;
  quantity: number;
  gst: number;
  sales_start?: string;
  sales_end?: string;
  sort_order: number;
}

/**
 * Helper to compare two date strings for temporal equivalence
 */
export function isDateEqual(
  d1?: string | null,
  d2?: string | null,
): boolean {
  const norm1 = d1 || "";
  const norm2 = d2 || "";
  if (!norm1 && !norm2) return true;
  if (!norm1 || !norm2) return false;
  try {
    const time1 = new Date(norm1).getTime();
    const time2 = new Date(norm2).getTime();
    if (isNaN(time1) || isNaN(time2)) return norm1 === norm2;
    return time1 === time2;
  } catch {
    return norm1 === norm2;
  }
}

/**
 * Get only changed fields for update (optimization)
 */
export function getChangedFields(
  currentData: EventFormData,
  tiersData: TierData[],
  initialData: Event,
  imageFile: File | null,
): UpdateEventRequest | null {
  const changedFields: Partial<UpdateEventRequest> = {};

  // Compare simple fields
  if (currentData.name !== initialData.title) {
    changedFields.title = currentData.name;
  }
  if (currentData.description !== initialData.description) {
    changedFields.description = currentData.description;
  }
  if (currentData.currency !== initialData.currency?.toUpperCase()) {
    changedFields.currency = currentData.currency;
  }
  if (currentData.event_type !== initialData.event_type) {
    changedFields.event_type = currentData.event_type;
  }
  if (currentData.country !== initialData.country) {
    changedFields.country = currentData.country;
  }
  if (
    JSON.stringify(currentData.tags) !==
    JSON.stringify(parseCategory(initialData.category))
  ) {
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
  if (currentData.is_refundable !== (initialData.is_refundable ?? false)) {
    changedFields.is_refundable = currentData.is_refundable;
  }
  if (!isDateEqual(currentData.startDate, initialData.start_date)) {
    changedFields.start_date = currentData.startDate || undefined;
  }
  if (!isDateEqual(currentData.endDate, initialData.end_date)) {
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
        tier.tier_template_id !== initialTier.tier_template_id ||
        tier.price !== initialTier.price ||
        tier.quantity !== initialTier.quantity ||
        tier.gst !== (initialTier.gst || 0) ||
        !isDateEqual(tier.sales_start, initialTier.sales_start) ||
        !isDateEqual(tier.sales_end, initialTier.sales_end)
      );
    });

  if (tiersChanged) {
    changedFields.tiers = tiersData as CreateEventTierRequest[];
  }

  // Check for new banner image
  if (imageFile) {
    changedFields.banner_image = imageFile;
  }

  // Update price if first tier price changed
  if (currentData.tickets[0]?.price !== initialTiers[0]?.price) {
    changedFields.price = currentData.tickets[0]?.price ?? 0;
  }

  return changedFields as UpdateEventRequest;
}

/**
 * Prepare event data for creation API
 */
export function prepareCreateEventData(
  data: EventFormData,
  tiersData: TierData[],
  imageFile: File | null,
): CreateEventData {
  const eventData: CreateEventData = {
    title: data.name,
    description: data.description,
    currency: data.currency,
    event_type: data.event_type,
    country: data.country,
    category: data.tags,
    venue_name: data.venue,
    address: data.venueAddress,
    start_date: data.startDate || "",
    end_date: data.endDate || "",
    timezone: data.timezone,
    is_refundable: data.is_refundable,
    capacity: data.capacity,
    price: data.tickets[0]?.price ?? 0,
    tiers: JSON.stringify(tiersData),
  };

  if (imageFile) {
    eventData.banner_image = imageFile;
  }

  return eventData;
}

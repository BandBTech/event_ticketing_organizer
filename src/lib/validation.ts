import {z} from 'zod';

export const ticketSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Ticket name is required"),
    price: z.number().min(0, "price must be positive"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    gst: z.number().min(0, "GST myst be positive").max(100, "GST cannot exceed 100%"),
    salesStart: z.string().min(1, "Sales start date is required"),
    salesEnd: z.string().min(1, "Sales end date is required"),
});
export const promoCodeSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  discountType: z.string().min(1, "Discount type is required"),
  amount: z.number().min(0, "Amount must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  image: z.string().min(1, "Image is required"),
  venue: z.string().min(1, "Venue name is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  timezone: z.string().min(1, "Timezone is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  tickets: z.array(ticketSchema).min(1, "At least one ticket is required"),
  promoCodes: z.array(promoCodeSchema).optional(),
});
export type EventFormData = z.infer<typeof eventSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
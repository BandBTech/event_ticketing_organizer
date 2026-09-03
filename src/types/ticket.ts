import { z } from "zod";

/**
 * Ticket Management Type Definitions & Zod Schemas
 * Fully compliant with Zod 4.1.x runtime signature requirements
 */

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const BulkActionResultItemSchema = z.object({
  success: z.boolean(),
  message: z.string().optional().default(""),
  qr_code: z.string().optional(),
  code: z.string().optional(),
  ticket_number: z.string().optional(),
}).transform((item) => ({
  success: item.success,
  message: item.message,
  qr_code: item.qr_code || item.code || item.ticket_number || "",
  ticket_number: item.ticket_number,
}));

export const TicketBulkActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  // CRITICAL ZOD 4 FIX: Must use (keySchema, valueSchema) signature
  data: z.array(z.record(z.string(), z.unknown())).optional().default([]),
}).transform((res) => ({
  success: res.success,
  message: res.message,
  data: (res.data || []).map((raw) => BulkActionResultItemSchema.parse(raw)),
}));

export const TicketCheckInValidationResponseSchema = z.object({
  valid: z.boolean(),
  can_checkin: z.boolean(),
  message: z.string(),
  qr_code: z.string().optional(),
  event_id: z.string().optional(),
  event_title: z.string().optional(),
  ticket_info: z.object({
    ticket_number: z.string().optional(),
    attendee: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const TicketScanResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  already_checked_in: z.boolean().optional().default(false),
  ticket: z.object({
    id: z.string().optional(),
    ticket_number: z.string().optional(),
    event_id: z.string().optional(),
    event_title: z.string().optional(),
    checked_in: z.boolean().optional(),
    tier_name: z.string().optional(),
    buyer_name: z.string().optional(),
    buyer_email: z.string().optional(),
  }).passthrough().optional(),
  error: z.string().optional(),
});

export const TicketStatsSchema = z.object({
  event_id: z.string(),
  event_title: z.string().optional().default(""),
  total_tickets: z.number().default(0),
  tickets_sold: z.number().default(0),
  tickets_checked_in: z.number().default(0),
  tickets_checked_out: z.number().default(0),
  tickets_remaining: z.number().default(0),
  tickets_cancelled: z.number().default(0),
  revenue: z.number().default(0),
  check_in_rate: z.number().default(0),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type BulkActionResultItem = z.infer<typeof BulkActionResultItemSchema>;
export type ValidatedTicketBulkActionResult = z.infer<typeof TicketBulkActionResultSchema>;
export type ValidatedCheckInValidation = z.infer<typeof TicketCheckInValidationResponseSchema>;
export type ValidatedTicketScanResult = z.infer<typeof TicketScanResultSchema>;
export type ValidatedTicketStats = z.infer<typeof TicketStatsSchema>;

// ─── Domain Interfaces (Preserved) ───────────────────────────────────────────

export interface Ticket {
  id: string;
  ticket_number: string;
  event_id: string;
  event_title: string;
  tier_id: string;
  tier_name: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  status: "valid" | "used" | "cancelled" | "expired" | "refunded" | "active";
  checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  checked_in_by_name?: string;
  checked_out: boolean;
  checked_out_at?: string;
  checked_out_by?: string;
  checked_out_by_name?: string;
  purchase_date: string;
  purchase_price: number;
  qr_code: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  attendee?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface TicketStats {
  event_id: string;
  event_title: string;
  total_tickets: number;
  tickets_sold: number;
  tickets_checked_in: number;
  tickets_checked_out: number;
  tickets_remaining: number;
  tickets_cancelled: number;
  revenue: number;
  check_in_rate: number;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: "valid" | "used" | "cancelled" | "expired" | "refunded";
  search?: string;
  checked_in?: boolean;
  tier_id?: string;
  sort?: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TicketScanResult {
  success: boolean;
  ticket?: Ticket;
  message: string;
  already_checked_in?: boolean;
  error?: string;
}

export interface CheckInData {
  notes?: string;
  location?: string;
}

export interface CheckOutData {
  notes?: string;
}

export interface TicketValidationResult {
  valid: boolean;
  ticket?: Ticket;
  reason?: string;
}

export interface TicketBulkCheckInRequest {
  event_id: string;
  qr_codes: string[];
  event_day_id?: string;
}

export interface TicketBulkCheckOutRequest {
  event_id: string;
  qr_codes: string[];
}

export interface TicketBulkActionResult {
  success: boolean;
  message: string;
  data?: BulkActionResultItem[];
}
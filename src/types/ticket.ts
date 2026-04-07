/**
 * Ticket Management Type Definitions
 * Defines all TypeScript interfaces for ticket-related data structures
 */

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
}

export interface TicketBulkCheckOutRequest {
  event_id: string;
  qr_codes: string[];
}

export interface TicketBulkActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>[];
}

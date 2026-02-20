
import { z } from "zod";

// Enums
export type PayoutRequestStatus = "pending" | "approved" | "rejected" | "paid";
export type PayoutRequestType = "event_payout" | "bulk_payout";

// Zod Schemas
export const PayoutRequestCreateSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  request_type: z.enum(["event_payout", "bulk_payout"]),
  event_id: z.string().optional(),
  description: z.string().optional(),
});

export const PayoutRequestUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "paid"]),
  admin_notes: z.string().optional(),
});

// TypeScript Interfaces
export type PayoutRequestCreate = z.infer<typeof PayoutRequestCreateSchema>;
export type PayoutRequestUpdate = z.infer<typeof PayoutRequestUpdateSchema>;

export interface PayoutRequest {
  id: string;
  organizer_id: string;
  amount: number;
  status: PayoutRequestStatus;
  request_type: PayoutRequestType;
  request_number: string;
  event_id?: string;
  description?: string;
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  // Expanded fields
  event?: {
    id: string; // Changed from id to match usual API response patterns if specific fields are returned
    title: string;
    // Add other fields if returned by API, currently assumed based on typical expansion
  };
  organizer?: {
    id: string;
    // Add other fields if returned by API
  };
}

export interface PayoutSummaryEvent {
  event_id: string;
  event_title: string;
  total_earnings: number;
  paid_amount: number;
  due_amount: number;
  pending_requests: number;
  approved_requests: number;
  paid_requests: number;
}

export interface PayoutSummary {
  approved_requests: number;
  available_amount: number;
  paid_requests: number;
  pending_amount: number;
  pending_requests: number;
  total_earnings: number;
  total_received: number;
  events: PayoutSummaryEvent[];
  filtered_by_event: boolean;
}

export interface PayoutPagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface PayoutRequestsListResponse {
  pagination: PayoutPagination;
  requests: PayoutRequest[];
}

export interface PayoutSearchParams {
  page?: number;
  limit?: number;
  status?: string;
}

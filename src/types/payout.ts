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

export interface PayoutPaymentHistory {
  id: number;
  amount: number;
  method: string;
  reference: string;
  paid_at: string;
  processed_by: string;
  notes: string;
  screenshot_url: string;
  created_at: string;
}

export interface PayoutBillSummary {
  total_billed: number;
  total_paid: number;
  remaining_amount: number;
  pending_amount: number;
  payment_count: number;
  last_payment_date: string;
}

export interface PayoutRequest {
  id: string;
  organizer_id: string;
  amount: number;
  currency?: string;
  symbol?: string;
  status: PayoutRequestStatus;
  request_type: PayoutRequestType;
  request_number: string;
  bill_id?: string;
  event_id?: string;
  description?: string;
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  // Expanded fields
  event?: {
    id: string;
    title: string;
    banner_image?: string;
    status?: string;
    currency?: string;
    symbol?: string;
  };
  bill_summary?: PayoutBillSummary;
  payment_history?: PayoutPaymentHistory[];
}

export interface PayoutSummaryEvent {
  event_id: string;
  event_title: string;
  commission_rate: number;
  currency?: string;
  symbol?: string;
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
  currency?: string;
  symbol?: string;
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
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  event_id?: string;
}

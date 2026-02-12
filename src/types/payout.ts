
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
    id: string;
    title: string;
  };
  organizer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface PayoutSummary {
  total_earnings: number;
  total_withdrawn: number;
  pending_amount: number;
  available_balance: number;
}

export interface PayoutRequestsListResponse {
  data: PayoutRequest[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PayoutSearchParams {
  page?: number;
  limit?: number;
  status?: string;
}

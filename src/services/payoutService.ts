import { api } from "@/lib/apiClient";
import {
  PayoutRequest,
  PayoutRequestCreate,
  PayoutRequestsListResponse,
  PayoutSearchParams,
  PayoutSummary,
} from "@/types/payout";

export const payoutService = {
  // Get paginated list of payout requests
  getPayoutRequests: async (params?: PayoutSearchParams) => {
    let endpoint = "/organizer/payouts";

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined)
        searchParams.append("page", params.page.toString());
      if (params.limit !== undefined)
        searchParams.append("limit", params.limit.toString());
      if (params.status && params.status !== "all") {
        searchParams.append("status", params.status);
      }
      if (params.sort_by) searchParams.append("sort_by", params.sort_by);
      if (params.sort_order)
        searchParams.append("sort_order", params.sort_order);

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return api.get<PayoutRequestsListResponse>(endpoint, {
      requiresAuth: true,
    });
  },

  // Get single payout request by ID
  getPayoutRequestById: async (id: string) => {
    return api.get<PayoutRequest>(`/organizer/payouts/${id}`, {
      requiresAuth: true,
    });
  },

  // Create a new payout request
  createPayoutRequest: async (data: PayoutRequestCreate) => {
    return api.post<PayoutRequest>("/organizer/payouts", data, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: "Payout request submitted successfully",
    });
  },

  // Get payout summary (earnings, withdrawn, pending)
  getPayoutSummary: async (eventId?: string) => {
    const endpoint = eventId
      ? `/organizer/payouts/summary?event_id=${eventId}`
      : "/organizer/payouts/summary";
    return api.get<PayoutSummary>(endpoint, {
      requiresAuth: true,
    });
  },
};

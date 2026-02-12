
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
    let endpoint = "/organizer/payout-requests";

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.append("page", params.page.toString());
      if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
      if (params.status && params.status !== "all") {
        searchParams.append("status", params.status);
      }

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return api.get<PayoutRequestsListResponse>(endpoint, { requiresAuth: true });
  },

  // Create a new payout request
  createPayoutRequest: async (data: PayoutRequestCreate) => {
    return api.post<PayoutRequest>("/organizer/payout-requests", data, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: "Payout request submitted successfully",
    });
  },

  // Get payout summary (earnings, withdrawn, pending)
  getPayoutSummary: async () => {
    return api.get<{ data: PayoutSummary }>("/organizer/payout-summary", { requiresAuth: true });
  },
};

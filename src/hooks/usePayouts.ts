import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutService } from "@/services/payoutService";
import { queryKeys } from "@/lib/queryKeys";
import {
  PayoutSearchParams,
  PayoutRequestsListResponse,
  PayoutRequestCreate,
  PayoutSummary,
  PayoutRequest,
} from "@/types/payout";

interface UsePayoutRequestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  event_id?: string;
}

/**
 * Custom hook for fetching payout requests with server-side pagination and filtering
 */
export function usePayoutRequests(options: UsePayoutRequestsOptions = {}) {
  const { page = 1, limit = 10, status, sort_by, sort_order, event_id } = options;

  // Build params, only include non-empty values
  const params: PayoutSearchParams = {
    page,
    limit,
    ...(status && status !== "all" && { status }),
    ...(sort_by && { sort_by }),
    ...(sort_order && { sort_order }),
    ...(event_id && { event_id }),
  };

  const query = useQuery({
    queryKey: queryKeys.payouts.list(params),
    queryFn: () => payoutService.getPayoutRequests(params),
  });

  // Extract data with proper typing
  const response = query.data as PayoutRequestsListResponse | undefined;

  return {
    ...query,
    payouts: response?.requests ?? [],
    pagination: response?.pagination,
    // Helper to check if there are more pages
    hasNextPage: response?.pagination?.has_next ?? false,
    hasPreviousPage: response?.pagination?.has_prev ?? false,
    totalPages: response?.pagination?.total_pages ?? 0,
    total: response?.pagination?.total ?? 0,
  };
}

/**
 * Custom hook for fetching a single payout request by ID
 */
export function usePayoutRequest(id: string | null) {
  return useQuery<PayoutRequest>({
    queryKey: queryKeys.payouts.byId(id ?? ""),
    queryFn: () => payoutService.getPayoutRequestById(id!),
    enabled: !!id,
  });
}

/**
 * Custom hook for fetching payout summary statistics
 */
export function usePayoutSummary(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.payouts.summary(eventId),
    queryFn: () => payoutService.getPayoutSummary(eventId),
  });
}

/**
 * Custom hook for creating a payout request
 */
export function useCreatePayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayoutRequestCreate) =>
      payoutService.createPayoutRequest(data),
    onSuccess: () => {
      // Invalidate all payout related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

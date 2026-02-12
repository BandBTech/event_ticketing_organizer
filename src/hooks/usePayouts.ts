
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutService } from "@/services/payoutService";
import { queryKeys } from "@/lib/queryKeys";
import { PayoutSearchParams, PayoutRequestsListResponse, PayoutRequestCreate, PayoutSummary } from "@/types/payout";

interface UsePayoutRequestsOptions {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Custom hook for fetching payout requests with server-side pagination and filtering
 */
export function usePayoutRequests(options: UsePayoutRequestsOptions = {}) {
  const { page = 1, limit = 10, status } = options;

  // Build params, only include non-empty values
  const params: PayoutSearchParams = {
    page,
    limit,
    ...(status && status !== "all" && { status }),
  };

  const query = useQuery({
    queryKey: queryKeys.payouts.list(params),
    queryFn: () => payoutService.getPayoutRequests(params),
  });

  // Extract data with proper typing
  const response = query.data as PayoutRequestsListResponse | undefined;

  return {
    ...query,
    payouts: response?.data ?? [],
    meta: response?.meta,
    // Helper to check if there are more pages
    hasNextPage: response?.meta ? response.meta.current_page < response.meta.last_page : false,
    hasPreviousPage: response?.meta ? response.meta.current_page > 1 : false,
    totalPages: response?.meta?.last_page ?? 0,
    total: response?.meta?.total ?? 0,
  };
}

/**
 * Custom hook for fetching payout summary statistics
 */
export function usePayoutSummary() {
  const query = useQuery({
    queryKey: queryKeys.payouts.summary,
    queryFn: () => payoutService.getPayoutSummary(),
  });

  const response = query.data as { data: PayoutSummary } | undefined;

  return {
    ...query,
    summary: response?.data,
  };
}

/**
 * Custom hook for creating a payout request
 */
export function useCreatePayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayoutRequestCreate) => payoutService.createPayoutRequest(data),
    onSuccess: () => {
      // Invalidate all payout related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

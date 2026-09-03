"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TicketService } from "@/services/ticketService";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/lib/toast";
import type {
  Ticket,
  TicketStats,
  TicketFilters,
  TicketsResponse,
  TicketScanResult,
  CheckInData,
  CheckOutData,
  TicketBulkActionResult,
  TicketBulkCheckInRequest,
  TicketBulkCheckOutRequest,
  ValidatedCheckInValidation,
} from "@/types/ticket";
import { useTranslation } from "./useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export function useEventTickets(eventId: string, filters?: TicketFilters) {
  return useQuery<TicketsResponse>({
    queryKey: queryKeys.tickets.list(eventId, filters),
    queryFn: () => TicketService.getEventTickets(eventId, filters),
    enabled: !!eventId,
    staleTime: 30000,
  });
}

export function useTicketStats(eventId: string) {
  return useQuery<TicketStats>({
    queryKey: queryKeys.tickets.stats(eventId),
    queryFn: () => TicketService.getTicketStats(eventId),
    enabled: !!eventId,
    staleTime: 10000,
  });
}

export function useScanTicket() {
  const queryClient = useQueryClient();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return useMutation<
    TicketScanResult,
    Error,
    { ticketCode: string; eventId?: string; eventDayId?: string }
  >({
    mutationFn: ({ ticketCode, eventId, eventDayId }) =>
      TicketService.scanTicket(ticketCode, eventId, eventDayId),
    onSuccess: (data, variables) => {
      const targetEventId = variables.eventId || data.ticket?.event_id;

      // RULE 4.5 EAGER UPDATE: Instantly update TanStack Query cache
      if (data.success && !data.already_checked_in && targetEventId) {
        queryClient.setQueryData<TicketStats>(
          queryKeys.tickets.stats(targetEventId),
          (old) => {
            if (!old) return old;
            const nextCheckedIn = (old.tickets_checked_in || 0) + 1;
            const nextRemaining = Math.max(0, (old.tickets_remaining || 0) - 1);
            const nextRate = old.total_tickets > 0 ? (nextCheckedIn / old.total_tickets) * 100 : 0;
            return {
              ...old,
              tickets_checked_in: nextCheckedIn,
              tickets_remaining: nextRemaining,
              check_in_rate: nextRate,
            };
          }
        );
        // Immediately invalidate to guarantee eventual server consistency
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.stats(targetEventId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(targetEventId) });
      }

      if (data.success && data.ticket) {
        toast.success(
          data.already_checked_in
            ? "scanner.ticket_already_checked_in"
            : "scanner.ticket_scanned_successfully",
          data.already_checked_in
            ? t("scanner.ticket_already_checked_in", "Ticket already checked in.")
            : t("scanner.ticket_scanned_successfully", "Ticket scanned successfully."),
          data.message || ""
        );
      }
    },
  });
}

export function useBulkCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<TicketBulkActionResult, Error, TicketBulkCheckInRequest>({
    mutationFn: (data) => TicketService.bulkCheckIn(data),
    onSuccess: (result, variables) => {
      const successCount = (result.data || []).filter((r) => r.success).length;

      // RULE 4.5 EAGER UPDATE: Instantly update ticket statistics cache
      if (variables.event_id && successCount > 0) {
        queryClient.setQueryData<TicketStats>(
          queryKeys.tickets.stats(variables.event_id),
          (old) => {
            if (!old) return old;
            const nextCheckedIn = (old.tickets_checked_in || 0) + successCount;
            const nextRemaining = Math.max(0, (old.tickets_remaining || 0) - successCount);
            const nextRate = old.total_tickets > 0 ? (nextCheckedIn / old.total_tickets) * 100 : 0;
            return {
              ...old,
              tickets_checked_in: nextCheckedIn,
              tickets_remaining: nextRemaining,
              check_in_rate: nextRate,
            };
          }
        );
      }

      // Immediately invalidate to synchronize cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.stats(variables.event_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.list(variables.event_id),
      });
    },
  });
}

export function useValidateCheckIn() {
  return useMutation<
    ValidatedCheckInValidation,
    Error,
    { qrCode: string; eventId?: string; eventDayId?: string }
  >({
    mutationFn: ({ qrCode, eventId, eventDayId }) =>
      TicketService.validateCheckIn(qrCode, eventId, eventDayId),
  });
}

export function useCheckInTicket() {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, { ticketId: string; data?: CheckInData }>({
    mutationFn: ({ ticketId, data }) => TicketService.checkInTicket(ticketId, data),
    onSuccess: (updatedTicket) => {
      toast.success("scanner.ticket_checked_in_successfully", "Ticket checked in successfully");
      queryClient.setQueryData<Ticket>(queryKeys.tickets.detail(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.stats(updatedTicket.event_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(updatedTicket.event_id) });
    },
    onError: (error) => {
      toast.error("Check-in failed", error.message || "Failed to check in ticket");
    },
  });
}

export function useCheckOutTicket() {
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, { ticketId: string; data?: CheckOutData }>({
    mutationFn: ({ ticketId, data }) => TicketService.checkOutTicket(ticketId, data),
    onSuccess: (updatedTicket) => {
      toast.success("Check-out successful", "Ticket checked out successfully");
      queryClient.setQueryData<Ticket>(queryKeys.tickets.detail(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.stats(updatedTicket.event_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(updatedTicket.event_id) });
    },
    onError: (error) => {
      toast.error("Check-out failed", error.message || "Failed to check out ticket");
    },
  });
}

export function useBulkCheckOut() {
  const queryClient = useQueryClient();

  return useMutation<TicketBulkActionResult, Error, TicketBulkCheckOutRequest>({
    mutationFn: (data) => TicketService.bulkCheckOut(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Bulk check-out successful", result.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.stats(variables.event_id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list(variables.event_id) });
      } else {
        toast.error("Bulk check-out failed", result.message);
      }
    },
    onError: (error) => {
      toast.error("Bulk check-out failed", error.message || "Failed to process bulk check-out");
    },
  });
}

export function useSearchTickets() {
  return useMutation<Ticket[], Error, { eventId: string; q: string }>({
    mutationFn: ({ eventId, q }) => TicketService.searchTickets(eventId, q),
  });
}

export function useManualCheckIn() {
  return useMutation<
    TicketScanResult,
    Error,
    { ticketNumber: string; eventId: string; eventDayId?: string }
  >({
    mutationFn: ({ ticketNumber, eventId, eventDayId }) =>
      TicketService.manualCheckIn(ticketNumber, eventId, eventDayId),
  });
}
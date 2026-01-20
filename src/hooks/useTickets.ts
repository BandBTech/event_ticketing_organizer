'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketService } from '@/services/ticketService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/lib/toast';
import type {
  Ticket,
  TicketStats,
  TicketFilters,
  TicketsResponse,
  TicketScanResult,
  CheckInData,
  CheckOutData
} from '@/types/ticket';

/**
 * Hook for fetching tickets for a specific event
 * @param eventId - The event ID
 * @param filters - Optional filters for tickets (status, search, pagination)
 */
export function useEventTickets(eventId: string, filters?: TicketFilters) {
  return useQuery<TicketsResponse>({
    queryKey: queryKeys.tickets.list(eventId, filters),
    queryFn: () => TicketService.getEventTickets(eventId, filters),
    enabled: !!eventId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook for fetching ticket statistics for an event
 * @param eventId - The event ID
 */
export function useTicketStats(eventId: string) {
  return useQuery<TicketStats>({
    queryKey: queryKeys.tickets.stats(eventId),
    queryFn: () => TicketService.getTicketStats(eventId),
    enabled: !!eventId,
    staleTime: 10000, // 10 seconds - more frequent updates for stats
  });
}

/**
 * Hook for fetching detailed information about a specific ticket
 * @param ticketId - The ticket ID
 * @param enabled - Whether to enable the query
 */
export function useTicketDetails(ticketId: string, enabled: boolean = true) {
  return useQuery<Ticket>({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => TicketService.getTicketDetails(ticketId),
    enabled: !!ticketId && enabled,
  });
}

/**
 * Hook for scanning a ticket QR code
 * Automatically invalidates ticket stats and list on successful scan
 */
export function useScanTicket() {
  const queryClient = useQueryClient();

  return useMutation<TicketScanResult, Error, string>({
    mutationFn: (ticketCode: string) => TicketService.scanTicket(ticketCode),
    onSuccess: (data) => {
      if (data.success && data.ticket) {
        // Show success message
        toast.success(
          data.already_checked_in
            ? 'Ticket already checked in'
            : 'Ticket scanned successfully!',
          data.message
        );

        // Update the ticket in cache if we have it
        queryClient.setQueryData<Ticket>(
          queryKeys.tickets.detail(data.ticket.id),
          data.ticket
        );

        // Invalidate stats and list for the event
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.stats(data.ticket.event_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.list(data.ticket.event_id),
        });
      } else {
        toast.error('Scan failed', data.message || data.error || 'Invalid ticket');
      }
    },
    onError: (error) => {
      toast.error('Scan failed', error.message || 'Failed to scan ticket');
    },
  });
}

/**
 * Hook for checking in a ticket
 * Invalidates relevant queries on success
 */
export function useCheckInTicket() {
  const queryClient = useQueryClient();

  return useMutation<
    Ticket,
    Error,
    { ticketId: string; data?: CheckInData }
  >({
    mutationFn: ({ ticketId, data }) =>
      TicketService.checkInTicket(ticketId, data),
    onSuccess: (updatedTicket) => {
      toast.success('Check-in successful', 'Ticket checked in successfully');

      // Update the ticket in cache
      queryClient.setQueryData<Ticket>(
        queryKeys.tickets.detail(updatedTicket.id),
        updatedTicket
      );

      // Invalidate stats and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.stats(updatedTicket.event_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.list(updatedTicket.event_id),
      });
    },
    onError: (error) => {
      toast.error('Check-in failed', error.message || 'Failed to check in ticket');
    },
  });
}

/**
 * Hook for checking out a ticket
 * Invalidates relevant queries on success
 */
export function useCheckOutTicket() {
  const queryClient = useQueryClient();

  return useMutation<
    Ticket,
    Error,
    { ticketId: string; data?: CheckOutData }
  >({
    mutationFn: ({ ticketId, data }) =>
      TicketService.checkOutTicket(ticketId, data),
    onSuccess: (updatedTicket) => {
      toast.success('Check-out successful', 'Ticket checked out successfully');

      // Update the ticket in cache
      queryClient.setQueryData<Ticket>(
        queryKeys.tickets.detail(updatedTicket.id),
        updatedTicket
      );

      // Invalidate stats and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.stats(updatedTicket.event_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.list(updatedTicket.event_id),
      });
    },
    onError: (error) => {
      toast.error('Check-out failed', error.message || 'Failed to check out ticket');
    },
  });
}

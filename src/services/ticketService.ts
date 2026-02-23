import { api } from '@/lib/apiClient';
import {
  Ticket,
  TicketStats,
  TicketFilters,
  TicketsResponse,
  TicketScanResult,
  CheckInData,
  CheckOutData,
  TicketValidationResult,
  TicketBulkCheckInRequest,
  TicketBulkCheckOutRequest,
  TicketBulkActionResult
} from '@/types/ticket';

/**
 * Ticket Service
 * Handles all ticket-related API calls for staff/manager roles
 */
export class TicketService {
  /**
   * Get all tickets for a specific event
   * GET /organizer/events/{eventId}/tickets
   */
  static async getEventTickets(
    eventId: string,
    filters?: TicketFilters
  ): Promise<TicketsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.checked_in !== undefined) {
        params.append('checked_in', filters.checked_in.toString());
      }
      if (filters.tier_id) params.append('tier_id', filters.tier_id);
      if (filters.sort) params.append('sort', filters.sort);
    }

    const query = params.toString();
    const endpoint = `/organizer/events/${eventId}/tickets${query ? `?${query}` : ''}`;
    
    return await api.get<TicketsResponse>(endpoint, {
      requiresAuth: true,
    });
  }

  /**
   * Get ticket statistics for a specific event
   * GET /organizer/events/{eventId}/tickets/stats
   */
  static async getTicketStats(eventId: string): Promise<TicketStats> {
    return await api.get<TicketStats>(
      `/organizer/events/${eventId}/tickets/stats`,
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Scan a ticket QR code (Check-in)
   * POST /organizer/tickets/scan -> POST /organizer/tickets/checkin
   */
  static async scanTicket(ticketCode: string, eventId?: string): Promise<TicketScanResult> {
    const payload: { qr_code: string; event_id?: string } = { qr_code: ticketCode };
    if (eventId) {
      payload.event_id = eventId;
    }

    return await api.post<{ success: boolean; message: string; data?: any }>(
      '/organizer/tickets/checkin',
      payload,
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Get detailed information about a specific ticket
   * GET /organizer/tickets/{ticketId}
   */
  static async getTicketDetails(ticketId: string): Promise<Ticket> {
    return await api.get<Ticket>(
      `/organizer/tickets/${ticketId}`,
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Check in a ticket
   * PUT /organizer/tickets/{ticketId}/checkin
   */
  static async checkInTicket(
    ticketId: string,
    data?: CheckInData
  ): Promise<Ticket> {
    return await api.put<Ticket>(
      `/organizer/tickets/${ticketId}/checkin`,
      data || {},
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Check out a ticket
   * PUT /organizer/tickets/{ticketId}/checkout
   */
  static async checkOutTicket(
    ticketId: string,
    data?: CheckOutData
  ): Promise<Ticket> {
    return await api.put<Ticket>(
      `/organizer/tickets/${ticketId}/checkout`,
      data || {},
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Validate a ticket (client-side helper)
   */
  static validateTicketStatus(ticket: Ticket): TicketValidationResult {
    if (ticket.status === 'cancelled') {
      return {
        valid: false,
        reason: 'This ticket has been cancelled',
      };
    }

    if (ticket.status === 'expired') {
      return {
        valid: false,
        reason: 'This ticket has expired',
      };
    }

    if (ticket.status === 'refunded') {
      return {
        valid: false,
        reason: 'This ticket has been refunded',
      };
    }

    if (ticket.checked_in) {
      return {
        valid: true,
        ticket,
        reason: 'Ticket already checked in',
      };
    }

    return {
      valid: true,
      ticket,
    };
  }

  /**
   * Validate a ticket for check-in without actually checking it in
   * POST /organizer/tickets/validate-checkin
   */
  static async validateCheckIn(
    qrCode: string,
    eventId?: string
  ): Promise<{ valid: boolean; can_checkin: boolean; message: string; qr_code?: string; ticket_info?: Record<string, unknown> & { ticket_number?: string }; event_id?: string; event_title?: string }> {
    const payload: { qr_code: string; event_id?: string } = { qr_code: qrCode };
    if (eventId) {
      payload.event_id = eventId;
    }
    return await api.post(
      '/organizer/tickets/validate-checkin',
      payload,
      { requiresAuth: true }
    );
  }

  /**
   * Bulk check-in tickets
   * POST /organizer/tickets/bulk-checkin
   */
  static async bulkCheckIn(
    data: TicketBulkCheckInRequest
  ): Promise<TicketBulkActionResult> {
    return await api.post<TicketBulkActionResult>(
      '/organizer/tickets/bulk-checkin',
      data,
      {
        requiresAuth: true,
      }
    );
  }

  /**
   * Bulk check-out tickets
   * POST /organizer/tickets/bulk-checkout
   */
  static async bulkCheckOut(
    data: TicketBulkCheckOutRequest
  ): Promise<TicketBulkActionResult> {
    return await api.post<TicketBulkActionResult>(
      '/organizer/tickets/bulk-checkout',
      data,
      {
        requiresAuth: true,
      }
    );
  }
}

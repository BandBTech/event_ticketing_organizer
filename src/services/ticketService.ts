import { api } from "@/lib/apiClient";
import {
  Ticket,
  TicketStats,
  TicketFilters,
  TicketsResponse,
  TicketScanResult,
  CheckInData,
  CheckOutData,
  TicketBulkCheckInRequest,
  TicketBulkCheckOutRequest,
  TicketBulkActionResult,
  TicketScanResultSchema,
  TicketBulkActionResultSchema,
  TicketCheckInValidationResponseSchema,
  TicketStatsSchema,
  ValidatedCheckInValidation,
} from "@/types/ticket";

export class TicketService {
  static async getEventTickets(
    eventId: string,
    filters?: TicketFilters
  ): Promise<TicketsResponse> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.checked_in !== undefined) {
        params.append("checked_in", filters.checked_in.toString());
      }
      if (filters.tier_id) params.append("tier_id", filters.tier_id);
      if (filters.sort) params.append("sort", filters.sort);
    }
    const query = params.toString();
    const endpoint = `/organizer/events/${eventId}/tickets${query ? `?${query}` : ""}`;
    return await api.get<TicketsResponse>(endpoint, { requiresAuth: true });
  }

  static async getTicketStats(eventId: string): Promise<TicketStats> {
    const raw = await api.get<unknown>(
      `/organizer/events/${eventId}/tickets/stats`,
      { requiresAuth: true }
    );
    return TicketStatsSchema.parse(raw) as TicketStats;
  }

  static async scanTicket(
    ticketCode: string,
    eventId?: string,
    eventDayId?: string
  ): Promise<TicketScanResult> {
    const payload: { qr_code: string; event_id?: string; event_day_id?: string } = {
      qr_code: ticketCode,
    };
    if (eventId) payload.event_id = eventId;
    if (eventDayId) payload.event_day_id = eventDayId;

    const raw = await api.post<unknown>(
      "/organizer/tickets/checkin",
      payload,
      { requiresAuth: true, showErrorToast: false }
    );
    return TicketScanResultSchema.parse(raw) as TicketScanResult;
  }

  static async validateCheckIn(
    qrCode: string,
    eventId?: string,
    eventDayId?: string
  ): Promise<ValidatedCheckInValidation> {
    const payload: { qr_code: string; event_id?: string; event_day_id?: string } = {
      qr_code: qrCode,
    };
    if (eventId) payload.event_id = eventId;
    if (eventDayId) payload.event_day_id = eventDayId;

    const raw = await api.post<unknown>(
      "/organizer/tickets/validate-checkin",
      payload,
      { requiresAuth: true, showErrorToast: false }
    );
    return TicketCheckInValidationResponseSchema.parse(raw);
  }

  static async bulkCheckIn(
    data: TicketBulkCheckInRequest
  ): Promise<TicketBulkActionResult> {
    const raw = await api.post<unknown>(
      "/organizer/tickets/bulk-checkin",
      data,
      { requiresAuth: true, returnFullResponse: true }
    );
    return TicketBulkActionResultSchema.parse(raw) as TicketBulkActionResult;
  }

  static async manualCheckIn(
    ticketNumber: string,
    eventId: string,
    eventDayId?: string
  ): Promise<TicketScanResult> {
    const payload: { ticket_number: string; event_id: string; event_day_id?: string } = {
      ticket_number: ticketNumber,
      event_id: eventId,
    };
    if (eventDayId) payload.event_day_id = eventDayId;

    const raw = await api.post<unknown>(
      "/organizer/tickets/checkin",
      payload,
      { requiresAuth: true, showErrorToast: false }
    );
    return TicketScanResultSchema.parse(raw) as TicketScanResult;
  }

  static async bulkCheckOut(
    data: TicketBulkCheckOutRequest
  ): Promise<TicketBulkActionResult> {
    const raw = await api.post<unknown>(
      "/organizer/tickets/bulk-checkout",
      data,
      { requiresAuth: true, returnFullResponse: true, showErrorToast: false }
    );
    return TicketBulkActionResultSchema.parse(raw) as TicketBulkActionResult;
  }

  static async getTicketDetails(ticketId: string): Promise<Ticket> {
    return await api.get<Ticket>(`/organizer/tickets/${ticketId}`, { requiresAuth: true });
  }

  static async checkInTicket(ticketId: string, data?: CheckInData): Promise<Ticket> {
    return await api.put<Ticket>(
      `/organizer/tickets/${ticketId}/checkin`,
      data || {},
      { requiresAuth: true, showErrorToast: false }
    );
  }

  static async checkOutTicket(ticketId: string, data?: CheckOutData): Promise<Ticket> {
    return await api.put<Ticket>(
      `/organizer/tickets/${ticketId}/checkout`,
      data || {},
      { requiresAuth: true, showErrorToast: false }
    );
  }

  static async searchTickets(eventId: string, q: string, limit = 10): Promise<Ticket[]> {
    const params = new URLSearchParams({ event_id: eventId, q, limit: limit.toString() });
    return await api.get<Ticket[]>(`/organizer/tickets/search?${params}`, { requiresAuth: true });
  }
}
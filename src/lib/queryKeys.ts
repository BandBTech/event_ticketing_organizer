/**
 * Centralized TanStack Query Keys
 *
 * This file provides a type-safe factory pattern for all query keys used in the application.
 * Using centralized keys ensures:
 * - Consistent key references across queries and invalidations
 * - Type-safety to prevent typos
 * - Single source of truth for cache management
 * - Easy refactoring when keys need changes
 */

export const queryKeys = {
  /**
   * Event-related query keys
   */
  events: {
    /** Key for fetching all events list */
    all: ["events"] as const,
    /** Key for fetching events with search/filter params */
    list: (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }) => ["events", "list", params] as const,
    /** Key for fetching a single event by ID */
    detail: (id: string) => ["event", id] as const,
    /** Key for fetching event analytics by ID */
    analytics: (id: string) => ["eventAnalytics", id] as const,
    /** Key for fetching event status history by ID */
    statusHistory: (id: string) => ["eventStatusHistory", id] as const,
    /** Key for fetching event tickets list */
    tickets: (
      id: string,
      params: {
        page?: number;
        limit?: number;
        search?: string;
        sort_by?: string;
        sort_order?: string;
      },
    ) => ["eventTickets", id, params] as const,
  },

  /**
   * Tier template query keys
   */
  tierTemplates: {
    /** Key for fetching all tier templates */
    all: ["tierTemplates"] as const,
  },

  /**
   * Organizer profile query keys
   */
  organizerProfile: {
    /** Key for fetching organizer profile */
    all: ["organizerProfile"] as const,
  },

  /**
   * Organization users query keys
   */
  orgUsers: {
    /** Key for invalidating all org users queries */
    all: ["orgUsers"] as const,
    /** Key for fetching users list with pagination/filters */
    list: (params: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      sort?: string;
      status?: string;
    }) =>
      [
        "orgUsers",
        params.page,
        params.limit,
        params.search,
        params.role,
        params.sort,
        params.status,
      ] as const,
  },

  /**
   * Ticket query keys
   */
  tickets: {
    /** Key for invalidating all tickets queries */
    all: ["tickets"] as const,
    /** Key for fetching tickets list for an event with filters */
    list: (
      eventId: string,
      filters?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        checked_in?: boolean;
      },
    ) => ["tickets", "list", eventId, filters] as const,
    /** Key for fetching a single ticket by ID */
    detail: (ticketId: string) => ["ticket", ticketId] as const,
    /** Key for fetching ticket statistics for an event */
    stats: (eventId: string) => ["ticketStats", eventId] as const,
  },

  /**
   * Payout query keys
   */
  payouts: {
    /** Key for fetching all payout requests */
    all: ["payouts"] as const,
    /** Key for fetching payout requests list with filters */
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      sort_by?: string;
      sort_order?: string;
    }) => ["payouts", "list", params] as const,
    /** Key for fetching a single payout request by ID */
    byId: (id: string) => ["payout", id] as const,
    /** Key for fetching payout summary */
    summary: ["payouts", "summary"] as const,
  },

  /**
   * Dashboard query keys
   */
  dashboard: {
    /** Key for fetching dashboard stats */
    all: ["dashboard"] as const,
  },

  /**
   * Reports query keys
   */
  reports: {
    /** Key for invalidating all report queries */
    all: ['reports'] as const,
    /** Key for fetching a specific report type with optional filters */
    byType: (type: string, params?: { start_date?: string; end_date?: string; event_id?: string; limit?: number }) =>
      ['reports', type, params] as const,
  },
} as const;

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
    all: ['events'] as const,
    /** Key for fetching events with search/filter params */
    list: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
      ['events', 'list', params] as const,
    /** Key for fetching a single event by ID */
    detail: (id: string) => ['event', id] as const,
    /** Key for fetching event analytics by ID */
    analytics: (id: string) => ['eventAnalytics', id] as const,
    /** Key for fetching event status history by ID */
    statusHistory: (id: string) => ['eventStatusHistory', id] as const,
  },

  /**
   * Tier template query keys
   */
  tierTemplates: {
    /** Key for fetching all tier templates */
    all: ['tierTemplates'] as const,
  },

  /**
   * Organizer profile query keys
   */
  organizerProfile: {
    /** Key for fetching organizer profile */
    all: ['organizerProfile'] as const,
  },

  /**
   * Organization users query keys
   */
  orgUsers: {
    /** Key for fetching users of an organization */
    all: (orgId: string) => ['orgUsers', orgId] as const,
  },
} as const;

import { api } from "@/lib/apiClient";
import {
  Event,
  CreateEventData,
  UpdateEventRequest,
  TierTemplate,
  CreateTierTemplateRequest,
  EventAnalyticsResponse,
  EventSalesControlRequest,
  EventCancellationRequest,
  EventCancellationRecord,
  EventStatusHistory,
  EventListResponse,
  EventSearchParams,
  EventTicketsListResponse,
  ListAllType,
  MinimalUserResponse,
  MinimalEventResponse,
} from "@/types/event";

// Helper to create FormData from event object
function createEventFormData(
  data: CreateEventData | UpdateEventRequest,
): FormData {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);

  // Handle banner_image (File or string)
  if (data.banner_image) {
    formData.append("banner_image", data.banner_image);
  }

  if (data.category && data.category.length > 0) {
    // Send as comma-separated string: "music,concert"
    formData.append("category", data.category.join(","));
  }
  if (data.currency) formData.append("currency", data.currency);
  if ("event_type" in data && data.event_type)
    formData.append("event_type", data.event_type);
  if ("country" in data && data.country)
    formData.append("country", data.country);
  if (data.venue_name) formData.append("venue_name", data.venue_name);
  if (data.address) formData.append("address", data.address);
  if (data.start_date) formData.append("start_date", data.start_date);
  if (data.end_date) formData.append("end_date", data.end_date);
  if (data.timezone) formData.append("timezone", data.timezone);
  if (data.capacity !== undefined)
    formData.append("capacity", data.capacity.toString());
  if (data.price !== undefined) formData.append("price", data.price.toString());

  // Handle tiers - ensure it's a JSON string
  if (data.tiers) {
    if (typeof data.tiers === "string") {
      formData.append("tiers", data.tiers);
    } else {
      formData.append("tiers", JSON.stringify(data.tiers));
    }
  }

  if ("status" in data && data.status) {
    formData.append("status", data.status);
  }

  return formData;
}

export const eventService = {
  getEvents: async (params?: EventSearchParams) => {
    let endpoint = "/organizer/events";

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined)
        searchParams.append("page", params.page.toString());
      if (params.limit !== undefined)
        searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.sort_by) searchParams.append("sort_by", params.sort_by);
      if (params.sort_dir) searchParams.append("sort_dir", params.sort_dir);

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return api.get<EventListResponse>(endpoint, { requiresAuth: true });
  },

  getEvent: async (id: string) => {
    return api.get<Event>(`/organizer/events/${id}`, { requiresAuth: true });
  },

  createEvent: async (data: CreateEventData) => {
    const formData = createEventFormData(data);
    return api.postFormData<Event>("/organizer/events", formData, {
      requiresAuth: true,
    });
  },

  updateEvent: async (id: string, data: UpdateEventRequest) => {
    const formData = createEventFormData(data);
    return api.putFormData<Event>(`/organizer/events/${id}`, formData, {
      requiresAuth: true,
    });
  },

  getTierTemplates: async () => {
    return api.get<TierTemplate[]>("/organizer/events/tier-templates", {
      requiresAuth: true,
    });
  },

  createTierTemplate: async (data: CreateTierTemplateRequest) => {
    return api.post<TierTemplate>("/organizer/events/tier-templates", data, {
      requiresAuth: true,
    });
  },

  // Event Analytics - Get comprehensive analytics for an event including tier breakdown
  getEventAnalytics: async (id: string) => {
    return api.get<EventAnalyticsResponse>(
      `/organizer/events/${id}/analytics`,
      { requiresAuth: true },
    );
  },

  // Control event sales - pause, resume, or stop
  controlEventSales: async (id: string, data: EventSalesControlRequest) => {
    return api.put<Event>(`/organizer/events/${id}/sales/control`, data, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: `Event sales ${data.action}d successfully`,
    });
  },

  // Submit a cancellation request for an event (requires admin approval)
  cancelEvent: async (id: string, data: EventCancellationRequest) => {
    return api.post<EventCancellationRecord>(
      `/organizer/events/${id}/cancel`,
      data,
      {
        requiresAuth: true,
        showSuccessToast: true,
        successMessage: "Cancellation request submitted successfully",
      },
    );
  },

  // Get event status change history
  getStatusHistory: async (id: string): Promise<EventStatusHistory[]> => {
    const response = await api.get<Record<string, unknown>>(
      `/organizer/events/${id}/status-history`,
      { requiresAuth: true },
    );

    // API might return raw array or wrapped in an object
    if (Array.isArray(response)) return response;

    if (response && typeof response === "object") {
      // Check for common wrappers
      return (
        (response.history as EventStatusHistory[]) ||
        (response.items as EventStatusHistory[]) ||
        (response.data as EventStatusHistory[]) ||
        []
      );
    }

    return [];
  },

  // Get all tickets purchased for a specific event
  getEventTickets: async (
    eventId: string,
    page = 1,
    limit = 10,
    search?: string,
    sort_by?: string,
    sort_order?: string,
    status?: string,
  ) => {
    let endpoint = `/organizer/events/${eventId}/tickets?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${search}`;
    }
    if (sort_by) {
      endpoint += `&sort_by=${sort_by}`;
    }
    if (sort_order) {
      endpoint += `&sort_order=${sort_order}`;
    }
    if (status) {
      endpoint += `&status=${status}`;
    }
    return api.get<EventTicketsListResponse>(endpoint, { requiresAuth: true });
  },

  // List all entities without pagination
  // GET /organizer/list-all?type=events  → MinimalEventResponse[]
  // GET /organizer/list-all?type=users   → MinimalUserResponse[]
  listAll: async (
    type: ListAllType,
  ): Promise<MinimalUserResponse[] | MinimalEventResponse[]> => {
    return api.get<MinimalUserResponse[] | MinimalEventResponse[]>(
      `/organizer/list-all?type=${type}`,
      { requiresAuth: true },
    );
  },
};

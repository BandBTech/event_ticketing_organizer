import { api } from '@/lib/apiClient';
import {
    Event,
    CreateEventData,
    UpdateEventRequest,
    TierTemplate,
  CreateTierTemplateRequest,
  EventAnalyticsResponse,
  EventSalesControlRequest,
  EventCancellationRequest
} from '@/types/event';


// Helper to create FormData from event object
function createEventFormData(data: CreateEventData | UpdateEventRequest): FormData {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);

  // Handle banner_image (File or string)
  if (data.banner_image) {
    formData.append('banner_image', data.banner_image);
  }

  if (data.category && data.category.length > 0) {
    // Send as comma-separated string: "music,concert"
    formData.append('category', data.category.join(','));
  }
  if (data.venue_name) formData.append('venue_name', data.venue_name);
  if (data.address) formData.append('address', data.address);
  if (data.start_date) formData.append('start_date', data.start_date);
  if (data.end_date) formData.append('end_date', data.end_date);
  if (data.timezone) formData.append('timezone', data.timezone);
  if (data.capacity !== undefined) formData.append('capacity', data.capacity.toString());
  if (data.price !== undefined) formData.append('price', data.price.toString());

  // Handle tiers - ensure it's a JSON string
  if (data.tiers) {
    if (typeof data.tiers === 'string') {
      formData.append('tiers', data.tiers);
    } else {
      formData.append('tiers', JSON.stringify(data.tiers));
    }
  }

  if ('status' in data && data.status) {
    formData.append('status', data.status);
  }

  return formData;
}

export const eventService = {
    getEvents: async () => {
        return api.get<Event[]>('/organizer/events', { requiresAuth: true });
    },

    getEvent: async (id: string) => {
        return api.get<Event>(`/organizer/events/${id}`, { requiresAuth: true });
    },

    createEvent: async (data: CreateEventData) => {
      const formData = createEventFormData(data);
        return api.postFormData<Event>('/organizer/events', formData, { requiresAuth: true });
    },

    updateEvent: async (id: string, data: UpdateEventRequest) => {
      const formData = createEventFormData(data);
      return api.putFormData<Event>(`/organizer/events/${id}`, formData, { requiresAuth: true });
    },

    getTierTemplates: async () => {
        return api.get<TierTemplate[]>('/organizer/events/tier-templates', { requiresAuth: true });
    },

    createTierTemplate: async (data: CreateTierTemplateRequest) => {
        return api.post<TierTemplate>('/organizer/events/tier-templates', data, { requiresAuth: true });
    },

  // Event Analytics - Get comprehensive analytics for an event including tier breakdown
  getEventAnalytics: async (id: string) => {
    return api.get<EventAnalyticsResponse>(`/organizer/events/${id}/analytics`, { requiresAuth: true });
  },

  // Control event sales - pause, resume, or stop
  controlEventSales: async (id: string, data: EventSalesControlRequest) => {
    return api.put<Event>(`/organizer/events/${id}/sales/control`, data, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: `Event sales ${data.action}d successfully`
    });
  },

  // Cancel an event with reason
  cancelEvent: async (id: string, data: EventCancellationRequest) => {
    return api.put<Event>(`/organizer/events/${id}/cancel`, data, {
      requiresAuth: true,
      showSuccessToast: true,
      successMessage: 'Event cancelled successfully'
    });
  },
};

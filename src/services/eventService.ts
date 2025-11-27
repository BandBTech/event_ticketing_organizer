import { api } from '@/lib/apiClient';
import {
    Event,
    CreateEventData,
    UpdateEventRequest,
    TierTemplate,
    CreateTierTemplateRequest
} from '@/types/event';

export const eventService = {
    getEvents: async () => {
        return api.get<Event[]>('/organizer/events', { requiresAuth: true });
    },

    getEvent: async (id: string) => {
        return api.get<Event>(`/organizer/events/${id}`, { requiresAuth: true });
    },

    createEvent: async (data: CreateEventData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.banner_image) formData.append('banner_image', data.banner_image);
        formData.append('category', data.category);
        formData.append('venue_name', data.venue_name);
        formData.append('address', data.address);
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);
        if (data.timezone) formData.append('timezone', data.timezone);
        formData.append('capacity', data.capacity.toString());
        formData.append('price', data.price.toString());
        formData.append('tiers', data.tiers);

        return api.postFormData<Event>('/organizer/events', formData, { requiresAuth: true });
    },

    updateEvent: async (id: string, data: UpdateEventRequest) => {
        return api.put<Event>(`/organizer/events/${id}`, data, { requiresAuth: true });
    },

    getTierTemplates: async () => {
        return api.get<TierTemplate[]>('/organizer/events/tier-templates', { requiresAuth: true });
    },

    createTierTemplate: async (data: CreateTierTemplateRequest) => {
        return api.post<TierTemplate>('/organizer/events/tier-templates', data, { requiresAuth: true });
    },
};

import { api } from '@/lib/apiClient';

export interface TierTemplate {
  id: string;
  template_name: string;
  description?: string;
  is_active: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTierTemplateRequest {
  template_name: string;
  description?: string;
}

export interface UpdateTierTemplateRequest {
  template_name?: string;
  description?: string;
  is_active?: boolean;
}

class TierService {
  async getTierTemplates(): Promise<TierTemplate[]> {
    return await api.get<TierTemplate[]>('/organizer/events/tier-templates', {
      requiresAuth: true,
    });
  }

  async createTierTemplate(data: CreateTierTemplateRequest): Promise<TierTemplate> {
    return await api.post<TierTemplate>('/organizer/events/tier-templates', data, {
      requiresAuth: true,
      showSuccessToast: true,
    });
  }

  async updateTierTemplate(id: string, data: UpdateTierTemplateRequest): Promise<TierTemplate> {
    return await api.put<TierTemplate>(`/organizer/events/tier-templates/${id}`, data, {
      requiresAuth: true,
      showSuccessToast: true,
    });
  }

  async deleteTierTemplate(id: string): Promise<void> {
    await api.delete<void>(`/organizer/events/tier-templates/${id}`, {
      requiresAuth: true,
    });
  }
}

export const tierService = new TierService();

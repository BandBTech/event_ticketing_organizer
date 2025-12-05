import { api } from '@/lib/apiClient';

// ==================== Types ====================

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    is_active: boolean;
    sort_order?: number;
    created_at: string;
    updated_at: string;
}

// ==================== Public Services ====================

/**
 * Public services for unauthenticated API endpoints
 * All endpoints here don't require authentication
 */
class PublicServices {
    /**
     * Get all active categories
     */
    async getCategories(): Promise<Category[]> {
        return await api.get<Category[]>('/public/categories', {
            requiresAuth: false,
        });
    }
}

export const publicServices = new PublicServices();

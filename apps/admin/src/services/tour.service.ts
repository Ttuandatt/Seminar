import api from '../lib/api';

export interface Tour {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    estimatedDuration?: number; // minutes
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // Assuming these based on PRD, checking backend DTO might be needed.
    createdAt: string;
    updatedAt: string;
    tourPois?: TourPoi[];
    _count?: {
        tourPois: number;
    }
}

export interface TourPoi {
    id: string;
    tourId: string;
    poiId: string;
    orderIndex: number;
    poi?: any; // Full POI object if included
}

export interface TourResponse {
    data: Tour[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const tourService = {
    getAll: async (params?: any) => {
        const response = await api.get<TourResponse>('/tours', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Tour>(`/tours/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post<Tour>('/tours', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put<Tour>(`/tours/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/tours/${id}`);
        return response.data;
    },

    setPois: async (id: string, poiIds: string[]) => {
        const response = await api.put(`/tours/${id}/pois`, { poiIds });
        return response.data;
    }
};

import api from '../lib/api';
import type { POI } from './poi.service';

export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Tour {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    estimatedDuration?: number; // minutes
    status: TourStatus;
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
    poi?: POI;
}

export interface TourListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: TourStatus;
}

export interface TourPayload {
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    estimatedDuration?: number;
    status?: TourStatus;
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
    getAll: async (params?: TourListParams) => {
        const response = await api.get<TourResponse>('/tours', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Tour>(`/tours/${id}`);
        return response.data;
    },

    create: async (data: TourPayload) => {
        const response = await api.post<Tour>('/tours', data);
        return response.data;
    },

    update: async (id: string, data: TourPayload) => {
        const response = await api.put<Tour>(`/tours/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/tours/${id}`);
        return response.data;
    },

    setPois: async (id: string, poiIds: string[]) => {
        await api.put(`/tours/${id}/pois`, { poiIds });
    }
};

import api from '../lib/api';

export interface POI {
    id: string;
    nameVi: string;
    descriptionVi: string;
    address: string;
    category: string;
    status: string;
    rating?: number;
    views: number;
    latitude: number;
    longitude: number;
    createdAt: string;
}

export interface POIResponse {
    data: POI[];
    meta: {
        page: number;
        limit: number;
        total: number;
        lastPage: number;
    };
}

export const poiService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }) => {
        const response = await api.get<POIResponse>('/pois', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<POI>(`/pois/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/pois', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/pois/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/pois/${id}`);
        return response.data;
    },

    uploadMedia: async (poiId: string, file: File, type: 'IMAGE' | 'AUDIO', language?: 'VI' | 'EN') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (language) formData.append('language', language);

        const response = await api.post(`/pois/${poiId}/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteMedia: async (poiId: string, mediaId: string) => {
        const response = await api.delete(`/pois/${poiId}/media/${mediaId}`);
        return response.data;
    },
};

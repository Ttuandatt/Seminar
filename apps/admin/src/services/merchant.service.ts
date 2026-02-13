import api from '../lib/api';

export interface ShopOwnerProfile {
    id: string;
    userId: string;
    shopName: string;
    shopAddress?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface Merchant {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    createdAt: string;
    shopOwnerProfile?: ShopOwnerProfile;
}

export interface MerchantResponse {
    data: Merchant[];
    meta: {
        page: number;
        limit: number;
        total: number;
        lastPage: number;
    };
}

export const merchantService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get<MerchantResponse>('/merchants', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Merchant>(`/merchants/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/merchants', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/merchants/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/merchants/${id}`);
        return response.data;
    },
};

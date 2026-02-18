import api from '../lib/api';

export interface ShopOwnerProfile {
    id: string;
    userId: string;
    shopName: string;
    shopAddress?: string;
    phone?: string;
    avatarUrl?: string;
}

export type MerchantStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface Merchant {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: MerchantStatus;
    createdAt: string;
    shopOwnerProfile?: ShopOwnerProfile;
}

export interface CreateMerchantPayload {
    email: string;
    password: string;
    fullName: string;
    shopName: string;
    shopAddress?: string;
    phone?: string;
}

export interface UpdateMerchantPayload {
    fullName?: string;
    shopName?: string;
    shopAddress?: string;
    phone?: string;
    status?: MerchantStatus;
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

    create: async (data: CreateMerchantPayload) => {
        const response = await api.post<Merchant>('/merchants', data);
        return response.data;
    },

    update: async (id: string, data: UpdateMerchantPayload) => {
        const response = await api.put<Merchant>(`/merchants/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/merchants/${id}`);
        return response.data;
    },
};

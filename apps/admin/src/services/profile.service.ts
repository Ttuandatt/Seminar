import api from '../lib/api';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | 'SHOP_OWNER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_SAY';

export interface Address {
    line1?: string;
    line2?: string;
    city?: string;
    country?: string;
}

export interface OpeningHour {
    day: string;
    open: string;
    close: string;
}

export interface ShopInfo {
    name?: string;
    address?: string;
    openingHours?: OpeningHour[];
}

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    phone?: string;
    birthDate?: string;
    gender?: UserGender;
    address?: Address;
    shop?: ShopInfo;
    createdAt: string;
    lastUpdatedAt?: string;
    lastLoginAt?: string;
}

export interface UpdateProfilePayload {
    fullName?: string;
    birthDate?: string;
    gender?: UserGender;
    phone?: string;
    address?: Address;
    shop?: ShopInfo;
}

export const profileService = {
    async getProfile(): Promise<UserProfile> {
        const { data } = await api.get<UserProfile>('/me');
        return data;
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
        const { data } = await api.put<UserProfile>('/me', payload);
        return data;
    },

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const { data } = await api.post<{ avatarUrl: string }>('/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};

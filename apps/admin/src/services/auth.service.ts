import api from '../lib/api';

export type UserRole = 'ADMIN' | 'SHOP_OWNER' | 'TOURIST';

export type AuthUser = {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
};

export type RegisterPayload = {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    shopName?: string;
    phone?: string;
};

export type RegisterResponse = LoginResponse & {
    message: string;
};

export const authService = {
    async login(payload: { email: string; password: string }): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/auth/login', payload);
        return data;
    },

    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        const { data } = await api.post<RegisterResponse>('/auth/register', payload);
        return data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Best-effort logout; ignore network errors so UI can still clear tokens.
            console.warn('Logout request failed', error);
        }
    },

    async forgotPassword(payload: { email: string }) {
        const { data } = await api.post<{ message: string; _devToken?: string }>('/auth/forgot-password', payload);
        return data;
    },

    async resetPassword(payload: { token: string; newPassword: string }) {
        const { data } = await api.post<{ message: string }>('/auth/reset-password', payload);
        return data;
    },
};

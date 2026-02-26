import api from './api';

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },
    register: async (userInfo: { fullName: string; email: string; password: string }) => {
        const { data } = await api.post('/auth/register', {
            ...userInfo,
            role: 'TOURIST'
        });
        return data;
    },
};

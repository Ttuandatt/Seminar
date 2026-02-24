import api from './api';

export const touristService = {
    getProfile: async () => {
        const { data } = await api.get('/tourist/me');
        return data;
    },
    updateProfile: async (updates: any) => {
        const { data } = await api.patch('/tourist/me', updates);
        return data;
    },
    getFavorites: async () => {
        const { data } = await api.get('/tourist/me/favorites');
        return data;
    },
    addFavorite: async (poiId: string) => {
        const { data } = await api.post('/tourist/me/favorites', { poiId });
        return data;
    },
    removeFavorite: async (poiId: string) => {
        const { data } = await api.delete(`/tourist/me/favorites/${poiId}`);
        return data;
    },
    getHistory: async (page = 1, limit = 20) => {
        const { data } = await api.get('/tourist/me/history', { params: { page, limit } });
        return data;
    },
    addHistory: async (viewData: { poiId: string; triggerType?: string; audioPlayed?: boolean }) => {
        const { data } = await api.post('/tourist/me/history', viewData);
        return data;
    }
};

import api from './api';

export interface Poi {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    latitude: number;
    longitude: number;
    poiType: string;
    media: any[];
    distance?: number;
}

export interface Tour {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    estimatedDuration?: number;
    tourPois?: any[];
    _count?: { tourPois: number };
}

export const publicService = {
    // POIs
    getAllPois: async () => {
        const { data } = await api.get<Poi[]>('/public/pois');
        return data;
    },
    getNearbyPois: async (lat: number, lng: number, radius?: number) => {
        const { data } = await api.get<Poi[]>('/public/pois/nearby', {
            params: { lat, lng, radius },
        });
        return data;
    },
    getPoiDetail: async (id: string) => {
        const { data } = await api.get<Poi>(`/public/pois/${id}`);
        return data;
    },

    // Tours
    getAllTours: async () => {
        const { data } = await api.get<Tour[]>('/public/tours');
        return data;
    },
    getTourDetail: async (id: string) => {
        const { data } = await api.get<Tour>(`/public/tours/${id}`);
        return data;
    },

    // Extras
    logTrigger: async (logData: { deviceId: string; poiId: string; triggerType: string; userAction: string, userLat?: number, userLng?: number }) => {
        const { data } = await api.post('/public/trigger-log', logData);
        return data;
    },
    validateQr: async (qrData: string) => {
        const { data } = await api.post('/public/qr/validate', { qrData });
        return data;
    }
};

import api from '../lib/api';

export type PoiStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export const POI_CATEGORY_OPTIONS = [
    { value: 'DINING', label: 'Dining' },
    { value: 'STREET_FOOD', label: 'Street Food' },
    { value: 'CAFES_DESSERTS', label: 'Cafes & Desserts' },
    { value: 'BARS_NIGHTLIFE', label: 'Bars & Nightlife' },
    { value: 'MARKETS_SPECIALTY', label: 'Markets & Specialty Stores' },
    { value: 'CULTURAL_LANDMARKS', label: 'Cultural Landmarks' },
    { value: 'EXPERIENCES_WORKSHOPS', label: 'Experiences & Workshops' },
    { value: 'OUTDOOR_SCENIC', label: 'Outdoor & Scenic Stops' },
] as const;

export type PoiCategory = typeof POI_CATEGORY_OPTIONS[number]['value'];

export const POI_CATEGORY_LABELS: Record<PoiCategory, string> = POI_CATEGORY_OPTIONS.reduce(
    (acc, option) => {
        acc[option.value] = option.label;
        return acc;
    },
    {} as Record<PoiCategory, string>,
);

export interface POIMedia {
    id: string;
    type: 'IMAGE' | 'AUDIO';
    url: string;
    language?: 'VI' | 'EN' | 'ALL';
    thumbnailUrl?: string | null;
}

export interface POIOwner {
    id: string;
    fullName: string;
    shopOwnerProfile?: {
        shopName?: string | null;
    } | null;
}

export interface POI {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi?: string;
    descriptionEn?: string;
    category: PoiCategory;
    status: PoiStatus;
    ownerId?: string | null;
    latitude: number;
    longitude: number;
    triggerRadius: number;
    qrCodeUrl?: string | null;
    media?: POIMedia[];
    owner?: POIOwner | null;
    _count?: {
        tourPois?: number;
        viewHistory?: number;
    };
    createdAt: string;
}

export interface POIPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface POIResponse {
    data: POI[];
    pagination: POIPagination;
}

export interface SavePOIPayload {
    nameVi: string;
    nameEn?: string;
    descriptionVi: string;
    descriptionEn?: string;
    latitude: number;
    longitude: number;
    category: PoiCategory;
    triggerRadius: number;
    status: PoiStatus;
    ownerId?: string | null;
}

export const poiService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; category?: PoiCategory }) => {
        const response = await api.get<POIResponse>('/pois', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<POI>(`/pois/${id}`);
        return response.data;
    },

    create: async (data: SavePOIPayload) => {
        const response = await api.post<POI>('/pois', data);
        return response.data;
    },

    update: async (id: string, data: SavePOIPayload) => {
        const response = await api.put<POI>(`/pois/${id}`, data);
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

    generateTts: async (poiId: string, text: string, language: string, voice?: string) => {
        const response = await api.post(`/tts/generate/${poiId}`, { text, language, voice });
        return response.data;
    },

    generateTranslatedTts: async (
        poiId: string,
        text: string,
        targetLanguage: string,
        sourceLanguage = 'VI',
        voice?: string,
    ) => {
        const response = await api.post(`/tts/generate-translated/${poiId}`, {
            text,
            targetLanguage,
            sourceLanguage,
            voice,
        });
        return response.data;
    },

    getQrCode: async (poiId: string) => {
        const response = await api.get<{
            poiId: string;
            poiName: string;
            qrCodeUrl: string;
            qrDataUrl: string;
            qrContent: string;
        }>(`/pois/${poiId}/qr`);
        return response.data;
    },

    regenerateQr: async (poiId: string) => {
        const response = await api.post(`/pois/${poiId}/qr/regenerate`);
        return response.data;
    },
};

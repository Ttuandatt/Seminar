import api from '../lib/api';

export type ShopOwnerPOIStatus = 'ACTIVE' | 'DRAFT' | 'IN_REVIEW';

export interface ShopOwnerPortalProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  avatarEmoji?: string;
}

export interface ShopOwnerPOI {
  id: string;
  name: string;
  status: ShopOwnerPOIStatus;
  address: string;
  lastUpdated: string;
  views: number;
  plays: number;
  audioCompletion: number;
  coverEmoji: string;
  latitude?: number;
  longitude?: number;
}

export interface ShopOwnerOverviewStat {
  label: string;
  value: string;
  change: string;
  description: string;
}

export interface ShopOwnerOverview {
  profile: ShopOwnerPortalProfile;
  stats: ShopOwnerOverviewStat[];
  pois: ShopOwnerPOI[];
  tips: string[];
}

export interface ShopOwnerAnalyticsPoint {
  day: string;
  views: number;
  plays: number;
}

export interface ShopOwnerAnalyticsBreakdown {
  id: string;
  name: string;
  views: number;
  plays: number;
  completion: number;
}

export interface ShopOwnerAnalytics {
  summary: ShopOwnerOverviewStat[];
  daily: ShopOwnerAnalyticsPoint[];
  breakdown: ShopOwnerAnalyticsBreakdown[];
}

export interface ShopOwnerProfilePayload {
  businessName: string;
  ownerName: string;
  phone?: string;
  address?: string;
}

export interface ShopOwnerCreatePOIPayload {
  nameVi: string;
  nameEn?: string;
  descriptionVi: string;
  descriptionEn?: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  media?: {
    images: string[];
    audio: { language: 'VI' | 'EN'; name: string }[];
  };
}

// ─── Backend response types ───────────────────────

interface BackendShopOwner {
  id: string;
  userId: string;
  shopName: string | null;
  phone: string | null;
  shopAddress: string | null;
  user: { email: string; fullName: string };
}

interface BackendPoi {
  id: string;
  nameVi: string;
  nameEn?: string | null;
  descriptionVi: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  createdAt: string;
  updatedAt: string;
  media?: { type: string; url: string }[];
  _count?: { viewHistory?: number; triggerLogs?: number };
}

interface BackendAnalytics {
  totalViews: number;
  totalAudioPlays: number;
  pois: {
    id: string;
    nameVi: string;
    viewCount: number;
    audioPlayCount: number;
    audioPlayRate: number;
  }[];
}

// ─── Transformers ─────────────────────────────────

function toProfile(raw: BackendShopOwner): ShopOwnerPortalProfile {
  return {
    id: raw.id,
    businessName: raw.shopName || raw.user.fullName,
    ownerName: raw.user.fullName,
    email: raw.user.email,
    phone: raw.phone || undefined,
    address: raw.shopAddress || undefined,
    avatarEmoji: (raw.shopName || raw.user.fullName).slice(0, 2).toUpperCase(),
  };
}

function toPoi(raw: BackendPoi): ShopOwnerPOI {
  const viewCount = raw._count?.viewHistory ?? 0;
  const triggerCount = raw._count?.triggerLogs ?? 0;
  const hasAudio = raw.media?.some(m => m.type === 'AUDIO') ?? false;

  return {
    id: raw.id,
    name: raw.nameVi,
    status: raw.status as ShopOwnerPOIStatus,
    address: `${raw.latitude.toFixed(4)}, ${raw.longitude.toFixed(4)}`,
    lastUpdated: formatRelativeDate(raw.updatedAt),
    views: viewCount,
    plays: triggerCount,
    audioCompletion: hasAudio ? Math.min(100, Math.round((triggerCount / Math.max(viewCount, 1)) * 100)) : 0,
    coverEmoji: raw.nameVi.slice(0, 2).toUpperCase(),
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

function getDateRange(range: '7d' | '30d' | '90d'): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

// ─── Service ──────────────────────────────────────

export const shopOwnerPortalService = {
  async getProfile(): Promise<ShopOwnerPortalProfile> {
    const { data } = await api.get<BackendShopOwner>('/shop-owner/me');
    return toProfile(data);
  },

  async getOverview(): Promise<ShopOwnerOverview> {
    const [profileRes, poisRes] = await Promise.all([
      api.get<BackendShopOwner>('/shop-owner/me'),
      api.get<BackendPoi[]>('/shop-owner/pois'),
    ]);

    const profile = toProfile(profileRes.data);
    const pois = poisRes.data.map(toPoi);
    const totalViews = pois.reduce((sum, p) => sum + p.views, 0);
    const totalPlays = pois.reduce((sum, p) => sum + p.plays, 0);
    const audioRate = totalViews ? Math.round((totalPlays / totalViews) * 100) : 0;

    return {
      profile,
      stats: [
        {
          label: 'My POIs',
          value: pois.length.toString(),
          change: `${pois.filter(p => p.status === 'ACTIVE').length} active`,
          description: 'Total POIs owned by you',
        },
        {
          label: 'Total Views',
          value: totalViews.toString(),
          change: 'All time',
          description: 'Across all your POIs',
        },
        {
          label: 'Audio Rate',
          value: `${audioRate}%`,
          change: 'Triggers / views',
          description: 'Audio engagement metric',
        },
      ],
      pois,
      tips: [
        'You can delete POIs you own. Admins can also manage them if needed.',
        'Keep audio under 4 minutes for better completion rates.',
      ],
    };
  },

  async getAnalytics(range: '7d' | '30d' | '90d' = '7d'): Promise<ShopOwnerAnalytics> {
    const { startDate, endDate } = getDateRange(range);
    const { data } = await api.get<BackendAnalytics>('/shop-owner/analytics', {
      params: { startDate, endDate },
    });

    const totalViews = data.totalViews;
    const totalPlays = data.totalAudioPlays;
    const playRate = totalViews > 0 ? Math.round((totalPlays / totalViews) * 100) : 0;

    const rangeLabel = range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days';

    return {
      summary: [
        { label: 'Views', value: totalViews.toString(), change: `Last ${rangeLabel}`, description: 'POI views' },
        { label: 'Audio plays', value: totalPlays.toString(), change: `Last ${rangeLabel}`, description: 'Audio trigger count' },
        { label: 'Play-through', value: `${playRate}%`, change: 'Audio / views ratio', description: 'Audio engagement' },
      ],
      daily: [], // Backend doesn't support daily breakdown yet
      breakdown: data.pois.map(poi => ({
        id: poi.id,
        name: poi.nameVi,
        views: poi.viewCount,
        plays: poi.audioPlayCount,
        completion: Math.round(poi.audioPlayRate * 100),
      })),
    };
  },

  async updateProfile(payload: ShopOwnerProfilePayload): Promise<ShopOwnerPortalProfile> {
    const { data } = await api.patch<BackendShopOwner>('/shop-owner/me', {
      shopName: payload.businessName,
      phone: payload.phone,
      shopAddress: payload.address,
    });
    return toProfile(data);
  },

  async deletePoi(poiId: string): Promise<{ message: string }> {
    await api.delete(`/pois/${poiId}`);
    return { message: 'POI has been deleted.' };
  },

  async createPoi(payload: ShopOwnerCreatePOIPayload): Promise<ShopOwnerPOI> {
    const formData = new FormData();
    formData.append('nameVi', payload.nameVi);
    if (payload.nameEn) formData.append('nameEn', payload.nameEn);
    formData.append('descriptionVi', payload.descriptionVi);
    if (payload.descriptionEn) formData.append('descriptionEn', payload.descriptionEn);
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());

    const { data } = await api.post('/shop-owner/pois', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      id: data.id,
      name: payload.nameVi,
      status: 'IN_REVIEW' as ShopOwnerPOIStatus,
      address: `${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`,
      lastUpdated: 'Just now',
      views: 0,
      plays: 0,
      audioCompletion: 0,
      coverEmoji: payload.nameVi.slice(0, 2).toUpperCase(),
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
  },
};

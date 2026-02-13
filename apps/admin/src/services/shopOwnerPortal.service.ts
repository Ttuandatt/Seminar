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

const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

let ownerProfile: ShopOwnerPortalProfile = {
  id: 'owner-001',
  businessName: 'Quán Bún Mắm Tùng',
  ownerName: 'Nguyễn Văn Tùng',
  email: 'tung@gpstours.vn',
  phone: '0901 234 567',
  address: '123 Vĩnh Khánh, Q.4, TP.HCM',
  avatarEmoji: 'SO',
};

const ownerPois: ShopOwnerPOI[] = [
  {
    id: 'poi-001',
    name: 'Quán Bún Mắm Tùng',
    status: 'ACTIVE',
    address: '123 Vĩnh Khánh, Q.4',
    lastUpdated: '2 giờ trước',
    views: 220,
    plays: 140,
    audioCompletion: 64,
    coverEmoji: 'Q1',
  },
  {
    id: 'poi-002',
    name: 'Chi nhánh 2 - Vĩnh Hội',
    status: 'DRAFT',
    address: '85 Vĩnh Hội, Q.4',
    lastUpdated: 'Hôm qua',
    views: 130,
    plays: 70,
    audioCompletion: 54,
    coverEmoji: 'CN',
  },
];

const baseWeekly: ShopOwnerAnalyticsPoint[] = [
  { day: 'T2', views: 52, plays: 31 },
  { day: 'T3', views: 48, plays: 28 },
  { day: 'T4', views: 63, plays: 37 },
  { day: 'T5', views: 58, plays: 34 },
  { day: 'T6', views: 64, plays: 39 },
  { day: 'T7', views: 46, plays: 26 },
  { day: 'CN', views: 59, plays: 35 },
];

const analyticsSeed: Record<'7d' | '30d' | '90d', ShopOwnerAnalytics> = {
  '7d': {
    summary: [
      { label: 'Views', value: '350', change: '+12% vs tuần trước', description: 'Lượt xem POI' },
      { label: 'Audio plays', value: '210', change: '+8% vs tuần trước', description: 'Số lần nghe audio' },
      { label: 'Play-through', value: '60%', change: '+3% ổn định', description: 'Tỷ lệ nghe hết audio' },
    ],
    daily: baseWeekly,
    breakdown: ownerPois.map((poi) => ({
      id: poi.id,
      name: poi.name,
      views: poi.views,
      plays: poi.plays,
      completion: poi.audioCompletion,
    })),
  },
  '30d': {
    summary: [
      { label: 'Views', value: '1.4K', change: '+18% vs tháng trước', description: 'Lượt xem POI' },
      { label: 'Audio plays', value: '840', change: '+11% vs tháng trước', description: 'Số lần nghe audio' },
      { label: 'Play-through', value: '58%', change: '-2% vs tháng trước', description: 'Tỷ lệ nghe hết audio' },
    ],
    daily: baseWeekly.map((point, index) => ({
      day: `Tuần ${index + 1}`,
      views: point.views * 4,
      plays: point.plays * 4,
    })),
    breakdown: ownerPois.map((poi) => ({
      id: poi.id,
      name: poi.name,
      views: poi.views * 4,
      plays: poi.plays * 4,
      completion: poi.audioCompletion - 2,
    })),
  },
  '90d': {
    summary: [
      { label: 'Views', value: '4.3K', change: '+32% vs quý trước', description: 'Lượt xem POI' },
      { label: 'Audio plays', value: '2.6K', change: '+24% vs quý trước', description: 'Số lần nghe audio' },
      { label: 'Play-through', value: '61%', change: '+1% vs quý trước', description: 'Tỷ lệ nghe hết audio' },
    ],
    daily: baseWeekly.map((point, index) => ({
      day: `Tháng ${index + 1}`,
      views: point.views * 12,
      plays: point.plays * 12,
    })),
    breakdown: ownerPois.map((poi) => ({
      id: poi.id,
      name: poi.name,
      views: poi.views * 12,
      plays: poi.plays * 12,
      completion: poi.audioCompletion,
    })),
  },
};

export const shopOwnerPortalService = {
  async login(payload: { email: string; password: string }) {
    await wait();
    if (!payload.email.includes('@') || payload.password.length < 6) {
      throw new Error('Email hoặc mật khẩu không hợp lệ');
    }
    return { token: 'owner-mock-token', owner: ownerProfile };
  },

  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    phone?: string;
  }) {
    await wait(900);
    if (!payload.email.includes('@')) {
      throw new Error('Email không hợp lệ');
    }
    ownerProfile = {
      ...ownerProfile,
      email: payload.email,
      ownerName: payload.fullName,
      businessName: payload.businessName,
      phone: payload.phone || ownerProfile.phone,
    };
    return { token: 'owner-mock-token', owner: ownerProfile };
  },

  async getProfile() {
    await wait(400);
    return ownerProfile;
  },

  async getOverview(): Promise<ShopOwnerOverview> {
    await wait(500);
    const totalViews = ownerPois.reduce((sum, poi) => sum + poi.views, 0);
    const totalPlays = ownerPois.reduce((sum, poi) => sum + poi.plays, 0);
    const audioRate = totalViews ? Math.round((totalPlays / totalViews) * 100) : 0;

    return {
      profile: ownerProfile,
      stats: [
        {
          label: 'My POIs',
          value: ownerPois.length.toString(),
          change: '+1 mới tuần này',
          description: 'POIs đang hoạt động',
        },
        {
          label: 'Views (7d)',
          value: totalViews.toString(),
          change: '+12% so với tuần trước',
          description: 'Lượt xem organic',
        },
        {
          label: 'Audio completion',
          value: `${audioRate}%`,
          change: 'Tỉ lệ nghe hết audio',
          description: 'Chỉ số trải nghiệm',
        },
      ],
      pois: ownerPois,
      tips: [
        'Chỉ Admin có thể xoá POI. Liên hệ GPS Tours Support để được hỗ trợ.',
        'Giữ audio dưới 4 phút giúp tăng tỉ lệ nghe hết.',
      ],
    };
  },

  async getAnalytics(range: '7d' | '30d' | '90d' = '7d'): Promise<ShopOwnerAnalytics> {
    await wait(500);
    return analyticsSeed[range];
  },

  async updateProfile(payload: ShopOwnerProfilePayload) {
    await wait(500);
    ownerProfile = { ...ownerProfile, ...payload };
    return ownerProfile;
  },
};

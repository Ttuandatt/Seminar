import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icons (broken by bundlers)
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export const HCM_CENTER: [number, number] = [10.7615, 106.7059];

export const TILE_STREET = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const CATEGORY_COLORS: Record<string, string> = {
    CULTURAL_LANDMARKS: '#ef4444',
    DINING: '#f97316',
    STREET_FOOD: '#eab308',
    CAFES_DESSERTS: '#a855f7',
    BARS_NIGHTLIFE: '#6366f1',
    MARKETS_SPECIALTY: '#14b8a6',
    EXPERIENCES_WORKSHOPS: '#ec4899',
    OUTDOOR_SCENIC: '#22c55e',
};

export const STATUS_COLORS: Record<string, string> = {
    ACTIVE: '#22c55e',
    DRAFT: '#f59e0b',
    ARCHIVED: '#94a3b8',
};

export const createColoredIcon = (color: string) =>
    L.divIcon({
        html: `<div style="
            background: ${color};
            width: 28px; height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
    });

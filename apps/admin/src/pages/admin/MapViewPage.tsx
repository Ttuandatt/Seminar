import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Circle, Popup, Polyline } from 'react-leaflet';
import { Loader2, MapPin, Eye, Pencil, Headphones } from 'lucide-react';
import { poiService, type POI, POI_CATEGORY_LABELS, type PoiCategory, type PoiStatus } from '../../services/poi.service';
import MapControls, { FitBounds } from '../../components/map/MapControls';
import { HCM_CENTER, CATEGORY_COLORS, STATUS_COLORS, createColoredIcon } from '../../components/map/map-utils';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface Tour {
    id: string;
    nameVi: string;
    nameEn?: string;
    status: string;
    tourPois?: { orderIndex: number; poi: POI }[];
}

const MapViewPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isShopOwner = user?.role === 'SHOP_OWNER';
    const [pois, setPois] = useState<POI[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRadius, setShowRadius] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedTour, setSelectedTour] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isShopOwner) {
                    // Shop owner: fetch own POIs via shop-owner endpoint
                    const { data } = await api.get('/shop-owner/pois');
                    const mapped: POI[] = (data as Record<string, unknown>[]).map((p: Record<string, unknown>) => ({
                        id: p.id as string,
                        nameVi: p.nameVi as string,
                        nameEn: (p.nameEn as string) || '',
                        descriptionVi: (p.descriptionVi as string) || '',
                        descriptionEn: (p.descriptionEn as string) || '',
                        category: (p.category as PoiCategory) || 'DINING',
                        status: (p.status as PoiStatus) || 'ACTIVE',
                        latitude: p.latitude as number,
                        longitude: p.longitude as number,
                        triggerRadius: (p.triggerRadius as number) || 15,
                        media: (p.media as POI['media']) || [],
                        createdAt: (p.createdAt as string) || new Date().toISOString(),
                    }));
                    setPois(mapped);
                } else {
                    // Admin: fetch all POIs + tours
                    const [poiRes, tourRes] = await Promise.all([
                        poiService.getAll({ limit: 200 }),
                        fetch('/api/v1/tours', {
                            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                        }).then(r => r.json()).catch(() => ({ data: [] })),
                    ]);
                    setPois(poiRes.data || []);
                    setTours(tourRes.data || tourRes || []);
                }
            } catch (err) {
                console.error('Failed to fetch map data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isShopOwner]);

    const filteredPois = useMemo(() => {
        if (statusFilter === 'ALL') return pois;
        return pois.filter(p => p.status === statusFilter);
    }, [pois, statusFilter]);

    const selectedTourRoute = useMemo(() => {
        if (!selectedTour) return null;
        const tour = tours.find(t => t.id === selectedTour);
        if (!tour?.tourPois?.length) return null;
        const sorted = [...tour.tourPois].sort((a, b) => a.orderIndex - b.orderIndex);
        return sorted.map(tp => [Number(tp.poi.latitude), Number(tp.poi.longitude)] as [number, number]);
    }, [selectedTour, tours]);

    const hasAudio = (poi: POI) => poi.media?.some(m => m.type === 'AUDIO');

    const poiBasePath = isShopOwner ? '/owner/pois' : '/admin/pois';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        Map Overview
                    </h1>
                    <p className="text-sm text-slate-500">
                        {filteredPois.length} POIs {!isShopOwner && tours.length > 0 && `\u2022 ${tours.length} Tours`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>

                    {!isShopOwner && (
                        <select
                            value={selectedTour || ''}
                            onChange={(e) => setSelectedTour(e.target.value || null)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
                        >
                            <option value="">No tour route</option>
                            {tours.map(t => (
                                <option key={t.id} value={t.id}>{t.nameVi}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => setShowRadius(prev => !prev)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                            showRadius
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600'
                        }`}
                    >
                        {showRadius ? 'Hide' : 'Show'} Radius
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
                <MapContainer
                    center={HCM_CENTER}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom
                >
                    <MapControls />
                    <FitBounds positions={filteredPois.map(p => [Number(p.latitude), Number(p.longitude)])} />

                    {filteredPois.map(poi => {
                        const color = CATEGORY_COLORS[poi.category] || '#f97316';
                        const lat = Number(poi.latitude);
                        const lng = Number(poi.longitude);

                        return (
                            <span key={poi.id}>
                                {showRadius && (
                                    <Circle
                                        center={[lat, lng]}
                                        radius={poi.triggerRadius || 15}
                                        pathOptions={{
                                            color: STATUS_COLORS[poi.status] || '#94a3b8',
                                            fillColor: color,
                                            fillOpacity: 0.12,
                                            weight: 1.5,
                                        }}
                                    />
                                )}
                                <Marker position={[lat, lng]} icon={createColoredIcon(color)}>
                                    <Popup minWidth={220} maxWidth={300}>
                                        <div className="space-y-2 text-sm">
                                            <div className="font-bold text-base text-slate-900">{poi.nameVi}</div>
                                            {poi.nameEn && <div className="text-slate-500 text-xs">{poi.nameEn}</div>}
                                            <div className="flex flex-wrap gap-1">
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                    style={{ backgroundColor: `${color}20`, color }}
                                                >
                                                    {POI_CATEGORY_LABELS[poi.category as PoiCategory] || poi.category}
                                                </span>
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                    style={{ backgroundColor: `${STATUS_COLORS[poi.status]}20`, color: STATUS_COLORS[poi.status] }}
                                                >
                                                    {poi.status}
                                                </span>
                                                {hasAudio(poi) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                                        <Headphones className="h-3 w-3" /> Audio
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400">Radius: {poi.triggerRadius}m</div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => navigate(`${poiBasePath}/${poi.id}`)}
                                                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                                >
                                                    <Eye className="h-3 w-3" /> View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`${poiBasePath}/${poi.id}/edit`)}
                                                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                                                >
                                                    <Pencil className="h-3 w-3" /> Edit
                                                </button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            </span>
                        );
                    })}

                    {selectedTourRoute && (
                        <Polyline
                            positions={selectedTourRoute}
                            pathOptions={{
                                color: '#3b82f6',
                                weight: 4,
                                opacity: 0.8,
                                dashArray: '10 6',
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        {POI_CATEGORY_LABELS[cat as PoiCategory] || cat}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapViewPage;

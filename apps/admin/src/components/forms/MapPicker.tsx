import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Copy, Loader2, MapPin, Search } from 'lucide-react';

// Fix Leaflet's default icon paths when bundling with Vite
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    triggerRadius: number;
    onCoordinateChange: (lat: number, lng: number) => void;
    onAddressSelect?: (address: string) => void;
}

interface GeocodeResult {
    display_name: string;
    lat: string;
    lon: string;
}

const DEFAULT_CENTER: [number, number] = [10.7615, 106.7059]; // Quận 4, Hồ Chí Minh

const MapViewUpdater = ({ latitude, longitude }: { latitude?: number; longitude?: number }) => {
    const map = useMap();

    useEffect(() => {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return;
        map.flyTo([latitude, longitude], map.getZoom(), { duration: 0.5 });
    }, [latitude, longitude, map]);

    return null;
};

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(event) {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });
    return null;
};

export const MapPicker = ({ latitude, longitude, triggerRadius, onCoordinateChange, onAddressSelect }: MapPickerProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [searchError, setSearchError] = useState('');

    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const center = useMemo<[number, number]>(() => {
        if (hasCoordinates && typeof latitude === 'number' && typeof longitude === 'number') {
            return [latitude, longitude];
        }
        return DEFAULT_CENTER;
    }, [hasCoordinates, latitude, longitude]);

    const zoom = hasCoordinates ? 16 : 13;

    const handleSearch = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchError('');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                throw new Error('Failed to search address');
            }
            const data: GeocodeResult[] = await response.json();
            setSearchResults(data);
            if (data.length === 0) {
                setSearchError('Không tìm thấy địa điểm phù hợp. Thử từ khóa khác.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            setSearchError('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handleSelectResult = (result: GeocodeResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            onCoordinateChange(lat, lng);
            onAddressSelect?.(result.display_name);
            setSearchResults([]);
            setSearchQuery(result.display_name);
        }
    };

    return (
        <div className="space-y-3">
            <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm địa chỉ hoặc địa điểm..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    disabled={isSearching}
                >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </button>
            </form>

            {searchError && (
                <p className="text-xs text-red-500">{searchError}</p>
            )}

            {searchResults.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                        <button
                            key={`${result.lat}-${result.lon}`}
                            type="button"
                            onClick={() => handleSelectResult(result)}
                            className="flex w-full items-start gap-2 border-b border-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-50 last:border-b-0"
                        >
                            <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                            <span>{result.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="relative">
                <MapContainer
                    center={center}
                    zoom={zoom}
                    className="h-80 w-full rounded-xl border border-slate-200 shadow-inner"
                    scrollWheelZoom
                >
                    <TileLayer
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {hasCoordinates && typeof latitude === 'number' && typeof longitude === 'number' && (
                        <>
                            <Marker position={[latitude, longitude]} />
                            <Circle
                                center={[latitude, longitude]}
                                radius={triggerRadius || 15}
                                pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.15 }}
                            />
                        </>
                    )}
                    <MapClickHandler onSelect={onCoordinateChange} />
                    <MapViewUpdater latitude={latitude} longitude={longitude} />
                </MapContainer>

                {!hasCoordinates && (
                    <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-white/90 p-3 text-xs text-slate-600 shadow">
                        Nhấp vào bản đồ hoặc tìm kiếm địa điểm để đặt tọa độ POI.
                    </div>
                )}
            </div>

            {hasCoordinates && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    <span>
                        Lat {latitude?.toFixed(5)}, Lng {longitude?.toFixed(5)}
                    </span>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-blue-700"
                        onClick={() => {
                            navigator.clipboard?.writeText(`${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`);
                        }}
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapPicker;

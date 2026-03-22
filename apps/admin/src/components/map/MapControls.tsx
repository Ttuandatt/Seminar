import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Satellite, Map as MapIcon } from 'lucide-react';
import { TILE_STREET, TILE_SATELLITE } from './map-utils';

interface MapControlsProps {
    showSatelliteToggle?: boolean;
    showLocate?: boolean;
    onLocateError?: (msg: string) => void;
}

/**
 * Renders Satellite + Locate buttons inside Leaflet's own control container
 * via React Portal, guaranteeing they share the same stacking context as
 * Leaflet's zoom controls and are always visible.
 *
 * Also handles tile switching imperatively (no extra TileSwitch component needed).
 */
const MapControls = ({ showSatelliteToggle = true, showLocate = true, onLocateError }: MapControlsProps) => {
    const map = useMap();
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const [isSatellite, setIsSatellite] = useState(false);
    const [locating, setLocating] = useState(false);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const locationMarkerRef = useRef<L.CircleMarker | null>(null);

    // Find Leaflet's top-right control container (where zoom lives)
    useEffect(() => {
        const el = map.getContainer().querySelector('.leaflet-top.leaflet-right') as HTMLElement | null;
        if (el) setContainer(el);
    }, [map]);

    // Manage tile layer imperatively
    useEffect(() => {
        const url = isSatellite ? TILE_SATELLITE : TILE_STREET;
        const attribution = isSatellite ? '&copy; Esri' : '&copy; OpenStreetMap';

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }
        tileLayerRef.current = L.tileLayer(url, { attribution }).addTo(map);

        return () => {
            if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
        };
    }, [isSatellite, map]);

    const handleLocate = useCallback(() => {
        setLocating(true);
        map.locate({ setView: true, maxZoom: 16 });

        map.once('locationfound', (e: L.LocationEvent) => {
            if (locationMarkerRef.current) map.removeLayer(locationMarkerRef.current);
            locationMarkerRef.current = L.circleMarker(e.latlng, {
                radius: 8,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.8,
                weight: 2,
            }).addTo(map).bindPopup('You are here').openPopup();
            setLocating(false);
        });

        map.once('locationerror', () => {
            setLocating(false);
            onLocateError?.('Could not determine your location.');
        });
    }, [map, onLocateError]);

    if (!container) return null;

    const btnStyle: React.CSSProperties = {
        width: 34,
        height: 34,
        borderRadius: 4,
        backgroundColor: '#fff',
        border: '2px solid rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundClip: 'padding-box',
    };

    return createPortal(
        <div className="leaflet-control leaflet-bar" style={{ display: 'flex', flexDirection: 'column' }}>
            {showSatelliteToggle && (
                <button
                    onClick={() => setIsSatellite(s => !s)}
                    title={isSatellite ? 'Street view' : 'Satellite view'}
                    style={btnStyle}
                >
                    {isSatellite
                        ? <MapIcon style={{ width: 18, height: 18, color: '#333' }} />
                        : <Satellite style={{ width: 18, height: 18, color: '#333' }} />
                    }
                </button>
            )}
            {showLocate && (
                <button
                    onClick={handleLocate}
                    disabled={locating}
                    title="Locate me"
                    style={{ ...btnStyle, opacity: locating ? 0.5 : 1, borderTop: showSatelliteToggle ? 'none' : undefined }}
                >
                    <LocateFixed style={{ width: 18, height: 18, color: '#333' }} className={locating ? 'animate-pulse' : ''} />
                </button>
            )}
        </div>,
        container,
    );
};

export default MapControls;

/**
 * Auto-fit map bounds to an array of positions.
 * Usage: <FitBounds positions={[[lat,lng], ...]} />
 */
export const FitBounds = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (positions.length === 0) return;
        const bounds = L.latLngBounds(positions);
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
    }, [positions, map]);
    return null;
};

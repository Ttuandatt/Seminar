import React from 'react';
import { MapPin, Trash2, Navigation, Info } from 'lucide-react';
import { type POI, POI_CATEGORY_LABELS } from '../../services/poi.service';
import { CATEGORY_COLORS } from '../map/map-utils';

interface POIGalleryProps {
    pois: (POI & { distanceM?: number; score?: number })[];
    onSelect: (poi: POI) => void;
    onDelete: (poi: POI) => void;
    isLoading?: boolean;
}

const POIGallery = ({ pois, onSelect, onDelete, isLoading }: POIGalleryProps) => {
    const getThumbnail = (poi: POI) => {
        const imageMedia = poi.media?.find((m) => m.type === 'IMAGE');
        if (imageMedia?.url) {
            if (imageMedia.url.startsWith('http')) return imageMedia.url;
            return `http://localhost:3000${imageMedia.url}`;
        }
        return 'https://images.unsplash.com/photo-1518173946687-a4c8a9ba332f?auto=format&fit=crop&q=80&w=400'; // Default placeholder
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200">
                <div className="flex animate-pulse space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 w-64 rounded-lg bg-slate-200" />
                    ))}
                </div>
            </div>
        );
    }

    if (pois.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
                No POIs in this area.
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden py-2">
            <div className="flex overflow-x-auto gap-4 pb-4 px-1 snap-x no-scrollbar scroll-smooth">
                {pois.map((poi) => {
                    const categoryColor = CATEGORY_COLORS[poi.category] || '#64748B';
                    
                    return (
                        <div
                            key={poi.id}
                            className="group relative flex-none w-64 snap-start rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300"
                        >
                            {/* Card Header/Image */}
                            <div 
                                className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl cursor-pointer"
                                onClick={() => onSelect(poi)}
                            >
                                <img
                                    src={getThumbnail(poi)}
                                    alt={poi.nameVi}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                
                                {/* Top Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    <span 
                                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                                        style={{ backgroundColor: categoryColor }}
                                    >
                                        {POI_CATEGORY_LABELS[poi.category] || poi.category}
                                    </span>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(poi); }}
                                        className="rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-red-50 transition-colors"
                                        title="Delete POI"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Title on image overlay */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <h3 className="text-sm font-bold text-white line-clamp-1 truncate">
                                        {poi.nameVi}
                                    </h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        <span>{Number(poi.latitude).toFixed(4)}, {Number(poi.longitude).toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-medium text-blue-600">
                                        <Navigation className="h-3 w-3" />
                                        <span>{poi.distanceM !== undefined && !isNaN(poi.distanceM) ? `${Math.round(poi.distanceM)}m` : `--`}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-1.5 text-[10px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-600">
                                        <Info className="h-3 w-3 text-slate-400" />
                                        <span>Radius: {poi.triggerRadius}m</span>
                                    </div>
                                    <button
                                        onClick={() => onSelect(poi)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default POIGallery;

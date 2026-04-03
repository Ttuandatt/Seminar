import { useEffect, useMemo, useState } from 'react';
import { X, Headphones, MapPin, Image as ImageIcon } from 'lucide-react';
import { getLanguageDisplayName } from '../../utils/language-display';

export interface AudioSource {
    url: string;
    label: string;
    pending?: boolean;
}

export interface MapPreviewMeta {
    embedUrl: string;
    externalUrl: string;
}

interface POIPreviewModalProps {
    open: boolean;
    onClose: () => void;
    poi: {
        nameVi: string;
        nameEn?: string;
        descriptionVi: string;
        descriptionEn?: string;
        category: string;
        triggerRadius: number;
        status: string;
        address?: string;
    };
    images: string[];
    audioSources: AudioSource[];
    mapPreview?: MapPreviewMeta | null;
    latitude?: number;
    longitude?: number;
}

const languageTabs: Array<'VI' | 'EN'> = ['VI', 'EN'];

const POIPreviewModal = ({
    open,
    onClose,
    poi,
    images,
    audioSources,
    mapPreview,
    latitude,
    longitude,
}: POIPreviewModalProps) => {
    const [activeLang, setActiveLang] = useState<'VI' | 'EN'>('VI');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const totalImages = images.length;
    const safeImageIndex = totalImages > 0 ? Math.min(activeImageIndex, totalImages - 1) : 0;

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const previewName = activeLang === 'VI' ? poi.nameVi : poi.nameEn || poi.nameVi;
    const previewDescription = activeLang === 'VI' ? poi.descriptionVi : poi.descriptionEn || poi.descriptionVi;
    const languageLocale = activeLang === 'VI' ? 'vi' : 'en';

    const coordinateLabel = useMemo(() => {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return '';
        return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }, [latitude, longitude]);

    if (!open) return null;

    const handlePrevImage = () => {
        if (totalImages <= 1) return;
        setActiveImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    const handleNextImage = () => {
        if (totalImages <= 1) return;
        setActiveImageIndex((prev) => (prev + 1) % totalImages);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
            <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="grid gap-6 p-6 md:grid-cols-[360px,1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-inner">
                        <div className="flex items-center justify-between px-4 pt-4">
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</span>
                            <div className="flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-[10px] text-slate-400">
                                <span>{poi.category}</span>
                                <span>•</span>
                                <span>{poi.status}</span>
                            </div>
                        </div>

                        <div className="px-4 pt-4">
                            <div className="flex gap-2 rounded-full bg-slate-800/80 p-1 text-xs">
                                {languageTabs.map((lang) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setActiveLang(lang)}
                                        className={`flex-1 rounded-full px-3 py-1 font-semibold transition ${activeLang === lang ? 'bg-white text-slate-900' : 'text-slate-400'}`}
                                    >
                                        {getLanguageDisplayName(lang, languageLocale)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4">
                            {totalImages > 0 ? (
                                <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-800">
                                    <img
                                        src={images[safeImageIndex]}
                                        alt="POI preview"
                                        className="h-full w-full object-cover"
                                    />
                                    {totalImages > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handlePrevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-white"
                                            >
                                                ›
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 text-slate-400">
                                    <ImageIcon className="mb-3 h-8 w-8" />
                                    <p className="text-sm">Chưa có hình ảnh</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 pb-6 text-left">
                            <p className="text-lg font-semibold text-white">{previewName}</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">{previewDescription}</p>

                            {poi.address && (
                                <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">{poi.address}</p>
                            )}

                            {coordinateLabel && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin className="h-3 w-3" />
                                    {coordinateLabel}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-slate-900">Hình ảnh</h3>
                            <p className="text-xs text-slate-500">Đây là cách ảnh sẽ xuất hiện trong app Tourist.</p>
                            {totalImages > 1 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={img + idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border ${idx === safeImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'}`}
                                        >
                                            <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-blue-600" />
                                <h3 className="font-semibold text-slate-900">Audio guide</h3>
                            </div>
                            {audioSources.length === 0 ? (
                                <p className="mt-2 text-sm text-slate-500">Chưa có file audio nào.</p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {audioSources.map((audio, idx) => (
                                        <div key={audio.url + idx} className="rounded-lg border border-slate-200 p-3">
                                            <p className="text-xs font-semibold text-slate-600">
                                                {audio.label}
                                                {audio.pending && ' • Pending upload'}
                                            </p>
                                            <audio controls className="mt-2 w-full">
                                                <source src={audio.url} />
                                            </audio>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                            <h3 className="font-semibold text-slate-900">Bản đồ & phạm vi</h3>
                            {mapPreview ? (
                                <iframe
                                    title="POI map preview"
                                    src={mapPreview.embedUrl}
                                    loading="lazy"
                                    className="h-48 w-full rounded-xl border border-slate-200"
                                />
                            ) : (
                                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                                    Nhập tọa độ hợp lệ để xem bản đồ.
                                </div>
                            )}
                            <div className="text-xs text-slate-500">
                                Trigger radius: <span className="font-semibold text-slate-800">{poi.triggerRadius}m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POIPreviewModal;

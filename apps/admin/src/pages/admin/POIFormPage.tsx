import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    MapPin,
    Upload,
    X,
    Loader2,
    AlertCircle,
    Globe,
    Eye,
    PlayCircle,
    Image as ImageIcon,
    Headphones,
} from 'lucide-react';
import { poiService } from '../../services/poi.service';

type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

const languageTabs = [
    { code: 'VI' as const, label: 'Vietnamese' },
    { code: 'EN' as const, label: 'English' },
];

const isAudioMedia = (media: any) => {
    if (!media) return false;
    const mimetype = media.mime || media.mimetype;
    if (mimetype && typeof mimetype === 'string') {
        return mimetype.toLowerCase().startsWith('audio');
    }
    if (media.type) {
        return media.type.toUpperCase() === 'AUDIO';
    }
    return /(mp3|wav|m4a|aac)$/i.test(media.url || '');
};

const getMediaLabel = (media: any) => media?.language || media?.lang || 'N/A';

const POIFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [activeLang, setActiveLang] = useState<'VI' | 'EN'>('VI');
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        category: 'MAIN',
        address: '',
        latitude: '',
        longitude: '',
        triggerRadius: 15,
        status: 'DRAFT' as WorkflowStatus,
    });

    // Media State
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [imageQueue, setImageQueue] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [audioQueue, setAudioQueue] = useState<{ file: File; language: 'VI' | 'EN' }[]>([]);
    const audioInputRefs = {
        VI: useRef<HTMLInputElement>(null),
        EN: useRef<HTMLInputElement>(null),
    } as const;

    useEffect(() => {
        if (id) {
            setFetching(true);
            poiService.getOne(id)
                .then((poi: any) => {
                    // Extract address from description if present
                    let address = '';
                    let description = poi.descriptionVi || '';
                    const addressMatch = description.match(/^\[Address: (.*?)\]\n\n/);
                    if (addressMatch) {
                        address = addressMatch[1];
                        description = description.replace(addressMatch[0], '');
                    }

                        setFormData({
                        name: poi.nameVi,
                        nameEn: poi.nameEn || '',
                        description: description,
                        descriptionEn: poi.descriptionEn || '',
                        category: poi.category,
                        address: address,
                        latitude: poi.latitude.toString(),
                        longitude: poi.longitude.toString(),
                        triggerRadius: poi.triggerRadius,
                        status: poi.status,
                    });

                    if (poi.media) {
                        setExistingMedia(poi.media);
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch POI:', err);
                    setError('Failed to load POI details.');
                })
                .finally(() => setFetching(false));
        }
    }, [id]);

    // Handle File Selection with Previews
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageQueue((prev) => [...prev, ...files]);

            // Generate previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeInQueue = (index: number) => {
        setImageQueue((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });

        setPreviewUrls((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index]);
            next.splice(index, 1);
            return next;
        });
    };

    const handleAudioSelect = (language: 'VI' | 'EN', e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setAudioQueue((prev) => [...prev, { file, language }]);
        e.target.value = '';
    };

    const removeAudioFromQueue = (index: number) => {
        setAudioQueue((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const handleDeleteMedia = async (mediaId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await poiService.deleteMedia(id!, mediaId);
            setExistingMedia(existingMedia.filter(m => m.id !== mediaId));
        } catch (err) {
            alert('Failed to delete media');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'triggerRadius') {
            setFormData((prev) => ({ ...prev, triggerRadius: Number(value) }));
            return;
        }
        const nextValue = type === 'number' ? value : value;
        setFormData((prev) => ({ ...prev, [name]: nextValue }));
    };

    const handleSave = async (nextStatus: WorkflowStatus) => {
        if (readOnly) return;
        setLoading(true);
        setError('');

        try {
            const payload: any = {
                nameVi: formData.name,
                nameEn: formData.nameEn,
                descriptionVi: formData.address ? `[Address: ${formData.address}]\n\n${formData.description}` : formData.description,
                descriptionEn: formData.descriptionEn,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                category: formData.category,
                triggerRadius: Number(formData.triggerRadius) || 15,
                status: nextStatus,
            };

            let poiId = id;

            if (isEditMode) {
                await poiService.update(id!, payload);
            } else {
                const newPoi = await poiService.create(payload);
                poiId = newPoi.id;
            }

            if (poiId) {
                const uploaders: Promise<unknown>[] = [];

                if (imageQueue.length > 0) {
                    uploaders.push(
                        Promise.all(
                            imageQueue.map((file) => poiService.uploadMedia(poiId!, file, 'IMAGE'))
                        )
                    );
                }

                if (audioQueue.length > 0) {
                    uploaders.push(
                        Promise.all(
                            audioQueue.map(({ file, language }) =>
                                poiService.uploadMedia(poiId!, file, 'AUDIO', language)
                            )
                        )
                    );
                }

                if (uploaders.length) {
                    await Promise.all(uploaders);
                }
            }

            alert(`POI ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/admin/pois');
        } catch (err: any) {
            console.error('Save POI error:', err);
            const msg = err.response?.data?.message || 'Failed to save POI.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        if (!id) {
            alert('Vui lòng lưu POI trước khi xem preview.');
            return;
        }
        alert('Preview tourist experience sẽ được bổ sung ở sprint tới.');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        handleSave(formData.status);
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Determine Base URL for images
    // Assuming backend serves static files at /uploads. 
    // Need to prepend API URL or just / if served by same host?
    // User's API is on localhost:3000/api. Static files probably at localhost:3000/uploads ?
    // Let's assume relative path returned by API needs full URL if on different port.
    // For now assuming proxy or same origin. 
    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        // If dev mode, might need to point to API server.
        // Quick hack: if url starts with /, assumes root.
        return `http://localhost:3000${url}`;
    };

    const mapPreview = (() => {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        const delta = 0.005;
        const bbox = [
            (lng - delta).toFixed(6),
            (lat - delta).toFixed(6),
            (lng + delta).toFixed(6),
            (lat + delta).toFixed(6),
        ].join('%2C');

        return {
            embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`,
            externalUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
            coordsLabel: `${lat.toFixed(6)},${lng.toFixed(6)}`,
        };
    })();

    const translationField = activeLang === 'VI'
        ? { name: 'name', description: 'description' }
        : { name: 'nameEn', description: 'descriptionEn' };

    const imageMedia = existingMedia.filter((media) => !isAudioMedia(media));
    const audioMedia = existingMedia.filter(isAudioMedia);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {isEditMode ? (readOnly ? 'View POI' : 'Edit POI') : 'Create New POI'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isEditMode ? 'Manage details for this Point of Interest.' : 'Add a new Point of Interest to the map.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Content
                            </h2>
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
                                {languageTabs.map((tab) => (
                                    <button
                                        key={tab.code}
                                        type="button"
                                        onClick={() => setActiveLang(tab.code)}
                                        className={`rounded-full px-3 py-1 transition-all ${
                                            activeLang === tab.code ? 'bg-white shadow text-blue-600' : 'text-slate-500'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">POI Name *</label>
                                <input
                                    name={translationField.name}
                                    value={formData[translationField.name as keyof typeof formData] as string}
                                    onChange={handleChange}
                                    required={activeLang === 'VI'}
                                    minLength={2}
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60"
                                    placeholder={activeLang === 'VI' ? 'ví dụ Chùa Linh Ứng' : 'e.g. Linh Ung Pagoda'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description {activeLang === 'VI' ? '*' : '(optional)'}</label>
                                <textarea
                                    name={translationField.description}
                                    value={formData[translationField.description as keyof typeof formData] as string}
                                    onChange={handleChange}
                                    required={activeLang === 'VI'}
                                    minLength={activeLang === 'VI' ? 10 : 0}
                                    rows={6}
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none disabled:opacity-60"
                                    placeholder={activeLang === 'VI' ? 'Mô tả địa điểm...' : 'Optional English copy...'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-600" />
                            Classification & Settings
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                >
                                    <option value="MAIN">Main</option>
                                    <option value="SUB">Secondary</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                    placeholder="Số nhà, đường, quận..."
                                />
                                <p className="text-xs text-slate-400 mt-1">Được tự động chèn vào phần mở đầu mô tả.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-semibold text-slate-900">Location</h2>
                            {mapPreview && (
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                                    onClick={() => navigator.clipboard?.writeText(mapPreview.coordsLabel)}
                                >
                                    Copy coords
                                </button>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude *</label>
                                <input
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    type="number"
                                    step="any"
                                    required
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude *</label>
                                <input
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    type="number"
                                    step="any"
                                    required
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Trigger radius: {formData.triggerRadius} m</label>
                            <input
                                name="triggerRadius"
                                type="range"
                                min={5}
                                max={100}
                                step={5}
                                value={formData.triggerRadius}
                                onChange={handleChange}
                                disabled={readOnly}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>5m</span>
                                <span>100m</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                            {mapPreview ? (
                                <div className="space-y-3">
                                    <iframe
                                        title="OpenStreetMap preview"
                                        src={mapPreview.embedUrl}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="h-64 w-full rounded-lg border border-slate-200"
                                    />
                                    <a
                                        href={mapPreview.externalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
                                    >
                                        View on OpenStreetMap ↗
                                    </a>
                                </div>
                            ) : (
                                <p>Nhập tọa độ hợp lệ để xem preview bản đồ.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            Media Assets
                        </div>

                        {imageMedia.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Existing images</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imageMedia.map((media) => (
                                        <div key={media.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={getImageUrl(media.url)} alt="POI Media" className="w-full h-full object-cover" />
                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMedia(media.id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {previewUrls.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Images pending upload</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewUrls.map((url, idx) => (
                                        <div key={url} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-200 bg-blue-50">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                            <button
                                                type="button"
                                                onClick={() => removeInQueue(idx)}
                                                className="absolute top-2 right-2 p-1 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">New</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!readOnly && (
                            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:bg-slate-100 transition-colors relative">
                                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-600">Thả ảnh hoặc bấm để tải lên</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG ≤ 5MB</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <Headphones className="h-4 w-4 text-blue-600" />
                                Audio guide
                            </div>
                            {audioMedia.length > 0 && (
                                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                                    {audioMedia.map((media) => (
                                        <div key={media.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                                            <div>
                                                <p className="font-semibold text-slate-900">{media.title || `Audio ${media.id}`}</p>
                                                <p className="text-xs text-slate-500">Language: {getMediaLabel(media)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <audio controls className="h-8">
                                                    <source src={getImageUrl(media.url)} />
                                                </audio>
                                                {!readOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMedia(media.id)}
                                                        className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {audioQueue.length > 0 && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 text-sm divide-y divide-blue-100">
                                    {audioQueue.map((audio, index) => (
                                        <div key={index} className="flex items-center justify-between gap-3 p-3">
                                            <div>
                                                <p className="font-semibold text-slate-800">{audio.file.name}</p>
                                                <p className="text-xs text-slate-500">Pending • {audio.language}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAudioFromQueue(index)}
                                                className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:text-slate-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!readOnly && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {(['VI', 'EN'] as const).map((lang) => (
                                        <label
                                            key={lang}
                                            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-600 hover:bg-slate-100"
                                        >
                                            <input
                                                ref={audioInputRefs[lang]}
                                                type="file"
                                                accept="audio/*"
                                                className="hidden"
                                                onChange={(event) => handleAudioSelect(lang, event)}
                                            />
                                            <PlayCircle className="mb-2 h-6 w-6 text-slate-400" />
                                            Upload {lang} audio
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-start gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-all"
                        >
                            {readOnly ? 'Back' : 'Cancel'}
                        </button>
                        {!readOnly && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save changes
                            </button>
                        )}
                    </div>
                </form>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Eye className="h-4 w-4 text-blue-600" />
                            Publishing status
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Current status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!isEditMode || readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 disabled:opacity-60"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="ACTIVE">Published</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                            {!isEditMode && <p className="text-xs text-slate-400">POI mới sẽ bắt đầu ở trạng thái Draft.</p>}
                        </div>
                        <div className="grid gap-2">
                            <button
                                type="button"
                                onClick={handlePreview}
                                disabled={readOnly}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
                            >
                                Quick preview
                            </button>
                            {!readOnly && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleSave('DRAFT')}
                                        disabled={loading}
                                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        Save draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSave('ACTIVE')}
                                        disabled={loading}
                                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {isEditMode ? 'Update & publish' : 'Publish' }
                                    </button>
                                    {isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => handleSave('ARCHIVED')}
                                            disabled={loading || formData.status === 'ARCHIVED'}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                                        >
                                            Archive POI
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 space-y-2">
                        <p className="font-semibold text-slate-900">Tips</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Mô tả tiếng Việt là bắt buộc, bản dịch tiếng Anh có thể bổ sung sau.</li>
                            <li>Giữ audio dưới 4 phút để tăng tỉ lệ nghe hết.</li>
                            <li>Ảnh tiêu đề nên có kích thước tối thiểu 1200px.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default POIFormPage;

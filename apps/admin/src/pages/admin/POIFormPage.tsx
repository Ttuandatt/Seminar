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
    QrCode,
    Download,
    RefreshCw,
} from 'lucide-react';
import { poiService, type POI, type POIMedia, type SavePOIPayload, POI_CATEGORY_OPTIONS } from '../../services/poi.service';
import { merchantService, type Merchant } from '../../services/merchant.service';
import MapPicker from '../../components/forms/MapPicker';
import POIPreviewModal, { type AudioSource as PreviewAudioSource } from '../../components/preview/POIPreviewModal';
import { useToast } from '../../components/ui/ToastProvider';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { POI_FORM_LABELS } from '../../constants/form-labels';

type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

const languageTabs = [
    { code: 'VI' as const, label: 'Vietnamese' },
    { code: 'EN' as const, label: 'English' },
];

type MediaResource = POIMedia & {
    mime?: string | null;
    mimetype?: string | null;
    lang?: string | null;
    title?: string | null;
};

const isAudioMedia = (media: MediaResource) => {
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

const getMediaLabel = (media: MediaResource) => media?.language || media?.lang || 'N/A';

const POIFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [activeLang, setActiveLang] = useState<'VI' | 'EN'>('VI');
    const L = POI_FORM_LABELS[activeLang];
    const defaultCategory = POI_CATEGORY_OPTIONS[0]?.value ?? 'DINING';

    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        category: defaultCategory,
        address: '',
        latitude: '',
        longitude: '',
        triggerRadius: 15,
        status: 'ACTIVE' as WorkflowStatus,
        ownerId: '',
    });

    // Media State
    const [existingMedia, setExistingMedia] = useState<MediaResource[]>([]);
    const [imageQueue, setImageQueue] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [audioQueue, setAudioQueue] = useState<{ file: File; language: 'VI' | 'EN' }[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<MediaResource | null>(null);
    const [isDeletingMedia, setIsDeletingMedia] = useState(false);
    const audioInputRefs = {
        VI: useRef<HTMLInputElement>(null),
        EN: useRef<HTMLInputElement>(null),
    } as const;

    const [owners, setOwners] = useState<Merchant[]>([]);
    const [ownersLoading, setOwnersLoading] = useState(false);
    const [currentOwnerInfo, setCurrentOwnerInfo] = useState<{ id: string; label: string } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [pendingAudioPreviews, setPendingAudioPreviews] = useState<PreviewAudioSource[]>([]);
    const [ttsGenerating, setTtsGenerating] = useState<{ VI?: boolean; EN?: boolean }>({});
    const [qrData, setQrData] = useState<{ qrDataUrl: string; qrCodeUrl: string; qrContent: string } | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        if (id) {
            setFetching(true);
            poiService.getOne(id)
                .then((poi: POI) => {
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
                        ownerId: poi.owner?.id || '',
                    });

                    setExistingMedia((poi.media as MediaResource[]) || []);

                    if (poi.owner) {
                        const ownerLabel = poi.owner.shopOwnerProfile?.shopName || poi.owner.fullName;
                        setCurrentOwnerInfo(ownerLabel ? { id: poi.owner.id, label: ownerLabel } : null);
                    } else {
                        setCurrentOwnerInfo(null);
                    }

                    // Fetch QR code
                    poiService.getQrCode(id)
                        .then(qr => setQrData({ qrDataUrl: qr.qrDataUrl, qrCodeUrl: qr.qrCodeUrl, qrContent: qr.qrContent }))
                        .catch(() => {}); // QR is non-critical
                })
                .catch((err) => {
                    console.error('Failed to fetch POI:', err);
                    setError('Failed to load POI details.');
                })
                .finally(() => setFetching(false));
        }
    }, [id]);

    useEffect(() => {
        let isMounted = true;
        setOwnersLoading(true);
        merchantService.getAll({ page: 1, limit: 100 })
            .then((res) => {
                if (!isMounted) return;
                setOwners(res.data || []);
            })
            .catch((err) => {
                console.error('Failed to fetch merchants:', err);
            })
            .finally(() => {
                if (isMounted) setOwnersLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const previews = audioQueue.map(({ file, language }) => ({
            url: URL.createObjectURL(file),
            label: `${language} audio (${file.name})`,
            pending: true,
        }));
        setPendingAudioPreviews(previews);
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [audioQueue]);

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

    const handleDeleteMediaRequest = (media: MediaResource) => {
        if (readOnly) return;
        setMediaToDelete(media);
    };

    const confirmDeleteMedia = async () => {
        if (!mediaToDelete || !id) return;
        setIsDeletingMedia(true);
        try {
            await poiService.deleteMedia(id, mediaToDelete.id);
            setExistingMedia((prev) => prev.filter((media) => media.id !== mediaToDelete.id));
            showToast({
                variant: 'success',
                title: 'Đã xoá media',
                description: 'Tệp đã được xoá khỏi POI.',
            });
        } catch (error) {
            console.error('Failed to delete media:', error);
            showToast({
                variant: 'error',
                title: 'Xoá media thất bại',
                description: 'Không thể xoá media. Vui lòng thử lại.',
            });
        } finally {
            setIsDeletingMedia(false);
            setMediaToDelete(null);
        }
    };

    const handleMapCoordinateChange = (lat: number, lng: number) => {
        if (readOnly) return;
        setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
        }));
    };

    const handleAddressSuggestion = (address: string) => {
        if (readOnly) return;
        setFormData((prev) => ({
            ...prev,
            address,
        }));
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

        // Client-side validation to prevent 400 from backend
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        const errors: string[] = [];
        if (!formData.name || formData.name.length < 2) errors.push('Tên POI cần ít nhất 2 ký tự.');
        if (!formData.description || formData.description.length < 10) errors.push('Mô tả tiếng Việt cần ít nhất 10 ký tự.');
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) errors.push('Vui lòng chọn vị trí trên bản đồ.');
        if (errors.length > 0) {
            setError(errors.join(' '));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: SavePOIPayload = {
                nameVi: formData.name,
                nameEn: formData.nameEn,
                descriptionVi: formData.address ? `[Address: ${formData.address}]\n\n${formData.description}` : formData.description,
                descriptionEn: formData.descriptionEn,
                latitude: lat,
                longitude: lng,
                category: formData.category,
                triggerRadius: Number(formData.triggerRadius) || 15,
                status: nextStatus,
                ownerId: formData.ownerId || null,
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

            showToast({
                variant: 'success',
                title: isEditMode ? 'Đã cập nhật POI' : 'Đã tạo POI',
                description: 'Thông tin POI đã được lưu thành công.',
            });
            navigate('/admin/pois');
        } catch (error: unknown) {
            console.error('Save POI error:', error);
            const message =
                typeof error === 'object' && error !== null && 'response' in error
                    ? (error as { response?: { data?: { message?: unknown } } }).response?.data?.message
                    : undefined;
            const msg = message || 'Failed to save POI.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
            showToast({
                variant: 'error',
                title: 'Lưu POI thất bại',
                description: Array.isArray(msg) ? msg.join(', ') : String(msg),
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        if (!formData.name || !formData.description) {
            showToast({
                variant: 'error',
                title: 'Thiếu nội dung',
                description: 'Vui lòng nhập tên và mô tả tiếng Việt trước khi xem preview.',
            });
            return;
        }
        setIsPreviewOpen(true);
    };

    const handleGenerateTts = async (language: 'VI' | 'EN') => {
        if (!id) {
            showToast({ variant: 'error', title: 'Lưu POI trước', description: 'Vui lòng lưu POI trước khi tạo TTS audio.' });
            return;
        }
        const text = language === 'VI' ? formData.description : formData.descriptionEn;
        if (!text || text.length < 10) {
            showToast({ variant: 'error', title: 'Thiếu nội dung', description: `Mô tả ${language} cần ít nhất 10 ký tự để tạo audio.` });
            return;
        }
        setTtsGenerating(prev => ({ ...prev, [language]: true }));
        try {
            const result = await poiService.generateTts(id, text, language);
            showToast({ variant: 'success', title: `TTS ${language} đã tạo`, description: `Audio ${language} đã được tạo thành công.` });
            // Refresh media list
            const poi = await poiService.getOne(id);
            setExistingMedia((poi.media as MediaResource[]) || []);
        } catch (err) {
            console.error('TTS generation error:', err);
            showToast({ variant: 'error', title: `TTS ${language} thất bại`, description: 'Không thể tạo audio. Vui lòng thử lại.' });
        } finally {
            setTtsGenerating(prev => ({ ...prev, [language]: false }));
        }
    };

    const handleRegenerateQr = async () => {
        if (!id) return;
        setQrLoading(true);
        try {
            const result = await poiService.regenerateQr(id);
            setQrData({ qrDataUrl: result.qrDataUrl, qrCodeUrl: result.qrCodeUrl, qrContent: `gpstours:poi:${id}` });
            showToast({ variant: 'success', title: 'QR Code regenerated', description: 'Mã QR mới đã được tạo.' });
        } catch {
            showToast({ variant: 'error', title: 'QR regeneration failed', description: 'Không thể tạo lại mã QR.' });
        } finally {
            setQrLoading(false);
        }
    };

    const handleDownloadQr = () => {
        if (!qrData?.qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `QR_${formData.name || 'POI'}.png`;
        link.href = qrData.qrDataUrl;
        link.click();
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

    const parseCoordinate = (value: string) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const latitudeValue = parseCoordinate(formData.latitude);
    const longitudeValue = parseCoordinate(formData.longitude);

    const mapPreview = (() => {
        if (typeof latitudeValue !== 'number' || typeof longitudeValue !== 'number') return null;
        const delta = 0.005;
        const bbox = [
            (longitudeValue - delta).toFixed(6),
            (latitudeValue - delta).toFixed(6),
            (longitudeValue + delta).toFixed(6),
            (latitudeValue + delta).toFixed(6),
        ].join('%2C');

        return {
            embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitudeValue},${longitudeValue}`,
            externalUrl: `https://www.openstreetmap.org/?mlat=${latitudeValue}&mlon=${longitudeValue}#map=16/${latitudeValue}/${longitudeValue}`,
            coordsLabel: `${latitudeValue.toFixed(6)},${longitudeValue.toFixed(6)}`,
        };
    })();

    const translationField = activeLang === 'VI'
        ? { name: 'name', description: 'description' }
        : { name: 'nameEn', description: 'descriptionEn' };

    const imageMedia = existingMedia.filter((media) => !isAudioMedia(media));
    const audioMedia = existingMedia.filter(isAudioMedia);

    const ownerSelectOptions = owners
        .map((owner) => ({
            id: owner.id,
            label: owner.shopOwnerProfile?.shopName || owner.fullName || 'Unnamed owner',
        }))
        .filter((option) => Boolean(option.label));

    if (currentOwnerInfo && !ownerSelectOptions.find((option) => option.id === currentOwnerInfo.id)) {
        ownerSelectOptions.push(currentOwnerInfo);
    }

    ownerSelectOptions.sort((a, b) => a.label.localeCompare(b.label));

    const existingImageUrls = imageMedia.map((media) => getImageUrl(media.url));
    const previewImageUrls = [...existingImageUrls, ...previewUrls];

    const existingAudioSources = audioMedia.map((media) => ({
        url: getImageUrl(media.url),
        label: `${getMediaLabel(media)} audio`,
    }));

    const audioPreviewSources = [...existingAudioSources, ...pendingAudioPreviews];

    return (
        <>
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
                                {L.contentHeading}
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.poiName} {activeLang === 'VI' ? L.required : ''}</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.description} {activeLang === 'VI' ? L.required : L.descriptionOptional}</label>
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
                            {L.classificationHeading}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.category} {L.required}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                >
                                    {POI_CATEGORY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.address}</label>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Owner (shop)</label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 disabled:opacity-60"
                            >
                                <option value="">Admin managed POI</option>
                                {ownerSelectOptions.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 mt-1">
                                {ownersLoading ? 'Đang tải danh sách shop owner...' : 'Chọn shop owner để POI hiển thị trong dashboard của họ.'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-semibold text-slate-900">{L.locationHeading}</h2>
                            {mapPreview && (
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                                    onClick={() => navigator.clipboard?.writeText(mapPreview.coordsLabel)}
                                >
                                    {L.copyCoords}
                                </button>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.latitude} {L.required}</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.longitude} {L.required}</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">{L.triggerRadius}: {formData.triggerRadius} m</label>
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
                        <div>
                            <MapPicker
                                latitude={latitudeValue}
                                longitude={longitudeValue}
                                triggerRadius={formData.triggerRadius}
                                onCoordinateChange={handleMapCoordinateChange}
                                onAddressSelect={handleAddressSuggestion}
                            />
                            {mapPreview && (
                                <a
                                    href={mapPreview.externalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
                                >
                                    Mở trên OpenStreetMap ↗
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            {L.mediaHeading}
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
                                                    onClick={() => handleDeleteMediaRequest(media)}
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
                                {L.audioGuide}
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
                                                        onClick={() => handleDeleteMediaRequest(media)}
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

                            {!readOnly && isEditMode && (
                                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                        <Headphones className="h-4 w-4" />
                                        {L.ttsHeading}
                                    </div>
                                    <p className="text-xs text-indigo-600">
                                        {L.ttsDescription}
                                    </p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateTts('VI')}
                                            disabled={ttsGenerating.VI || !formData.description}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {ttsGenerating.VI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}
                                            {L.generateVi}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateTts('EN')}
                                            disabled={ttsGenerating.EN || !formData.descriptionEn}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {ttsGenerating.EN ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}
                                            {L.generateEn}
                                        </button>
                                    </div>
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

                    {isEditMode && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <QrCode className="h-4 w-4 text-blue-600" />
                                QR Code
                            </div>
                            {qrData?.qrDataUrl ? (
                                <>
                                    <div className="flex justify-center">
                                        <img
                                            src={qrData.qrDataUrl}
                                            alt="QR Code"
                                            className="w-48 h-48 rounded-lg border border-slate-200"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 text-center break-all">{qrData.qrContent}</p>
                                    <div className="grid gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadQr}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download PNG
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRegenerateQr}
                                            disabled={qrLoading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                        >
                                            {qrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                            Regenerate
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center py-4 text-center text-slate-400">
                                    <QrCode className="h-10 w-10 mb-2" />
                                    <p className="text-xs">QR code will be generated automatically when this POI is saved.</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </div>
        {isPreviewOpen && (
            <POIPreviewModal
                open={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                poi={{
                    nameVi: formData.name || 'POI chưa đặt tên',
                    nameEn: formData.nameEn,
                    descriptionVi: formData.description || 'Chưa có mô tả',
                    descriptionEn: formData.descriptionEn,
                    category: formData.category,
                    triggerRadius: formData.triggerRadius,
                    status: formData.status,
                    address: formData.address,
                }}
                images={previewImageUrls}
                audioSources={audioPreviewSources}
                mapPreview={mapPreview}
                latitude={latitudeValue}
                longitude={longitudeValue}
            />
        )}
        <ConfirmDialog
            open={Boolean(mediaToDelete)}
            title={mediaToDelete?.type === 'AUDIO' ? 'Xoá audio khỏi POI' : 'Xoá hình ảnh khỏi POI'}
            description="Tệp sẽ bị xoá vĩnh viễn khỏi POI sau khi xác nhận."
            confirmLabel="Xoá tệp"
            cancelLabel="Huỷ"
            isDanger
            isLoading={isDeletingMedia}
            onConfirm={confirmDeleteMedia}
            onCancel={() => (!isDeletingMedia ? setMediaToDelete(null) : null)}
        />
        </>
    );
};

export default POIFormPage;

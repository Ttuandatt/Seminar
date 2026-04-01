import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Loader2,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Headphones,
  PlayCircle,
} from 'lucide-react';
import MapPicker from '../../components/forms/MapPicker';
import POIPreviewModal, { type AudioSource as PreviewAudioSource } from '../../components/preview/POIPreviewModal';
import { POI_CATEGORY_OPTIONS } from '../../services/poi.service';
import { shopOwnerPortalService } from '../../services/shopOwnerPortal.service';
import { useToast } from '../../components/ui/ToastProvider';
import { POI_FORM_LABELS } from '../../constants/form-labels';
import usePoiTts, { type EnsurePoiResult } from '../../hooks/usePoiTts';

const languageTabs = [
  { code: 'VI' as const, label: 'Vietnamese' },
  { code: 'EN' as const, label: 'English' },
];

interface MediaResource {
  id: string;
  type: string;
  language?: string;
  url: string;
  originalName?: string;
  orderIndex?: number | null;
}

const isActiveMedia = (media?: MediaResource | null) =>
  Boolean(media) && (media.orderIndex === undefined || media.orderIndex === null || media.orderIndex >= 0);

const sanitizeMediaList = (media?: MediaResource[] | null) => {
  if (!Array.isArray(media)) return [];
  return media.filter((item) => isActiveMedia(item));
};

const ShopOwnerPOIFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [draftPoiId, setDraftPoiId] = useState<string | null>(null);
  const poiId = id ?? draftPoiId ?? undefined;
  const isEditMode = !!poiId;
  const { showToast } = useToast();
  const defaultCategory = POI_CATEGORY_OPTIONS[0]?.value ?? 'DINING';
  const [activeLang, setActiveLang] = useState<'VI' | 'EN'>('VI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingAudioPreviews, setPendingAudioPreviews] = useState<PreviewAudioSource[]>([]);
  const [ensuringPoiForTts, setEnsuringPoiForTts] = useState(false);

  const L = POI_FORM_LABELS[activeLang];

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
  });

  const [existingMedia, setExistingMedia] = useState<MediaResource[]>([]);
  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [audioQueue, setAudioQueue] = useState<{ file: File; language: 'VI' | 'EN' }[]>([]);
  const audioInputRefs = {
    VI: useRef<HTMLInputElement>(null),
    EN: useRef<HTMLInputElement>(null),
  } as const;

  // Fetch existing POI data for view/edit modes
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    shopOwnerPortalService.getOnePoi(id)
      .then((poi: Record<string, unknown>) => {
        setFormData({
          name: (poi.nameVi as string) || '',
          nameEn: (poi.nameEn as string) || '',
          description: (poi.descriptionVi as string) || '',
          descriptionEn: (poi.descriptionEn as string) || '',
          category: (poi.category as string) || defaultCategory,
          address: '',
          latitude: String(poi.latitude ?? ''),
          longitude: String(poi.longitude ?? ''),
          triggerRadius: (poi.triggerRadius as number) || 15,
        });
        if (Array.isArray(poi.media)) {
          setExistingMedia(sanitizeMediaList(poi.media as MediaResource[]));
        } else {
          setExistingMedia([]);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch POI:', err);
        setError('Failed to load POI details.');
      })
      .finally(() => setFetching(false));
  }, [id, defaultCategory]);

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

  const refreshMedia = useCallback(async (targetPoiId?: string) => {
    const effectivePoiId = targetPoiId ?? poiId;
    if (!effectivePoiId) return;
    const poi = await shopOwnerPortalService.getOnePoi(effectivePoiId);
    if (Array.isArray(poi.media)) {
      setExistingMedia(sanitizeMediaList(poi.media as MediaResource[]));
    } else {
      setExistingMedia([]);
    }
  }, [poiId]);

  const { generating: ttsGenerating, generateTts } = usePoiTts({
    getPoiId: () => poiId,
    getDescriptionFor: (language) => (language === 'VI' ? formData.description : formData.descriptionEn),
    refreshMedia,
    onSuccessToast: (language) =>
      showToast({
        variant: 'success',
        title: `TTS ${language}`,
        description: `Audio ${language} generated successfully.`,
      }),
    onErrorToast: (language, message) =>
      showToast({
        variant: 'error',
        title: `TTS ${language} failed`,
        description: message,
      }),
    getMissingPoiMessage: () => 'Save POI first before generating TTS.',
    getShortDescriptionMessage: (language) =>
      language === 'VI'
        ? 'Vietnamese description needs at least 10 characters.'
        : 'English description needs at least 10 characters.',
    ensurePoiExists: ensurePoiExistsForTts,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (readOnly) return;
    const { name, value, type } = event.target;
    if (name === 'triggerRadius') {
      setFormData((prev) => ({ ...prev, triggerRadius: Number(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? value : value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    setImageQueue((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeInQueue = (index: number) => {
    setImageQueue((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setPreviewUrls((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index]);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleAudioSelect = (language: 'VI' | 'EN', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAudioQueue((prev) => [...prev, { file, language }]);
    event.target.value = '';
  };

  const removeAudioFromQueue = (index: number) => {
    setAudioQueue((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleMapCoordinateChange = (lat: number, lng: number) => {
    if (readOnly) return;
    setFormData((prev) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
  };

  const handleAddressSuggestion = (address: string) => {
    if (readOnly) return;
    setFormData((prev) => ({ ...prev, address }));
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

  const collectValidationState = () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push(L.toastMissingInfoDesc || 'Vui lòng nhập tên tiếng Việt.');
    if (!formData.description.trim()) errors.push(L.toastMissingContentDesc || 'Vui lòng nhập mô tả tiếng Việt.');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) errors.push(L.toastMissingCoordsDesc || 'Vui lòng chọn toạ độ trên bản đồ.');
    return { errors, lat, lng };
  };

  const buildBaseCreatePayload = (lat: number, lng: number) => ({
    nameVi: formData.name.trim(),
    nameEn: formData.nameEn.trim() || undefined,
    descriptionVi: formData.description.trim(),
    descriptionEn: formData.descriptionEn.trim() || undefined,
    category: formData.category,
    address: formData.address.trim() || undefined,
    latitude: lat,
    longitude: lng,
    triggerRadius: formData.triggerRadius,
  });

  const translationField = activeLang === 'VI'
    ? { name: 'name', description: 'description' }
    : { name: 'nameEn', description: 'descriptionEn' };
  const activeDescriptionValue = activeLang === 'VI' ? formData.description : formData.descriptionEn;

  const handlePreview = () => {
    if (!formData.name || !formData.description) {
      showToast({
        variant: 'error',
        title: L.toastMissingContent,
        description: L.toastMissingContentDesc,
      });
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly) return;
    setError('');

    const { errors, lat, lng } = collectValidationState();
    if (errors.length > 0) {
      showToast({ variant: 'error', title: L.toastMissingInfo, description: errors[0] });
      setError(errors.join(' '));
      return;
    }

    setIsSubmitting(true);
    try {
      let targetPoiId = poiId;

      if (targetPoiId) {
        await shopOwnerPortalService.updatePoi(targetPoiId, {
          nameVi: formData.name.trim(),
          nameEn: formData.nameEn.trim() || '',
          descriptionVi: formData.description.trim(),
        });
      } else {
        const result = await shopOwnerPortalService.createPoi({
          ...buildBaseCreatePayload(lat, lng),
          media: {
            images: imageQueue.map((file) => file.name),
            audio: audioQueue.map((audio) => ({ language: audio.language, name: audio.file.name })),
          },
        });
        targetPoiId = result.id;
        setDraftPoiId(result.id);
      }

      if (targetPoiId) {
        const uploaders: Promise<unknown>[] = [];
        if (imageQueue.length > 0) {
          uploaders.push(
            Promise.all(imageQueue.map((file) => shopOwnerPortalService.uploadMedia(targetPoiId!, file, 'IMAGE')))
          );
        }
        if (audioQueue.length > 0) {
          uploaders.push(
            Promise.all(audioQueue.map(({ file, language }) => shopOwnerPortalService.uploadMedia(targetPoiId!, file, 'AUDIO', language)))
          );
        }
        if (uploaders.length) await Promise.all(uploaders);
      }

      showToast({
        variant: 'success',
        title: id ? L.toastUpdated : L.toastSubmitted,
        description: id ? L.toastUpdatedDesc : L.toastSubmittedDesc,
      });
      navigate('/owner/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : L.toastFailedDefault;
      setError(message);
      showToast({ variant: 'error', title: L.toastFailed, description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ensurePoiExistsForTts = async (): Promise<EnsurePoiResult> => {
    if (poiId) {
      return { poiId };
    }

    const { errors, lat, lng } = collectValidationState();
    if (errors.length > 0) {
      showToast({ variant: 'error', title: L.toastMissingInfo, description: errors[0] });
      setError(errors.join(' '));
      return { handled: true };
    }

    setEnsuringPoiForTts(true);
    try {
      const result = await shopOwnerPortalService.createPoi(buildBaseCreatePayload(lat, lng));
      setDraftPoiId(result.id);
      const successTitle = activeLang === 'VI' ? 'Đã lưu bản nháp' : 'Draft saved';
      const successDescription = activeLang === 'VI'
        ? 'POI đã được lưu tạm để tạo audio.'
        : 'Saved a draft so you can generate audio.';
      showToast({ variant: 'success', title: successTitle, description: successDescription });
      return { poiId: result.id };
    } catch (error) {
      console.error('Failed to auto-save shop owner POI for TTS:', error);
      showToast({ variant: 'error', title: L.toastFailed, description: L.toastFailedDefault });
      return { handled: true };
    } finally {
      setEnsuringPoiForTts(false);
    }
  };

  const getMediaUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const audioMedia = existingMedia.filter((m) => m.type === 'AUDIO');
  const imageMedia = existingMedia.filter((m) => m.type !== 'AUDIO');

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pageTitle = isEditMode ? (readOnly ? L.viewTitle : L.editTitle) : L.createTitle;
  const pageSubtitle = isEditMode ? (readOnly ? L.viewSubtitle : L.editSubtitle) : L.createSubtitle;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S14 • POI</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{pageSubtitle}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content section */}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {L.poiName} {activeLang === 'VI' ? L.required : ''}
                  </label>
                  <input
                    name={translationField.name}
                    value={formData[translationField.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    required={activeLang === 'VI'}
                    minLength={2}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    placeholder={activeLang === 'VI' ? L.namePlaceholder : L.nameEnPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {L.description} {activeLang === 'VI' ? L.required : L.descriptionOptional}
                  </label>
                  <textarea
                    name={translationField.description}
                    value={formData[translationField.description as keyof typeof formData] as string}
                    onChange={handleChange}
                    required={activeLang === 'VI'}
                    minLength={activeLang === 'VI' ? 10 : 0}
                    rows={6}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none disabled:opacity-60"
                    placeholder={activeLang === 'VI' ? L.descriptionPlaceholder : L.descriptionEnPlaceholder}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{L.ttsDescription}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => generateTts(activeLang)}
                        disabled={ensuringPoiForTts || ttsGenerating[activeLang] || !activeDescriptionValue?.trim()}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ensuringPoiForTts || ttsGenerating[activeLang] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Headphones className="h-3.5 w-3.5" />
                        )}
                        {activeLang === 'VI' ? L.generateVi : L.generateEn}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Classification section */}
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
                    placeholder={L.addressPlaceholder}
                  />
                  <p className="text-xs text-slate-400 mt-1">{L.addressHint}</p>
                </div>
              </div>
            </div>

            {/* Location section */}
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
                    {L.openMap} ↗
                  </a>
                )}
              </div>
            </div>

            {/* Media section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                {L.mediaHeading}
              </div>

              {/* Existing images (view/edit mode) */}
              {imageMedia.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Existing images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageMedia.map((media) => (
                      <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={getMediaUrl(media.url)} alt="POI Media" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">{L.imagesPending}</h3>
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
                  <p className="text-sm font-medium text-slate-600">{L.dropImages}</p>
                  <p className="text-xs text-slate-400 mt-1">{L.imageLimit}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Headphones className="h-4 w-4 text-blue-600" />
                  {L.audioGuide}
                </div>

                {/* Existing audio (view/edit mode) */}
                {audioMedia.length > 0 && (
                  <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {audioMedia.map((media) => (
                      <div key={media.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">{media.originalName || `Audio ${media.id.slice(0, 8)}`}</p>
                          <p className="text-xs text-slate-500">Language: {media.language || 'N/A'}</p>
                        </div>
                        <audio controls className="h-8">
                          <source src={getMediaUrl(media.url)} />
                        </audio>
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
                        {L.uploadAudio} {lang}
                      </label>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-all"
              >
                {readOnly ? L.back : L.cancel}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditMode ? L.save : L.submit}
                </button>
              )}
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{L.approvalStatus}</p>
              <p dangerouslySetInnerHTML={{ __html: L.approvalNote }} />
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
              >
                {L.previewButton}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">{L.tipsHeading}</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                {L.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {isPreviewOpen && (
        <POIPreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          poi={{
            nameVi: formData.name || 'POI',
            nameEn: formData.nameEn,
            descriptionVi: formData.description || '',
            descriptionEn: formData.descriptionEn,
            category: formData.category,
            triggerRadius: formData.triggerRadius,
            status: 'IN_REVIEW',
            address: formData.address,
          }}
          images={previewUrls}
          audioSources={pendingAudioPreviews}
          mapPreview={mapPreview}
          latitude={latitudeValue}
          longitude={longitudeValue}
        />
      )}
    </>
  );
};

export default ShopOwnerPOIFormPage;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const languageTabs = [
  { code: 'VI' as const, label: 'Vietnamese' },
  { code: 'EN' as const, label: 'English' },
];

const ShopOwnerPOIFormPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const defaultCategory = POI_CATEGORY_OPTIONS[0]?.value ?? 'DINING';
  const [activeLang, setActiveLang] = useState<'VI' | 'EN'>('VI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingAudioPreviews, setPendingAudioPreviews] = useState<PreviewAudioSource[]>([]);

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

  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [audioQueue, setAudioQueue] = useState<{ file: File; language: 'VI' | 'EN' }[]>([]);
  const audioInputRefs = {
    VI: useRef<HTMLInputElement>(null),
    EN: useRef<HTMLInputElement>(null),
  } as const;

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    setFormData((prev) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
  };

  const handleAddressSuggestion = (address: string) => {
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

  const translationField = activeLang === 'VI'
    ? { name: 'name', description: 'description' }
    : { name: 'nameEn', description: 'descriptionEn' };

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.description.trim()) {
      showToast({
        variant: 'error',
        title: 'Thiếu thông tin',
        description: 'Tên và mô tả tiếng Việt là bắt buộc.',
      });
      return;
    }
    if (typeof latitudeValue !== 'number' || typeof longitudeValue !== 'number') {
      showToast({
        variant: 'error',
        title: 'Thiếu toạ độ',
        description: 'Vui lòng chọn vị trí trên bản đồ.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await shopOwnerPortalService.createPoi({
        nameVi: formData.name.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        descriptionVi: formData.description.trim(),
        descriptionEn: formData.descriptionEn.trim() || undefined,
        category: formData.category,
        address: formData.address.trim() || undefined,
        latitude: latitudeValue,
        longitude: longitudeValue,
        triggerRadius: formData.triggerRadius,
        media: {
          images: imageQueue.map((file) => file.name),
          audio: audioQueue.map((audio) => ({ language: audio.language, name: audio.file.name })),
        },
      });

      showToast({
        variant: 'success',
        title: 'Đã gửi POI để duyệt',
        description: 'Chúng tôi sẽ thông báo khi POI được phê duyệt.',
      });
      navigate('/owner/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo POI. Vui lòng thử lại.';
      setError(message);
      showToast({ variant: 'error', title: 'Tạo POI thất bại', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S14 • Submit POI</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký POI mới</h1>
            <p className="text-sm text-slate-500">Nhập đầy đủ dữ liệu để đội ngũ duyệt và xuất bản cho khách du lịch.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Nội dung POI
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên POI *</label>
                  <input
                    name={translationField.name}
                    value={formData[translationField.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    required={activeLang === 'VI'}
                    minLength={2}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder={activeLang === 'VI' ? 'ví dụ Quán bún mắm...' : 'Optional English name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả {activeLang === 'VI' ? '*' : '(không bắt buộc)'}</label>
                  <textarea
                    name={translationField.description}
                    value={formData[translationField.description as keyof typeof formData] as string}
                    onChange={handleChange}
                    required={activeLang === 'VI'}
                    minLength={activeLang === 'VI' ? 10 : 0}
                    rows={6}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder={activeLang === 'VI' ? 'Mô tả trải nghiệm...' : 'Optional English copy...'}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                Phân loại & thông tin
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {POI_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ hiển thị</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Số nhà, đường, quận..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Địa chỉ sẽ được chèn vào phần đầu mô tả.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Vị trí bản đồ</h2>
                {mapPreview && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                    onClick={() => navigator.clipboard?.writeText(mapPreview.coordsLabel)}
                  >
                    Copy toạ độ
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bán kính kích hoạt: {formData.triggerRadius} m</label>
                <input
                  name="triggerRadius"
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={formData.triggerRadius}
                  onChange={handleChange}
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
                Media Assets
              </div>

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

              <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:bg-slate-100 transition-colors relative">
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Thả ảnh hoặc bấm để tải lên</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG ≤ 5MB</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Headphones className="h-4 w-4 text-blue-600" />
                  Audio guide
                </div>

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
              </div>
            </div>

            <div className="flex items-center justify-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-all"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Gửi duyệt POI
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Trạng thái phê duyệt</p>
              <p>POI mới sẽ ở trạng thái <span className="font-semibold text-blue-600">In review</span>. Bạn sẽ nhận thông báo khi team vận hành duyệt xong.</p>
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
              >
                Xem thử giao diện
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">Tips</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Mô tả tiếng Việt tối thiểu 10 dòng để được duyệt nhanh.</li>
                <li>Ảnh đại diện nên sáng, độ phân giải 1200px.</li>
                <li>Audio nên dài 2-4 phút, ghi âm rõ ràng.</li>
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
            nameVi: formData.name || 'POI chưa đặt tên',
            nameEn: formData.nameEn,
            descriptionVi: formData.description || 'Chưa có mô tả',
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

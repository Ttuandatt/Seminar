import { useState, useEffect, useCallback } from 'react';
import { 
    Play, 
    RefreshCw, 
    Save, 
    Loader2, 
    Music, 
    Languages, 
    Info,
    CheckCircle2,
    AlertTriangle,
    Mic2
} from 'lucide-react';
import { narrationService, type TourNarration, type NarrationType } from '../services/narration.service';
import { tourService, type Tour } from '../services/tour.service';

interface TourNarrationTabProps {
    tourId: string;
}

const TourNarrationTab = ({ tourId }: TourNarrationTabProps) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [tour, setTour] = useState<Tour | null>(null);
    const [narrations, setNarrations] = useState<TourNarration[]>([]);
    const [localScripts, setLocalScripts] = useState<Record<string, { scriptVi: string; scriptEn: string }>>({});

    const loadData = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const [tourData, narrationData] = await Promise.all([
                tourService.getOne(tourId),
                narrationService.getAll(tourId)
            ]);
            setTour(tourData);
            setNarrations(narrationData.sort((a, b) => a.orderIndex - b.orderIndex));
            
            // Initialize local scripts for editing
            const scripts: Record<string, { scriptVi: string; scriptEn: string }> = {};
            narrationData.forEach(n => {
                scripts[n.id] = {
                    scriptVi: n.scriptVi || '',
                    scriptEn: n.scriptEn || ''
                };
            });
            setLocalScripts(scripts);
        } catch (err) {
            console.error('Failed to load narration data:', err);
            setError('Failed to load narration data. Please check your connection.');
        } finally {
            setFetching(false);
        }
    }, [tourId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleScriptChange = (id: string, lang: 'scriptVi' | 'scriptEn', value: string) => {
        setLocalScripts(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [lang]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                narrations: narrations.map(n => ({
                    type: n.type,
                    orderIndex: n.orderIndex,
                    fromPoiId: n.fromPoiId,
                    toPoiId: n.toPoiId,
                    scriptVi: localScripts[n.id]?.scriptVi || null,
                    scriptEn: localScripts[n.id]?.scriptEn || null
                }))
            };
            await narrationService.upsert(tourId, payload);
            setSuccess('Thuyết minh đã được lưu thành công!');
            await loadData();
        } catch (err) {
            console.error('Failed to save narrations:', err);
            setError('Không thể lưu thuyết minh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoGenerate = async () => {
        if (!confirm('Bạn có chắc muốn tự động tạo lại tất cả kịch bản? Các thay đổi thủ công có thể bị ghi đè.')) return;
        
        setLoading(true);
        setError(null);
        try {
            await narrationService.generate(tourId, { overwriteExisting: true });
            setSuccess('Đã tự động tạo các kịch bản thuyết minh!');
            await loadData();
        } catch (err) {
            console.error('Failed to generate narrations:', err);
            setError('Không thể tự động tạo thuyết minh.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTts = async () => {
        setLoading(true);
        setError(null);
        try {
            await narrationService.generateTts(tourId);
            setSuccess('Đã bắt đầu tạo âm thanh TTS cho toàn bộ tour!');
            await loadData();
        } catch (err) {
            console.error('Failed to generate TTS:', err);
            setError('Không thể tạo âm thanh TTS.');
        } finally {
            setLoading(false);
        }
    };

    const handleSingleTts = async (id: string) => {
        setLoading(true);
        try {
            await narrationService.generateSingleTts(tourId, id);
            await loadData();
        } catch (err) {
            console.error('Failed to generate single TTS:', err);
            setError('Không thể tạo âm thanh cho mục này.');
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (url: string) => {
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${url}`;
        const audio = new Audio(fullUrl);
        audio.play().catch(e => {
            console.error('Playback error:', e);
            alert('Không thể phát file âm thanh này.');
        });
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-slate-500 text-sm">Đang tải dữ liệu thuyết minh...</p>
            </div>
        );
    }

    const getPoiName = (poiId: string | null) => {
        if (!poiId || !tour?.tourPois) return '';
        const tp = tour.tourPois.find(p => p.poiId === poiId);
        return tp?.poi?.nameVi || poiId;
    };

    const renderNarrationType = (type: NarrationType, toPoiId: string | null) => {
        switch (type) {
            case 'INTRO':
                return (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Mic2 className="h-4 w-4" /> 🎬 CHÀO MỪNG (INTRO)
                    </div>
                );
            case 'TRANSITION':
                return (
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                        <RefreshCw className="h-4 w-4" /> 🚶 DI CHUYỂN (TRANSITION) → {getPoiName(toPoiId)}
                    </div>
                );
            case 'ARRIVAL':
                return (
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-4 w-4" /> 📍 ĐẾN NƠI (ARRIVAL) → {getPoiName(toPoiId)}
                    </div>
                );
            case 'OUTRO':
                return (
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <Music className="h-4 w-4" /> 🏁 KẾT THÚC (OUTRO)
                    </div>
                );
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                <div>
                    <h3 className="font-bold text-purple-900 flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Quản lý Thuyết minh Tour
                    </h3>
                    <p className="text-xs text-purple-700 mt-1">
                        Tự động tạo hoặc tùy chỉnh lời thuyết minh song ngữ cho toàn bộ hành trình.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAutoGenerate}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Tự động tạo scripts
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerateTts}
                        disabled={loading || narrations.length === 0}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Music className="h-4 w-4 mr-2" />
                        Tạo âm thanh (TTS)
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-700">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    {success}
                </div>
            )}

            {narrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Info className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Chưa có thuyết minh nào được tạo cho tour này.</p>
                    <button
                        onClick={handleAutoGenerate}
                        className="mt-4 text-purple-600 font-bold hover:underline"
                    >
                        Nhấn để tự động tạo ngay
                    </button>
                </div>
            ) : (
                <div className="relative pb-10">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-slate-200"></div>

                    <div className="space-y-8 relative">
                        {narrations.map((narration) => (
                            <div key={narration.id} className="ml-14 group">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[3.25rem] mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-300 shadow-sm transition-colors group-hover:bg-purple-500 z-10"></div>
                                
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 rounded-t-xl flex items-center justify-between">
                                        {renderNarrationType(narration.type, narration.toPoiId)}
                                        <div className="flex gap-2">
                                            {narration.audioViUrl && (
                                                <button
                                                    onClick={() => playAudio(narration.audioViUrl!)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Nghe tiếng Việt"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </button>
                                            )}
                                            {narration.audioEnUrl && (
                                                <button
                                                    onClick={() => playAudio(narration.audioEnUrl!)}
                                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                    title="Nghe tiếng Anh"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSingleTts(narration.id)}
                                                disabled={loading}
                                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                title="Cập nhật TTS"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Tiếng Việt
                                            </label>
                                            <textarea
                                                className="w-full text-sm border-0 focus:ring-0 p-0 text-slate-700 bg-transparent min-h-[60px] resize-none"
                                                placeholder="Nhập thuyết minh tiếng Việt..."
                                                value={localScripts[narration.id]?.scriptVi || ''}
                                                onChange={(e) => handleScriptChange(narration.id, 'scriptVi', e.target.value)}
                                            />
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l border-slate-100 md:pl-4 pt-4 md:pt-0">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                English
                                            </label>
                                            <textarea
                                                className="w-full text-sm border-0 focus:ring-0 p-0 text-slate-700 bg-transparent min-h-[60px] resize-none"
                                                placeholder="Enter English narration..."
                                                value={localScripts[narration.id]?.scriptEn || ''}
                                                onChange={(e) => handleScriptChange(narration.id, 'scriptEn', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                            Lưu tất cả thay đổi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourNarrationTab;

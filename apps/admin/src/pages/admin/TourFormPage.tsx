import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Map,
    Loader2,
    AlertCircle,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    GripVertical,
} from 'lucide-react';
import { tourService, type Tour, type TourPayload, type TourStatus } from '../../services/tour.service';
import { poiService, type POI } from '../../services/poi.service';

type EditableStop = {
    stopId?: string;
    poi: POI;
    estimatedStayMinutes?: number;
    transitionNote?: string;
    customIntro?: string;
    titleOverride?: string;
    descriptionOverride?: string;
    isRequired: boolean;
};

const TourFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<{
        name: string;
        nameEn: string;
        description: string;
        descriptionEn: string;
        estimatedDuration: number;
        status: TourStatus;
    }>({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        estimatedDuration: 60,
        status: 'DRAFT',
    });

    const [allPois, setAllPois] = useState<POI[]>([]);
    const [selectedStops, setSelectedStops] = useState<EditableStop[]>([]);
    const [isPoiModalOpen, setIsPoiModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setFetching(true);
            try {
                const poisResponse = await poiService.getAll({ status: 'ACTIVE' });
                setAllPois(poisResponse.data || []);

                if (id) {
                    const tour: Tour = await tourService.getOne(id);
                    setFormData({
                        name: tour.nameVi,
                        nameEn: tour.nameEn || '',
                        description: tour.descriptionVi || '',
                        descriptionEn: tour.descriptionEn || '',
                        estimatedDuration: tour.estimatedDuration || 60,
                        status: tour.status,
                    });

                    const sortedStops = [...(tour.tourPois || [])].sort((a, b) => a.orderIndex - b.orderIndex);
                    const mapped = sortedStops
                        .filter((tp) => tp.poi)
                        .map((tp) => ({
                            stopId: tp.id,
                            poi: tp.poi!,
                            estimatedStayMinutes: tp.estimatedStayMinutes,
                            transitionNote: tp.transitionNote || '',
                            customIntro: tp.customIntro || '',
                            titleOverride: tp.titleOverride || '',
                            descriptionOverride: tp.descriptionOverride || '',
                            isRequired: tp.isRequired ?? true,
                        }));
                    setSelectedStops(mapped);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load data. Please refresh.');
            } finally {
                setFetching(false);
            }
        };

        loadData();
    }, [id]);

    const validationIssues = useMemo(() => {
        const issues: string[] = [];
        const title = formData.name.trim();
        if (!title) {
            issues.push('Tour title is required.');
        }

        if (formData.status === 'PUBLISHED' && selectedStops.length < 2) {
            issues.push('Published tour must have at least 2 stops.');
        }

        const ids = selectedStops.map((s) => s.poi.id);
        if (new Set(ids).size !== ids.length) {
            issues.push('Duplicate POIs are not allowed in one tour.');
        }

        selectedStops.forEach((stop, index) => {
            if (!stop.poi?.id) {
                issues.push(`Stop #${index + 1} has invalid POI.`);
            }
            if (stop.estimatedStayMinutes !== undefined && stop.estimatedStayMinutes <= 0) {
                issues.push(`Stop #${index + 1} estimated stay must be greater than 0.`);
            }
        });

        return issues;
    }, [formData.name, formData.status, selectedStops]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === 'estimatedDuration' ? Number(value) : value }));
    };

    const updateStopField = (index: number, patch: Partial<EditableStop>) => {
        setSelectedStops((prev) => prev.map((stop, idx) => (idx === index ? { ...stop, ...patch } : stop)));
    };

    const handleAddPoi = (poi: POI) => {
        if (selectedStops.some((s) => s.poi.id === poi.id)) {
            setIsPoiModalOpen(false);
            return;
        }
        setSelectedStops((prev) => [
            ...prev,
            {
                poi,
                isRequired: true,
                estimatedStayMinutes: undefined,
                transitionNote: '',
                customIntro: '',
                titleOverride: '',
                descriptionOverride: '',
            },
        ]);
        setIsPoiModalOpen(false);
    };

    const handleRemoveStop = (index: number) => {
        setSelectedStops((prev) => prev.filter((_, idx) => idx !== index));
    };

    const moveStop = (index: number, direction: 'up' | 'down') => {
        const next = [...selectedStops];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setSelectedStops(next);
    };

    const syncStopsForTour = async (tourId: string) => {
        const current = isEditMode ? await tourService.getOne(tourId) : null;
        const currentStops = current?.tourPois || [];

        const selectedStopIds = new Set(selectedStops.map((s) => s.stopId).filter(Boolean));

        if (currentStops.length) {
            const toRemove = currentStops.filter((s) => !selectedStopIds.has(s.id));
            for (const stop of toRemove) {
                await tourService.removeStop(tourId, stop.id);
            }
        }

        for (let index = 0; index < selectedStops.length; index += 1) {
            const stop = selectedStops[index];
            const payload = {
                orderIndex: index,
                estimatedStayMinutes: stop.estimatedStayMinutes,
                transitionNote: stop.transitionNote || undefined,
                customIntro: stop.customIntro || undefined,
                titleOverride: stop.titleOverride || undefined,
                descriptionOverride: stop.descriptionOverride || undefined,
                isRequired: stop.isRequired,
            };

            if (stop.stopId) {
                await tourService.updateStop(tourId, stop.stopId, payload);
            } else {
                const updatedTour = await tourService.addStop(tourId, {
                    poiId: stop.poi.id,
                    ...payload,
                });
                const freshStop = updatedTour.tourPois
                    ?.find((s) => s.poiId === stop.poi.id)
                    ?.id;
                if (freshStop) {
                    updateStopField(index, { stopId: freshStop });
                }
            }
        }

        const refreshed = await tourService.getOne(tourId);
        const sorted = [...(refreshed.tourPois || [])].sort((a, b) => a.orderIndex - b.orderIndex);
        const merged: EditableStop[] = sorted
            .filter((tp) => tp.poi)
            .map((tp) => ({
                stopId: tp.id,
                poi: tp.poi!,
                estimatedStayMinutes: tp.estimatedStayMinutes,
                transitionNote: tp.transitionNote || '',
                customIntro: tp.customIntro || '',
                titleOverride: tp.titleOverride || '',
                descriptionOverride: tp.descriptionOverride || '',
                isRequired: tp.isRequired ?? true,
            }));
        setSelectedStops(merged);
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (validationIssues.length > 0) {
            setError(validationIssues[0]);
            setLoading(false);
            return;
        }

        try {
            const payload: TourPayload = {
                nameVi: formData.name.trim(),
                nameEn: formData.nameEn.trim() || undefined,
                descriptionVi: formData.description.trim() || undefined,
                descriptionEn: formData.descriptionEn.trim() || undefined,
                estimatedDuration: Number(formData.estimatedDuration),
            };

            let tourId = id;
            if (isEditMode) {
                if (!id) {
                    throw new Error('Tour id not found in edit mode');
                }
                await tourService.update(id, { ...payload, status: formData.status });
            } else {
                // Create as DRAFT first so stops can be attached before publish validation.
                const created = await tourService.create({ ...payload, status: 'DRAFT' });
                tourId = created.id;
            }

            if (!tourId) {
                throw new Error('Tour id not found');
            }

            await syncStopsForTour(tourId);

            if (formData.status === 'PUBLISHED') {
                await tourService.publish(tourId);
            }

            navigate('/admin/tours');
        } catch (err: unknown) {
            console.error('Save Tour error:', err);
            const msg =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { message?: unknown } } }).response?.data?.message
                    : undefined;
            let resolvedMessage = 'Failed to save Tour.';
            if (typeof msg === 'string') {
                resolvedMessage = msg;
            } else if (Array.isArray(msg)) {
                resolvedMessage = msg.join(', ');
            }
            setError(resolvedMessage);
        } finally {
            setLoading(false);
        }
    };

    const availablePois = allPois.filter((poi) => !selectedStops.some((s) => s.poi.id === poi.id));

    let pageTitle = 'Create New Tour';
    if (isEditMode && readOnly) {
        pageTitle = 'View Tour';
    } else if (isEditMode) {
        pageTitle = 'Edit Tour';
    }

    let submitLabel = 'Create Tour';
    if (loading) {
        submitLabel = 'Saving...';
    } else if (isEditMode) {
        submitLabel = 'Update Tour';
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {pageTitle}
                    </h1>
                    <p className="text-sm text-slate-500">Structured tour with stop metadata and publish validation.</p>
                </div>
            </div>

            {validationIssues.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="font-semibold text-amber-800 mb-2">Validation Panel</div>
                    <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                        {validationIssues.map((issue) => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Map className="h-4 w-4 text-blue-600" />
                            Basic Info
                        </h2>
                        <div>
                            <label htmlFor="tour-name-vi" className="block text-sm font-medium text-slate-700 mb-1">Tour Name (VI) *</label>
                            <input
                                id="tour-name-vi"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label htmlFor="tour-name-en" className="block text-sm font-medium text-slate-700 mb-1">Tour Name (EN)</label>
                            <input
                                id="tour-name-en"
                                name="nameEn"
                                value={formData.nameEn}
                                onChange={handleChange}
                                disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label htmlFor="tour-description-vi" className="block text-sm font-medium text-slate-700 mb-1">Description (VI)</label>
                            <textarea
                                id="tour-description-vi"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label htmlFor="tour-description-en" className="block text-sm font-medium text-slate-700 mb-1">Description (EN)</label>
                            <textarea
                                id="tour-description-en"
                                name="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={handleChange}
                                rows={3}
                                disabled={readOnly}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tour-estimated-duration" className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                                <input
                                    id="tour-estimated-duration"
                                    name="estimatedDuration"
                                    type="number"
                                    min={1}
                                    value={formData.estimatedDuration}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label htmlFor="tour-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    id="tour-status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900">Stops ({selectedStops.length})</h2>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => setIsPoiModalOpen(true)}
                                    className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add POI
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                            {selectedStops.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                                    No stop added yet.
                                </div>
                            )}

                            {selectedStops.map((stop, index) => (
                                <div key={`${stop.poi.id}-${index}`} className="rounded-lg border border-slate-200 p-3 space-y-3 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center gap-1 text-slate-400">
                                            {!readOnly && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveStop(index, 'up')}
                                                        disabled={index === 0}
                                                        className="hover:text-blue-600 disabled:opacity-20"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </button>
                                                    <GripVertical className="h-4 w-4 opacity-50" />
                                                    <button
                                                        type="button"
                                                        onClick={() => moveStop(index, 'down')}
                                                        disabled={index === selectedStops.length - 1}
                                                        className="hover:text-blue-600 disabled:opacity-20"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="h-10 w-10 flex-none bg-slate-200 rounded-md flex items-center justify-center">
                                            <Map className="h-5 w-5 text-slate-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-slate-500">Stop {index + 1}</div>
                                            <div className="text-sm font-semibold text-slate-900 truncate">{stop.poi.nameVi}</div>
                                        </div>

                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStop(index)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor={`stop-estimated-stay-${index}`} className="block text-xs font-medium text-slate-600 mb-1">Estimated stay (minutes)</label>
                                            <input
                                                id={`stop-estimated-stay-${index}`}
                                                type="number"
                                                min={1}
                                                value={stop.estimatedStayMinutes ?? ''}
                                                disabled={readOnly}
                                                onChange={(e) =>
                                                    updateStopField(index, {
                                                        estimatedStayMinutes: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <label htmlFor={`stop-required-${index}`} className="inline-flex items-center gap-2 text-sm text-slate-700">
                                                <input
                                                    id={`stop-required-${index}`}
                                                    type="checkbox"
                                                    checked={stop.isRequired}
                                                    disabled={readOnly}
                                                    onChange={(e) => updateStopField(index, { isRequired: e.target.checked })}
                                                />
                                                <span>Required stop</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label htmlFor={`stop-title-override-${index}`} className="block text-xs font-medium text-slate-600 mb-1">Title override</label>
                                            <input
                                                id={`stop-title-override-${index}`}
                                                value={stop.titleOverride || ''}
                                                disabled={readOnly}
                                                onChange={(e) => updateStopField(index, { titleOverride: e.target.value })}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`stop-transition-note-${index}`} className="block text-xs font-medium text-slate-600 mb-1">Transition note</label>
                                            <input
                                                id={`stop-transition-note-${index}`}
                                                value={stop.transitionNote || ''}
                                                disabled={readOnly}
                                                onChange={(e) => updateStopField(index, { transitionNote: e.target.value })}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor={`stop-custom-intro-${index}`} className="block text-xs font-medium text-slate-600 mb-1">Custom intro</label>
                                        <textarea
                                            id={`stop-custom-intro-${index}`}
                                            rows={2}
                                            value={stop.customIntro || ''}
                                            disabled={readOnly}
                                            onChange={(e) => updateStopField(index, { customIntro: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor={`stop-description-override-${index}`} className="block text-xs font-medium text-slate-600 mb-1">Description override</label>
                                        <textarea
                                            id={`stop-description-override-${index}`}
                                            rows={2}
                                            value={stop.descriptionOverride || ''}
                                            disabled={readOnly}
                                            onChange={(e) => updateStopField(index, { descriptionOverride: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
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
                            {submitLabel}
                        </button>
                    )}
                </div>
            </form>

            {isPoiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Add Stop to Tour</h3>
                            <button onClick={() => setIsPoiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-2">
                            {availablePois.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No available POIs found.</p>
                            ) : (
                                availablePois.map((poi) => (
                                    <button
                                        key={poi.id}
                                        onClick={() => handleAddPoi(poi)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                                    >
                                        <div className="h-10 w-10 flex-none bg-slate-200 rounded-md flex items-center justify-center">
                                            <Map className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{poi.nameVi}</p>
                                            <p className="text-xs text-slate-500">{poi.category}</p>
                                        </div>
                                        <Plus className="h-4 w-4 text-blue-600 ml-auto" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TourFormPage;

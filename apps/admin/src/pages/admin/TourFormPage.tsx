import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Map, Loader2, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { tourService } from '../../services/tour.service';
import { poiService } from '../../services/poi.service';

const TourFormPage = ({ readOnly = false }: { readOnly?: boolean }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        estimatedDuration: 60, // default 60 mins
        status: 'DRAFT',
    });

    // POI Selection State
    const [allPois, setAllPois] = useState<any[]>([]);
    const [selectedPois, setSelectedPois] = useState<any[]>([]); // Array of POI objects
    const [isPoiModalOpen, setIsPoiModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setFetching(true);
            try {
                // Fetch all published POIs for selection
                // Assuming query params: { status: 'ACTIVE' }
                const pois = await poiService.getAll({ status: 'ACTIVE' });
                setAllPois(pois.data || []); // Adjust based on API response structure (PaginationResult)

                // If Edit mode, fetch Tour details
                if (id) {
                    const tour: any = await tourService.getOne(id);
                    setFormData({
                        name: tour.nameVi,
                        nameEn: tour.nameEn || '',
                        description: tour.descriptionVi || '',
                        descriptionEn: tour.descriptionEn || '',
                        estimatedDuration: tour.estimatedDuration || 60,
                        status: tour.status,
                    });

                    // Sort tourPois by orderIndex and extract POI details
                    if (tour.tourPois && tour.tourPois.length > 0) {
                        const sorted = [...tour.tourPois].sort((a, b) => a.orderIndex - b.orderIndex);
                        const mappedPois = sorted.map(tp => tp.poi);
                        setSelectedPois(mappedPois);
                    }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddPoi = (poi: any) => {
        if (!selectedPois.find(p => p.id === poi.id)) {
            setSelectedPois([...selectedPois, poi]);
        }
        setIsPoiModalOpen(false);
    };

    const handleRemovePoi = (poiId: string) => {
        setSelectedPois(selectedPois.filter(p => p.id !== poiId));
    };

    const movePoi = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === selectedPois.length - 1)) return;

        const newPois = [...selectedPois];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newPois[index], newPois[swapIndex]] = [newPois[swapIndex], newPois[index]];
        setSelectedPois(newPois);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (selectedPois.length < 2 && formData.status === 'PUBLISHED') {
            setError('A published tour must have at least 2 POIs.');
            setLoading(false);
            return;
        }

        try {
            const payload: any = {
                nameVi: formData.name,
                nameEn: formData.nameEn,
                descriptionVi: formData.description,
                descriptionEn: formData.descriptionEn,
                estimatedDuration: Number(formData.estimatedDuration),
            };

            let tourId = id;

            if (isEditMode) {
                payload.status = formData.status;
                await tourService.update(id!, payload);
            } else {
                const newTour = await tourService.create(payload);
                tourId = newTour.id;
            }

            // Update POIs (setTourPois)
            // Backend expects { poiIds: ["id1", "id2", ...] } in order
            if (tourId) {
                const poiIds = selectedPois.map(p => p.id);
                await tourService.setPois(tourId, poiIds);
            }

            alert(`Tour ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/admin/tours');
        } catch (err: any) {
            console.error('Save Tour error:', err);
            const msg = err.response?.data?.message || 'Failed to save Tour.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Filter available POIs (exclude already selected)
    const availablePois = allPois.filter(p => !selectedPois.find(sp => sp.id === p.id));

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {isEditMode ? (readOnly ? 'View Tour' : 'Edit Tour') : 'Create New Tour'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isEditMode ? 'Manage stops and details for this tour.' : 'Design a new walking tour.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Map className="h-4 w-4 text-blue-600" />
                                Tour Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tour Name (VI) *</label>
                                <input name="name" value={formData.name} onChange={handleChange} required minLength={2} disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tour Name (EN)</label>
                                <input name="nameEn" value={formData.nameEn} onChange={handleChange} disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (VI)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (EN)</label>
                                <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} rows={3} disabled={readOnly}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                                    <input name="estimatedDuration" type="number" value={formData.estimatedDuration} onChange={handleChange} disabled={readOnly}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} disabled={!isEditMode || readOnly}
                                        className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 ${(!isEditMode || readOnly) ? 'opacity-50' : ''}`}>
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: POI List (Stops) */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-900">
                                    Tour Stops ({selectedPois.length})
                                </h2>
                                {!readOnly && (
                                    <button type="button" onClick={() => setIsPoiModalOpen(true)}
                                        className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Add POI
                                    </button>
                                )}
                            </div>

                            {/* POI List */}
                            <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-1">
                                {selectedPois.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                                        <p className="text-sm text-slate-400">No stops added yet.</p>
                                        <p className="text-xs text-slate-400">Add POIs to create a route.</p>
                                    </div>
                                ) : (
                                    selectedPois.map((poi, index) => (
                                        <div key={poi.id} className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-all">
                                            <div className="flex-none flex flex-col items-center justify-center gap-1 text-slate-400">
                                                {!readOnly && (
                                                    <>
                                                        <button type="button" onClick={() => movePoi(index, 'up')} disabled={index === 0} className="hover:text-blue-600 disabled:opacity-20">
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                        <GripVertical className="h-4 w-4 opacity-50" />
                                                        <button type="button" onClick={() => movePoi(index, 'down')} disabled={index === selectedPois.length - 1} className="hover:text-blue-600 disabled:opacity-20">
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                )}
                                                {readOnly && <span className="text-xs font-bold text-slate-500">{index + 1}</span>}
                                            </div>

                                            <div className="h-10 w-10 flex-none bg-slate-200 rounded-md overflow-hidden">
                                                {/* Placeholder for image */}
                                                <Map className="h-5 w-5 text-slate-400 m-auto h-full" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{poi.nameVi}</p>
                                                <p className="text-xs text-slate-500 truncate">{poi.descriptionVi}</p>
                                            </div>

                                            {!readOnly && (
                                                <button type="button" onClick={() => handleRemovePoi(poi.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
                        {readOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!readOnly && (
                        <button type="submit"
                            disabled={loading}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {loading ? 'Saving...' : (isEditMode ? 'Update Tour' : 'Create Tour')}
                        </button>
                    )}
                </div>
            </form>

            {/* Add POI Modal */}
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
                                availablePois.map(poi => (
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Map, Plus, Search, Eye, Edit, Trash2,
    Clock, MapPin, Loader2, AlertCircle
} from 'lucide-react';
import { tourService, type Tour } from '../../services/tour.service';

const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    ARCHIVED: 'bg-slate-50 text-slate-700 ring-slate-600/20',
};

const TourListPage = () => {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        setLoading(true);
        try {
            const res = await tourService.getAll();
            setTours(res.data);
        } catch (err) {
            console.error('Failed to fetch tours:', err);
            setError('Failed to load tours.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tour?')) return;
        try {
            await tourService.delete(id);
            setTours(tours.filter(t => t.id !== id));
        } catch (err) {
            alert('Failed to delete tour');
        }
    };

    const filtered = tours.filter(t =>
        t.nameVi.toLowerCase().includes(search.toLowerCase()) ||
        (t.nameEn && t.nameEn.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading && tours.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tours</h1>
                    <p className="text-sm text-slate-500">Create and manage walking tours.</p>
                </div>
                <Link
                    to="/admin/tours/new"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tour
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tours..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Tour Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Map className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No tours found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                        Try adjusting your search or create a new tour to get started.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filtered.map((tour) => (
                        <div key={tour.id} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <Map className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{tour.nameVi}</h3>
                                        {tour.nameEn && <p className="text-xs text-slate-400">{tour.nameEn}</p>}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[tour.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {tour.status}
                                </span>
                            </div>

                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{tour.descriptionVi}</p>

                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {tour._count?.tourPois || 0} stops
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {tour.estimatedDuration || 0} min
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
                                <Link to={`/admin/tours/${tour.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="View">
                                    <Eye className="h-4 w-4" />
                                </Link>
                                <Link to={`/admin/tours/${tour.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Edit">
                                    <Edit className="h-4 w-4" />
                                </Link>
                                <button onClick={() => handleDelete(tour.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TourListPage;

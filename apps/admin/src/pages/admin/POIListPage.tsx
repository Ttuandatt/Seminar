import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Eye, Edit, Trash2, Star, ChevronLeft, ChevronRight, Loader2, AlertCircle, MapPin
} from 'lucide-react';
import { poiService } from '../../services/poi.service';

const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    ARCHIVED: 'bg-slate-50 text-slate-600 ring-slate-500/20',
};

const POIListPage = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;

    // Fetch POIs
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['pois', page, search],
        queryFn: () => poiService.getAll({ page, limit, search }),
        placeholderData: (prev) => prev,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: poiService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pois'] });
            alert('POI deleted successfully');
        },
        onError: (err) => {
            alert('Failed to delete POI');
            console.error(err);
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this POI?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600 gap-2">
                <AlertCircle className="h-6 w-6" />
                <span>Error loading POIs: {error.message}</span>
            </div>
        );
    }

    const pois = data?.data || [];
    const meta = data?.meta || { page: 1, limit: 10, total: 0, lastPage: 1 };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Points of Interest</h1>
                    <p className="text-sm text-slate-500">Manage all POIs in the GPS Tours system.</p>
                </div>
                <Link
                    to="/admin/pois/new"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New POI
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search POIs by name..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-3.5 font-medium text-slate-500">POI</th>
                                <th className="px-6 py-3.5 font-medium text-slate-500">Category</th>
                                <th className="px-6 py-3.5 font-medium text-slate-500">Rating</th>
                                <th className="px-6 py-3.5 font-medium text-slate-500">Views</th>
                                <th className="px-6 py-3.5 font-medium text-slate-500">Status</th>
                                <th className="px-6 py-3.5 font-medium text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pois.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="rounded-full bg-slate-100 p-3 mb-4">
                                                <MapPin className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-900">No POIs found</h3>
                                            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                                                {search ? 'Try adjusting your search terms.' : 'Get started by creating your first Point of Interest.'}
                                            </p>
                                            {!search && (
                                                <Link
                                                    to="/admin/pois/new"
                                                    className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create POI
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pois.map((poi) => (
                                    <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg">
                                                    🏛️
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{poi.nameVi}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{poi.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {poi.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                <span className="font-medium text-slate-700">{poi.rating || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-slate-600">{poi.views}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[poi.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {poi.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link to={`/admin/pois/${poi.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link to={`/admin/pois/${poi.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(poi.id)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.lastPage > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium">{((page - 1) * limit) + 1}</span>-
                            <span className="font-medium">{Math.min(page * limit, meta.total)}</span> of
                            <span className="font-medium">{meta.total}</span> POIs
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium px-2">Page {page} of {meta.lastPage}</span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                                disabled={page === meta.lastPage}
                                className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POIListPage;

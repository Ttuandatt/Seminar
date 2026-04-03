import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle, MapPin,
    List, Map as MapIcon, Pencil, Headphones,
} from 'lucide-react';
import { MapContainer, Marker, Circle, Popup } from 'react-leaflet';
import { poiService, POI_CATEGORY_OPTIONS, POI_CATEGORY_LABELS, type PoiCategory } from '../../services/poi.service';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import MapControls, { FitBounds } from '../../components/map/MapControls';
import { HCM_CENTER, CATEGORY_COLORS, STATUS_COLORS, createColoredIcon } from '../../components/map/map-utils';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    ARCHIVED: 'bg-slate-50 text-slate-600 ring-slate-500/20',
};

const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    PUBLISHED: 'Published',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived',
};

const statusFilterOptions = [
    { label: 'All statuses', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Archived', value: 'ARCHIVED' },
];

const categoryFilterOptions = [
    { label: 'All categories', value: 'ALL' },
    ...POI_CATEGORY_OPTIONS,
];

type ViewMode = 'list' | 'map';

const POIListPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | PoiCategory>('ALL');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const { showToast } = useToast();
    const limit = 10;

    // Fetch POIs (paginated for list)
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['pois', page, search, statusFilter, categoryFilter],
        queryFn: () => poiService.getAll({
            page,
            limit,
            search: search || undefined,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        }),
        placeholderData: (prev) => prev,
    });

    // Fetch all POIs for map view (no pagination)
    const { data: mapData } = useQuery({
        queryKey: ['pois-map', search, statusFilter, categoryFilter],
        queryFn: () => poiService.getAll({
            limit: 500,
            search: search || undefined,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        }),
        enabled: viewMode === 'map',
    });

    const mapPois = useMemo(() => mapData?.data ?? [], [mapData]);

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: poiService.delete,
        onSuccess: (_, poiId) => {
            queryClient.invalidateQueries({ queryKey: ['pois'] });
            showToast({
                variant: 'success',
                title: 'Deleted POI',
                description: deleteTarget?.id === poiId ? `${deleteTarget.name} has been deleted.` : 'POI has been deleted.',
            });
            setDeleteTarget(null);
        },
        onError: (err) => {
            console.error(err);
            showToast({
                variant: 'error',
                title: 'Delete failed',
                description: 'Could not delete POI. Please try again.',
            });
        }
    });

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
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

    const pois = data?.data ?? [];
    const pagination = data?.pagination ?? { page: 1, limit, total: 0, totalPages: 1 };
    const startIndex = pois.length === 0 ? 0 : ((page - 1) * limit) + 1;
    const endIndex = pois.length === 0 ? 0 : startIndex + pois.length - 1;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Points of Interest</h1>
                    <p className="text-sm text-slate-500">Manage all POIs in the GPS Tours system.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <List className="h-4 w-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <MapIcon className="h-4 w-4" />
                            Map
                        </button>
                    </div>
                    <Link
                        to="/admin/pois/new"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New POI
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
                        className="w-full sm:w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                    >
                        {statusFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value as typeof categoryFilter); setPage(1); }}
                        className="w-full sm:w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                    >
                        {categoryFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content: List or Map */}
            {viewMode === 'list' ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-3.5 font-medium text-slate-500">POI</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500">Category</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500">Owner</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500">Tours</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500">Views</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500">Status</th>
                                    <th className="px-6 py-3.5 font-medium text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pois.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
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
                                                        {poi.nameEn && (
                                                            <p className="text-xs text-slate-400">{poi.nameEn}</p>
                                                        )}
                                                        <p className="text-xs text-slate-500 truncate max-w-[220px]">
                                                            {poi.latitude?.toFixed(4)}, {poi.longitude?.toFixed(4)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                    {POI_CATEGORY_LABELS[poi.category] || poi.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">
                                                    {poi.owner?.shopOwnerProfile?.shopName || poi.owner?.fullName || '\u2014'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-700">{poi._count?.tourPois ?? 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-slate-600">{poi._count?.viewHistory ?? 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[poi.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {statusLabels[poi.status] || poi.status}
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
                                                        onClick={() => setDeleteTarget({ id: poi.id, name: poi.nameVi })}
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
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-medium">{startIndex}</span>-
                                <span className="font-medium">{endIndex}</span> of{' '}
                                <span className="font-medium">{pagination.total}</span> POIs
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-medium px-2">Page {page} of {pagination.totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Map View */
                <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 280px)' }}>
                        <MapContainer
                            center={HCM_CENTER}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom
                        >
                            <MapControls onLocateError={(msg) => showToast({ variant: 'error', title: 'Location error', description: msg })} />
                            <FitBounds positions={mapPois.map(p => [Number(p.latitude), Number(p.longitude)])} />

                            {mapPois.map(poi => {
                                const color = CATEGORY_COLORS[poi.category] || '#f97316';
                                const lat = Number(poi.latitude);
                                const lng = Number(poi.longitude);
                                const hasAudio = poi.media?.some(m => m.type === 'AUDIO');

                                return (
                                    <span key={poi.id}>
                                        <Circle
                                            center={[lat, lng]}
                                            radius={poi.triggerRadius || 15}
                                            pathOptions={{
                                                color: STATUS_COLORS[poi.status] || '#94a3b8',
                                                fillColor: color,
                                                fillOpacity: 0.12,
                                                weight: 1.5,
                                            }}
                                        />
                                        <Marker position={[lat, lng]} icon={createColoredIcon(color)}>
                                            <Popup minWidth={220} maxWidth={300}>
                                                <div className="space-y-2 text-sm">
                                                    <div className="font-bold text-base text-slate-900">{poi.nameVi}</div>
                                                    {poi.nameEn && <div className="text-slate-500 text-xs">{poi.nameEn}</div>}
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                            style={{ backgroundColor: `${color}20`, color }}
                                                        >
                                                            {POI_CATEGORY_LABELS[poi.category] || poi.category}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                            style={{ backgroundColor: `${STATUS_COLORS[poi.status]}20`, color: STATUS_COLORS[poi.status] }}
                                                        >
                                                            {statusLabels[poi.status] || poi.status}
                                                        </span>
                                                        {hasAudio && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                                                <Headphones className="h-3 w-3" /> Audio
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400">Radius: {poi.triggerRadius}m</div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            onClick={() => navigate(`/admin/pois/${poi.id}`)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                                        >
                                                            <Eye className="h-3 w-3" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/pois/${poi.id}/edit`)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                                                        >
                                                            <Pencil className="h-3 w-3" /> Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </span>
                                );
                            })}
                        </MapContainer>
                    </div>

                    {/* Map Footer: count + legend */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <span className="text-sm font-medium text-slate-700">
                            {mapPois.length} POI{mapPois.length !== 1 ? 's' : ''} on map
                        </span>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                                <div key={cat} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                    {POI_CATEGORY_LABELS[cat as PoiCategory] || cat}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={deleteTarget ? `Delete POI "${deleteTarget.name}"?` : 'Delete POI'}
                description="This POI will be marked as deleted and hidden from all lists."
                confirmLabel="Delete POI"
                cancelLabel="Cancel"
                isDanger
                isLoading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => (!deleteMutation.isPending ? setDeleteTarget(null) : null)}
            />
        </div>
    );
};

export default POIListPage;

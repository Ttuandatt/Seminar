import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, AlertCircle, Plus, Edit3, ExternalLink, Clock3, MapPin, ShieldAlert, Trash2, List, Map as MapIcon } from 'lucide-react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import { shopOwnerPortalService, type ShopOwnerPOIStatus } from '../../services/shopOwnerPortal.service';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastProvider';
import MapControls, { FitBounds } from '../../components/map/MapControls';
import { HCM_CENTER } from '../../components/map/map-utils';

const statusStyles: Record<ShopOwnerPOIStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN_REVIEW: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

type ViewMode = 'list' | 'map';

const ShopOwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-owner', 'overview'],
    queryFn: shopOwnerPortalService.getOverview,
  });

  const deleteMutation = useMutation({
    mutationFn: (poiId: string) => shopOwnerPortalService.deletePoi(poiId),
    onSuccess: (response, poiId) => {
      showToast({
        variant: 'success',
        title: 'Deleted POI',
        description: response?.message || 'POI has been removed from your account.',
      });
      refetch();
      if (deleteTarget?.id === poiId) {
        setDeleteTarget(null);
      }
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Could not delete POI. Please try again.';
      showToast({ variant: 'error', title: 'Delete failed', description: message });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Could not load data.';
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
        <AlertCircle className="mb-3 h-8 w-8" />
        <p className="mb-4 font-medium">{message}</p>
        <button
          onClick={() => refetch()}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const overview = data!;

  const handleCreatePOI = () => {
    navigate('/owner/pois/new');
  };

  const confirmDeletePoi = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const poisWithCoords = overview.pois.filter(poi => poi.latitude && poi.longitude);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S13 &bull; My POIs</p>
          <h1 className="text-3xl font-bold text-slate-900">Manage your locations</h1>
          <p className="text-sm text-slate-500">Quick overview of your POI status and recent actions.</p>
        </div>
        <button
          onClick={handleCreatePOI}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New POI
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {overview.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-emerald-600">{stat.change}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">My POIs</h2>
            <p className="text-sm text-slate-500">Only showing POIs owned by you. You can edit or delete them at any time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <MapIcon className="h-4 w-4" />
                Map
              </button>
            </div>
            <Link to="/owner/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="mt-4 divide-y divide-slate-100">
            {overview.pois.map((poi) => (
              <div key={poi.id} className="grid gap-4 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                    {poi.coverEmoji}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{poi.name}</p>
                    <p className="text-xs text-slate-500">{poi.address}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      Updated {poi.lastUpdated}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:justify-center">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[poi.status]}`}>
                    {poi.status}
                  </span>
                  <div className="text-sm text-slate-500">
                    <p className="font-semibold text-slate-900">{poi.views} views</p>
                    <p>{poi.plays} audio plays</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/owner/pois/${poi.id}/edit`)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600"
                  >
                    <Edit3 className="mr-2 inline h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/owner/pois/${poi.id}`)}
                    className="rounded-full border border-slate-200 px-3 py-2 text-slate-500 hover:border-slate-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: poi.id, name: poi.name })}
                    disabled={deleteMutation.isPending && deleteMutation.variables === poi.id}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === poi.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden" style={{ height: 400 }}>
            <MapContainer
              center={HCM_CENTER}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <MapControls onLocateError={(msg) => showToast({ variant: 'error', title: 'Location error', description: msg })} />
              <FitBounds positions={poisWithCoords.map(poi => [poi.latitude!, poi.longitude!] as [number, number])} />

              {poisWithCoords.map(poi => (
                <Marker key={poi.id} position={[poi.latitude!, poi.longitude!]}>
                  <Popup minWidth={200}>
                    <div className="space-y-2 text-sm">
                      <div className="font-bold text-base text-slate-900">{poi.name}</div>
                      <div className="text-xs text-slate-500">{poi.address}</div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[poi.status]}`}>
                        {poi.status}
                      </span>
                      <div className="text-xs text-slate-500">
                        {poi.views} views &middot; {poi.plays} audio plays
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-5 py-4 text-sm text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5" />
          <div>
            {overview.tips.map((tip, idx) => (
              <p key={idx}>{tip}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span>Can't find the POI you're looking for?</span>
          <button onClick={handleCreatePOI} className="font-semibold text-blue-600 hover:text-blue-500">
            Add a new location
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete POI${deleteTarget ? `: ${deleteTarget.name}` : ''}`}
        description="This will remove the POI from your account. You can recreate it later if needed."
        confirmLabel="Delete POI"
        cancelLabel="Cancel"
        isDanger
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDeletePoi}
        onCancel={() => (!deleteMutation.isPending ? setDeleteTarget(null) : null)}
      />
    </div>
  );
};

export default ShopOwnerDashboardPage;

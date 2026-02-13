import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, Plus, Edit3, ExternalLink, Clock3, MapPin, ShieldAlert } from 'lucide-react';
import { shopOwnerPortalService, type ShopOwnerPOIStatus } from '../../services/shopOwnerPortal.service';

const statusStyles: Record<ShopOwnerPOIStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN_REVIEW: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

const ShopOwnerDashboardPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shop-owner', 'overview'],
    queryFn: shopOwnerPortalService.getOverview,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu.';
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
        <AlertCircle className="mb-3 h-8 w-8" />
        <p className="mb-4 font-medium">{message}</p>
        <button
          onClick={() => refetch()}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const overview = data!;

  const handleCreatePOI = () => {
    alert('Tính năng tạo POI sẽ ra mắt ở sprint tiếp theo.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S13 • My POIs</p>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý địa điểm của bạn</h1>
          <p className="text-sm text-slate-500">Xem nhanh trạng thái POI và hành động gần nhất.</p>
        </div>
        <button
          onClick={handleCreatePOI}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tạo POI mới
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
            <p className="text-sm text-slate-500">Chỉ hiển thị POIs thuộc quyền sở hữu của bạn.</p>
          </div>
          <Link to="/owner/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
            Xem tất cả
          </Link>
        </div>

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
                    Cập nhật {poi.lastUpdated}
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

              <div className="flex items-center justify-end gap-2">
                <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600">
                  <Edit3 className="mr-2 inline h-4 w-4" />
                  Chỉnh sửa
                </button>
                <button className="rounded-full border border-slate-200 px-3 py-2 text-slate-500 hover:border-slate-300">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
          <span>Không tìm thấy POI mong muốn?</span>
          <button onClick={handleCreatePOI} className="font-semibold text-blue-600 hover:text-blue-500">
            Thêm địa điểm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboardPage;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, Download, BarChart3 } from 'lucide-react';
import { shopOwnerPortalService, type ShopOwnerAnalytics } from '../../services/shopOwnerPortal.service';

const ranges: Array<{ value: '7d' | '30d' | '90d'; label: string }> = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '90d', label: '90 ngày qua' },
];

const ShopOwnerAnalyticsPage = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const { data, isLoading, isError, error } = useQuery<ShopOwnerAnalytics>({
    queryKey: ['shop-owner', 'analytics', range],
    queryFn: () => shopOwnerPortalService.getAnalytics(range),
  });

  const maxViews = Math.max(...(data?.daily.map((point) => point.views) || [1]));

  const handleExport = () => {
    alert('Tính năng export CSV sẽ có trong sprint tới.');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu analytics.';
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
        <AlertCircle className="mb-3 h-8 w-8" />
        <p className="font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S15 • Analytics</p>
          <h1 className="text-3xl font-bold text-slate-900">Hiệu suất nội dung</h1>
          <p className="text-sm text-slate-500">Theo dõi lượt xem, lượt nghe audio và tỷ lệ hoàn thành.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as '7d' | '30d' | '90d')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            {ranges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.summary.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-emerald-600">{card.change}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Daily performance</h2>
            <p className="text-sm text-slate-500">Views vs audio plays</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 text-sm text-slate-500 md:grid-cols-[1fr_auto]">
          <div className="flex items-end gap-4 overflow-x-auto pb-4">
            {data.daily.map((point) => (
              <div key={point.day} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1">
                  <div
                    className="w-3 rounded-full bg-blue-200"
                    style={{ height: `${(point.views / maxViews) * 140 || 10}px` }}
                    title={`${point.views} views`}
                  />
                  <div
                    className="w-3 rounded-full bg-blue-500"
                    style={{ height: `${(point.plays / maxViews) * 140 || 8}px` }}
                    title={`${point.plays} plays`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{point.day}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p><span className="inline-block h-3 w-3 rounded-full bg-blue-200 mr-1" /> Views</p>
            <p><span className="inline-block h-3 w-3 rounded-full bg-blue-500 mr-1" /> Audio plays</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Per-POI breakdown</h2>
            <p className="text-sm text-slate-500">So sánh giữa các chi nhánh.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">POI</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Audio plays</th>
                <th className="px-4 py-3">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.breakdown.map((poi) => (
                <tr key={poi.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{poi.name}</td>
                  <td className="px-4 py-3">{poi.views}</td>
                  <td className="px-4 py-3">{poi.plays}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${poi.completion}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{poi.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ShopOwnerAnalyticsPage;

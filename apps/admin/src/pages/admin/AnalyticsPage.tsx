import {
    MapPin, Map, Users, Eye,
    ArrowUpRight, ArrowDownRight, BarChart3, Activity
} from 'lucide-react';

const kpis = [
    { label: 'Total POIs', value: '25', change: '+12%', up: true, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Tours', value: '5', change: '+2', up: true, icon: Map, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Views', value: '4.8K', change: '+24%', up: true, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Users', value: '156', change: '-3%', up: false, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const topPOIs = [
    { name: 'Bến Nhà Rồng', views: 890, category: 'Historical' },
    { name: 'Landmark 81', views: 1024, category: 'Landmark' },
    { name: 'Phở Hòa Pasteur', views: 512, category: 'Food' },
    { name: 'Chùa Linh Ứng', views: 324, category: 'Temple' },
    { name: 'Quán Bún Mắm', views: 256, category: 'Food' },
];

const weeklyData = [
    { day: 'Mon', views: 120 },
    { day: 'Tue', views: 180 },
    { day: 'Wed', views: 150 },
    { day: 'Thu', views: 220 },
    { day: 'Fri', views: 300 },
    { day: 'Sat', views: 450 },
    { day: 'Sun', views: 380 },
];

const maxViews = Math.max(...weeklyData.map(d => d.views));

const AnalyticsPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
                <p className="text-sm text-slate-500">Overview of your GPS Tours performance.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`rounded-lg p-2.5 ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <span className={`flex items-center text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {kpi.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Weekly Chart */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Weekly Views
                        </h2>
                        <select className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none">
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="p-6">
                        <div className="flex items-end gap-3 h-48">
                            {weeklyData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs font-medium text-slate-600">{d.views}</span>
                                    <div
                                        className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                                        style={{ height: `${(d.views / maxViews) * 100}%` }}
                                        title={`${d.day}: ${d.views} views`}
                                    ></div>
                                    <span className="text-xs text-slate-500">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top POIs */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-600" />
                            Top POIs
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {topPOIs.map((poi, i) => (
                            <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{poi.name}</p>
                                    <p className="text-xs text-slate-500">{poi.category}</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    {poi.views}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

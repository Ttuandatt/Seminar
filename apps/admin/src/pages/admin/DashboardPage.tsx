import { 
  MapPin, 
  Map, 
  Users, 
  TrendingUp, 
  MoreHorizontal,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { 
    label: 'Total POIs', 
    value: '25', 
    change: '+3 this week', 
    icon: MapPin, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50' 
  },
  { 
    label: 'Active Tours', 
    value: '5', 
    change: 'Stable', 
    icon: Map, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50' 
  },
  { 
    label: 'Total Views', 
    value: '1.2K', 
    change: '+15% vs last week', 
    icon: Users, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50' 
  },
  { 
    label: 'Avg. Rating', 
    value: '4.8', 
    change: 'Top tier', 
    icon: TrendingUp, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50' 
  },
];

const recentActivity = [
  { id: 1, user: 'Admin', action: 'updated POI', target: 'Chùa Linh Ứng', time: '2 hours ago' },
  { id: 2, user: 'Nguyen Van Tung', action: 'created POI', target: 'Quán Bún Mắm Tùng', time: '5 hours ago' },
  { id: 3, user: 'Admin', action: 'published Tour', target: 'Food Tour Vĩnh Khánh', time: '1 day ago' },
  { id: 4, user: 'System', action: 'backup completed', target: 'Database', time: '2 days ago' },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/pois/new" className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
            <Plus className="mr-2 h-4 w-4" />
            New POI
          </Link>
          <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Create Tour
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="flex items-center font-medium text-emerald-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs ring-4 ring-white">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900">
                      <span className="font-semibold text-blue-600">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium text-slate-700">"{activity.target}"</span>
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tips / Chart Placeholder */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Growth Insights</h3>
          <p className="text-blue-100 text-sm mb-6">
            POI views increased by 24% this week. Most popular time is 7:00 PM.
          </p>
          <button className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Map,
  BarChart3,
  Settings,
  LogOut,
  Store,
} from 'lucide-react';
import api from '../../lib/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: MapPin, label: 'POIs', path: '/admin/pois' },
    { icon: Map, label: 'Tours', path: '/admin/tours' },
    { icon: Store, label: 'Merchants', path: '/admin/merchants' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 transition-transform hidden md:block">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span>GPS Tours</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-col justify-between h-[calc(100vh-4rem)] px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@gpstours.vn</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

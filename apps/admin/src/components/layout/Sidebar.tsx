import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Map,
  Globe,
  BarChart3,
  Settings,
  LogOut,
  Store,
  UserCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';
import { useAuth } from '../../contexts/AuthContext';

const getInitials = (fullName?: string) => {
  if (!fullName) return 'U';
  const parts = fullName.split(' ').filter(Boolean);
  if (!parts.length) return 'U';
  const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
};

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: MapPin, label: 'POIs', path: '/admin/pois' },
  { icon: Map, label: 'Tours', path: '/admin/tours' },
  { icon: Globe, label: 'Map View', path: '/admin/map' },
  { icon: Store, label: 'Merchants', path: '/admin/merchants' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: UserCircle2, label: 'Profile', path: '/admin/profile' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const shopOwnerNavItems = [
  { icon: MapPin, label: 'My POIs', path: '/owner/dashboard' },
  { icon: Globe, label: 'Map View', path: '/owner/map' },
  { icon: BarChart3, label: 'Analytics', path: '/owner/analytics' },
  { icon: UserCircle2, label: 'Profile', path: '/owner/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  const isShopOwner = user?.role === 'SHOP_OWNER';
  const navItems = isShopOwner ? shopOwnerNavItems : adminNavItems;
  const profilePath = isShopOwner ? '/owner/profile' : '/admin/profile';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

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
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName ?? 'Profile avatar'} className="h-full w-full object-cover" />
              ) : (
                getInitials(profile?.fullName)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.fullName ?? 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.email ?? user?.email ?? ''}</p>
            </div>
            <button
              onClick={() => navigate(profilePath)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
            >
              View
            </button>
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

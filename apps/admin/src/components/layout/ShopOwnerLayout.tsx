import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, BarChart3, User, LogOut, Loader2 } from 'lucide-react';
import { shopOwnerPortalService } from '../../services/shopOwnerPortal.service';

const navItems = [
  { label: 'My POIs', path: '/owner/dashboard', icon: MapPin },
  { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
  { label: 'Profile', path: '/owner/profile', icon: User },
];

const ShopOwnerLayout = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['shop-owner', 'profile'],
    queryFn: shopOwnerPortalService.getProfile,
  });

  useEffect(() => {
    if (!localStorage.getItem('ownerAccessToken')) {
      navigate('/owner/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ownerAccessToken');
    navigate('/owner/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white">
              {profile?.avatarEmoji || 'GPS'}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">GPS Tours Partner</p>
              <p className="text-lg font-semibold text-slate-900">{profile?.businessName || 'Loading...'}</p>
              <p className="text-sm text-slate-500">{profile?.address || 'Updating profile'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{profile?.ownerName || 'Shop Owner'}</p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default ShopOwnerLayout;

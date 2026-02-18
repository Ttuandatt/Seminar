import { Search, Bell, Menu, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/profile.service';

const getInitials = (fullName?: string) => {
  if (!fullName) return 'U';
  const parts = fullName.split(' ').filter(Boolean);
  if (!parts.length) return 'U';
  const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
};

const Header = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  const renderAvatar = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-slate-500" />;
    }

    if (profile?.avatarUrl) {
      return <img src={profile.avatarUrl} alt={profile.fullName ?? 'User avatar'} className="h-full w-full rounded-full object-cover" />;
    }

    return <span className="text-sm font-semibold text-slate-600">{getInitials(profile?.fullName)}</span>;
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search POIs, Tours..."
            className="h-10 w-48 md:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 hover:bg-slate-200 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            {renderAvatar()}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {profile?.fullName ?? (isLoading ? 'Đang tải...' : 'Hồ sơ cá nhân')}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;

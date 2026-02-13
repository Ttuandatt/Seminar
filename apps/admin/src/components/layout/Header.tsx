import { Search, Bell, User, Menu } from 'lucide-react';

const Header = () => {
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
        <button className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 hover:bg-slate-200 transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
             <User className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">Profile</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

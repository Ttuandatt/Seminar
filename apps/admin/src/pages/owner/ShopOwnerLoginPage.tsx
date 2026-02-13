import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { shopOwnerPortalService } from '../../services/shopOwnerPortal.service';

const ShopOwnerLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('ownerAccessToken')) {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [navigate]);

  const loginMutation = useMutation({
    mutationFn: shopOwnerPortalService.login,
    onSuccess: ({ token }) => {
      localStorage.setItem('ownerAccessToken', token);
      navigate('/owner/dashboard');
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-white px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-32 right-10 h-32 w-32 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <MapPin className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">GPS Tours</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Shop Owner Portal</h1>
          <p className="text-sm text-slate-500">Đăng nhập để quản lý POI và theo dõi hiệu quả.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="owner@domain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/owner/register" className="font-semibold text-blue-600 hover:text-blue-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ShopOwnerLoginPage;

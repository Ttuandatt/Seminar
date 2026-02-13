import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Mail, Lock, User, Phone, Store, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { shopOwnerPortalService } from '../../services/shopOwnerPortal.service';

const ShopOwnerRegisterPage = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
    phone: '',
  });

  const registerMutation = useMutation({
    mutationFn: shopOwnerPortalService.register,
    onSuccess: ({ token }) => {
      localStorage.setItem('ownerAccessToken', token);
      setFormSuccess('Đăng ký thành công! Đang chuyển đến dashboard...');
      setTimeout(() => navigate('/owner/dashboard'), 800);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormError('');
    setFormSuccess('');
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      businessName: formData.businessName,
      phone: formData.phone,
    });
  };

  const fieldClasses =
    'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-12 top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-16 h-32 w-32 rounded-full bg-purple-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-2xl backdrop-blur-xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-blue-700 to-indigo-700 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-tight">Tham gia mạng lưới GPS Tours</h2>
              <p className="mt-4 text-sm text-white/80">
                Kết nối du khách với quán của bạn, cập nhật nội dung realtime và theo dõi hiệu quả từng POI.
              </p>
            </div>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Quản lý nhiều chi nhánh tại một nơi
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Theo dõi lượt xem, lượt nghe audio hàng tuần
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Tối ưu trải nghiệm du khách với nội dung song ngữ
              </li>
            </ul>
          </div>

          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Đăng ký Shop Owner</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
            <p className="text-sm text-slate-500">Nhập thông tin cơ bản để bắt đầu quản lý POI của bạn.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {formSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className={fieldClasses}
                    placeholder="owner@domain.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Mật khẩu *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(event) => handleChange('password', event.target.value)}
                      className={fieldClasses}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Xác nhận *</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(event) => handleChange('confirmPassword', event.target.value)}
                      className={fieldClasses}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Họ tên *</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(event) => handleChange('fullName', event.target.value)}
                    className={fieldClasses}
                    placeholder="Nguyễn Văn Tùng"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Tên quán / thương hiệu *</label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(event) => handleChange('businessName', event.target.value)}
                    className={fieldClasses}
                    placeholder="Quán Bún Mắm Tùng"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className={fieldClasses}
                    placeholder="0901 234 567"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/owner/login" className="font-semibold text-blue-600 hover:text-blue-500">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerRegisterPage;

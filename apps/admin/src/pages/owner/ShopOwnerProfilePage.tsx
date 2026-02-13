import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, CheckCircle2, User, Store, Phone, MapPin, Shield } from 'lucide-react';
import { shopOwnerPortalService, type ShopOwnerPortalProfile, type ShopOwnerProfilePayload } from '../../services/shopOwnerPortal.service';

const ShopOwnerProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['shop-owner', 'profile'],
    queryFn: shopOwnerPortalService.getProfile,
  });

  const [formState, setFormState] = useState<ShopOwnerProfilePayload>({
    businessName: '',
    ownerName: '',
    phone: '',
    address: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (profile) {
      setFormState({
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: shopOwnerPortalService.updateProfile,
    onSuccess: (updated: ShopOwnerPortalProfile) => {
      queryClient.setQueryData(['shop-owner', 'profile'], updated);
      queryClient.invalidateQueries({ queryKey: ['shop-owner', 'overview'] });
      setStatusType('success');
      setStatusMessage('Thông tin đã được lưu.');
    },
    onError: (err: unknown) => {
      setStatusType('error');
      setStatusMessage(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setStatusType('');
    updateMutation.mutate(formState);
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerAccessToken');
    navigate('/owner/login', { replace: true });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S16 • Profile</p>
        <h1 className="text-3xl font-bold text-slate-900">Hồ sơ Shop Owner</h1>
        <p className="text-sm text-slate-500">Cập nhật thông tin hiển thị cho du khách.</p>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            statusType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {statusType === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
            {profile.avatarEmoji || '👤'}
          </div>
          <div>
            <p className="text-sm text-slate-500">Email đăng nhập</p>
            <p className="text-base font-semibold text-slate-900">{profile.email}</p>
            <p className="text-xs text-slate-400">Không thể thay đổi email trong phiên bản này.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Tên thương hiệu *</label>
            <div className="relative mt-1">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formState.businessName}
                onChange={(event) => setFormState((prev) => ({ ...prev, businessName: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Họ tên *</label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formState.ownerName}
                onChange={(event) => setFormState((prev) => ({ ...prev, ownerName: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={formState.phone || ''}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formState.address || ''}
                onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={() => alert('Tính năng đổi mật khẩu đang được triển khai.')}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
          >
            Đổi mật khẩu
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-900">Tips</p>
            <p>Cập nhật avatar và mô tả ngắn gọn giúp du khách nhận diện thương hiệu nhanh hơn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerProfilePage;

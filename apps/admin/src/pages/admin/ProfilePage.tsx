import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    Camera,
    Mail,
    User,
    Phone,
    MapPin,
    CalendarDays,
    ShieldCheck,
    Plus,
    Trash2,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import {
    profileService,
    type UserProfile,
    type UpdateProfilePayload,
    type OpeningHour,
    type UserGender,
} from '../../services/profile.service';
import { useToast } from '../../components/ui/ToastProvider';

const genderOptions: { label: string; value: UserGender }[] = [
    { label: 'Không tiết lộ', value: 'PREFER_NOT_SAY' },
    { label: 'Nam', value: 'MALE' },
    { label: 'Nữ', value: 'FEMALE' },
    { label: 'Khác', value: 'OTHER' },
];

const weekdayOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

type FormState = {
    fullName: string;
    phone: string;
    birthDate: string;
    gender: UserGender | '';
    addressLine1: string;
    addressLine2: string;
    city: string;
    country: string;
    shopName: string;
    shopAddress: string;
    openingHours: OpeningHour[];
};

const initialState: FormState = {
    fullName: '',
    phone: '',
    birthDate: '',
    gender: 'PREFER_NOT_SAY',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    shopName: '',
    shopAddress: '',
    openingHours: [],
};

const formatDateTime = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ').filter(Boolean);
    if (!parts.length) return 'U';
    const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[parts.length - 1][0]}`;
    return initials.toUpperCase();
};

const mapProfileToFormState = (profile: UserProfile): FormState => ({
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
    gender: profile.gender ?? 'PREFER_NOT_SAY',
    addressLine1: profile.address?.line1 ?? '',
    addressLine2: profile.address?.line2 ?? '',
    city: profile.address?.city ?? '',
    country: profile.address?.country ?? '',
    shopName: profile.shop?.name ?? '',
    shopAddress: profile.shop?.address ?? '',
    openingHours: profile.shop?.openingHours?.map((hour) => ({ ...hour })) ?? [],
});

const cloneFormState = (state: FormState): FormState => ({
    ...state,
    openingHours: state.openingHours.map((hour) => ({ ...hour })),
});

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [formState, setFormState] = useState<FormState>(initialState);
    const [initialFormState, setInitialFormState] = useState<FormState>(initialState);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
    const { showToast } = useToast();

    const { data: profile, isLoading, isError, error } = useQuery<UserProfile>({
        queryKey: ['profile', 'me'],
        queryFn: profileService.getProfile,
    });

    useEffect(() => {
        if (profile) {
            const mapped = mapProfileToFormState(profile);
            setFormState(mapped);
            setInitialFormState(mapped);
        }
    }, [profile]);

    const showShopSection = useMemo(
        () => profile?.role === 'SHOP_OWNER' || Boolean(profile?.shop),
        [profile],
    );

    const validation = useMemo(() => {
        const errors: string[] = [];
        const openingHourErrors: Record<number, string[]> = {};
        const phoneRegex = /^\+?\d{8,15}$/;

        if (!formState.fullName.trim()) {
            errors.push('Họ và tên là bắt buộc.');
        }

        if (formState.phone.trim() && !phoneRegex.test(formState.phone.trim())) {
            errors.push('Số điện thoại phải có 8-15 chữ số và có thể bắt đầu bằng +.');
        }

        if (formState.birthDate) {
            const birth = new Date(formState.birthDate);
            const today = new Date();
            birth.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (birth > today) {
                errors.push('Ngày sinh không được nằm trong tương lai.');
            }
        }

        if (showShopSection && formState.openingHours.length) {
            const dayCount = new Map<string, number>();
            formState.openingHours.forEach((hour, index) => {
                const rowErrors: string[] = [];
                const count = (dayCount.get(hour.day) ?? 0) + 1;
                dayCount.set(hour.day, count);
                if (!hour.open || !hour.close) {
                    rowErrors.push('Cần nhập cả giờ mở và đóng.');
                }
                if (hour.open && hour.close && hour.open >= hour.close) {
                    rowErrors.push('Giờ đóng phải sau giờ mở.');
                }
                if (count > 1) {
                    rowErrors.push('Ngày này đã có khung giờ khác.');
                }
                if (rowErrors.length) {
                    openingHourErrors[index] = rowErrors;
                }
            });
            dayCount.forEach((count, day) => {
                if (count > 1) {
                    errors.push(`Ngày ${day} có ${count} khung giờ, vui lòng giữ tối đa 1.`);
                }
            });
        }

        return { errors, openingHourErrors };
    }, [formState, showShopSection]);

    const isDirty = useMemo(
        () => JSON.stringify(formState) !== JSON.stringify(initialFormState),
        [formState, initialFormState],
    );

    const dayUsage = useMemo(
        () =>
            formState.openingHours.reduce<Record<string, number>>((acc, current) => {
                acc[current.day] = (acc[current.day] ?? 0) + 1;
                return acc;
            }, {}),
        [formState.openingHours],
    );

    const updateMutation = useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(['profile', 'me'], updatedProfile);
            setStatusType('success');
            setStatusMessage('Thông tin cá nhân đã được cập nhật.');
        },
        onError: (err: unknown) => {
            setStatusType('error');
            setStatusMessage(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
        },
    });

    const avatarMutation = useMutation({
        mutationFn: profileService.uploadAvatar,
        onSuccess: ({ avatarUrl }) => {
            queryClient.setQueryData<UserProfile | undefined>(['profile', 'me'], (current) =>
                current ? { ...current, avatarUrl } : current,
            );
            setStatusType('success');
            setStatusMessage('Ảnh đại diện đã được cập nhật.');
        },
        onError: () => {
            setStatusType('error');
            setStatusMessage('Tải ảnh đại diện thất bại. Vui lòng thử lại.');
        },
    });

    const handleFieldChange = (field: keyof FormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpeningHourChange = (index: number, key: keyof OpeningHour, value: string) => {
        setFormState((prev) => {
            const clone = [...prev.openingHours];
            clone[index] = { ...clone[index], [key]: value };
            return { ...prev, openingHours: clone };
        });
    };

    const handleAddOpeningHour = () => {
        const usedDays = new Set(formState.openingHours.map((hour) => hour.day));
        const nextDay = weekdayOptions.find((day) => !usedDays.has(day)) ?? 'MON';
        setFormState((prev) => ({
            ...prev,
            openingHours: [...prev.openingHours, { day: nextDay, open: '', close: '' }],
        }));
    };

    const handleRemoveOpeningHour = (index: number) => {
        setFormState((prev) => ({
            ...prev,
            openingHours: prev.openingHours.filter((_, idx) => idx !== index),
        }));
    };

    const handleAvatarPicker = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setStatusMessage('');
        setStatusType('');
        avatarMutation.mutate(file);
    };

    const buildPayload = (): UpdateProfilePayload => {
        const payload: UpdateProfilePayload = {
            fullName: formState.fullName.trim() || undefined,
            birthDate: formState.birthDate || undefined,
            gender: (formState.gender as UserGender) || undefined,
            phone: formState.phone.trim() || undefined,
            address: {
                line1: formState.addressLine1.trim() || undefined,
                line2: formState.addressLine2.trim() || undefined,
                city: formState.city.trim() || undefined,
                country: formState.country.trim() || undefined,
            },
        };

        if (payload.address && !Object.values(payload.address).some(Boolean)) {
            delete payload.address;
        }

        if (showShopSection) {
            const sanitizedHours = formState.openingHours
                .map((hour) => ({
                    day: hour.day,
                    open: hour.open,
                    close: hour.close,
                }))
                .filter((hour) => hour.open && hour.close);

            payload.shop = {
                name: formState.shopName.trim() || undefined,
                address: formState.shopAddress.trim() || undefined,
                openingHours: sanitizedHours.length ? sanitizedHours : undefined,
            };

            if (payload.shop && !Object.values(payload.shop).some(Boolean)) {
                delete payload.shop;
            }
        }

        return payload;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (validation.errors.length) {
            setStatusType('error');
            setStatusMessage('Vui lòng sửa các lỗi được đánh dấu trước khi lưu.');
            return;
        }
        if (!isDirty) {
            setStatusType('success');
            setStatusMessage('Không có thay đổi để lưu.');
            return;
        }
        setStatusMessage('');
        setStatusType('');
        updateMutation.mutate(buildPayload());
    };

    const handleResetForm = () => {
        setFormState(cloneFormState(initialFormState));
        setStatusMessage('Đã hoàn tác các thay đổi.');
        setStatusType('success');
    };

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login', { replace: true });
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
                <p className="font-semibold">Không thể tải thông tin hồ sơ.</p>
                <p className="text-sm">
                    {error instanceof Error ? error.message : 'Vui lòng kiểm tra kết nối và thử lại.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">S16 • Personal Profile</p>
                <h1 className="text-3xl font-bold text-slate-900">Thông tin cá nhân</h1>
                <p className="text-sm text-slate-500">
                    Cập nhật thông tin của bạn để đồng bộ giữa các hệ thống và giúp team dễ liên lạc hơn.
                </p>
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

            {validation.errors.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        Vui lòng kiểm tra lại các trường sau:
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        {validation.errors.map((issue) => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[280px,1fr]">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-4xl font-semibold">
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.fullName}
                                        className="h-full w-full rounded-3xl object-cover"
                                    />
                                ) : (
                                    getInitials(profile.fullName)
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAvatarPicker}
                                className="absolute -bottom-2 left-20 inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-lg shadow-slate-300/40 ring-1 ring-slate-200"
                                disabled={avatarMutation.isPending}
                            >
                                <Camera className="h-3.5 w-3.5" />
                                {avatarMutation.isPending ? 'Đang tải...' : 'Đổi ảnh'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleAvatarSelected}
                            />
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 space-y-1">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <Mail className="h-4 w-4" />
                                {profile.email}
                            </div>
                            <p className="text-xs text-slate-500">Email đăng nhập • chỉ đọc</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Họ và tên *</label>
                                <div className="relative mt-1">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formState.fullName}
                                        onChange={(event) => handleFieldChange('fullName', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                                <div className="relative mt-1">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formState.phone}
                                        onChange={(event) => handleFieldChange('phone', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
                                <div className="relative mt-1">
                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formState.birthDate}
                                        onChange={(event) => handleFieldChange('birthDate', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Giới tính</label>
                                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {genderOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex cursor-pointer items-center justify-center rounded-2xl border py-2 text-sm font-medium transition-colors ${
                                                formState.gender === option.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="gender"
                                                value={option.value}
                                                checked={formState.gender === option.value}
                                                onChange={() => handleFieldChange('gender', option.value)}
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
                                <div className="relative mt-1">
                                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formState.addressLine1}
                                        onChange={(event) => handleFieldChange('addressLine1', event.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="Số nhà / Đường"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Địa chỉ (dòng 2)</label>
                                <input
                                    type="text"
                                    value={formState.addressLine2}
                                    onChange={(event) => handleFieldChange('addressLine2', event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="Phường / Quận"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Thành phố</label>
                                <input
                                    type="text"
                                    value={formState.city}
                                    onChange={(event) => handleFieldChange('city', event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Quốc gia</label>
                                <input
                                    type="text"
                                    value={formState.country}
                                    onChange={(event) => handleFieldChange('country', event.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="VN"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-base font-semibold text-slate-900">Thông tin tài khoản</p>
                                <p className="text-sm text-slate-500">Các trường này chỉ có thể chỉnh bởi Super Admin.</p>
                            </div>
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span className="text-slate-500">Vai trò</span>
                                <span className="font-semibold text-slate-900">{profile.role}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span className="text-slate-500">Trạng thái</span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        profile.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}
                                >
                                    {profile.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span className="text-slate-500">Tạo ngày</span>
                                <span className="font-medium text-slate-900">{formatDateTime(profile.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span className="text-slate-500">Cập nhật gần nhất</span>
                                <span className="font-medium text-slate-900">{formatDateTime(profile.lastUpdatedAt)}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                <span className="text-slate-500">Lần đăng nhập gần nhất</span>
                                <span className="font-medium text-slate-900">{formatDateTime(profile.lastLoginAt)}</span>
                            </div>
                        </div>
                    </div>

                    {showShopSection && (
                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-semibold text-slate-900">Thông tin cửa hàng</p>
                                    <p className="text-sm text-slate-500">Hiển thị cho du khách trên ứng dụng.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddOpeningHour}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600"
                                >
                                    <Plus className="h-4 w-4" />
                                    Thêm khung giờ
                                </button>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Tên cửa hàng</label>
                                    <input
                                        type="text"
                                        value={formState.shopName}
                                        onChange={(event) => handleFieldChange('shopName', event.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Địa chỉ cửa hàng</label>
                                    <input
                                        type="text"
                                        value={formState.shopAddress}
                                        onChange={(event) => handleFieldChange('shopAddress', event.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {formState.openingHours.length === 0 && (
                                    <p className="text-sm text-slate-500">Chưa có khung giờ. Bấm "Thêm khung giờ" để bắt đầu.</p>
                                )}

                                {formState.openingHours.map((hour, index) => {
                                    const rowErrors = validation.openingHourErrors[index];
                                    return (
                                        <div
                                            key={`${hour.day}-${index}`}
                                            className={`grid gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-[120px,1fr,1fr,40px] ${
                                                rowErrors ? 'border-red-200' : 'border-slate-100'
                                            }`}
                                        >
                                            <select
                                                value={hour.day}
                                                onChange={(event) => handleOpeningHourChange(index, 'day', event.target.value)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                            >
                                                {weekdayOptions.map((day) => (
                                                    <option key={day} value={day} disabled={Boolean(dayUsage[day]) && day !== hour.day}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="time"
                                                value={hour.open}
                                                onChange={(event) => handleOpeningHourChange(index, 'open', event.target.value)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="time"
                                                value={hour.close}
                                                onChange={(event) => handleOpeningHourChange(index, 'close', event.target.value)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOpeningHour(index)}
                                                className="flex items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 hover:bg-red-50"
                                                aria-label="Xóa khung giờ"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            {rowErrors && (
                                                <p className="sm:col-span-4 text-xs text-red-500">{rowErrors.join(' ')}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending || validation.errors.length > 0 || !isDirty}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </button>
                    <button
                        type="button"
                        disabled={!isDirty}
                        onClick={handleResetForm}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Hủy thay đổi
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            showToast({
                                variant: 'info',
                                title: 'Đang phát triển',
                                description: 'Tính năng đổi mật khẩu sẽ sớm khả dụng.',
                            })
                        }
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
        </div>
    );
};

export default ProfilePage;

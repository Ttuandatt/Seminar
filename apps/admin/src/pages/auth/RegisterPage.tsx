import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    MapPin,
    Mail,
    Lock,
    User,
    Store,
    Phone,
    Loader2,
    ShieldCheck,
    Globe,
    Sparkles,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { authService, type RegisterPayload, type UserRole } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

const roleOptions: Array<{
    value: UserRole;
    title: string;
    subtitle: string;
    accent: string;
    icon: typeof ShieldCheck;
}> = [
    {
        value: 'ADMIN',
        title: 'Admin',
        subtitle: 'Quản trị hệ thống, duyệt nội dung và quản lý tours.',
        accent: 'from-slate-900 to-slate-700',
        icon: ShieldCheck,
    },
    {
        value: 'SHOP_OWNER',
        title: 'Shop Owner',
        subtitle: 'Tự đăng ký đối tác, quản lý POI và xem hiệu quả.',
        accent: 'from-blue-600 to-blue-400',
        icon: Store,
    },
    {
        value: 'TOURIST',
        title: 'Tourist',
        subtitle: 'Đồng bộ hành trình, nhận thông báo điểm mới.',
        accent: 'from-emerald-500 to-lime-400',
        icon: Globe,
    },
];

const passwordRules = [
    { label: 'Tối thiểu 8 ký tự', test: (value: string) => value.length >= 8 },
    { label: 'Có ít nhất 1 chữ hoa', test: (value: string) => /[A-Z]/.test(value) },
    { label: 'Có ít nhất 1 chữ thường', test: (value: string) => /[a-z]/.test(value) },
    { label: 'Có ít nhất 1 chữ số', test: (value: string) => /\d/.test(value) },
];

const isUserRole = (value: string): value is UserRole =>
    value === 'ADMIN' || value === 'SHOP_OWNER' || value === 'TOURIST';

const normalizeRoleParam = (value: string | null): UserRole | null => {
    if (!value) return null;
    const upper = value.toUpperCase();
    return isUserRole(upper) ? (upper as UserRole) : null;
};

const inputClasses =
    'w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

interface RegisterPageProps {
    initialRole?: UserRole;
}

interface FormState {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    businessName: string;
    phone: string;
    role: UserRole;
}

const RegisterPage = ({ initialRole }: RegisterPageProps) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const queryRole = normalizeRoleParam(searchParams.get('role'));
    const computedRole = (queryRole ?? initialRole ?? 'SHOP_OWNER') as UserRole;

    const [formData, setFormData] = useState<FormState>({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        businessName: '',
        phone: '',
        role: computedRole,
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        setFormData((prev) => (prev.role === computedRole ? prev : { ...prev, role: computedRole }));
    }, [computedRole]);

    const passwordChecklist = useMemo(
        () => passwordRules.map((rule) => ({ label: rule.label, valid: rule.test(formData.password) })),
        [formData.password],
    );

    const registerMutation = useMutation({
        mutationFn: (payload: RegisterPayload) => authService.register(payload),
    });

    const selectedRole = roleOptions.find((role) => role.value === formData.role) ?? roleOptions[0];
    const showShopFields = formData.role === 'SHOP_OWNER';

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormError('');
        setFormSuccess('');
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        if (!formData.email) return 'Vui lòng nhập email.';
        if (!formData.password) return 'Vui lòng nhập mật khẩu.';
        if (formData.password !== formData.confirmPassword) return 'Mật khẩu xác nhận không khớp.';
        const passwordValid = passwordRules.every((rule) => rule.test(formData.password));
        if (!passwordValid) return 'Mật khẩu chưa đáp ứng yêu cầu bảo mật.';
        if (!formData.fullName.trim()) return 'Vui lòng nhập họ tên.';
        if (showShopFields) {
            if (!formData.businessName.trim()) return 'Vui lòng nhập tên thương hiệu.';
            if (!formData.phone.trim()) return 'Vui lòng nhập số điện thoại.';
        }
        return '';
    };

    const extractErrorMessage = (error: unknown) => {
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string | string[] } } };
            const message = axiosError.response?.data?.message;
            if (Array.isArray(message)) {
                return message[0];
            }
            if (typeof message === 'string') {
                return message;
            }
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'Đăng ký thất bại. Vui lòng thử lại.';
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError('');
        setFormSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        const payload: RegisterPayload = {
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
            shopName: showShopFields ? formData.businessName : undefined,
            phone: showShopFields ? formData.phone : undefined,
        };

        try {
            const response = await registerMutation.mutateAsync(payload);

            if (formData.role === 'TOURIST') {
                setFormSuccess('Tạo tài khoản Tourist thành công! Vui lòng đăng nhập trên ứng dụng di động để khám phá tour.');
                setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
                return;
            }

            if (!response.accessToken || !response.refreshToken || !response.user) {
                setFormSuccess('Đăng ký thành công. Vui lòng đăng nhập lại để tiếp tục.');
                return;
            }

            login(response);

            if (formData.role === 'SHOP_OWNER') {
                localStorage.setItem('ownerAccessToken', response.accessToken);
                navigate('/owner/dashboard', { replace: true });
            } else {
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (error) {
            setFormError(extractErrorMessage(error));
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-16 top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="absolute right-24 bottom-10 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="absolute inset-x-0 top-8 mx-auto h-20 w-2/3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-400/10 to-pink-400/10 blur-3xl" />
            </div>

            <div className="relative z-10 grid w-full max-w-6xl gap-6 rounded-[2.5rem] border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl lg:grid-cols-[1fr_1.1fr]">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700 p-8 text-white">
                    <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.4em] text-white/60">
                        <MapPin className="h-4 w-4" /> GPS Tours Network
                    </div>
                    <h2 className="mt-6 text-4xl font-bold leading-tight">Onboard mọi vai trò trong một hành trình thống nhất.</h2>
                    <p className="mt-4 text-base text-white/80">
                        Chúng tôi dùng cùng một endpoint /auth/register để tạo tài khoản Admin, Shop Owner và Tourist theo UC-02. Chọn vai trò bên cạnh và điền thông tin bắt buộc để bắt đầu.
                    </p>

                    <div className="mt-10 space-y-4">
                        {roleOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition ${
                                    option.value === formData.role ? 'ring-2 ring-emerald-300/70' : 'opacity-70'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${option.accent}`}>
                                        <option.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">{option.title}</p>
                                        <p className="text-xs text-white/60">{option.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 rounded-2xl bg-white/10 p-5">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Security Memo</p>
                        <p className="mt-2 text-sm text-white/80">
                            Tuân thủ BR-1001 và BR-1002: email duy nhất, password mạnh và Shop Owner phải khai báo business name cùng phone để tạo hồ sơ.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">Unified Sign-up</p>
                        <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
                        <p className="text-sm text-slate-500">{selectedRole.subtitle}</p>
                    </div>

                    <div className="mt-6 grid gap-3 rounded-3xl bg-slate-50 p-3 sm:grid-cols-3">
                        {roleOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => updateField('role', option.value)}
                                className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition ${
                                    formData.role === option.value
                                        ? 'border-blue-500 bg-white text-slate-900 shadow-lg shadow-blue-500/20'
                                        : 'border-transparent text-slate-500 hover:bg-white/70'
                                }`}
                            >
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <option.icon className="h-4 w-4" />
                                    {option.title}
                                </div>
                                <p className="text-xs text-slate-500">{option.subtitle}</p>
                            </button>
                        ))}
                    </div>

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

                        <div>
                            <label className="text-sm font-medium text-slate-700">Email *</label>
                            <div className="relative mt-1">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    className={inputClasses}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Mật khẩu *</label>
                                <div className="relative mt-1">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(event) => updateField('password', event.target.value)}
                                        className={inputClasses}
                                        placeholder="Ít nhất 8 ký tự"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Xác nhận *</label>
                                <div className="relative mt-1">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                                        className={inputClasses}
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
                            {passwordChecklist.map((rule) => (
                                <div key={rule.label} className="flex items-center gap-2 text-xs text-slate-600">
                                    {rule.valid ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-slate-400" />
                                    )}
                                    {rule.label}
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Họ tên *</label>
                            <div className="relative mt-1">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(event) => updateField('fullName', event.target.value)}
                                    className={inputClasses}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        {showShopFields && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Business name *</label>
                                    <div className="relative mt-1">
                                        <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.businessName}
                                            onChange={(event) => updateField('businessName', event.target.value)}
                                            className={inputClasses}
                                            placeholder="Quán Bún Mắm Tùng"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Số điện thoại *</label>
                                    <div className="relative mt-1">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(event) => updateField('phone', event.target.value)}
                                            className={inputClasses}
                                            placeholder="+84 901 234 567"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang khởi tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản {selectedRole.title}
                                    <Sparkles className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Đã có tài khoản? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Đăng nhập ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

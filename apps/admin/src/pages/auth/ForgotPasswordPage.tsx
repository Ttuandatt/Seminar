import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devToken, setDevToken] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setDevToken('');

        try {
            const response = await authService.forgotPassword({ email });
            setMessage(response.message);
            if (response._devToken) {
                setDevToken(response._devToken);
            }
        } catch (err) {
            console.error(err);
            setError('Không thể gửi yêu cầu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-8 space-y-6">
                <div>
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Quay lại đăng nhập
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900">Quên mật khẩu</h1>
                    <p className="text-sm text-slate-500">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4" />
                            <div>
                                <p>Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (bao gồm thư rác).</p>
                                {devToken && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-xs text-emerald-600 hover:text-emerald-700">
                                            Dev mode: Xem token
                                        </summary>
                                        <p className="mt-1 text-xs text-emerald-600">
                                            <a
                                                href={`/reset-password?token=${devToken}`}
                                                className="font-mono underline hover:text-emerald-800"
                                            >
                                                /reset-password?token={devToken}
                                            </a>
                                        </p>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="admin@gpstours.vn"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                Gửi hướng dẫn
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

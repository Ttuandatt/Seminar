import api from './api';

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },
    register: async (userInfo: { fullName: string; email: string; password: string }) => {
        const { data } = await api.post('/auth/register', {
            ...userInfo,
            role: 'TOURIST'
        });
        return data;
    },
    /**
     * Maps API/network errors to field or banner errors for auth forms.
     * Returns array of { field?: 'email'|'password'|'fullName', message: string, actionLabel?: string, onAction?: () => void, banner?: boolean }
     */
    normalizeAuthError: (error: any): Array<{ field?: string; message: string; actionLabel?: string; banner?: boolean }> => {
        // Network or unknown error
        if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error' || error?.response?.status >= 500) {
            return [{ message: 'Lỗi hệ thống. Vui lòng thử lại.', banner: true }];
        }
        const status = error?.response?.status;
        const msg = error?.response?.data?.message || '';
        // Duplicate email (register)
        if (status === 409 && /email/i.test(msg)) {
            return [{ field: 'email', message: 'Email đã được sử dụng.', actionLabel: 'Đăng nhập' }];
        }
        // Invalid credentials (login)
        if (status === 401 && /invalid|sai|incorrect/i.test(msg)) {
            return [{ field: 'password', message: 'Email hoặc mật khẩu không đúng.' }];
        }
        // Locked account
        if (status === 401 && /locked|khoá|bị khóa/i.test(msg)) {
            return [{ field: 'password', message: 'Tài khoản đã bị khoá. Liên hệ hỗ trợ.', banner: true }];
        }
        // Fallback: generic inline error
        if (status && msg) {
            return [{ message: typeof msg === 'string' ? msg : 'Đã xảy ra lỗi. Vui lòng thử lại.', banner: true }];
        }
        return [{ message: 'Đã xảy ra lỗi. Vui lòng thử lại.', banner: true }];
    },
};

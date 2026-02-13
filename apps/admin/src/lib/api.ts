import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const clearAuthState = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
    refreshQueue.push(callback);
};

const notifyRefreshSubscribers = (token: string | null) => {
    refreshQueue.forEach((callback) => callback(token));
    refreshQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { response } = error;
        const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (
            response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                clearAuthState();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((token) => {
                        if (!token) {
                            reject(error);
                            return;
                        }
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await refreshClient.post('/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: nextRefreshToken } = refreshResponse.data as {
                    accessToken: string;
                    refreshToken?: string;
                };

                localStorage.setItem('accessToken', accessToken);
                if (nextRefreshToken) {
                    localStorage.setItem('refreshToken', nextRefreshToken);
                }

                notifyRefreshSubscribers(accessToken);

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                notifyRefreshSubscribers(null);
                clearAuthState();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default api;

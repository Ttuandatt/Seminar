import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const getServerUrl = () => {
    // 1. Explicit env override (only if set)
    if (process.env.EXPO_PUBLIC_API_URL) {
        const url = new URL(process.env.EXPO_PUBLIC_API_URL);
        console.log(`[API] Using env override: ${url.protocol}//${url.host}`);
        return `${url.protocol}//${url.host}`;
    }

    // 2. Auto-detect from Expo Go's hostUri (format: "IP:8081")
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    const lanIp = debuggerHost?.split(':')[0];

    if (lanIp) {
        console.log(`[API] Auto-detected LAN IP: ${lanIp}`);
        return `http://${lanIp}:3000`;
    }

    // 3. Fallback for production / standalone builds
    console.warn('[API] Could not detect LAN IP, falling back to localhost');
    return 'http://localhost:3000';
};

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    return `${getServerUrl()}/api/v1`;
};

export const getMediaUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${getServerUrl()}${path}`;
    return `${getServerUrl()}/${path}`;
};

const baseURL = getBaseUrl();
console.log(`[API] Base URL: ${baseURL}`);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Non-blocking health ping on startup
axios.get(`${getServerUrl()}/api/v1/public/pois?limit=1`, { timeout: 5000 })
    .then(() => console.log('[API] Health check OK'))
    .catch((err) => console.warn(`[API] Health check failed: ${err.message}`));

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

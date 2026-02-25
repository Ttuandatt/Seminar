import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const getServerUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        // Assume process.env.EXPO_PUBLIC_API_URL is like http://ip:3000/api/v1
        const url = new URL(process.env.EXPO_PUBLIC_API_URL);
        return `${url.protocol}//${url.host}`;
    }
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    const lanIp = debuggerHost?.split(':')[0] || '192.168.1.5';
    return `http://${lanIp}:3000`;
};

// Auto-detect dev server LAN IP from Expo, so the phone can reach the backend
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

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

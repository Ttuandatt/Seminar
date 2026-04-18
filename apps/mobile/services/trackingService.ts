import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServerUrl } from './api';

class TrackingService {
    private socket: Socket | null = null;

    async init() {
        if (this.socket) return;

        let deviceId = await AsyncStorage.getItem('mobile_deviceId');
        if (!deviceId) {
            deviceId = `device_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
            await AsyncStorage.setItem('mobile_deviceId', deviceId);
        }

        const serverUrl = getServerUrl();
        this.socket = io(serverUrl, {
            query: { deviceId },
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('[TrackingService] Connected to WebSocket', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('[TrackingService] Disconnected from WebSocket');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new TrackingService();

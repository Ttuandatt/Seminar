import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const state = await Network.getNetworkStateAsync();
                setIsOnline(!!(state.isConnected && state.isInternetReachable));
            } catch (e) {
                console.error("Network check error", e);
                setIsOnline(false);
            }
        };

        // Initial check
        checkStatus();

        // Polling every 10 seconds since expo-network doesn't have a stable listener in some versions
        const interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, []);

    return isOnline;
}

/**
 * Static one-time check
 */
export async function isOnline(): Promise<boolean> {
    try {
        const state = await Network.getNetworkStateAsync();
        return !!(state.isConnected && state.isInternetReachable);
    } catch {
        return false;
    }
}

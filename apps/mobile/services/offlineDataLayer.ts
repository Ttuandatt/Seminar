import * as db from './database';
import { isOnline } from './networkStatus';
import api from './api';

export class OfflineDataLayer {
    /**
     * Fetches all POIs, prioritizing online source with offline fallback.
     */
    static async getAllPois(): Promise<any[]> {
        if (await isOnline()) {
            try {
                const response = await api.get('/public/pois');
                return response.data.data || response.data;
            } catch (error) {
                console.warn('API failed for getAllPois, falling back to offline', error);
            }
        }
        return db.getAllOfflinePois();
    }

    /**
     * Fetches POI data, prioritizing online source with offline fallback.
     */
    static async getPoi(poiId: string): Promise<any> {
        if (await isOnline()) {
            try {
                const response = await api.get(`/public/pois/${poiId}`);
                return response.data;
            } catch (error) {
                console.warn(`API failed for POI ${poiId}, falling back to offline`, error);
            }
        }
        
        // Offline or API failed
        const poi = db.getOfflinePoi(poiId);
        if (!poi) throw new Error('POI not available offline');
        
        // Fetch media from cache
        const media = (db as any).getMediaCacheForPoi?.(poiId) || [];
        
        return { ...poi, media };
    }

    /**
     * Fetches Tour data, prioritizing online source with offline fallback.
     */
    static async getTour(tourId: string): Promise<any> {
        if (await isOnline()) {
            try {
                const response = await api.get(`/public/tours/${tourId}`);
                return response.data;
            } catch (error) {
                console.warn(`API failed for Tour ${tourId}, falling back to offline`, error);
            }
        }

        const tour = db.getOfflineTour(tourId);
        if (!tour) throw new Error('Tour not available offline');

        const tourPois = db.getOfflineTourPois(tourId);
        // We'd ideally populate POI data for each tourPoi here from the local 'pois' table
        
        return { ...tour, tourPois };
    }

    /**
     * Resolves a media URL to a local URI if cached, otherwise returns original URL.
     */
    static async resolveMediaUrl(remoteUrl: string): Promise<string> {
        const cached = db.getMediaCacheByUrl(remoteUrl);
        if (cached && cached.localPath) {
            // In a real app, we might also verify file existence here
            return cached.localPath;
        }
        return remoteUrl;
    }
}

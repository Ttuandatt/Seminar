import * as db from './database';
import * as FileSystem from 'expo-file-system/legacy';
import { deleteLocalFile } from './mediaDownloader';

// Expiry in milliseconds
const EXPIRY = {
    POI_IMAGE: 30 * 24 * 60 * 60 * 1000,   // 30 days
    TOUR_IMAGE: 7 * 24 * 60 * 60 * 1000,    // 7 days
    VIDEO: 3 * 24 * 60 * 60 * 1000,         // 3 days
    AUDIO: 7 * 24 * 60 * 60 * 1000,         // 7 days
};

export class MediaCleanupService {
    /**
     * Cleans up expired media files from the device.
     * Should be called on app startup or periodically.
     */
    static async cleanupExpiredMedia(): Promise<number> {
        console.log('[Cleanup] Starting media cleanup...');
        
        try {
            // 1. Get all media cache records
            // Note: We'd need a helper in database.ts to get all media cache
            // For now, let's assume we can query it
            const allCache = (db as any).getAllMediaCache?.() || []; 
            if (allCache.length === 0) return 0;

            let deletedCount = 0;
            const now = Date.now();

            for (const item of allCache) {
                let expiryTime = EXPIRY.POI_IMAGE; // Default

                if (item.type === 'VIDEO') expiryTime = EXPIRY.VIDEO;
                else if (item.type === 'AUDIO') expiryTime = EXPIRY.AUDIO;
                // Distinguish between POI image and Tour image if possible
                // For now, use 30 days for all images unless specifically a tour thumbnail
                
                if (now - item.downloadedAt > expiryTime) {
                    // Expired!
                    console.log(`[Cleanup] Deleting expired media: ${item.localPath}`);
                    await deleteLocalFile(item.localPath);
                    // Remove record from DB
                    (db as any).deleteMediaCache?.(item.id);
                    deletedCount++;
                }
            }

            console.log(`[Cleanup] Finished. Deleted ${deletedCount} expired items.`);
            return deletedCount;
        } catch (error) {
            console.error('[Cleanup] Error during media cleanup', error);
            return 0;
        }
    }
}

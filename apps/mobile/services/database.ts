import * as SQLite from 'expo-sqlite';
import api from './api';

const db = SQLite.openDatabaseSync('gpstours.db');
let databaseInitialized = false;

export interface OfflinePOI {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi: string;
    descriptionEn?: string;
    latitude: number;
    longitude: number;
    category: string;
    triggerRadius: number;
    syncedAt: number;
}

export interface OfflineTour {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi: string;
    descriptionEn?: string;
    tourType: string;
    estimatedDuration?: number;
    thumbnailLocalPath?: string;
    syncedAt: number;
}

export interface OfflineTourPoi {
    id: string;
    tourId: string;
    poiId: string;
    orderIndex: number;
    titleOverride?: string;
    descriptionOverride?: string;
    customIntro?: string;
    transitionNote?: string;
    estimatedStayMinutes?: number;
}

export interface OfflineNarration {
    id: string;
    tourId: string;
    type: string;
    orderIndex: number;
    scriptVi?: string;
    scriptEn?: string;
    audioViLocalPath?: string;
    audioEnLocalPath?: string;
}

export interface MediaCache {
    id: string;
    poiId: string;
    type: string;
    language: string;
    remoteUrl: string;
    localPath: string;
    fileSize?: number;
    durationSec?: number;
    downloadedAt: number;
}

export const initDatabase = () => {
    if (databaseInitialized) {
        return;
    }
    try {
        db.execSync(`
            -- POI table
            CREATE TABLE IF NOT EXISTS pois (
                id TEXT PRIMARY KEY NOT NULL,
                nameVi TEXT NOT NULL,
                nameEn TEXT,
                descriptionVi TEXT,
                descriptionEn TEXT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                category TEXT NOT NULL,
                triggerRadius INTEGER DEFAULT 15,
                syncedAt INTEGER NOT NULL
            );

            -- Tour table
            CREATE TABLE IF NOT EXISTS tours (
                id TEXT PRIMARY KEY NOT NULL,
                nameVi TEXT NOT NULL,
                nameEn TEXT,
                descriptionVi TEXT,
                descriptionEn TEXT,
                tourType TEXT NOT NULL,
                estimatedDuration INTEGER,
                thumbnailLocalPath TEXT,
                syncedAt INTEGER NOT NULL
            );

            -- Tour POI relationship
            CREATE TABLE IF NOT EXISTS tour_pois (
                id TEXT PRIMARY KEY NOT NULL,
                tourId TEXT NOT NULL,
                poiId TEXT NOT NULL,
                orderIndex INTEGER NOT NULL,
                titleOverride TEXT,
                descriptionOverride TEXT,
                customIntro TEXT,
                transitionNote TEXT,
                estimatedStayMinutes INTEGER,
                FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE,
                FOREIGN KEY (poiId) REFERENCES pois(id)
            );

            -- Tour Narrations
            CREATE TABLE IF NOT EXISTS tour_narrations (
                id TEXT PRIMARY KEY NOT NULL,
                tourId TEXT NOT NULL,
                type TEXT NOT NULL,
                orderIndex INTEGER NOT NULL,
                scriptVi TEXT,
                scriptEn TEXT,
                audioViLocalPath TEXT,
                audioEnLocalPath TEXT,
                FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
            );

            -- Media Cache
            CREATE TABLE IF NOT EXISTS media_cache (
                id TEXT PRIMARY KEY NOT NULL,
                poiId TEXT NOT NULL,
                type TEXT NOT NULL,
                language TEXT NOT NULL,
                remoteUrl TEXT NOT NULL,
                localPath TEXT NOT NULL,
                fileSize INTEGER,
                durationSec REAL,
                downloadedAt INTEGER NOT NULL,
                FOREIGN KEY (poiId) REFERENCES pois(id)
            );

            -- Sync Metadata
            CREATE TABLE IF NOT EXISTS sync_metadata (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL,
                updatedAt INTEGER NOT NULL
            );

            -- Downloaded Tours tracking
            CREATE TABLE IF NOT EXISTS downloaded_tours (
                tourId TEXT PRIMARY KEY NOT NULL,
                totalSize INTEGER NOT NULL,
                mediaCount INTEGER NOT NULL,
                downloadedAt INTEGER NOT NULL,
                FOREIGN KEY (tourId) REFERENCES tours(id)
            );

            -- Legacy table (kept for transition, can be removed later)
            CREATE TABLE IF NOT EXISTS offline_pois (
                id TEXT PRIMARY KEY NOT NULL,
                nameVi TEXT NOT NULL,
                nameEn TEXT,
                descriptionVi TEXT,
                descriptionEn TEXT,
                latitude REAL,
                longitude REAL,
                poiType TEXT,
                hasLargeAudio INTEGER DEFAULT 0
            );
        `);
        databaseInitialized = true;
        console.log("SQLite DB Initialized");
    } catch (e) {
        console.error("SQLite Init Error:", e);
    }
};

// Ensure the table exists before any consumer tries to read it (e.g. QR scan before manual sync)
initDatabase();

export const syncOfflinePois = async () => {
    try {
        console.log("Starting offline POI sync...");
        const response = await api.get('/public/pois');
        const pois = response.data.data || response.data;

        initDatabase();

        // Clear old ones
        db.execSync('DELETE FROM offline_pois;');

        const statement = db.prepareSync(
            'INSERT INTO offline_pois (id, nameVi, nameEn, descriptionVi, descriptionEn, latitude, longitude, poiType, hasLargeAudio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        let count = 0;
        for (const poi of pois) {
            // If POI has VIDEO or AUDIO media, we consider it requires network (TH2)
            const hasLargeAudio = poi.media?.some((m: any) => m.type === 'AUDIO' || m.type === 'VIDEO') ? 1 : 0;

            statement.executeSync([
                poi.id,
                poi.nameVi,
                poi.nameEn || '',
                poi.descriptionVi || '',
                poi.descriptionEn || '',
                poi.latitude || 0,
                poi.longitude || 0,
                poi.poiType || 'SUB',
                hasLargeAudio
            ]);
            count++;
        }

        console.log(`Synced ${count} POIs to offline database.`);
        return { success: true, count };
    } catch (error) {
        console.error("Failed to sync offline POIs", error);
        return { success: false, error };
    }
};

// --- New Sync Helpers ---

export const getSyncMetadata = (key: string): string | null => {
    try {
        const result = db.getFirstSync<{ value: string }>('SELECT value FROM sync_metadata WHERE key = ?;', [key]);
        return result?.value || null;
    } catch { return null; }
};

export const setSyncMetadata = (key: string, value: string) => {
    try {
        db.execSync(`INSERT OR REPLACE INTO sync_metadata (key, value, updatedAt) VALUES ('${key}', '${value}', ${Date.now()});`);
    } catch (e) { console.error("setSyncMetadata error", e); }
};

export const upsertPoi = (poi: any) => {
    const statement = db.prepareSync(
        `INSERT OR REPLACE INTO pois (id, nameVi, nameEn, descriptionVi, descriptionEn, latitude, longitude, category, triggerRadius, syncedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    statement.executeSync([
        poi.id, poi.nameVi, poi.nameEn || '', poi.descriptionVi || '', poi.descriptionEn || '',
        poi.latitude, poi.longitude, poi.category || 'OTHER', poi.triggerRadius || 15, Date.now()
    ]);
};

export const deletePoi = (id: string) => {
    db.execSync(`DELETE FROM pois WHERE id = '${id}';`);
};

export const upsertTour = (tour: any) => {
    const statement = db.prepareSync(
        `INSERT OR REPLACE INTO tours (id, nameVi, nameEn, descriptionVi, descriptionEn, tourType, estimatedDuration, syncedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    statement.executeSync([
        tour.id, tour.nameVi, tour.nameEn || '', tour.descriptionVi || '', tour.descriptionEn || '',
        tour.tourType || 'OFFICIAL', tour.estimatedDuration || 0, Date.now()
    ]);
};

export const deleteTour = (id: string) => {
    db.execSync(`DELETE FROM tours WHERE id = '${id}';`);
};

export const getOfflineTour = (id: string): OfflineTour | null => {
    return db.getFirstSync<OfflineTour>('SELECT * FROM tours WHERE id = ?;', [id]);
};

export const getOfflinePoi = (id: string): OfflinePOI | null => {
    return db.getFirstSync<OfflinePOI>('SELECT * FROM pois WHERE id = ?;', [id]);
};

export const getAllOfflinePois = (): OfflinePOI[] => {
    try {
        return db.getAllSync<OfflinePOI>('SELECT * FROM pois;');
    } catch {
        return [];
    }
};

export const getOfflineTourPois = (tourId: string): OfflineTourPoi[] => {
    return db.getAllSync<OfflineTourPoi>('SELECT * FROM tour_pois WHERE tourId = ? ORDER BY orderIndex ASC;', [tourId]);
};

export const getMediaCacheByUrl = (remoteUrl: string): MediaCache | null => {
    return db.getFirstSync<MediaCache>('SELECT * FROM media_cache WHERE remoteUrl = ?;', [remoteUrl]);
};

export const getAllMediaCache = (): MediaCache[] => {
    return db.getAllSync<MediaCache>('SELECT * FROM media_cache;');
};

export const getMediaCacheForPoi = (poiId: string): MediaCache[] => {
    return db.getAllSync<MediaCache>('SELECT * FROM media_cache WHERE poiId = ?;', [poiId]);
};

export const deleteMediaCache = (id: string) => {
    db.execSync(`DELETE FROM media_cache WHERE id = '${id}';`);
};

export const insertMediaCache = (item: Omit<MediaCache, 'downloadedAt'>) => {
    const statement = db.prepareSync(
        `INSERT OR REPLACE INTO media_cache (id, poiId, type, language, remoteUrl, localPath, fileSize, durationSec, downloadedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    statement.executeSync([
        item.id, item.poiId, item.type, item.language, item.remoteUrl, item.localPath,
        item.fileSize || 0, item.durationSec || 0, Date.now()
    ]);
};

export const upsertTourPoi = (tp: any) => {
    const statement = db.prepareSync(
        `INSERT OR REPLACE INTO tour_pois (id, tourId, poiId, orderIndex, titleOverride, descriptionOverride, customIntro, transitionNote, estimatedStayMinutes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    statement.executeSync([
        tp.id, tp.tourId, tp.poiId, tp.orderIndex, tp.titleOverride || '', tp.descriptionOverride || '',
        tp.customIntro || '', tp.transitionNote || '', tp.estimatedStayMinutes || 0
    ]);
};

export const upsertNarration = (nar: any) => {
    const statement = db.prepareSync(
        `INSERT OR REPLACE INTO tour_narrations (id, tourId, type, orderIndex, scriptVi, scriptEn, audioViLocalPath, audioEnLocalPath) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    statement.executeSync([
        nar.id, nar.tourId, nar.type, nar.orderIndex, nar.scriptVi || '', nar.scriptEn || '',
        nar.audioViLocalPath || '', nar.audioEnLocalPath || ''
    ]);
};

export const deleteNarrationsForTour = (tourId: string) => {
    db.execSync(`DELETE FROM tour_narrations WHERE tourId = '${tourId}';`);
};

export const markTourDownloaded = (tourId: string, totalSize: number, mediaCount: number) => {
    db.execSync(`INSERT OR REPLACE INTO downloaded_tours (tourId, totalSize, mediaCount, downloadedAt) 
                 VALUES ('${tourId}', ${totalSize}, ${mediaCount}, ${Date.now()});`);
};

export const isTourDownloaded = (tourId: string): boolean => {
    const result = db.getFirstSync('SELECT tourId FROM downloaded_tours WHERE tourId = ?;', [tourId]);
    return !!result;
};

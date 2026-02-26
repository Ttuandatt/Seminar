import * as SQLite from 'expo-sqlite';
import api from './api';

const db = SQLite.openDatabaseSync('gpstours.db');

export interface OfflinePOI {
    id: string;
    nameVi: string;
    nameEn?: string;
    descriptionVi: string;
    descriptionEn?: string;
    latitude: number;
    longitude: number;
    poiType: string;
    hasLargeAudio: number; // 0 or 1
}

export const initDatabase = () => {
    try {
        db.execSync(`
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
        console.log("SQLite DB Initialized");
    } catch (e) {
        console.error("SQLite Init Error:", e);
    }
};

export const syncOfflinePois = async () => {
    try {
        console.log("Starting offline POI sync...");
        const response = await api.get('/pois');
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

export const getOfflinePoi = (id: string): OfflinePOI | null => {
    try {
        const result = db.getFirstSync<OfflinePOI>('SELECT * FROM offline_pois WHERE id = ?;', [id]);
        return result;
    } catch (e) {
        console.error("Failed to fetch offline POI", e);
        return null;
    }
};

export const getAllOfflinePois = (): OfflinePOI[] => {
    try {
        return db.getAllSync<OfflinePOI>('SELECT * FROM offline_pois;');
    } catch {
        return [];
    }
};

import * as FileSystem from 'expo-file-system/legacy';

const BASE_DIR = `${FileSystem.documentDirectory}media/`;

/**
 * Ensures media directories exist
 */
export async function ensureDir(dir: string) {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
}

/**
 * Downloads a file to local storage
 * @param remoteUrl Relative URL from server
 * @param subDir Subdirectory (e.g. 'images', 'audio')
 * @param filename Filename to save as
 * @returns Local URI
 */
export async function downloadFile(remoteUrl: string, subDir: string, filename: string): Promise<string> {
    const targetDir = `${BASE_DIR}${subDir}/`;
    await ensureDir(targetDir);
    
    // Convert relative URL to full absolute URL if needed
    // Assuming api.defaults.baseURL or similar
    // For now, let's assume remoteUrl is absolute or we'll handle it in the caller
    
    const localUri = `${targetDir}${filename}`;
    
    // Check if already exists to skip download
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
        return localUri;
    }

    try {
        const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);
        return downloadResult.uri;
    } catch (error) {
        console.error(`Download failed: ${remoteUrl}`, error);
        throw error;
    }
}

export async function deleteLocalFile(localUri: string) {
    try {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch (e) {
        console.error("Delete file error", e);
    }
}

export async function getDirectorySize(dir: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists || !info.isDirectory) return 0;
    
    // expo-file-system doesn't have a recursive size function easily
    // This is a simplified version
    return 0; 
}

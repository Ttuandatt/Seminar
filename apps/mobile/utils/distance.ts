import * as Location from 'expo-location';

// Helper to calculate distance in meters between two coordinates using Haversine formula
export function getDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
): number {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const phi1 = coord1.latitude * rad;
    const phi2 = coord2.latitude * rad;
    const deltaPhi = (coord2.latitude - coord1.latitude) * rad;
    const deltaLambda = (coord2.longitude - coord1.longitude) * rad;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

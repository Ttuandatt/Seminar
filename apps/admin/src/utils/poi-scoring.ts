/**
 * Calculates distance in meters between two coordinates using the Haversine formula.
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lng2 - lng1) * rad;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Calculates a score for a POI based on distance and priority (from mobile criteriaEngine).
 * higher score = higher priority/closer.
 * 
 * score = priority * 0.30 + distanceScore * 0.30
 */
export const calculateAdminPoiScore = (
    priority: number,
    distance: number,
    triggerRadius: number
): number => {
    // 1. Priority Score (Raw 1-5 scale)
    const priorityValue = priority || 1;

    // 2. Distance Score (0-1)
    // Formula: 1 - (distance / triggerRadius)
    // Closer to center = higher score
    const distanceScore = Math.max(0, 1 - distance / (triggerRadius || 50));

    return priorityValue * 0.3 + distanceScore * 0.3;
};

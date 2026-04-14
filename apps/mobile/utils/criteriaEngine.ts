import { Poi } from '../services/publicService';

export interface ScoringFactors {
    priority: number; // 1-5
    distance: number;
    triggerRadius: number;
    hasPlayed: boolean;
    autoPlayEnabled: boolean;
}

/**
 * Implements the Criteria Engine scoring logic (SD-08).
 * score = priority * 0.30 + distanceScore * 0.30 + notPlayedBonus * 0.25 + autoPlayScore * 0.15
 */
export const calculatePoiScore = (factors: ScoringFactors): number => {
    const { priority, distance, triggerRadius, hasPlayed, autoPlayEnabled } = factors;
    
    // 1. Priority Score (Raw 1-5 scale)
    const priorityValue = priority || 1;
    
    // 2. Distance Score (0-1)
    // Formula: 1 - (distance / triggerRadius)
    // Closer to center = higher score
    const distanceScore = Math.max(0, 1 - (distance / (triggerRadius || 50)));
    
    // 3. Not Played Bonus (0 or 1)
    const notPlayedBonus = hasPlayed ? 0 : 1;
    
    // 4. Auto Play Score (0 or 1)
    const autoPlayScore = autoPlayEnabled ? 1 : 0;
    
    return (priorityValue * 0.30) + 
           (distanceScore * 0.30) + 
           (notPlayedBonus * 0.25) + 
           (autoPlayScore * 0.15);
};

export type ScoredPoi = Poi & { 
    score: number; 
    distanceM: number;
    hasPlayed: boolean;
};

/**
 * Resolves the best POI from a list of nearby POIs.
 */
export const resolveBestPoi = (
    nearbyPois: (Poi & { distanceM: number })[],
    playedPoiIds: Set<string>,
    autoPlayEnabled: boolean,
    excludePoiIds: Set<string> = new Set()
): { winner: ScoredPoi | null; others: ScoredPoi[] } => {
    
    const scoredPois: ScoredPoi[] = nearbyPois
        .filter(poi => !excludePoiIds.has(poi.id))
        .map(poi => {
            const hasPlayed = playedPoiIds.has(poi.id);
            const score = calculatePoiScore({
                priority: poi.priority || 1,
                distance: poi.distanceM,
                triggerRadius: poi.triggerRadius || 50,
                hasPlayed,
                autoPlayEnabled
            });
            
            return {
                ...poi,
                score,
                hasPlayed
            };
        });

    // Sort descending by score
    scoredPois.sort((a, b) => b.score - a.score);

    if (scoredPois.length === 0) {
        return { winner: null, others: [] };
    }

    const [winner, ...others] = scoredPois;
    return { winner, others };
};

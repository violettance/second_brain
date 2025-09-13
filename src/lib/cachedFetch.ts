import { apiCache } from './cache';
import { logger } from './logger';

/**
 * Generic cached fetch function
 * Automatically caches API responses with TTL
 */
export const cachedFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  try {
    // Check cache first
    const cached = apiCache.get(key);
    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    // Cache miss - fetch data
    logger.debug(`Cache miss: ${key}`);
    const data = await fetcher();
    
    // Store in cache
    apiCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    logger.error(`Cached fetch error for key ${key}:`, error);
    throw error;
  }
};

/**
 * Cached fetch with automatic key generation
 * Uses function name and parameters to generate cache key
 */
export const cachedFetchWithKey = async <T>(
  fetcher: () => Promise<T>,
  keyParts: (string | number | undefined)[],
  ttl?: number
): Promise<T> => {
  const key = keyParts.filter(Boolean).join('_');
  return cachedFetch(key, fetcher, ttl);
};

/**
 * Invalidate cache entries by pattern
 */
export const invalidateCache = (pattern: string): number => {
  const beforeSize = apiCache.getStats().size;
  apiCache.invalidate(pattern);
  const afterSize = apiCache.getStats().size;
  const deletedCount = beforeSize - afterSize;
  logger.debug(`Invalidated ${deletedCount} cache entries matching pattern: ${pattern}`);
  return deletedCount;
};

/**
 * Clear all cache
 */
export const clearCache = (): void => {
  apiCache.clear();
  logger.debug('All cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return apiCache.getStats();
};

/**
 * Predefined cache keys for common API calls
 */
export const CACHE_KEYS = {
  NOTES: (userId: string, date?: string) => `notes_${userId}${date ? `_${date}` : ''}`,
  ANALYTICS: (userId: string, timeRange: string) => `analytics_${userId}_${timeRange}`,
  PROJECTS: (userId: string) => `projects_${userId}`,
  MEMORY_NOTES: (userId: string, type: 'short' | 'long') => `memory_${type}_${userId}`,
  TASKS: (userId: string, projectId?: string) => `tasks_${userId}${projectId ? `_${projectId}` : ''}`,
  USER_PROFILE: (userId: string) => `profile_${userId}`,
} as const;

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

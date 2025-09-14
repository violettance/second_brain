import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { cachedFetch } from '../../../src/lib/cachedFetch';
import { apiCache } from '../../../src/lib/cache';

// Mock logger to avoid console output during tests
const mockLogger = {
  debug: mock(() => {}),
  error: mock(() => {})
};

// Mock the logger module
mock.module('../../../src/lib/logger', () => ({
  logger: mockLogger
}));

describe('cachedFetch', () => {
  beforeEach(() => {
    // Her test öncesi cache'i temizle
    apiCache.clear();
    // Mock fonksiyonları sıfırla
    mockLogger.debug.mockClear();
    mockLogger.error.mockClear();
  });

  describe('basic functionality', () => {
    it('should fetch and cache data on first call', async () => {
      const mockFetcher = mock(() => Promise.resolve('test data'));
      
      const result = await cachedFetch('test-key', mockFetcher);
      
      expect(result).toBe('test data');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith('Cache miss: test-key');
    });

    it('should return cached data on second call', async () => {
      const mockFetcher = mock(() => Promise.resolve('cached data'));
      
      // İlk çağrı
      await cachedFetch('cache-key', mockFetcher);
      
      // İkinci çağrı
      const result = await cachedFetch('cache-key', mockFetcher);
      
      expect(result).toBe('cached data');
      expect(mockFetcher).toHaveBeenCalledTimes(1); // Sadece bir kez çağrılmalı
      expect(mockLogger.debug).toHaveBeenCalledWith('Cache hit: cache-key');
    });

    it('should use custom TTL when provided', async () => {
      const mockFetcher = mock(() => Promise.resolve('short-lived data'));
      
      await cachedFetch('ttl-key', mockFetcher, 100); // 100ms TTL
      
      // Hemen al - cache'de olmalı
      let result = await cachedFetch('ttl-key', mockFetcher, 100);
      expect(result).toBe('short-lived data');
      expect(mockFetcher).toHaveBeenCalledTimes(1);
      
      // 150ms bekle ve tekrar al - expire olmuş olmalı
      await new Promise(resolve => setTimeout(resolve, 150));
      result = await cachedFetch('ttl-key', mockFetcher, 100);
      expect(result).toBe('short-lived data');
      expect(mockFetcher).toHaveBeenCalledTimes(2); // İkinci kez çağrılmalı
    });
  });

  describe('error handling', () => {
    it('should propagate fetcher errors', async () => {
      const errorMessage = 'Fetcher failed';
      const mockFetcher = mock(() => Promise.reject(new Error(errorMessage)));
      
      await expect(cachedFetch('error-key', mockFetcher)).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cached fetch error for key error-key:',
        expect.any(Error)
      );
    });

    it('should not cache failed requests', async () => {
      const mockFetcher = mock(() => Promise.reject(new Error('Network error')));
      
      try {
        await cachedFetch('fail-key', mockFetcher);
      } catch (error) {
        // Error bekleniyor
      }
      
      // Cache'de hiçbir şey olmamalı
      expect(apiCache.get('fail-key')).toBeNull();
    });

    it('should handle different error types', async () => {
      const stringError = 'String error';
      const mockFetcher = mock(() => Promise.reject(stringError));
      
      await expect(cachedFetch('string-error-key', mockFetcher)).rejects.toBe(stringError);
    });
  });

  describe('complex data types', () => {
    it('should handle objects', async () => {
      const testObject = { id: 1, name: 'test', nested: { value: 42 } };
      const mockFetcher = mock(() => Promise.resolve(testObject));
      
      const result = await cachedFetch('object-key', mockFetcher);
      
      expect(result).toEqual(testObject);
      expect((result as any).nested.value).toBe(42);
    });

    it('should handle arrays', async () => {
      const testArray = [1, 2, 3, { nested: 'value' }];
      const mockFetcher = mock(() => Promise.resolve(testArray));
      
      const result = await cachedFetch('array-key', mockFetcher);
      
      expect(result).toEqual(testArray);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle null and undefined', async () => {
      const mockFetcherNull = mock(() => Promise.resolve(null));
      const mockFetcherUndefined = mock(() => Promise.resolve(undefined));
      
      const nullResult = await cachedFetch('null-key', mockFetcherNull);
      const undefinedResult = await cachedFetch('undefined-key', mockFetcherUndefined);
      
      expect(nullResult).toBeNull();
      expect(undefinedResult).toBeUndefined();
    });
  });

  describe('performance', () => {
    it('should handle multiple sequential calls efficiently', async () => {
      const mockFetcher = mock(() => Promise.resolve('sequential data'));
      
      // İlk çağrı - cache miss
      const result1 = await cachedFetch('sequential-key', mockFetcher);
      expect(result1).toBe('sequential data');
      
      // İkinci çağrı - cache hit
      const result2 = await cachedFetch('sequential-key', mockFetcher);
      expect(result2).toBe('sequential data');
      
      // Üçüncü çağrı - cache hit
      const result3 = await cachedFetch('sequential-key', mockFetcher);
      expect(result3).toBe('sequential data');
      
      // Fetcher sadece bir kez çağrılmalı
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache key uniqueness', () => {
    it('should treat different keys as separate', async () => {
      const mockFetcher1 = mock(() => Promise.resolve('data1'));
      const mockFetcher2 = mock(() => Promise.resolve('data2'));
      
      const result1 = await cachedFetch('key1', mockFetcher1);
      const result2 = await cachedFetch('key2', mockFetcher2);
      
      expect(result1).toBe('data1');
      expect(result2).toBe('data2');
      expect(mockFetcher1).toHaveBeenCalledTimes(1);
      expect(mockFetcher2).toHaveBeenCalledTimes(1);
    });
  });
});

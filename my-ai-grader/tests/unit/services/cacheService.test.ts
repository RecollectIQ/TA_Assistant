import { describe, it, expect, beforeEach } from 'vitest';
import { cacheService } from '@/services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should store and retrieve data', () => {
    const testData = { result: 'test' };
    cacheService.set('test-key', testData);

    const retrieved = cacheService.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', () => {
    const testData = { result: 'test' };
    cacheService.set('test-key', testData, 100); // 100ms TTL

    // Wait for expiration
    return new Promise((resolve) => {
      setTimeout(() => {
        const retrieved = cacheService.get('test-key');
        expect(retrieved).toBeNull();
        resolve();
      }, 150);
    });
  });

  it('should cache grading results', () => {
    const requestData = {
      standardAnswer: 'test answer',
      rubric: 'test rubric',
      studentSubmissions: [],
    };
    const result = { score: 85 };

    cacheService.cacheGradingResult(requestData, result);

    const cached = cacheService.getGradingResult(requestData);
    expect(cached).toEqual(result);
  });

  it('should generate consistent keys for same data', () => {
    const data1 = { a: 1, b: 2 };
    const data2 = { b: 2, a: 1 }; // Different order

    const key1 = cacheService.generateKey('test', data1);
    const key2 = cacheService.generateKey('test', data2);

    expect(key1).toBe(key2);
  });

  it('should provide cache stats', () => {
    cacheService.set('key1', 'data1');
    cacheService.set('key2', 'data2');

    const stats = cacheService.getStats();
    expect(stats.size).toBe(2);
    expect(stats.entries).toHaveLength(2);
  });
});

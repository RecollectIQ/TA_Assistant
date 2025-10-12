interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 30 * 60 * 1000; // 30 minutes
  private maxCacheSize = 100; // Maximum number of entries

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generate cache key from request data
  generateKey(prefix: string, data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return `${prefix}_${this.hashCode(dataString)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  set(key: string, data: any, ttl?: number): void {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.cleanup();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.timestamp = Date.now();
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Cache specific for grading results
  cacheGradingResult(requestData: any, result: any): void {
    const key = this.generateKey('grading', requestData);
    this.set(key, result, 60 * 60 * 1000); // 1 hour TTL
  }

  getGradingResult(requestData: any): any | null {
    const key = this.generateKey('grading', requestData);
    return this.get(key);
  }

  cacheAnalysisResult(images: string[], result: any): void {
    const key = this.generateKey('analysis', { images });
    this.set(key, result, 2 * 60 * 60 * 1000); // 2 hours TTL
  }

  getAnalysisResult(images: string[]): any | null {
    const key = this.generateKey('analysis', { images });
    return this.get(key);
  }

  // Cache API responses
  cacheApiResponse(endpoint: string, data: any, ttl?: number): void {
    const key = this.generateKey('api', { endpoint, data });
    this.set(key, data, ttl);
  }

  getApiResponse(endpoint: string, data: any): any | null {
    const key = this.generateKey('api', { endpoint, data });
    return this.get(key);
  }

  getStats(): {
    size: number;
    entries: { key: string; age: number; ttl: number }[];
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

export const cacheService = CacheService.getInstance();

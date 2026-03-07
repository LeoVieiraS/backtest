import { Injectable } from '@nestjs/common';
import { Asset } from '@domain/entities/asset';

/**
 * Cached asset information
 */
interface CachedAsset {
  asset: Asset;
  cachedAt: Date;
}

/**
 * Service for caching validated assets
 */
@Injectable()
export class AssetCacheService {
  private readonly cache: Map<string, CachedAsset> = new Map();
  private readonly cacheTTL: number = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Get cache key for an asset
   */
  private getCacheKey(symbol: string, type: string): string {
    return `${type}:${symbol}`;
  }

  /**
   * Get cached asset if exists and not expired
   */
  get(symbol: string, type: string): Asset | null {
    const key = this.getCacheKey(symbol, type);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = new Date();
    const age = now.getTime() - cached.cachedAt.getTime();

    if (age > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.asset;
  }

  /**
   * Store asset in cache
   */
  set(asset: Asset): void {
    const key = this.getCacheKey(asset.getSymbol(), asset.getType().getValue());
    this.cache.set(key, {
      asset,
      cachedAt: new Date(),
    });
  }

  /**
   * Check if asset exists in cache
   */
  has(symbol: string, type: string): boolean {
    const key = this.getCacheKey(symbol, type);
    return this.cache.has(key);
  }

  /**
   * Get all cached assets
   */
  getAll(): Asset[] {
    const now = new Date();
    const validAssets: Asset[] = [];

    for (const [key, cached] of this.cache.entries()) {
      const age = now.getTime() - cached.cachedAt.getTime();
      if (age <= this.cacheTTL) {
        validAssets.push(cached.asset);
      } else {
        this.cache.delete(key);
      }
    }

    return validAssets;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = new Date();
    for (const [key, cached] of this.cache.entries()) {
      const age = now.getTime() - cached.cachedAt.getTime();
      if (age > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}

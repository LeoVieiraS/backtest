import { Injectable } from '@nestjs/common';
import { Asset } from '@domain/entities/asset';
import { DateRange } from '@domain/value-objects/date-range';
import {
  IAssetPriceRepository,
  PriceDataPoint,
} from '@domain/repositories/asset-price-repository.interface';
import { AssetType } from '@domain/value-objects/asset-type';
import { AlphaVantageRepository } from './alpha-vantage-repository';
import { MockAssetPriceRepository } from './mock-asset-price-repository';

/**
 * Hybrid repository that routes requests to the appropriate provider
 * based on asset type. This allows easy addition of new providers
 * for different asset types in the future.
 */
@Injectable()
export class HybridAssetPriceRepository implements IAssetPriceRepository {
  constructor(
    private readonly alphaVantageRepository: AlphaVantageRepository,
    private readonly mockAssetPriceRepository: MockAssetPriceRepository,
  ) {}

  /**
   * Determines which repository should handle the request based on asset type
   */
  private getRepository(asset: Asset): IAssetPriceRepository {
    const type = asset.getType().getValue();

    if (type === AssetType.STOCK_BR || type === AssetType.STOCK_US) {
      return this.alphaVantageRepository;
    }

    if (type === AssetType.FII || type === AssetType.CRYPTO) {
      return this.mockAssetPriceRepository;
    }

    return this.mockAssetPriceRepository;
  }

  async getHistoricalPrices(
    asset: Asset,
    dateRange: DateRange,
  ): Promise<PriceDataPoint[]> {
    const repository = this.getRepository(asset);
    return repository.getHistoricalPrices(asset, dateRange);
  }

  async getPriceOnDate(asset: Asset, date: Date): Promise<number> {
    const repository = this.getRepository(asset);
    return repository.getPriceOnDate(asset, date);
  }

  async canProvideDataFor(asset: Asset): Promise<boolean> {
    const repository = this.getRepository(asset);
    return repository.canProvideDataFor(asset);
  }
}

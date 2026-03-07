import { Injectable, Inject } from '@nestjs/common';
import { Asset } from '@domain/entities/asset';
import { AssetType, AssetTypeVO } from '@domain/value-objects/asset-type';
import { IAssetPriceRepository } from '@domain/repositories/asset-price-repository.interface';
import { AssetCacheService } from '@infrastructure/services/asset-cache.service';
import { AlphaVantageRepository } from '@infrastructure/repositories/alpha-vantage-repository';
import { MockAssetPriceRepository } from '@infrastructure/repositories/mock-asset-price-repository';

/**
 * Use Case: Search Asset
 * Searches for an asset by symbol, validates it, and caches the result
 */
@Injectable()
export class SearchAssetUseCase {
  constructor(
    @Inject('IAssetPriceRepository')
    private readonly assetPriceRepository: IAssetPriceRepository,
    private readonly assetCacheService: AssetCacheService,
    private readonly alphaVantageRepository: AlphaVantageRepository,
    private readonly mockAssetPriceRepository: MockAssetPriceRepository,
  ) {}

  async execute(
    symbol: string,
    type: AssetType,
  ): Promise<Asset | null> {
    const normalizedSymbol = symbol.toUpperCase().trim();

    if (!normalizedSymbol) {
      return null;
    }

    const cached = this.assetCacheService.get(normalizedSymbol, type);
    if (cached) {
      return cached;
    }

    let assetInfo: { symbol: string; name: string; valid: boolean } | null =
      null;

    if (type === AssetType.STOCK_BR || type === AssetType.STOCK_US) {
      assetInfo = await this.alphaVantageRepository.searchAsset(
        normalizedSymbol,
        type,
      );
    } else if (type === AssetType.FII || type === AssetType.CRYPTO) {
      const canProvide = await this.mockAssetPriceRepository.canProvideDataFor(
        new Asset(normalizedSymbol, new AssetTypeVO(type), normalizedSymbol),
      );
      if (canProvide) {
        assetInfo = {
          symbol: normalizedSymbol,
          name: this.getDefaultName(normalizedSymbol, type),
          valid: true,
        };
      }
    }

    if (!assetInfo || !assetInfo.valid) {
      return null;
    }

    const asset = new Asset(
      assetInfo.symbol,
      new AssetTypeVO(type),
      assetInfo.name,
    );

    this.assetCacheService.set(asset);
    return asset;
  }

  private getDefaultName(symbol: string, type: AssetType): string {
    const names: Record<string, string> = {
      HGLG11: 'CSHG Logística FII',
      XPLG11: 'XP Log FII',
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
    };
    return names[symbol] || symbol;
  }
}

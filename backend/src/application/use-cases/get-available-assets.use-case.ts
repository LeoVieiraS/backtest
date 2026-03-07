import { Injectable } from '@nestjs/common';
import { Asset } from '@domain/entities/asset';
import { AssetCacheService } from '@infrastructure/services/asset-cache.service';
import { AssetType, AssetTypeVO } from '@domain/value-objects/asset-type';

/**
 * Use Case: Get Available Assets
 * Returns cached assets and some default popular assets
 */
@Injectable()
export class GetAvailableAssetsUseCase {
  constructor(private readonly assetCacheService: AssetCacheService) {}

  async execute(): Promise<Asset[]> {
    this.assetCacheService.clearExpired();

    const cachedAssets = this.assetCacheService.getAll();

    const defaultAssets: Asset[] = [
      new Asset('PETR4', new AssetTypeVO(AssetType.STOCK_BR), 'Petrobras PN'),
      new Asset('VALE3', new AssetTypeVO(AssetType.STOCK_BR), 'Vale ON'),
      new Asset('ITUB4', new AssetTypeVO(AssetType.STOCK_BR), 'Itaú Unibanco PN'),
      new Asset('AAPL', new AssetTypeVO(AssetType.STOCK_US), 'Apple Inc.'),
      new Asset('GOOGL', new AssetTypeVO(AssetType.STOCK_US), 'Alphabet Inc.'),
      new Asset('MSFT', new AssetTypeVO(AssetType.STOCK_US), 'Microsoft Corporation'),
      new Asset('HGLG11', new AssetTypeVO(AssetType.FII), 'CSHG Logística FII'),
      new Asset('XPLG11', new AssetTypeVO(AssetType.FII), 'XP Log FII'),
      new Asset('BTC', new AssetTypeVO(AssetType.CRYPTO), 'Bitcoin'),
      new Asset('ETH', new AssetTypeVO(AssetType.CRYPTO), 'Ethereum'),
    ];

    const assetMap = new Map<string, Asset>();

    defaultAssets.forEach((asset) => {
      const key = `${asset.getType().getValue()}:${asset.getSymbol()}`;
      assetMap.set(key, asset);
    });

    cachedAssets.forEach((asset) => {
      const key = `${asset.getType().getValue()}:${asset.getSymbol()}`;
      if (!assetMap.has(key)) {
        assetMap.set(key, asset);
      }
    });

    return Array.from(assetMap.values());
  }
}

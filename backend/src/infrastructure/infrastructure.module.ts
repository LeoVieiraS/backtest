import { Module } from '@nestjs/common';
import { MockAssetPriceRepository } from './repositories/mock-asset-price-repository';
import { AlphaVantageRepository } from './repositories/alpha-vantage-repository';
import { HybridAssetPriceRepository } from './repositories/hybrid-asset-price-repository';
import { AssetCacheService } from './services/asset-cache.service';
import { IAssetPriceRepository } from '@domain/repositories/asset-price-repository.interface';

/**
 * Infrastructure module containing concrete implementations
 */
@Module({
  providers: [
    AlphaVantageRepository,
    MockAssetPriceRepository,
    HybridAssetPriceRepository,
    AssetCacheService,
    {
      provide: 'IAssetPriceRepository',
      useClass: HybridAssetPriceRepository,
    },
  ],
  exports: ['IAssetPriceRepository', AssetCacheService, AlphaVantageRepository, MockAssetPriceRepository],
})
export class InfrastructureModule {}

import { Module } from '@nestjs/common';
import { ExecuteBacktestUseCase } from './use-cases/execute-backtest.use-case';
import { GetAvailableAssetsUseCase } from './use-cases/get-available-assets.use-case';
import { SearchAssetUseCase } from './use-cases/search-asset.use-case';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

/**
 * Application module containing use cases
 */
@Module({
  imports: [InfrastructureModule],
  providers: [
    ExecuteBacktestUseCase,
    GetAvailableAssetsUseCase,
    SearchAssetUseCase,
  ],
  exports: [
    ExecuteBacktestUseCase,
    GetAvailableAssetsUseCase,
    SearchAssetUseCase,
  ],
})
export class ApplicationModule {}

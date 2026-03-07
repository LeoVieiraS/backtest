import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ExecuteBacktestUseCase } from '@application/use-cases/execute-backtest.use-case';
import { GetAvailableAssetsUseCase } from '@application/use-cases/get-available-assets.use-case';
import { SearchAssetUseCase } from '@application/use-cases/search-asset.use-case';
import { BacktestMapper } from '@infrastructure/mappers/backtest-mapper';
import { CreateBacktestDto } from '../dto/create-backtest.dto';
import { BacktestResponseDto } from '@application/dto/backtest-response.dto';
import { AssetResponseDto } from '../dto/asset-response.dto';
import { AssetType } from '@domain/value-objects/asset-type';

/**
 * Controller for backtest operations
 */
@Controller('backtest')
export class BacktestController {
  constructor(
    private readonly executeBacktestUseCase: ExecuteBacktestUseCase,
    private readonly getAvailableAssetsUseCase: GetAvailableAssetsUseCase,
    private readonly searchAssetUseCase: SearchAssetUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async executeBacktest(
    @Body(ValidationPipe) createBacktestDto: CreateBacktestDto,
  ): Promise<BacktestResponseDto> {
    const { backtest, investmentsByAsset } = BacktestMapper.toDomain(createBacktestDto);
    const result = await this.executeBacktestUseCase.execute(backtest, investmentsByAsset);
    return BacktestMapper.toDto(result);
  }

  @Get('assets')
  async getAvailableAssets(): Promise<AssetResponseDto[]> {
    const assets = await this.getAvailableAssetsUseCase.execute();
    return assets.map((asset) => ({
      symbol: asset.getSymbol(),
      type: asset.getType().getValue(),
      name: asset.getName(),
    }));
  }

  @Get('search')
  async searchAsset(
    @Query('symbol') symbol: string,
    @Query('type') type: string,
  ): Promise<AssetResponseDto | null> {
    if (!symbol || !type) {
      return null;
    }

    const assetType = type as AssetType;
    if (!Object.values(AssetType).includes(assetType)) {
      return null;
    }

    try {
      const asset = await this.searchAssetUseCase.execute(symbol, assetType);
      if (!asset) {
        return null;
      }

      return {
        symbol: asset.getSymbol(),
        type: asset.getType().getValue(),
        name: asset.getName(),
      };
    } catch (error) {
      return null;
    }
  }

  @Get('test')
  async test(): Promise<{ status: string; message: string }> {
    return {
      status: 'ok',
      message: 'Backtest API is running',
    };
  }
}

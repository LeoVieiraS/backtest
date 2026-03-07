import { Backtest } from '@domain/entities/backtest';
import { BacktestResult } from '@domain/entities/backtest-result';
import { Asset } from '@domain/entities/asset';
import { AssetType, AssetTypeVO } from '@domain/value-objects/asset-type';
import { Money } from '@domain/value-objects/money';
import { DateRange } from '@domain/value-objects/date-range';
import { BacktestRequestDto } from '@application/dto/backtest-request.dto';
import { BacktestResponseDto } from '@application/dto/backtest-response.dto';

/**
 * Mapper for converting between DTOs and domain entities
 */
export class BacktestMapper {
  static toDomain(dto: BacktestRequestDto): {
    backtest: Backtest;
    investmentsByAsset: Map<string, Money>;
  } {
    const assets = dto.assets.map(
      (assetDto) =>
        new Asset(
          assetDto.symbol,
          new AssetTypeVO(assetDto.type),
          assetDto.symbol,
        ),
    );

    const totalInvestment = dto.assets.reduce(
      (sum, asset) => sum + (asset.investment || 0),
      0,
    );
    const initialInvestment = new Money(totalInvestment);
    const dateRange = new DateRange(
      new Date(dto.startDate),
      new Date(dto.endDate),
    );

    const investmentsByAsset = new Map<string, Money>();
    dto.assets.forEach((assetDto, index) => {
      const asset = assets[index];
      const key = `${asset.getSymbol()}-${asset.getType().getValue()}`;
      investmentsByAsset.set(key, new Money(assetDto.investment || 0));
    });

    return {
      backtest: new Backtest(assets, initialInvestment, dateRange),
      investmentsByAsset,
    };
  }

  static toDto(result: BacktestResult): BacktestResponseDto {
    return {
      initialInvestment: result.getInitialInvestment().getAmount(),
      finalValue: result.getFinalValue().getAmount(),
      profitOrLoss: result.getProfitOrLoss().getAmount(),
      returnPercentage: result.getReturnPercentage().getValue(),
      historicalData: result.getHistoricalData().map((point) => ({
        date: point.date.toISOString(),
        value: point.value,
      })),
      assetResults: result.getAssetResults().map((assetResult) => ({
        asset: {
          symbol: assetResult.asset.getSymbol(),
          type: assetResult.asset.getType().getValue(),
          name: assetResult.asset.getName(),
        },
        initialInvestment: assetResult.initialInvestment.getAmount(),
        finalValue: assetResult.finalValue.getAmount(),
        profitOrLoss: assetResult.profitOrLoss.getAmount(),
        returnPercentage: assetResult.returnPercentage.getValue(),
      })),
    };
  }
}

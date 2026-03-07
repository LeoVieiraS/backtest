import { Injectable, Inject } from '@nestjs/common';
import { Backtest } from '@domain/entities/backtest';
import { BacktestResult, AssetResult, HistoricalDataPoint } from '@domain/entities/backtest-result';
import { IAssetPriceRepository } from '@domain/repositories/asset-price-repository.interface';
import { Money } from '@domain/value-objects/money';
import { Percentage } from '@domain/value-objects/percentage';
import { DateRange } from '@domain/value-objects/date-range';

/**
 * Use Case: Execute Backtest
 * Orchestrates the backtest calculation logic
 */
@Injectable()
export class ExecuteBacktestUseCase {
  constructor(
    @Inject('IAssetPriceRepository')
    private readonly assetPriceRepository: IAssetPriceRepository,
  ) {}

  async execute(
    backtest: Backtest,
    investmentsByAsset?: Map<string, Money>,
  ): Promise<BacktestResult> {
    const assets = backtest.getAssets();
    const initialInvestment = backtest.getInitialInvestment();
    const dateRange = backtest.getDateRange();

    const assetResults: AssetResult[] = [];
    const allHistoricalData: Map<string, HistoricalDataPoint[]> = new Map();

    for (const asset of assets) {
      const canProvide = await this.assetPriceRepository.canProvideDataFor(asset);
      if (!canProvide) {
        throw new Error(`Cannot provide price data for asset: ${asset.getSymbol()}`);
      }

      const prices = await this.assetPriceRepository.getHistoricalPrices(
        asset,
        dateRange,
      );

      if (prices.length === 0) {
        throw new Error(`No price data available for asset: ${asset.getSymbol()}`);
      }

      const startPrice = await this.assetPriceRepository.getPriceOnDate(
        asset,
        dateRange.getStartDate(),
      );
      const endPrice = await this.assetPriceRepository.getPriceOnDate(
        asset,
        dateRange.getEndDate(),
      );

      const assetKey = `${asset.getSymbol()}-${asset.getType().getValue()}`;
      const assetInvestment = investmentsByAsset?.get(assetKey) || backtest.getInvestmentPerAsset();

      const shares = assetInvestment.getAmount() / startPrice;
      const finalValue = new Money(shares * endPrice);
      const profitOrLoss = finalValue.subtract(assetInvestment);
      const returnPercentage = this.calculateReturnPercentage(
        assetInvestment,
        finalValue,
      );

      assetResults.push({
        asset,
        initialInvestment: assetInvestment,
        finalValue,
        profitOrLoss,
        returnPercentage,
      });

      const historicalPoints = this.buildHistoricalDataPoints(
        prices,
        shares,
        dateRange,
      );
      allHistoricalData.set(asset.getSymbol(), historicalPoints);
    }

    const totalFinalValue = assetResults.reduce(
      (sum, result) => sum.add(result.finalValue),
      new Money(0),
    );

    const totalProfitOrLoss = totalFinalValue.subtract(initialInvestment);
    const totalReturnPercentage = this.calculateReturnPercentage(
      initialInvestment,
      totalFinalValue,
    );

    const combinedHistoricalData = this.combineHistoricalData(
      allHistoricalData,
      dateRange,
    );

    return new BacktestResult(
      initialInvestment,
      totalFinalValue,
      totalProfitOrLoss,
      totalReturnPercentage,
      combinedHistoricalData,
      assetResults,
    );
  }

  private calculateReturnPercentage(
    initial: Money,
    final: Money,
  ): Percentage {
    if (initial.getAmount() === 0) {
      return new Percentage(0);
    }
    const returnValue =
      ((final.getAmount() - initial.getAmount()) / initial.getAmount()) * 100;
    return new Percentage(returnValue);
  }

  private buildHistoricalDataPoints(
    prices: Array<{ date: Date; price: number }>,
    shares: number,
    dateRange: DateRange,
  ): HistoricalDataPoint[] {
    return prices
      .filter((p) => dateRange.contains(p.date))
      .map((p) => ({
        date: p.date,
        value: shares * p.price,
      }));
  }

  private combineHistoricalData(
    allData: Map<string, HistoricalDataPoint[]>,
    dateRange: DateRange,
  ): HistoricalDataPoint[] {
    const dateMap = new Map<string, number>();

    for (const points of allData.values()) {
      for (const point of points) {
        const dateKey = point.date.toISOString().split('T')[0];
        const currentValue = dateMap.get(dateKey) || 0;
        dateMap.set(dateKey, currentValue + point.value);
      }
    }

    const combined: HistoricalDataPoint[] = Array.from(dateMap.entries())
      .map(([dateStr, value]) => ({
        date: new Date(dateStr),
        value,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return combined;
  }
}

import { Money } from '../value-objects/money';
import { Percentage } from '../value-objects/percentage';
import { Asset } from './asset';

/**
 * Historical data point for chart visualization
 */
export interface HistoricalDataPoint {
  date: Date;
  value: number;
}

/**
 * Domain Entity representing the result of a backtest
 */
export class BacktestResult {
  private readonly initialInvestment: Money;
  private readonly finalValue: Money;
  private readonly profitOrLoss: Money;
  private readonly returnPercentage: Percentage;
  private readonly historicalData: HistoricalDataPoint[];
  private readonly assetResults: AssetResult[];

  constructor(
    initialInvestment: Money,
    finalValue: Money,
    profitOrLoss: Money,
    returnPercentage: Percentage,
    historicalData: HistoricalDataPoint[],
    assetResults: AssetResult[],
  ) {
    this.initialInvestment = initialInvestment;
    this.finalValue = finalValue;
    this.profitOrLoss = profitOrLoss;
    this.returnPercentage = returnPercentage;
    this.historicalData = [...historicalData];
    this.assetResults = [...assetResults];
  }

  getInitialInvestment(): Money {
    return this.initialInvestment;
  }

  getFinalValue(): Money {
    return this.finalValue;
  }

  getProfitOrLoss(): Money {
    return this.profitOrLoss;
  }

  getReturnPercentage(): Percentage {
    return this.returnPercentage;
  }

  getHistoricalData(): HistoricalDataPoint[] {
    return [...this.historicalData];
  }

  getAssetResults(): AssetResult[] {
    return [...this.assetResults];
  }
}

/**
 * Result for individual asset in the backtest
 */
export interface AssetResult {
  asset: Asset;
  initialInvestment: Money;
  finalValue: Money;
  profitOrLoss: Money;
  returnPercentage: Percentage;
}

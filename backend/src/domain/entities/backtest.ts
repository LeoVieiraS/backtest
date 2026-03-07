import { Asset } from './asset';
import { Money } from '../value-objects/money';
import { DateRange } from '../value-objects/date-range';

/**
 * Domain Entity representing a backtest request
 */
export class Backtest {
  private readonly assets: Asset[];
  private readonly initialInvestment: Money;
  private readonly dateRange: DateRange;

  constructor(assets: Asset[], initialInvestment: Money, dateRange: DateRange) {
    this.validate(assets, initialInvestment, dateRange);
    this.assets = [...assets];
    this.initialInvestment = initialInvestment;
    this.dateRange = dateRange;
  }

  private validate(
    assets: Asset[],
    initialInvestment: Money,
    dateRange: DateRange,
  ): void {
    if (!assets || assets.length === 0) {
      throw new Error('At least one asset is required');
    }
    if (initialInvestment.getAmount() <= 0) {
      throw new Error('Initial investment must be greater than zero');
    }
  }

  getAssets(): Asset[] {
    return [...this.assets];
  }

  getInitialInvestment(): Money {
    return this.initialInvestment;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getInvestmentPerAsset(): Money {
    return this.initialInvestment.divide(this.assets.length);
  }

  getAssetCount(): number {
    return this.assets.length;
  }
}

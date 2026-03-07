import { Asset } from '../entities/asset';
import { DateRange } from '../value-objects/date-range';

/**
 * Historical price data point
 */
export interface PriceDataPoint {
  date: Date;
  price: number;
}

/**
 * Interface for asset price repository (part of domain layer)
 * Implementation will be in infrastructure layer
 */
export interface IAssetPriceRepository {
  /**
   * Get historical prices for an asset within a date range
   */
  getHistoricalPrices(
    asset: Asset,
    dateRange: DateRange,
  ): Promise<PriceDataPoint[]>;

  /**
   * Get the price of an asset on a specific date
   */
  getPriceOnDate(asset: Asset, date: Date): Promise<number>;

  /**
   * Check if the repository can provide data for a given asset
   */
  canProvideDataFor(asset: Asset): Promise<boolean>;
}

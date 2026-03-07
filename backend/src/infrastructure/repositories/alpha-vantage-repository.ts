import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Asset } from '@domain/entities/asset';
import { DateRange } from '@domain/value-objects/date-range';
import {
  IAssetPriceRepository,
  PriceDataPoint,
} from '@domain/repositories/asset-price-repository.interface';
import { AssetType } from '@domain/value-objects/asset-type';

/**
 * Real implementation using Alpha Vantage API
 * Provides historical price data for stocks (BR and US)
 */
@Injectable()
export class AlphaVantageRepository implements IAssetPriceRepository {
  private readonly logger = new Logger(AlphaVantageRepository.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY environment variable is required');
    }
  }

  async getHistoricalPrices(
    asset: Asset,
    dateRange: DateRange,
  ): Promise<PriceDataPoint[]> {
    const symbol = this.mapSymbolToAlphaVantage(asset);
    if (!symbol) {
      throw new Error(`Symbol ${asset.getSymbol()} not supported by Alpha Vantage`);
    }

    try {
      this.logger.log(`Fetching historical prices for ${symbol}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          apikey: this.apiKey,
          outputsize: 'full',
        },
        timeout: 10000,
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No time series data returned for ${symbol}`);
      }

      const prices: PriceDataPoint[] = [];
      const startDate = dateRange.getStartDate();
      const endDate = dateRange.getEndDate();

      for (const [dateStr, data] of Object.entries(timeSeries)) {
        const date = new Date(dateStr);
        if (date >= startDate && date <= endDate) {
          const closePrice = parseFloat((data as any)['4. close']);
          if (!isNaN(closePrice) && isFinite(closePrice)) {
            prices.push({
              date,
              price: closePrice,
            });
          }
        }
      }

      if (prices.length === 0) {
        throw new Error(
          `No price data available for ${symbol} in the specified date range`,
        );
      }

      this.logger.log(`Retrieved ${prices.length} price points for ${symbol}`);

      return prices.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      this.logger.error(`Error fetching prices for ${symbol}: ${error}`);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch historical prices: ${error.message}`);
      }
      throw error;
    }
  }

  async getPriceOnDate(asset: Asset, date: Date): Promise<number> {
    const prices = await this.getHistoricalPrices(
      asset,
      new DateRange(date, date),
    );
    if (prices.length === 0) {
      throw new Error(
        `No price data available for ${asset.getSymbol()} on ${date.toISOString()}`,
      );
    }
    return prices[0].price;
  }

  async canProvideDataFor(asset: Asset): Promise<boolean> {
    const assetType = asset.getType().getValue();
    return (
      assetType === AssetType.STOCK_US || assetType === AssetType.STOCK_BR
    );
  }

  /**
   * Search for asset information by symbol
   * Uses OVERVIEW function to validate and get asset name
   */
  async searchAsset(symbol: string, type: AssetType): Promise<{
    symbol: string;
    name: string;
    valid: boolean;
  } | null> {
    const alphaVantageSymbol = this.mapSymbolToAlphaVantageByType(symbol, type);
    if (!alphaVantageSymbol) {
      return null;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'OVERVIEW',
          symbol: alphaVantageSymbol,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data['Error Message']) {
        return null;
      }

      if (response.data['Note']) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      const name = response.data['Name'];
      if (!name) {
        return null;
      }

      return {
        symbol,
        name,
        valid: true,
      };
    } catch (error) {
      this.logger.error(`Error searching asset ${symbol}: ${error}`);
      return null;
    }
  }

  private mapSymbolToAlphaVantage(asset: Asset): string | null {
    return this.mapSymbolToAlphaVantageByType(
      asset.getSymbol(),
      asset.getType().getValue(),
    );
  }

  private mapSymbolToAlphaVantageByType(
    symbol: string,
    type: AssetType,
  ): string | null {
    if (type === AssetType.STOCK_US) {
      return symbol;
    }

    if (type === AssetType.STOCK_BR) {
      return `${symbol}.SAO`;
    }

    return null;
  }
}

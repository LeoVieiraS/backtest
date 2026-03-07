import { Injectable } from '@nestjs/common';
import { Asset } from '@domain/entities/asset';
import { DateRange } from '@domain/value-objects/date-range';
import {
  IAssetPriceRepository,
  PriceDataPoint,
} from '@domain/repositories/asset-price-repository.interface';
import { AssetType } from '@domain/value-objects/asset-type';
import { differenceInDays, addDays } from 'date-fns';

/**
 * Mock implementation of AssetPriceRepository
 * Simulates market data for demonstration purposes
 * In production, this would connect to a real market data API
 */
@Injectable()
export class MockAssetPriceRepository implements IAssetPriceRepository {
  private readonly basePrices: Map<string, number> = new Map([
    ['PETR4', 28.50],
    ['VALE3', 65.20],
    ['ITUB4', 24.80],
    ['AAPL', 175.00],
    ['GOOGL', 140.00],
    ['MSFT', 380.00],
    ['HGLG11', 95.00],
    ['XPLG11', 102.50],
    ['BTC', 45000.00],
    ['ETH', 2800.00],
  ]);

  async getHistoricalPrices(
    asset: Asset,
    dateRange: DateRange,
  ): Promise<PriceDataPoint[]> {
    const basePrice = this.getBasePrice(asset);
    const volatility = this.getVolatility(asset.getType().getValue());
    const days = differenceInDays(dateRange.getEndDate(), dateRange.getStartDate());
    const prices: PriceDataPoint[] = [];

    let currentPrice = basePrice;
    const startDate = dateRange.getStartDate();

    for (let i = 0; i <= days; i++) {
      const date = addDays(startDate, i);
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      currentPrice = currentPrice * (1 + randomChange / 100);
      prices.push({
        date,
        price: Math.max(0.01, currentPrice),
      });
    }

    return prices;
  }

  async getPriceOnDate(asset: Asset, date: Date): Promise<number> {
    const basePrice = this.getBasePrice(asset);
    const volatility = this.getVolatility(asset.getType().getValue());
    const daysSinceStart = differenceInDays(
      date,
      new Date('2020-01-01'),
    );
    const trend = daysSinceStart * 0.01;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    return Math.max(0.01, basePrice * (1 + trend / 100) * (1 + randomChange / 100));
  }

  async canProvideDataFor(asset: Asset): Promise<boolean> {
    return this.basePrices.has(asset.getSymbol());
  }

  private getBasePrice(asset: Asset): number {
    const price = this.basePrices.get(asset.getSymbol());
    if (!price) {
      throw new Error(`Base price not found for asset: ${asset.getSymbol()}`);
    }
    return price;
  }

  private getVolatility(assetType: AssetType): number {
    switch (assetType) {
      case AssetType.CRYPTO:
        return 5.0;
      case AssetType.STOCK_BR:
        return 2.5;
      case AssetType.STOCK_US:
        return 2.0;
      case AssetType.FII:
        return 1.5;
      default:
        return 2.0;
    }
  }
}

import { AssetType } from '@domain/value-objects/asset-type';

/**
 * DTO for backtest request
 */
export interface BacktestRequestDto {
  assets: Array<{
    symbol: string;
    type: AssetType;
    investment: number;
  }>;
  initialInvestment: number;
  startDate: string;
  endDate: string;
}

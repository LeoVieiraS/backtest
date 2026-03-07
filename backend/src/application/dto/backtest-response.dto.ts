import { AssetType } from '@domain/value-objects/asset-type';

/**
 * DTO for backtest response
 */
export interface BacktestResponseDto {
  initialInvestment: number;
  finalValue: number;
  profitOrLoss: number;
  returnPercentage: number;
  historicalData: Array<{
    date: string;
    value: number;
  }>;
  assetResults: Array<{
    asset: {
      symbol: string;
      type: AssetType;
      name: string;
    };
    initialInvestment: number;
    finalValue: number;
    profitOrLoss: number;
    returnPercentage: number;
  }>;
}

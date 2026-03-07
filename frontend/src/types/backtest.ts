import { AssetType } from './asset';

export interface BacktestRequest {
  assets: Array<{
    symbol: string;
    type: AssetType;
    investment: number;
  }>;
  initialInvestment: number;
  startDate: string;
  endDate: string;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface AssetResult {
  asset: {
    symbol: string;
    type: AssetType;
    name: string;
  };
  initialInvestment: number;
  finalValue: number;
  profitOrLoss: number;
  returnPercentage: number;
}

export interface BacktestResponse {
  initialInvestment: number;
  finalValue: number;
  profitOrLoss: number;
  returnPercentage: number;
  historicalData: HistoricalDataPoint[];
  assetResults: AssetResult[];
}

export enum AssetType {
  STOCK_BR = 'STOCK_BR',
  STOCK_US = 'STOCK_US',
  FII = 'FII',
  CRYPTO = 'CRYPTO',
}

export interface Asset {
  symbol: string;
  type: AssetType;
  name: string;
}

export interface AssetResponse {
  symbol: string;
  type: AssetType;
  name: string;
}

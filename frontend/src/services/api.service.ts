import axios from 'axios';
import { AssetResponse, AssetType } from '@/types/asset';
import { BacktestRequest, BacktestResponse } from '@/types/backtest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async getAvailableAssets(): Promise<AssetResponse[]> {
    const response = await apiClient.get<AssetResponse[]>('/backtest/assets');
    return response.data;
  },

  async searchAsset(
    symbol: string,
    type: AssetType,
  ): Promise<AssetResponse | null> {
    try {
      const response = await apiClient.get<AssetResponse>('/backtest/search', {
        params: { symbol, type },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async executeBacktest(request: BacktestRequest): Promise<BacktestResponse> {
    const response = await apiClient.post<BacktestResponse>(
      '/backtest',
      request,
    );
    return response.data;
  },
};

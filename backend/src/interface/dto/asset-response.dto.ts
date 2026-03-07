import { AssetType } from '@domain/value-objects/asset-type';

/**
 * DTO for asset response
 */
export interface AssetResponseDto {
  symbol: string;
  type: AssetType;
  name: string;
}

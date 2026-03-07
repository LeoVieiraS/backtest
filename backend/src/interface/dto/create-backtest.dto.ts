import { IsArray, IsNumber, IsString, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '@domain/value-objects/asset-type';

class AssetDto {
  @IsString()
  symbol: string;

  @IsEnum(AssetType)
  type: AssetType;

  @IsNumber()
  @Min(0.01)
  investment: number;
}

/**
 * DTO for creating a backtest request
 */
export class CreateBacktestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets: AssetDto[];

  @IsNumber()
  @Min(0.01)
  initialInvestment: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

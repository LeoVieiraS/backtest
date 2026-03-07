import { AssetTypeVO } from '../value-objects/asset-type';

/**
 * Domain Entity representing a financial asset
 */
export class Asset {
  private readonly symbol: string;
  private readonly type: AssetTypeVO;
  private readonly name: string;

  constructor(symbol: string, type: AssetTypeVO, name: string) {
    this.validate(symbol, name);
    this.symbol = symbol.toUpperCase();
    this.type = type;
    this.name = name;
  }

  private validate(symbol: string, name: string): void {
    if (!symbol || symbol.trim().length === 0) {
      throw new Error('Asset symbol cannot be empty');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Asset name cannot be empty');
    }
  }

  getSymbol(): string {
    return this.symbol;
  }

  getType(): AssetTypeVO {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  equals(other: Asset): boolean {
    return this.symbol === other.symbol && this.type.equals(other.type);
  }
}

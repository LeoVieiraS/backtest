/**
 * Value Object representing the type of asset
 */
export enum AssetType {
  STOCK_BR = 'STOCK_BR',
  STOCK_US = 'STOCK_US',
  FII = 'FII',
  CRYPTO = 'CRYPTO',
}

export class AssetTypeVO {
  private readonly value: AssetType;

  constructor(value: AssetType) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: AssetType): void {
    if (!Object.values(AssetType).includes(value)) {
      throw new Error(`Invalid asset type: ${value}`);
    }
  }

  getValue(): AssetType {
    return this.value;
  }

  equals(other: AssetTypeVO): boolean {
    return this.value === other.value;
  }
}

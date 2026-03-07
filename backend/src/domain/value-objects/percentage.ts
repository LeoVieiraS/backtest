/**
 * Value Object representing percentage values
 */
export class Percentage {
  private readonly value: number;

  constructor(value: number) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: number): void {
    if (!Number.isFinite(value)) {
      throw new Error('Percentage must be a finite number');
    }
  }

  getValue(): number {
    return this.value;
  }

  getDecimal(): number {
    return this.value / 100;
  }

  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  equals(other: Percentage): boolean {
    return Math.abs(this.value - other.value) < 0.0001;
  }
}

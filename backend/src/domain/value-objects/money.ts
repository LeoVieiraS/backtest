/**
 * Value Object representing monetary values
 */
export class Money {
  private readonly amount: number;

  constructor(amount: number) {
    this.validate(amount);
    this.amount = amount;
  }

  private validate(amount: number): void {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number');
    }
  }

  getAmount(): number {
    return this.amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amount / divisor);
  }

  equals(other: Money): boolean {
    return Math.abs(this.amount - other.amount) < 0.01;
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }
}

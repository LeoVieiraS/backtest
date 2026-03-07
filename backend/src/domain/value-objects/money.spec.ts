import { Money } from './money';

describe('Money', () => {
  describe('constructor', () => {
    it('should create a valid money instance', () => {
      const money = new Money(100);
      expect(money.getAmount()).toBe(100);
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-10)).toThrow('Money amount cannot be negative');
    });

    it('should throw error for non-finite amount', () => {
      expect(() => new Money(Infinity)).toThrow(
        'Money amount must be a finite number',
      );
      expect(() => new Money(NaN)).toThrow(
        'Money amount must be a finite number',
      );
    });
  });

  describe('add', () => {
    it('should add two money amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);
      expect(result.getAmount()).toBe(150);
    });
  });

  describe('subtract', () => {
    it('should subtract two money amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);
      const result = money1.subtract(money2);
      expect(result.getAmount()).toBe(70);
    });
  });

  describe('multiply', () => {
    it('should multiply money by a factor', () => {
      const money = new Money(100);
      const result = money.multiply(1.5);
      expect(result.getAmount()).toBe(150);
    });
  });

  describe('divide', () => {
    it('should divide money by a divisor', () => {
      const money = new Money(100);
      const result = money.divide(2);
      expect(result.getAmount()).toBe(50);
    });

    it('should throw error when dividing by zero', () => {
      const money = new Money(100);
      expect(() => money.divide(0)).toThrow('Cannot divide by zero');
    });
  });

  describe('equals', () => {
    it('should return true for equal amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(100);
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(200);
      expect(money1.equals(money2)).toBe(false);
    });
  });
});

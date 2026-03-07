import { DateRange } from './date-range';

describe('DateRange', () => {
  describe('constructor', () => {
    it('should create a valid date range', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      const range = new DateRange(start, end);
      expect(range.getStartDate()).toEqual(start);
      expect(range.getEndDate()).toEqual(end);
    });

    it('should throw error if start date is after end date', () => {
      const start = new Date('2023-12-31');
      const end = new Date('2023-01-01');
      expect(() => new DateRange(start, end)).toThrow(
        'Start date cannot be after end date',
      );
    });

    it('should throw error for invalid start date', () => {
      const invalidDate = new Date('invalid');
      const end = new Date('2023-12-31');
      expect(() => new DateRange(invalidDate, end)).toThrow(
        'Start date must be a valid date',
      );
    });

    it('should throw error for invalid end date', () => {
      const start = new Date('2023-01-01');
      const invalidDate = new Date('invalid');
      expect(() => new DateRange(start, invalidDate)).toThrow(
        'End date must be a valid date',
      );
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate days difference correctly', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-01-31');
      const range = new DateRange(start, end);
      expect(range.getDaysDifference()).toBe(30);
    });
  });

  describe('contains', () => {
    it('should return true for date within range', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      const range = new DateRange(start, end);
      const date = new Date('2023-06-15');
      expect(range.contains(date)).toBe(true);
    });

    it('should return false for date before range', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      const range = new DateRange(start, end);
      const date = new Date('2022-12-31');
      expect(range.contains(date)).toBe(false);
    });

    it('should return false for date after range', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      const range = new DateRange(start, end);
      const date = new Date('2024-01-01');
      expect(range.contains(date)).toBe(false);
    });
  });
});

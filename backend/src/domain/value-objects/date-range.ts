/**
 * Value Object representing a date range
 */
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this.validate(startDate, endDate);
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  private validate(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Start date must be a valid date');
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('End date must be a valid date');
    }
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  getDaysDifference(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}

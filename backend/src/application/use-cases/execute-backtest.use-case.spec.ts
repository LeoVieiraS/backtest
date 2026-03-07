import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteBacktestUseCase } from './execute-backtest.use-case';
import { IAssetPriceRepository } from '@domain/repositories/asset-price-repository.interface';
import { Backtest } from '@domain/entities/backtest';
import { Asset } from '@domain/entities/asset';
import { AssetType, AssetTypeVO } from '@domain/value-objects/asset-type';
import { Money } from '@domain/value-objects/money';
import { DateRange } from '@domain/value-objects/date-range';

describe('ExecuteBacktestUseCase', () => {
  let useCase: ExecuteBacktestUseCase;
  let mockRepository: jest.Mocked<IAssetPriceRepository>;

  beforeEach(async () => {
    mockRepository = {
      getHistoricalPrices: jest.fn(),
      getPriceOnDate: jest.fn(),
      canProvideDataFor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteBacktestUseCase,
        {
          provide: 'IAssetPriceRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ExecuteBacktestUseCase>(ExecuteBacktestUseCase);
  });

  it('should execute backtest successfully', async () => {
    const asset = new Asset(
      'PETR4',
      new AssetTypeVO(AssetType.STOCK_BR),
      'Petrobras',
    );
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const dateRange = new DateRange(startDate, endDate);
    const backtest = new Backtest(
      [asset],
      new Money(10000),
      dateRange,
    );

    mockRepository.canProvideDataFor.mockResolvedValue(true);
    mockRepository.getPriceOnDate
      .mockResolvedValueOnce(25.0)
      .mockResolvedValueOnce(30.0);
    mockRepository.getHistoricalPrices.mockResolvedValue([
      { date: startDate, price: 25.0 },
      { date: endDate, price: 30.0 },
    ]);

    const result = await useCase.execute(backtest);

    expect(result.getInitialInvestment().getAmount()).toBe(10000);
    expect(result.getFinalValue().getAmount()).toBeGreaterThan(10000);
    expect(result.getReturnPercentage().getValue()).toBeGreaterThan(0);
  });

  it('should throw error if asset data cannot be provided', async () => {
    const asset = new Asset(
      'INVALID',
      new AssetTypeVO(AssetType.STOCK_BR),
      'Invalid',
    );
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const dateRange = new DateRange(startDate, endDate);
    const backtest = new Backtest(
      [asset],
      new Money(10000),
      dateRange,
    );

    mockRepository.canProvideDataFor.mockResolvedValue(false);

    await expect(useCase.execute(backtest)).rejects.toThrow(
      'Cannot provide price data for asset: INVALID',
    );
  });
});

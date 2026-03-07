import { Module } from '@nestjs/common';
import { BacktestController } from './controllers/backtest.controller';
import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

/**
 * Interface module containing controllers
 */
@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [BacktestController],
})
export class InterfaceModule {}

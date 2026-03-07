import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterfaceModule } from './interface/interface.module';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

/**
 * Root application module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InterfaceModule,
    ApplicationModule,
    InfrastructureModule,
  ],
})
export class AppModule {}

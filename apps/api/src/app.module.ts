import { Module } from '@nestjs/common';
import { PackagesModule } from './packages/packages.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PackagesModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}

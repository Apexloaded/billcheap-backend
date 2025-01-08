import { Module } from '@nestjs/common';
import { ElectricityService } from './electricity.service';
import { ElectricityController } from './electricity.controller';
import { ReloadlyModule } from '@/reloadly/reloadly.module';

@Module({
  imports: [ReloadlyModule],
  controllers: [ElectricityController],
  providers: [ElectricityService],
})
export class ElectricityModule {}

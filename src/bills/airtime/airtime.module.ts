import { Module } from '@nestjs/common';
import { AirtimeService } from './airtime.service';
import { AirtimeController } from './airtime.controller';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AirtimeBill, AirtimeBillSchema } from './schemas/airtime.schema';
import { AirtimeProcessor } from './airtime.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AirtimeBill.name, schema: AirtimeBillSchema },
    ]),
    ReloadlyModule,
    HttpModule
  ],
  controllers: [AirtimeController],
  providers: [AirtimeService, AirtimeProcessor],
  exports: [AirtimeService, AirtimeProcessor],
})
export class AirtimeModule {}

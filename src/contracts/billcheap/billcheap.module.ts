import { Module } from '@nestjs/common';
import { BillCheapService } from './billcheap.service';
import { BillcheapController } from './billcheap.controller';
import { BillCheapListener } from './billcheap.listener';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractEvent,
  ContractEventSchema,
} from '../schemas/contract-event.schema';
import { BillsModule } from '@/bills/bills.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractEvent.name, schema: ContractEventSchema },
    ]),
    BillsModule
  ],
  controllers: [BillcheapController],
  providers: [BillCheapService, BillCheapListener],
  exports: [BillCheapService],
})
export class BillCheapModule {}

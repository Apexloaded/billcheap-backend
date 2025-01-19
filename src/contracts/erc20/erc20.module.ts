import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractEvent,
  ContractEventSchema,
} from '../schemas/contract-event.schema';
import { Erc20Service } from './erc20.service';
import { Erc20Job } from './erc20.job';
import { TokensModule } from '@/tokens/tokens.module';
import { UserModule } from '@/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { Erc20Processor } from './event.processor';
import { TransactionModule } from '@/transaction/transaction.module';
import { BillCheapModule } from '../billcheap/billcheap.module';
import { EventModule } from '@/event/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractEvent.name, schema: ContractEventSchema },
    ]),
    BullModule.registerQueue({
      name: 'erc20-events',
    }),
    TokensModule,
    UserModule,
    TransactionModule,
    BillCheapModule,
    EventModule
  ],
  providers: [Erc20Service, Erc20Job, Erc20Processor],
  exports: [Erc20Service],
})
export class Erc20Module {}

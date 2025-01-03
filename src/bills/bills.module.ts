import { forwardRef, Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { AirtimeModule } from './airtime/airtime.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from './schema/bill.schema';
import { UserModule } from '@/user/user.module';
import { TransactionModule } from '@/transaction/transaction.module';
import { BillsProcessor } from './bills.processor';

@Module({
  imports: [
    AirtimeModule,
    MongooseModule.forFeature([{ name: Bill.name, schema: BillSchema }]),
    forwardRef(() => UserModule),
    TransactionModule,
  ],
  controllers: [BillsController],
  providers: [BillsService, BillsProcessor],
  exports: [BillsService, BillsProcessor],
})
export class BillsModule {}

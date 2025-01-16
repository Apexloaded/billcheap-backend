import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BillStatus, BillType } from './schema/bill.schema';
import { BlockchainEvent } from '@/contracts/billcheap/billcheap.service';
import { fromHex } from 'viem';
import { BillsService } from './bills.service';
import { AirtimeProcessor } from './airtime/airtime.processor';
import { TransactionService } from '@/transaction/transaction.service';
import { TxStatus } from '@/transaction/schema/transaction.schema';

@Injectable()
export class BillsProcessor {
  private readonly logger = new Logger(BillsProcessor.name);

  constructor(
    private readonly billsService: BillsService,
    private readonly airtimeProcessor: AirtimeProcessor,
    private readonly txService: TransactionService,
  ) {}

  async processBillEvent(event: BlockchainEvent) {
    const { from, id, externalTxId, billId, timestamp } = event.args;
    const unHashedBillId = fromHex(billId, 'string');
    const unHashedTransactionId = fromHex(externalTxId, 'string');

    const bill = await this.billsService.findOne({ _id: unHashedBillId });
    const transaction = this.txService.findOne({ _id: unHashedTransactionId });

    if (!bill || !transaction) return;

    switch (bill.billType) {
      case BillType.AIRTIME: {
        try {
          const airtimeRes =
            await this.airtimeProcessor.processAirtime(unHashedBillId);

          const [billsUpdate, txUpdate] = await Promise.all([
            this.billsService.updateOne(
              { _id: unHashedBillId },
              {
                status: airtimeRes.status,
                billExternalId: airtimeRes.transaction.transactionId,
              },
            ),
            this.txService.update(
              { _id: unHashedTransactionId },
              {
                status: TxStatus.SUCCESSFUL,
                onChainTxId: id,
                senderAddress: from,
              },
            ),
          ]);
        } catch (error) {
          this.logger.error('Error processing airtime bill', error);
        }
        break;
      }
      case BillType.MOBILE_DATA: {
        try {
          const airtimeRes =
            await this.airtimeProcessor.processAirtime(unHashedBillId);

          const [billsUpdate, txUpdate] = await Promise.all([
            this.billsService.updateOne(
              { _id: unHashedBillId },
              {
                status: airtimeRes.status,
                billExternalId: airtimeRes.transaction.transactionId,
              },
            ),
            this.txService.update(
              { _id: unHashedTransactionId },
              {
                status: TxStatus.SUCCESSFUL,
                onChainTxId: id,
                senderAddress: from,
              },
            ),
          ]);
        } catch (error) {
          this.logger.error('Error processing airtime bill', error);
        }
        break;
      }
      default:
        this.logger.warn(`Unhandled event type: ${event.name}`);
    }
  }
}

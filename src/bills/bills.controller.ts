import { Body, Controller, Post, Req } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateAirtimeDto } from './airtime/dto/create-airtime.dto';
import { UserService } from '@/user/user.service';
import { generateId } from '@/utils/generate-id';
import { Bill, BillType } from './schema/bill.schema';
import { AirtimeService } from './airtime/airtime.service';
import { TransactionService } from '@/transaction/transaction.service';
import {
  PaymentMethods,
  TxType,
} from '@/transaction/schema/transaction.schema';
import { CreateTransactionDto } from '@/transaction/dto/create-transaction.dto';
import { ContractBillType, ContractTxType } from '@/enums/contract.enum';
import { toHex } from 'viem';

@Controller('bill')
export class BillsController {
  constructor(
    private readonly airtimeService: AirtimeService,
    private readonly billsService: BillsService,
    private readonly userService: UserService,
    private readonly txService: TransactionService,
  ) {}

  @Post('/topup/airtime')
  async createAirtimeBill(@Req() req: Request, @Body() body: CreateAirtimeDto) {
    const authUser = req['user'];
    const user = await this.userService.findOne({ _id: authUser.id });

    if (!user) {
      throw new Error('Unauthorized');
    }

    const customIdentifier = generateId({ length: 16 });

    // Add parent billing information to bills
    const billPayload = {
      user: authUser.id,
      billType: BillType.AIRTIME,
      amount: parseFloat(body.amount),
      reference: customIdentifier,
    };
    const bill = await this.billsService.create(billPayload);

    // Add specific airtime bill information
    const airtimePayload = {
      bill: bill._id.toString() as unknown as Bill,
      provider: {
        name: body.providerName,
        providerId: body.provider,
        logoUrl: body.logoUrl,
      },
      processedBy: authUser.id,
      recipient: {
        countryCode: body.countryCode,
        number: body.phoneNumber,
      },
      localAmount: parseFloat(body.amount),
      reference: customIdentifier,
    };
    await this.airtimeService.create(airtimePayload);

    // Create transaction for this bill
    const txPayload = {
      userId: authUser.id,
      billId: bill._id.toString(),
      amount: parseFloat(body.amount),
      type: TxType.BILL_PAYMENT,
      paymentMethod: PaymentMethods.CRYPTO,
      tokenAddress: body.token,
    };
    const transaction = await this.createTransaction(txPayload);

    const response = {
      transactionId: toHex(transaction._id.toString()),
      billType: ContractBillType.Airtime,
      billId: toHex(bill._id.toString()),
      tokenAddress: body.token,
      transactionType: ContractTxType.BillPayment,
      providerId: toHex(body.provider),
    };

    return response;
  }

  @Post('/topup/data')
  async createDataBill(@Req() req: Request, @Body() body: CreateAirtimeDto) {
    const authUser = req['user'];
    const user = await this.userService.findOne({ _id: authUser.id });

    if (!user) {
      throw new Error('Unauthorized');
    }

    const customIdentifier = generateId({ length: 16 });

    // Add parent billing information to bills
    const billPayload = {
      user: authUser.id,
      billType: BillType.MOBILE_DATA,
      amount: parseFloat(body.amount),
      reference: customIdentifier,
    };
    const bill = await this.billsService.create(billPayload);

    // Add specific airtime bill information
    const airtimePayload = {
      bill: bill._id.toString() as unknown as Bill,
      provider: {
        name: body.providerName,
        providerId: body.provider,
        logoUrl: body.logoUrl,
      },
      processedBy: authUser.id,
      recipient: {
        countryCode: body.countryCode,
        number: body.phoneNumber,
      },
      localAmount: parseFloat(body.amount),
      reference: customIdentifier,
    };
    await this.airtimeService.create(airtimePayload);

    // Create transaction for this bill
    const txPayload = {
      userId: authUser.id,
      billId: bill._id.toString(),
      amount: parseFloat(body.amount),
      type: TxType.BILL_PAYMENT,
      paymentMethod: PaymentMethods.CRYPTO,
      tokenAddress: body.token,
    };
    const transaction = await this.createTransaction(txPayload);

    const response = {
      transactionId: toHex(transaction._id.toString()),
      billType: ContractBillType.Data,
      billId: toHex(bill._id.toString()),
      tokenAddress: body.token,
      transactionType: ContractTxType.BillPayment,
      providerId: toHex(body.provider),
    };

    return response;
  }

  private async createTransaction(payload: CreateTransactionDto) {
    return await this.txService.create(payload);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bill, BillDocument, BillType } from './schema/bill.schema';
import { FilterQuery, Model } from 'mongoose';
import { BlockchainEvent } from '@/contracts/billcheap/billcheap.service';
import { fromHex } from 'viem';

@Injectable()
export class BillsService {
  constructor(@InjectModel(Bill.name) private readonly bill: Model<Bill>) {}

  async create(bill: Partial<Bill>): Promise<BillDocument> {
    return await this.bill.create(bill);
  }

  async findOne(filter: FilterQuery<Bill>) {
    return await this.bill.findOne(filter);
  }

  async updateOne(filter: FilterQuery<Bill>, update: Partial<Bill>) {
    return await this.bill.findOneAndUpdate(filter, update);
  }
}

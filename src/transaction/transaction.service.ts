import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './schema/transaction.schema';
import { FilterQuery, Model } from 'mongoose';
import { BillType } from '@/bills/schema/bill.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private readonly txModel: Model<Transaction>,
  ) {}
  create(createTransactionDto: CreateTransactionDto) {
    return this.txModel.create(createTransactionDto);
  }

  findAll(userId: string, wallet: string, page: number, pageSize: number) {
    console.log(wallet);
    const skip = page * pageSize;
    return this.txModel.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$userId', { $toObjectId: userId }] },
              {
                $or: [
                  { $eq: ['$senderAddress', wallet] },
                  { $eq: ['$recipientAddress', wallet] },
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'bills',
          localField: 'billId',
          foreignField: '_id',
          as: 'bills',
        },
      },
      {
        $unwind: {
          path: '$bills',
          preserveNullAndEmptyArrays: true, // Ensures transactions without bills are not excluded
        },
      },
      {
        $lookup: {
          from: 'airtimebills',
          localField: 'bills._id',
          foreignField: 'bill',
          as: 'airtime',
        },
      },
      {
        $addFields: {
          id: '$_id',
          billType: '$bills.billType',
          billStatus: '$bills.status',
          reference: '$bills.reference',
          billDetails: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$bills.billType', BillType.AIRTIME] },
                  then: { $arrayElemAt: ['$airtime', 0] },
                },
                {
                  case: { $eq: ['$bills.billType', BillType.MOBILE_DATA] },
                  then: { $arrayElemAt: ['$airtime', 0] },
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          bills: 0,
          airtime: 0,
        },
      },
    ]);
  }

  findOne(filter: FilterQuery<Transaction>) {
    return this.txModel.findOne(filter);
  }

  update(filter: FilterQuery<Transaction>, update: Partial<Transaction>) {
    return this.txModel.findOneAndUpdate(filter, update);
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}

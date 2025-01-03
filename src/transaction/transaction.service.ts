import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './schema/transaction.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private readonly txModel: Model<Transaction>,
  ) {}
  create(createTransactionDto: CreateTransactionDto) {
    return this.txModel.create(createTransactionDto);
  }

  findAll(userId: string, page: number, pageSize: number) {
    const skip = page * pageSize;
    return this.txModel.aggregate([
      { $match: { $expr: { $eq: ['$userId', { $toObjectId: userId }] } } },
      {
        $lookup: {
          from: 'bills',
          localField: 'billId',
          foreignField: '_id',
          as: 'bills',
        },
      },
      { $unwind: '$bills' },
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
          metaData: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$bills.billType', 'AIRTIME'] },
                  then: { $arrayElemAt: ['$airtime', 0] },
                },
                // {
                //   case: { $eq: ['$bill_type', 'Data'] },
                //   then: { $arrayElemAt: ['$data_bill', 0] },
                // },
                // {
                //   case: { $eq: ['$bill_type', 'Cable'] },
                //   then: { $arrayElemAt: ['$cable_bill', 0] },
                // },
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

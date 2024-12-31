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

  findAll() {
    return `This action returns all transaction`;
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

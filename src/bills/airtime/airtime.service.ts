import { Injectable } from '@nestjs/common';
import { CreateAirtimeDto } from './dto/create-airtime.dto';
import { UpdateAirtimeDto } from './dto/update-airtime.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AirtimeBill } from './schemas/airtime.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class AirtimeService {
  constructor(
    @InjectModel(AirtimeBill.name) private readonly model: Model<AirtimeBill>,
  ) {}
  create(payload: Partial<AirtimeBill>) {
    return this.model.create(payload);
  }

  findAll(filter: FilterQuery<AirtimeBill>) {
    return this.model.find(filter);
  }

  findOne(filter: FilterQuery<AirtimeBill>) {
    return this.model.findOne(filter);
  }

  update(id: number, updateAirtimeDto: UpdateAirtimeDto) {
    return `This action updates a #${id} airtime`;
  }

  remove(id: number) {
    return `This action removes a #${id} airtime`;
  }

  processAirtime() {}
}

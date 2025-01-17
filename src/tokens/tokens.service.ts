import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { ListedToken } from './schemas/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BillCheapService } from '@/contracts/billcheap/billcheap.service';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(ListedToken.name) private model: Model<ListedToken>,
    private readonly bcService: BillCheapService,
  ) {}
  create(createTokenDto: CreateTokenDto) {
    return 'This action adds a new token';
  }

  findAll() {
    return this.model.find();
  }

  findOne(filter: FilterQuery<ListedToken>) {
    return this.model.findOne(filter);;
  }

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  remove(id: number) {
    return `This action removes a #${id} token`;
  }

  async queryBalance(address: `0x${string}`) {
    const tokens = await this.findAll();
    return this.bcService.getAccountBalance(tokens, address);
  }
}

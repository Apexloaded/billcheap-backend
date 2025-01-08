import { Injectable } from '@nestjs/common';
import { CreateElectricityDto } from './dto/create-electricity.dto';
import { UpdateElectricityDto } from './dto/update-electricity.dto';

@Injectable()
export class ElectricityService {
  create(createElectricityDto: CreateElectricityDto) {
    return 'This action adds a new electricity';
  }

  findAll() {
    return `This action returns all electricity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} electricity`;
  }

  update(id: number, updateElectricityDto: UpdateElectricityDto) {
    return `This action updates a #${id} electricity`;
  }

  remove(id: number) {
    return `This action removes a #${id} electricity`;
  }
}

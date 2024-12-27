import { Injectable } from '@nestjs/common';
import { CreateTGUserDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(filter: FilterQuery<UserDocument>) {
    return this.userModel.findOne(filter);
  }

  findOneOrCreate(
    filter: FilterQuery<User>,
    createUserDto: CreateTGUserDto,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      filter,
      { $setOnInsert: createUserDto },
      { upsert: true, new: true },
    );
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateTGUserDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    //this.seedUsers();
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll(filter?: FilterQuery<User>) {
    return this.userModel.find(filter);
  }

  findOne(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter);
  }

  findOneOrCreate(
    filter: FilterQuery<User>,
    createUserDto: Partial<User>,
  ): Promise<User> {
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

  async seedUsers() {
    const users = faker.helpers.multiple(this.createRandomUser, {
      count: 1000,
    });
    await this.userModel.insertMany(users);
  }

  private createRandomUser() {
    const mnemonic = generateMnemonic(english);
    const account = mnemonicToAccount(mnemonic);
    return {
      telegramId: faker.number.int(),
      billId: faker.string.numeric(7),
      firstName: faker.internet.displayName(),
      lastName: faker.internet.displayName(),
      referralCode: faker.string.alphanumeric(6),
      roles: ['USER'],
      wallet: account.address,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { AudienceType } from '@/enums/reloadly.enum';
import { InjectModel } from '@nestjs/mongoose';
import { ReloadlyAuth, ReloadlyAuthDocument } from '../schema/reloadly.schema';
import { Model } from 'mongoose';
import { CreateReloadlyAuthDto } from '../dto/reloadly-auth.dto';

@Injectable()
export class ReloadlyTokenStorageService {
  constructor(
    @InjectModel(ReloadlyAuth.name) private readonly model: Model<ReloadlyAuth>,
  ) {}

  async getAuthToken(key: AudienceType): Promise<ReloadlyAuthDocument> {
    return this.model.findOne({ audience: key });
  }

  async setAuthToken(
    body: CreateReloadlyAuthDto,
  ): Promise<ReloadlyAuthDocument> {
    const { audience } = body;
    const filter = { audience };
    const options = { upsert: true, new: true };
    const update = {
      $set: body,
    };
    console.log('setting body', body);
    return this.model.findOneAndUpdate(filter, update, options);
  }

  async deleteAuthToken(key: AudienceType): Promise<void> {
    await this.model.deleteOne({ audience: key });
  }
}

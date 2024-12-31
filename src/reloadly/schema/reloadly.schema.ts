import { AudienceType } from '@/enums/reloadly.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReloadlyAuthDocument = HydratedDocument<ReloadlyAuth>;

@Schema({ timestamps: true })
export class ReloadlyAuth {
  @Prop({ unique: true, enum: AudienceType })
  audience: AudienceType;

  @Prop()
  accessToken: string;

  @Prop()
  expiresIn: number;

  @Prop()
  tokenType: string;

  @Prop()
  scope: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ReloadlyAuthSchema = SchemaFactory.createForClass(ReloadlyAuth);

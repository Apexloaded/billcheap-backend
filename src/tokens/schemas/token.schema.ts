import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ListedTokenDocument = HydratedDocument<ListedToken>;

@Schema({ timestamps: true })
export class ListedToken {
  @Prop()
  token: string;

  @Prop({ unique: true, lowercase: true })
  address: string;

  @Prop({ lowercase: true })
  aggregator: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  icon: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ListedTokenSchema = SchemaFactory.createForClass(ListedToken);

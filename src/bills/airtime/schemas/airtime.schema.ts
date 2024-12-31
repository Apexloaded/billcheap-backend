import { Bill } from '@/bills/schema/bill.schema';
import { User } from '@/user/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, now } from 'mongoose';

export type AirtimeBillDocument = HydratedDocument<AirtimeBill>;

export class Recipient {
  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  number: string;
}

export class Provider {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  providerId: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  transactionId?: string;
}

@Schema({ timestamps: true })
export class AirtimeBill {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    unique: true,
  })
  bill: Bill;

  @Prop()
  provider: Provider;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  processedBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  processedFor?: User;

  @Prop()
  recipient: Recipient;

  @Prop({ required: true })
  localAmount: number;

  @Prop()
  foreignAmount: number;

  @Prop()
  currencyCode: string;

  @Prop({ required: true })
  reference: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AirtimeBillSchema = SchemaFactory.createForClass(AirtimeBill);

import { User } from '@/user/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum BillStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  PROCESSING = 'PROCESSING',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum BillType {
  AIRTIME = 'AIRTIME',
  ELECTRICITY = 'ELECTRICITY',
  CABLE_TV = 'CABLE_TV',
  MOBILE_DATA = 'MOBILE_DATA',
}

export type BillDocument = HydratedDocument<Bill>;

@Schema({ timestamps: true })
export class Bill {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ enum: BillType, required: true })
  billType: BillType;

  @Prop()
  billExternalId: number; // To be updated when bill is processed.

  @Prop({ required: true })
  amount: number;

  @Prop()
  dueDate: Date;

  @Prop()
  reference: string;

  @Prop({ enum: BillStatus, required: true, default: BillStatus.PENDING })
  status: BillStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BillSchema = SchemaFactory.createForClass(Bill);

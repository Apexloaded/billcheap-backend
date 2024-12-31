import { PaymentMethods, TxType } from '../schema/transaction.schema';

export class CreateTransactionDto {
  userId: string;
  billId?: string;
  amount: number;
  type: TxType;
  paymentMethod: PaymentMethods;
  tokenAddress?: string;
}

import { EventType } from '@/enums/event.enum';
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TransferInDto } from './dto/transfer.dto';
import {
  PaymentMethods,
  TxStatus,
  TxType,
} from '@/transaction/schema/transaction.schema';
import { formatEther, parseEther } from 'viem';
import { TransactionService } from '@/transaction/transaction.service';
import { TokensService } from '@/tokens/tokens.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway {
  private readonly logger = new Logger(EventGateway.name);

  @WebSocketServer() server: Server;
  constructor(
    private readonly txService: TransactionService,
    private readonly tokenService: TokensService,
  ) {}

  @SubscribeMessage('connect')
  handleConnection(client: Socket) {
    const userId = client.handshake.query.user;
    if (userId) {
      client.join(userId);
      this.logger.log(`User connected: ${userId}`);
    }
  }

  @SubscribeMessage(EventType.TRANSFER_IN)
  async handleTransferIn(@MessageBody() body: TransferInDto) {
    try {
      const [transaction, token] = await Promise.all([
        this.txService.findOne({
          hash: body.transactionHash,
        }),
        this.tokenService.findOne({
          address: { $regex: body.token, $options: 'i' },
        }),
      ]);

      if (!transaction) {
        const txPayload = {
          hash: body.transactionHash,
          userId: body.user,
          amount: parseFloat(body.value),
          amountInWei: parseInt(parseEther(body.value).toString()),
          type: TxType.TRANSFER,
          paymentMethod: PaymentMethods.CRYPTO,
          tokenAddress: body.token,
          description: `Transfer in ${body.value} ${token?.symbol}`,
          senderAddress: body.from,
          recipientAddress: body.to,
          metaData: { ...body.metadata },
          status: TxStatus.SUCCESSFUL,
          amountInUsd: parseFloat(`${body.usdValue}`),
        };
        const tx = await this.txService.create(txPayload);
        this.logger.log(tx);
      }
    } catch (error) {
      this.logger.error('Error handling transfer in event', error);
    }
  }

  async emit(event: EventType, data: any) {
    let newData = data;
    if (event == EventType.TOPUP_SUCCESS) {
      //   const tx = data as Transaction;
      //   const biller = await this.billerService.findOne({
      //     _id: tx.metaData.billerId,
      //   });
      //   if (biller && biller.logo) {
      //     newData = {
      //       ...newData._doc,
      //       logo: biller.logo,
      //     };
      //   }
    }
    this.server.to(`${newData.userId}`).emit(event, newData);
  }
}

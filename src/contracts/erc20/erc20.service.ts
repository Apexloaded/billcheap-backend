import { TokensService } from '@/tokens/tokens.service';
import { UserService } from '@/user/user.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { ethers } from 'ethers';
import { erc20Abi, formatEther, parseEther } from 'viem';
import { ContractEvent } from '../schemas/contract-event.schema';
import { Model } from 'mongoose';
import { TransactionService } from '@/transaction/transaction.service';
import {
  PaymentMethods,
  TxStatus,
  TxType,
} from '@/transaction/schema/transaction.schema';
import { BillCheapService } from '../billcheap/billcheap.service';
import { EventGateway } from '@/event/event.gateway';
import { EventType, QueueEvent } from '@/enums/event.enum';

type RawEvents = ethers.Log &
  ethers.EventLog & {
    args: any[];
  };

@Injectable()
export class Erc20Service {
  private readonly logger = new Logger(Erc20Service.name);

  private provider: ethers.JsonRpcProvider;
  private deployedAtBlock: number;

  constructor(
    @InjectQueue('erc20-events') private eventQueue: Queue,
    @InjectModel(ContractEvent.name)
    private readonly eventModel: Model<ContractEvent>,
    private readonly tokenService: TokensService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly txService: TransactionService,
    private readonly bcService: BillCheapService,
    private readonly evGateway: EventGateway,
  ) {
    const rpcUrl = this.configService.get<string>('RPC');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.deployedAtBlock = this.configService.get<number>('DEPLOYED_AT_BLOCK');
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async pollTransferEvents(fromBlock: number, toBlock: number): Promise<void> {
    const [tokens, users] = await Promise.all([
      this.tokenService.findAll(),
      this.userService.findAll(),
    ]);
    const wallets = users.map((user) => user.wallet.toLowerCase());
    const tokenAddresses = tokens.map((t) => t.address);

    const batchSize = 1000;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const walletBatch = wallets.slice(i, i + batchSize);
      await this.eventQueue.add(
        QueueEvent.Transfer,
        {
          wallets: walletBatch,
          tokens: tokenAddresses,
          fromBlock,
          toBlock,
        },
        {
          attempts: 5,
          removeOnComplete: true,
          backoff: {
            delay: 60 * 1000,
            type: 'exponential',
          },
        },
      );
    }
  }

  async testTransferPollingEvent() {
    try {
      const [token, users] = await Promise.all([
        this.tokenService.findOne({
          address: {
            $regex: '0x39a325F4699a651fdcef4AA263F84c596cFe479d',
            $options: 'i',
          },
        }),
        this.userService.findAll().limit(2),
      ]);

      const wallets = users.map((u) => u.wallet.toLowerCase());
      //await this.processTransferEvent(token.address, wallets);
    } catch (error) {
      console.log(error);
    }
  }

  async processTransferEvent(
    tokenAddress: string,
    accounts: string[],
    fromBlock: number,
    toBlock: number,
  ) {
    //this.logger.log('Processing Transfer Events On Contract: ', tokenAddress);
    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.provider);

    // const latestMinedBlock = await this.getLatestBlockNumber();
    // const lastProcessedBlock = await this.getLatestProcessedBlock();

    // if (latestMinedBlock <= lastProcessedBlock) return;

    const token = await this.tokenService.findOne({
      address: { $regex: tokenAddress, $options: 'i' },
    });
    const priceFeeds = await this.bcService.getPriceFeeds(token ? [token] : []);

    const wallets = accounts.map((w) => w.toLowerCase());
    const filter = contract.filters['Transfer']();
    const fromFilters = contract.filters.Transfer(wallets);
    const toFilters = contract.filters.Transfer(null, wallets);

    const fromQuery = contract.queryFilter(
      fromFilters,
      fromBlock,
      toBlock,
    ) as Promise<RawEvents[]>;
    const toQuery = contract.queryFilter(
      toFilters,
      fromBlock,
      toBlock,
    ) as Promise<RawEvents[]>;

    const [fromEvents, toEvents] = await Promise.all([fromQuery, toQuery]);
    const events = [...fromEvents, ...toEvents];

    for (const event of events) {
      const from = event.args[0];
      const to = event.args[1];
      const amount = formatEther(event.args[2]);
      const hash = event.transactionHash;
      const blockNumber = event.blockNumber;

      //this.logger.log('Processing Tx: ', hash);

      if (
        wallets.includes(from.toLowerCase()) ||
        wallets.includes(to.toLowerCase())
      ) {
        const [findEvent, findTx, fromUser, toUser] = await Promise.all([
          this.eventModel.findOne({
            transactionHash: { $regex: hash, $options: 'i' },
          }),
          this.txService.findOne({
            hash: { $regex: hash, $options: 'i' },
          }),
          this.userService.findOne({ wallet: { $regex: from, $options: 'i' } }),
          this.userService.findOne({ wallet: { $regex: to, $options: 'i' } }),
        ]);

        // Check if transaction exists in transactions collection
        if (!findTx) {
          const price = priceFeeds ? priceFeeds[0].price : '0';
          const amountInUsd = parseFloat(amount) * parseFloat(price);
          const userId = fromUser?._id ?? toUser?._id;

          const txPayload = {
            hash: hash,
            userId: `${userId}`,
            amount: parseFloat(amount),
            amountInWei: parseInt(parseEther(amount).toString()),
            type: TxType.TRANSFER,
            paymentMethod: PaymentMethods.CRYPTO,
            tokenAddress,
            description: `${token?.symbol} Transfer`,
            senderAddress: from,
            recipientAddress: to,
            metaData: {
              blockHash: event.blockHash,
              blockNumber: Number(blockNumber),
              eventName: filter.fragment.name,
              topics: event.data,
            },
            status: TxStatus.SUCCESSFUL,
            amountInUsd,
          };
          await this.txService.create(txPayload);

          if (fromUser) {
            this.evGateway.emit(EventType.TRANSFER_OUT, {
              ...txPayload,
              symbol: token.symbol,
            });
          }
          if (toUser) {
            this.evGateway.emit(EventType.TRANSFER_IN, {
              ...txPayload,
              symbol: token.symbol,
            });
          }
        }

        // Check if event exists in events collection
        if (!findEvent) {
          const payload = {
            transactionHash: hash,
            blockNumber: Number(blockNumber),
            eventName: filter.fragment.name,
            eventData: event.args,
          };
          await this.eventModel.create(payload);
        }
        this.logger.log('Processed: ✅', hash);
      }
    }
  }

  async getLatestProcessedBlock() {
    const lastEvent = await this.eventModel
      .findOne({ eventName: { $regex: 'Transfer', $options: 'i' } })
      .sort({ blockNumber: -1 })
      .exec();
    return lastEvent ? lastEvent.blockNumber : this.deployedAtBlock;
  }
}

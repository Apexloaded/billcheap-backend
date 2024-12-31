import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import BillCheapAbi from './abi/billcheap.abi';
import { ContractEvents } from '@/enums/contract.enum';

export interface BlockchainEvent {
  name: string;
  args: any;
  blockNumber: number;
  transactionHash: string;
}

@Injectable()
export class BillCheapService {
  private readonly logger = new Logger(BillCheapService.name);
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC');
    const contractAddress = this.configService.get<string>('BC_CONTRACT');
    const adminKey = this.configService.get<string>('ADMIN_PRIVATE');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(adminKey, this.provider);
    this.contract = new Contract(contractAddress, BillCheapAbi, this.signer);

    this.logger.log('*********BillCheap Service Initialized*********');
  }

  async signInitTopUp(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>,
  ) {
    const signature = await this.signer.signTypedData(domain, types, value);
    return signature;
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<BlockchainEvent[]> {
    const eventNames = [ContractEvents.BillProcessed];
    const events: BlockchainEvent[] = [];

    for (const eventName of eventNames) {
      const filter = this.contract.filters[eventName]();
      const rawEvents = await this.contract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );
      events.push(
        ...rawEvents.map((event: any) => ({
          name: eventName,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        })),
      );
    }

    return events;

    // const filter = this.contract.filters.TopUpInitialized();
    // const maxBlockRange = 50000; // Maximum allowed block range
    // const events: (ethers.EventLog | ethers.Log)[] = [];

    // let startBlock = fromBlock;
    // while (startBlock <= toBlock) {
    //   const endBlock = Math.min(startBlock + maxBlockRange - 1, toBlock);
    //   const chunkEvents = await this.contract.queryFilter(
    //     filter,
    //     startBlock,
    //     endBlock,
    //   );
    //   events.push(...chunkEvents);
    //   startBlock = endBlock + 1; // Move to the next chunk
    // }

    // return events;

    // const filter = this.contract.filters.TopUpInitialized();
    // console.log(filter);
    // return this.contract.queryFilter(filter, fromBlock, toBlock);
  }

  subscribeToEvents(callback: (event: BlockchainEvent) => void) {
    const eventNames = [ContractEvents.BillProcessed];

    for (const eventName of eventNames) {
      this.contract.on(eventName, (...args) => {
        const event = args[args.length - 1];
        callback({
          name: eventName,
          args: event.args,
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
    }

    this.logger.log('Subscribed to real-time events');
  }
}
